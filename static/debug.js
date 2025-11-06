// Load environment configurations from parent scope or localStorage
function loadEnvironmentConfigs() {
    // Try to get from shared storage or use defaults
    const stored = localStorage.getItem('environmentConfigs');
    if (stored) {
        return JSON.parse(stored);
    }
    return {};
}

// Evaluation history storage
function getEvaluationHistory() {
    const history = localStorage.getItem('evaluationHistory');
    return history ? JSON.parse(history) : [];
}

function saveEvaluationToHistory(evaluation) {
    const history = getEvaluationHistory();
    history.unshift(evaluation); // Add to beginning
    
    // Keep only last 100 evaluations
    if (history.length > 100) {
        history.splice(100);
    }
    
    localStorage.setItem('evaluationHistory', JSON.stringify(history));
}

function updateContextFields() {
    const keyType = document.getElementById('keyType').value;
    
    document.getElementById('orgContext').style.display = keyType === 'org' ? 'block' : 'none';
    document.getElementById('userContext').style.display = keyType === 'user' ? 'block' : 'none';
    document.getElementById('customContext').style.display = keyType === 'custom' ? 'block' : 'none';
}

function runEvaluation() {
    const env = document.getElementById('debugEnv').value;
    const keyType = document.getElementById('keyType').value;
    const specificFlag = document.getElementById('specificFlag').value;
    
    let context = {};
    
    // Build context based on type
    if (keyType === 'org') {
        const orgId = document.getElementById('orgId').value;
        if (!orgId) {
            alert('Please enter an Organization ID');
            return;
        }
        
        context = {
            organization_id: orgId,
            org: {
                id: orgId,
                plan: document.getElementById('orgPlan').value || 'free',
                region: document.getElementById('orgRegion').value || 'US',
                isInternal: document.getElementById('isInternal').checked
            }
        };
    } else if (keyType === 'user') {
        const userId = document.getElementById('userId').value;
        if (!userId) {
            alert('Please enter a User ID');
            return;
        }
        
        context = {
            user_id: userId,
            user: {
                id: userId,
                email: document.getElementById('userEmail').value,
                role: document.getElementById('userRole').value || 'member'
            }
        };
    } else {
        const customJson = document.getElementById('customJson').value;
        if (!customJson) {
            alert('Please enter custom context JSON');
            return;
        }
        
        try {
            context = JSON.parse(customJson);
        } catch (e) {
            alert('Invalid JSON: ' + e.message);
            return;
        }
    }
    
    // Run actual evaluation
    const startTime = performance.now();
    const results = evaluateFlags(env, context, specificFlag);
    const endTime = performance.now();
    const evalTime = Math.round(endTime - startTime);
    
    // Save to history
    const evaluation = {
        id: 'eval_' + Date.now(),
        timestamp: new Date().toISOString(),
        environment: env,
        context: context,
        results: results,
        evaluationTime: evalTime,
        flagName: specificFlag || 'all'
    };
    saveEvaluationToHistory(evaluation);
    
    displayResults(env, context, results, evalTime);
    loadEvaluationHistory(); // Refresh history display
}

// Hash function for consistent bucketing
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// Percentage bucketing function
function isInPercentageBucket(key, percentage) {
    const hash = hashString(String(key));
    const bucket = hash % 100;
    return bucket < percentage;
}

// Evaluate condition against context
function evaluateCondition(condition, context) {
    const { field, operator, values } = condition;
    
    // Get field value from context (supports nested paths like "org.plan")
    const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], context);
    
    if (fieldValue === undefined) return false;
    
    switch (operator) {
        case 'equals':
            return values.includes(String(fieldValue));
        case 'not_equals':
            return !values.includes(String(fieldValue));
        case 'contains':
            return values.some(v => String(fieldValue).includes(v));
        case 'starts_with':
            return values.some(v => String(fieldValue).startsWith(v));
        case 'ends_with':
            return values.some(v => String(fieldValue).endsWith(v));
        case 'greater_than':
            return Number(fieldValue) > Number(values[0]);
        case 'less_than':
            return Number(fieldValue) < Number(values[0]);
        case 'matches_regex':
            try {
                const regex = new RegExp(values[0]);
                return regex.test(String(fieldValue));
            } catch (e) {
                return false;
            }
        default:
            return false;
    }
}

// Evaluate targeting rule
function evaluateRule(rule, context) {
    // All conditions must match (AND logic)
    if (!rule.conditions || rule.conditions.length === 0) {
        return false;
    }
    
    return rule.conditions.every(condition => evaluateCondition(condition, context));
}

function evaluateFlags(env, context, specificFlag) {
    // Get all flags from localStorage
    const flags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
    const envConfigs = loadEnvironmentConfigs();
    
    // Filter flags if specific flag requested
    const flagsToEvaluate = specificFlag 
        ? flags.filter(f => f.name === specificFlag)
        : flags;
    
    const results = flagsToEvaluate.map(flag => {
        // Get environment configuration for this flag
        const envConfig = envConfigs[env] || {
            flagStatus: 'on',
            offVariation: 'var-b',
            targetingRules: [],
            defaultServe: 'var-a',
            contextKeyType: 'organization_id'
        };
        
        let value = flag.defaultVariation;
        let reason = 'Default variation';
        let ruleMatch = null;
        let variation = 'default';
        
        // Check if flag is OFF
        if (envConfig.flagStatus === 'off') {
            value = envConfig.offVariation || flag.defaultVariation;
            reason = 'Flag is OFF - serving off variation';
            variation = envConfig.offVariation || 'default';
        } else {
            // Flag is ON - evaluate targeting rules
            let matchedRule = null;
            
            if (envConfig.targetingRules && envConfig.targetingRules.length > 0) {
                for (let i = 0; i < envConfig.targetingRules.length; i++) {
                    const rule = envConfig.targetingRules[i];
                    
                    if (evaluateRule(rule, context)) {
                        matchedRule = rule;
                        
                        // Determine serve value based on rule type
                        if (rule.serve?.type === 'variation') {
                            variation = rule.serve.variation;
                            value = rule.serve.variation;
                            reason = `Matched Rule: ${rule.title || 'Rule ' + (i + 1)}`;
                            ruleMatch = JSON.stringify(rule.conditions, null, 2);
                        } else if (rule.serve?.type === 'percentage') {
                            // Percentage rollout
                            const key = context[rule.serve.key] || context.organization_id || context.user_id;
                            
                            if (key) {
                                const distribution = rule.serve.distribution || [];
                                const hash = hashString(String(key)) % 100;
                                
                                let cumulativePercentage = 0;
                                for (const dist of distribution) {
                                    cumulativePercentage += dist.percentage;
                                    if (hash < cumulativePercentage) {
                                        variation = dist.variation;
                                        value = dist.variation;
                                        reason = `Matched Rule: ${rule.title || 'Rule ' + (i + 1)} - Percentage rollout (${dist.percentage}%)`;
                                        ruleMatch = `Percentage rollout on ${rule.serve.key}: bucket ${hash} → ${dist.variation}`;
                                        break;
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            }
            
            // No rule matched - use default serve
            if (!matchedRule) {
                variation = envConfig.defaultServe || flag.defaultVariation;
                value = envConfig.defaultServe || flag.defaultVariation;
                reason = 'No rules matched - serving default';
            }
        }
        
        // Convert value to appropriate type
        let typedValue = value;
        try {
            if (flag.type === 'boolean') {
                typedValue = value === 'true' || value === true;
            } else if (flag.type === 'number') {
                typedValue = Number(value);
            } else if (flag.type === 'object') {
                typedValue = typeof value === 'string' ? JSON.parse(value) : value;
            }
        } catch (e) {
            // Keep original value if conversion fails
        }
        
        return {
            name: flag.name,
            type: flag.type,
            value: typedValue,
            variation: variation,
            reason: reason,
            ruleMatch: ruleMatch,
            default: flag.defaultVariation,
            flagConfig: {
                status: flag.status,
                owner: flag.owner,
                team: flag.team
            }
        };
    });
    
    return results;
}

function displayResults(env, context, results, evalTime) {
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultEnv').textContent = env;
    
    // Format context display
    let contextStr = '';
    if (context.org) {
        contextStr = `org: ${context.org.id} (${context.org.plan}, ${context.org.region})`;
    } else if (context.user) {
        contextStr = `user: ${context.user.id} (${context.user.role})`;
    } else {
        contextStr = 'Custom context';
    }
    document.getElementById('resultContext').textContent = contextStr;
    document.getElementById('resultCount').textContent = results.length;
    document.getElementById('resultTime').textContent = evalTime + 'ms';
    
    // Build results HTML
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = results.map(flag => `
        <div class="result-card">
            <div class="result-header">
                <h4>${flag.name}</h4>
                <span class="type-badge ${flag.type}">${flag.type}</span>
            </div>
            <div class="result-body">
                <div class="result-row">
                    <span class="result-label">Evaluated Value:</span>
                    <span class="result-value variant-badge">${formatValue(flag.value)}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Variation:</span>
                    <span class="result-value"><code>${flag.variation}</code></span>
                </div>
                <div class="result-row">
                    <span class="result-label">Reason:</span>
                    <span class="result-value">${flag.reason}</span>
                </div>
                ${flag.ruleMatch ? `
                <div class="result-row">
                    <span class="result-label">Matching Logic:</span>
                    <pre class="result-json">${escapeHtml(flag.ruleMatch)}</pre>
                </div>
                ` : ''}
                <div class="result-row">
                    <span class="result-label">Default Value:</span>
                    <span class="result-value">${formatValue(flag.default)}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Owner:</span>
                    <span class="result-value">${flag.flagConfig.owner} (${flag.flagConfig.team})</span>
                </div>
            </div>
            <div class="result-footer">
                <a href="flag-detail.html?flag=${encodeURIComponent(flag.name)}" class="btn-link">View Flag Details →</a>
            </div>
        </div>
    `).join('');
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load and display evaluation history
function loadEvaluationHistory() {
    const history = getEvaluationHistory();
    const historyContainer = document.getElementById('evaluationHistory');
    
    if (!historyContainer) return;
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 20px;">No evaluation history yet. Run an evaluation to see it here.</p>';
        return;
    }
    
    // Show only top 6 most recent
    const recentHistory = history.slice(0, 6);
    
    historyContainer.innerHTML = `
        <div class="history-header">
            <h3>Recent Evaluations</h3>
            <button class="btn btn-secondary btn-sm" onclick="showAllHistory()">View All (${history.length})</button>
        </div>
        <div class="history-list">
            ${recentHistory.map(eval => `
                <div class="history-item" onclick="replayEvaluation('${eval.id}')">
                    <div class="history-item-header">
                        <span class="history-time">${formatTimeAgo(eval.timestamp)}</span>
                        <span class="history-env-badge">${eval.environment}</span>
                    </div>
                    <div class="history-item-body">
                        <div class="history-context">
                            ${formatContextSummary(eval.context)}
                        </div>
                        <div class="history-meta">
                            <span>${eval.results.length} flag(s)</span>
                            <span>•</span>
                            <span>${eval.evaluationTime}ms</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return then.toLocaleDateString();
}

function formatContextSummary(context) {
    if (context.org) {
        return `<strong>Org:</strong> ${context.org.id} (${context.org.plan || 'free'})`;
    } else if (context.user) {
        return `<strong>User:</strong> ${context.user.id} (${context.user.role || 'member'})`;
    } else if (context.organization_id) {
        return `<strong>Org ID:</strong> ${context.organization_id}`;
    } else if (context.user_id) {
        return `<strong>User ID:</strong> ${context.user_id}`;
    }
    return '<strong>Custom context</strong>';
}

function replayEvaluation(evalId) {
    const history = getEvaluationHistory();
    const evaluation = history.find(e => e.id === evalId);
    
    if (!evaluation) {
        alert('Evaluation not found');
        return;
    }
    
    // Display the saved results
    displayResults(evaluation.environment, evaluation.context, evaluation.results, evaluation.evaluationTime);
    
    // Optionally, populate the form with the context
    populateFormFromContext(evaluation.environment, evaluation.context);
}

function populateFormFromContext(env, context) {
    document.getElementById('debugEnv').value = env;
    
    if (context.org) {
        document.getElementById('keyType').value = 'org';
        updateContextFields();
        document.getElementById('orgId').value = context.org.id;
        document.getElementById('orgPlan').value = context.org.plan || '';
        document.getElementById('orgRegion').value = context.org.region || '';
        document.getElementById('isInternal').checked = context.org.isInternal || false;
    } else if (context.user) {
        document.getElementById('keyType').value = 'user';
        updateContextFields();
        document.getElementById('userId').value = context.user.id;
        document.getElementById('userEmail').value = context.user.email || '';
        document.getElementById('userRole').value = context.user.role || '';
    } else {
        document.getElementById('keyType').value = 'custom';
        updateContextFields();
        document.getElementById('customJson').value = JSON.stringify(context, null, 2);
    }
}

function showAllHistory() {
    const history = getEvaluationHistory();
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.innerHTML = `
        <div class="history-modal-content">
            <div class="history-modal-header">
                <h2>All Evaluation History (${history.length})</h2>
                <button class="btn-close" onclick="this.closest('.history-modal').remove()">✕</button>
            </div>
            <div class="history-search">
                <input type="text" id="historySearch" class="form-control" placeholder="Search by environment, org ID, user ID..." oninput="filterHistory()">
            </div>
            <div class="history-modal-body" id="allHistoryList">
                ${history.map(eval => `
                    <div class="history-item" onclick="replayEvaluation('${eval.id}'); document.querySelector('.history-modal').remove();">
                        <div class="history-item-header">
                            <span class="history-time">${new Date(eval.timestamp).toLocaleString()}</span>
                            <span class="history-env-badge">${eval.environment}</span>
                        </div>
                        <div class="history-item-body">
                            <div class="history-context">
                                ${formatContextSummary(eval.context)}
                            </div>
                            <div class="history-meta">
                                <span>${eval.flagName !== 'all' ? eval.flagName : eval.results.length + ' flag(s)'}</span>
                                <span>•</span>
                                <span>${eval.evaluationTime}ms</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="history-modal-footer">
                <button class="btn btn-secondary" onclick="clearHistory()">Clear All History</button>
                <button class="btn btn-primary" onclick="this.closest('.history-modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function filterHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const history = getEvaluationHistory();
    
    const filtered = history.filter(eval => {
        const envMatch = eval.environment.toLowerCase().includes(searchTerm);
        const contextMatch = JSON.stringify(eval.context).toLowerCase().includes(searchTerm);
        const flagMatch = eval.flagName.toLowerCase().includes(searchTerm);
        return envMatch || contextMatch || flagMatch;
    });
    
    const listContainer = document.getElementById('allHistoryList');
    listContainer.innerHTML = filtered.map(eval => `
        <div class="history-item" onclick="replayEvaluation('${eval.id}'); document.querySelector('.history-modal').remove();">
            <div class="history-item-header">
                <span class="history-time">${new Date(eval.timestamp).toLocaleString()}</span>
                <span class="history-env-badge">${eval.environment}</span>
            </div>
            <div class="history-item-body">
                <div class="history-context">
                    ${formatContextSummary(eval.context)}
                </div>
                <div class="history-meta">
                    <span>${eval.flagName !== 'all' ? eval.flagName : eval.results.length + ' flag(s)'}</span>
                    <span>•</span>
                    <span>${eval.evaluationTime}ms</span>
                </div>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all evaluation history?')) {
        localStorage.removeItem('evaluationHistory');
        document.querySelector('.history-modal').remove();
        loadEvaluationHistory();
        showToast('Evaluation history cleared');
    }
}

function formatValue(value) {
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadEvaluationHistory();
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

