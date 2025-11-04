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
    
    // Mock evaluation
    const results = evaluateFlags(env, context, specificFlag);
    displayResults(env, context, results);
}

function evaluateFlags(env, context, specificFlag) {
    // Mock flag evaluations
    const allFlags = [
        {
            name: 'enable_new_dashboard',
            type: 'boolean',
            value: true,
            reason: 'Matched Rule 1: Enterprise Customers',
            ruleMatch: '{"and": [{"==": [{"var": "org.plan"}, "enterprise"]}, {"==": [{"var": "org.region"}, "US"]}]}',
            default: false
        },
        {
            name: 'payment_v2_enabled',
            type: 'boolean',
            value: false,
            reason: 'Targeting OFF - serving default variation',
            ruleMatch: null,
            default: false
        },
        {
            name: 'theme_variant',
            type: 'string',
            value: 'dark',
            reason: 'Default variation (no matching rules)',
            ruleMatch: null,
            default: 'light'
        },
        {
            name: 'max_upload_size',
            type: 'number',
            value: 500,
            reason: 'Matched Rule: Enterprise plan gets higher limit',
            ruleMatch: '{"==": [{"var": "org.plan"}, "enterprise"]}',
            default: 100
        },
        {
            name: 'enable_notifications',
            type: 'boolean',
            value: true,
            reason: 'Percentage rollout (75%) - User in rollout cohort',
            ruleMatch: 'Deterministic bucketing on org.id',
            default: false
        },
        {
            name: 'feature_config',
            type: 'object',
            value: {enabled: true, maxItems: 50},
            reason: 'Default variation',
            ruleMatch: null,
            default: {enabled: false, maxItems: 10}
        }
    ];
    
    if (specificFlag) {
        return allFlags.filter(f => f.name === specificFlag);
    }
    
    return allFlags;
}

function displayResults(env, context, results) {
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
    document.getElementById('resultTime').textContent = Math.floor(Math.random() * 20 + 5) + 'ms';
    
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
                    <span class="result-label">Reason:</span>
                    <span class="result-value">${flag.reason}</span>
                </div>
                ${flag.ruleMatch ? `
                <div class="result-row">
                    <span class="result-label">Matching Logic:</span>
                    <pre class="result-json">${flag.ruleMatch}</pre>
                </div>
                ` : ''}
                <div class="result-row">
                    <span class="result-label">Default Value:</span>
                    <span class="result-value">${formatValue(flag.default)}</span>
                </div>
            </div>
            <div class="result-footer">
                <a href="flag-detail.html" class="btn-link">View Flag Details →</a>
            </div>
        </div>
    `).join('');
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
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

