let currentEnvironment = 'prod';
let currentTab = 'variations';
let currentFlag = null;
let detailRuleCounter = 0;
let detailConditionCounter = 0;

// Default environment configuration
const DEFAULT_ENVIRONMENT = 'default';

// Default environment configuration that will be used as fallback
const defaultEnvironmentConfig = {
    contextKeyType: 'organization_id',
    secondaryContextKey: '',
    flagStatus: 'on',
    offVariation: 'var-b',
    targetingRules: [],
    defaultServe: 'var-a'
};

// Store environment configurations per flag (including patterns)
let environmentConfigs = {};

// Store pattern-based configurations
let patternConfigs = {};

// Match environment against pattern (e.g., 'giger-*' matches 'giger-1', 'giger-2')
function matchesPattern(envName, pattern) {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(envName);
}

// Get config for environment (checks exact match, then patterns, then default)
function getEnvironmentConfigDetail(envName) {
    // Check for exact match
    if (environmentConfigs[envName]) {
        return { config: environmentConfigs[envName], source: 'exact', pattern: null };
    }
    
    // Check for pattern match
    for (const [pattern, config] of Object.entries(patternConfigs)) {
        if (matchesPattern(envName, pattern)) {
            return { config: config, source: 'pattern', pattern: pattern };
        }
    }
    
    // Fall back to default
    if (envName !== DEFAULT_ENVIRONMENT) {
        const defaultConfig = environmentConfigs[DEFAULT_ENVIRONMENT] || defaultEnvironmentConfig;
        return { config: defaultConfig, source: 'default', pattern: null };
    }
    
    // Initialize default if not set
    if (!environmentConfigs[DEFAULT_ENVIRONMENT]) {
        environmentConfigs[DEFAULT_ENVIRONMENT] = {...defaultEnvironmentConfig};
    }
    
    return { config: environmentConfigs[DEFAULT_ENVIRONMENT], source: 'exact', pattern: null };
}

// Load flag data on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const flagName = urlParams.get('flag');
    
    if (flagName) {
        loadFlagData(flagName);
    } else {
        // Load first flag from list
        const flags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
        if (flags.length > 0) {
            loadFlagData(flags[0].name);
        }
    }
    
    // Initialize environment overlay with prod (default)
    buildEnvironmentOverlayDetail('default');
});

function loadFlagData(flagName) {
    const flags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
    currentFlag = flags.find(f => f.name === flagName);
    
    if (!currentFlag) {
        alert('Flag not found!');
        window.location.href = 'index.html';
        return;
    }
    
    // Update page title
    document.title = 'Flag Details - ' + currentFlag.name;
    
    // Update header
    document.querySelector('.flag-header h2').textContent = currentFlag.name;
    document.querySelector('.flag-description').textContent = currentFlag.description || '';
    
    // Update metadata
    const metadata = document.querySelector('.flag-metadata');
    metadata.innerHTML = `
        <span><strong>Owner:</strong> ${currentFlag.owner}</span>
        <span><strong>Team:</strong> ${currentFlag.team}</span>
        <span><strong>Maintainer:</strong> ${currentFlag.maintainer}</span>
        <span><strong>Created:</strong> ${new Date(currentFlag.createdAt).toLocaleDateString()}</span>
        <span><strong>Expires:</strong> ${currentFlag.expiryDate}</span>
        <span><strong>Type:</strong> ${currentFlag.type}</span>
    `;
    
    // Update status bar
    updateStatusBar();
    
    // Update rollout slider
    updateRolloutDisplay();
    
    // Initialize variations
    handleFlagTypeChangeDetail();
}

function updateStatusBar() {
    // Status bar is now part of the environment overlay
    // This function is kept for backward compatibility but does nothing
    return;
}

function updateRolloutDisplay() {
    // Rollout display is now part of the environment overlay
    // This function is kept for backward compatibility but does nothing
    return;
}

function switchEnvironment(env) {
    // Environment switching is now handled by selectEnvironmentTileDetail
    // This function is kept for backward compatibility but does nothing
    return;
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // Hide all tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Show selected tab
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function toggleTargeting() {
    const toggle = document.getElementById('targetingToggle');
    const status = document.getElementById('targetingStatus');
    status.textContent = toggle.checked ? 'ON' : 'OFF';
    
    // Update flag status in localStorage
    if (currentFlag) {
        const flags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
        const flagIndex = flags.findIndex(f => f.name === currentFlag.name);
        
        if (flagIndex !== -1) {
            flags[flagIndex].status = toggle.checked ? 'active' : 'inactive';
            localStorage.setItem('featureFlags', JSON.stringify(flags));
            currentFlag.status = flags[flagIndex].status;
        }
    }
    
    if (toggle.checked) {
        showToast('✓ Targeting enabled! Changes will propagate in ~5 seconds.');
    } else {
        showToast('✓ Targeting disabled. Serving default "off" variation to all users.');
    }
}

function updateRolloutType() {
    // Rollout type is now handled in the environment overlay
    // This function is kept for backward compatibility but does nothing
    return;
}

function updateRolloutValue(value) {
    // Rollout value is now part of the environment overlay
    // This function is kept for backward compatibility but does nothing
    return;
}

function saveTargeting() {
    showToast('✓ Targeting rules saved! Changes propagated to all clients in ~5 seconds.');
    console.log('Targeting configuration saved for environment:', currentEnvironment);
}

function saveRollout() {
    if (!currentFlag) return;
    
    // Get new rollout percentage
    const newPercentage = parseInt(document.querySelector('.slider-input').value);
    
    // Update flag in localStorage
    const flags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
    const flagIndex = flags.findIndex(f => f.name === currentFlag.name);
    
    if (flagIndex !== -1) {
        flags[flagIndex].rolloutPercentage = newPercentage;
        localStorage.setItem('featureFlags', JSON.stringify(flags));
        currentFlag.rolloutPercentage = newPercentage;
    }
    
    showToast('✓ Rollout configuration updated to ' + newPercentage + '%! Changes are live.');
    console.log('Rollout saved for environment:', currentEnvironment);
}

function addRule() {
    alert('Opening rule builder... (Mock)');
}

function editRule(ruleId) {
    alert('Editing rule ' + ruleId + '... (Mock)');
}

function deleteRule(ruleId) {
    if (confirm('Are you sure you want to delete this targeting rule?')) {
        alert('Rule ' + ruleId + ' deleted.');
    }
}

function addExclusion() {
    alert('Adding exclusion rule... (Mock)');
}

function deleteExclusion() {
    if (confirm('Are you sure you want to delete this exclusion rule?')) {
        alert('Exclusion rule deleted.');
    }
}

function showRollbackModal() {
    document.getElementById('rollbackModal').style.display = 'flex';
}

function closeRollbackModal() {
    document.getElementById('rollbackModal').style.display = 'none';
}

function confirmRollback() {
    alert('✓ Rollback executed! Flag reverted to safe default. All clients updated in ~5 seconds.');
    closeRollbackModal();
    console.log('Flag rolled back in environment:', currentEnvironment);
}

function rollbackToVersion(version) {
    if (confirm('Rollback to version v' + version + '?')) {
        alert('✓ Rolled back to v' + version + '. Changes propagated.');
        console.log('Rolled back to version:', version);
    }
}

function showDeleteModal() {
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

function confirmDelete() {
    if (!currentFlag) return;
    
    const inputName = document.getElementById('deleteFlagName').value;
    if (inputName !== currentFlag.name) {
        alert('Flag name does not match. Please type "' + currentFlag.name + '" to confirm.');
        return;
    }
    
    // Delete flag from localStorage
    const flags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
    const filtered = flags.filter(f => f.name !== currentFlag.name);
    localStorage.setItem('featureFlags', JSON.stringify(filtered));
    
    showToast('✓ Flag marked for deletion. 24-hour grace period started.');
    closeDeleteModal();
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function copyFlagLink() {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
        showToast('✓ Flag link copied to clipboard!');
    });
}

function showAuditDiff(id) {
    showToast('Showing change diff for audit entry #' + id);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
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

// Environment tile selection for detail page
function selectEnvironmentTileDetail(event, envName) {
    currentEnvironment = envName;
    
    // Update active state
    document.querySelectorAll('.env-tile').forEach(tile => tile.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Build environment overlay
    buildEnvironmentOverlayDetail(envName);
}

// Build environment-specific overlay
function buildEnvironmentOverlayDetail(envName) {
    const overlay = document.getElementById('envConfigOverlayDetail');
    
    // Check if this is a pattern being edited directly
    const isPattern = envName.includes('*');
    let envConfig, source, pattern;
    
    if (isPattern && patternConfigs[envName]) {
        // Editing a pattern directly
        envConfig = patternConfigs[envName];
        source = 'exact'; // It's an exact pattern match
        pattern = null;
    } else {
        // Get environment configuration with source tracking
        const result = getEnvironmentConfigDetail(envName);
        envConfig = result.config;
        source = result.source;
        pattern = result.pattern;
    }
    
    const envDisplayNames = {
        'default': 'Default',
        'dev': 'Development',
        'stage': 'Staging',
        'prod': 'Production',
        'giger-1': 'Giger-1'
    };
    
    const displayName = envDisplayNames[envName] || envName.charAt(0).toUpperCase() + envName.slice(1);
    
    const colorClasses = {
        'default': 'blue',
        'dev': 'orange',
        'stage': 'gray',
        'prod': 'green',
        'giger-1': 'purple'
    };
    
    const colorClass = colorClasses[envName] || 'purple';
    
    overlay.innerHTML = `
        <div class="env-config-header">
            <div class="env-config-title">
                <span class="env-tile-dot ${colorClass}"></span>
                <h4>${displayName} Configuration</h4>
            </div>
            <div class="env-config-actions">
                <button type="button" class="btn-copy-env" onclick="showCopyEnvironmentDialogDetail('${envName}')" title="Copy configuration to another environment">
                    📋 Copy to...
                </button>
            </div>
        </div>
        
        ${source === 'default' ? `
        <div class="alert alert-info" style="margin-bottom: 20px; padding: 12px 16px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px; color: #0d47a1;">
            <strong>ℹ️ Using Default Configuration</strong>
            <p style="margin: 5px 0 0 0; font-size: 0.9em;">This environment is using the default configuration. Any changes will create a new configuration for this environment.</p>
        </div>
        ` : ''}
        ${source === 'pattern' ? `
        <div class="alert alert-info" style="margin-bottom: 20px; padding: 12px 16px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; color: #856404;">
            <strong>🔍 Using Pattern Configuration</strong>
            <p style="margin: 5px 0 0 0; font-size: 0.9em;">This environment matches the pattern "<strong>${pattern}</strong>". Any changes will create a specific configuration for this environment.</p>
        </div>
        ` : ''}
        
        <!-- Status Bar -->
        <div class="env-config-section">
            <div class="env-status-bar" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div class="status-item">
                    <span class="status-label">Evaluations (24h):</span>
                    <span class="status-value">45,892</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Last Evaluated:</span>
                    <span class="status-value">2 min ago</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Unique Orgs:</span>
                    <span class="status-value">1,234</span>
                </div>
            </div>
        </div>
        
        <!-- Targeting Context Keys -->
        <div class="env-config-section">
            <h5>Targeting Context Keys</h5>
            <div class="targeting-keys-light">
                <div class="form-row">
                    <div class="form-group">
                        <label for="contextKeyType-${envName}">Primary Context Key *</label>
                        <select id="contextKeyType-${envName}" name="contextKeyType-${envName}" class="light-select" onchange="saveEnvironmentConfigDetail('${envName}')">
                            <option value="organization_id" ${envConfig.contextKeyType === 'organization_id' ? 'selected' : ''}>Organization ID</option>
                            <option value="user_id" ${envConfig.contextKeyType === 'user_id' ? 'selected' : ''}>User ID</option>
                        </select>
                        <small>Primary key for targeting and rollout</small>
                    </div>
                    <div class="form-group">
                        <label for="secondaryContextKey-${envName}">Secondary Context Key (Optional)</label>
                        <select id="secondaryContextKey-${envName}" name="secondaryContextKey-${envName}" class="light-select" onchange="saveEnvironmentConfigDetail('${envName}')">
                            <option value="" ${!envConfig.secondaryContextKey ? 'selected' : ''}>None</option>
                            <option value="user_id" ${envConfig.secondaryContextKey === 'user_id' ? 'selected' : ''}>User ID</option>
                            <option value="organization_id" ${envConfig.secondaryContextKey === 'organization_id' ? 'selected' : ''}>Organization ID</option>
                            <option value="team_id" ${envConfig.secondaryContextKey === 'team_id' ? 'selected' : ''}>Team ID</option>
                        </select>
                        <small>Additional key for multi-level targeting</small>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Flag Status -->
        <div class="env-config-section">
            <h5>Flag Status</h5>
            <div class="flag-status-light">
                <span>Flag is</span>
                <select class="flag-toggle-light" data-env="${envName}" onchange="updateFlagStatusDetail(this)">
                    <option value="off" ${envConfig.flagStatus === 'off' ? 'selected' : ''}>Off</option>
                    <option value="on" ${envConfig.flagStatus === 'on' ? 'selected' : ''}>On</option>
                </select>
                <span>serving</span>
                <select class="variation-select-light" id="offVariation-${envName}" onchange="saveEnvironmentConfigDetail('${envName}')">
                    <option value="var-a" ${envConfig.offVariation === 'var-a' ? 'selected' : ''}>var-a</option>
                    <option value="var-b" ${envConfig.offVariation === 'var-b' ? 'selected' : ''}>var-b</option>
                </select>
                <span>to all traffic</span>
            </div>
        </div>
        
        <!-- Targeting Rules -->
        <div class="env-config-section">
            <h5>Targeting Rules</h5>
            <p class="section-description">Define rules to target specific users or organizations. Rules are evaluated in order.</p>
            
            <div class="targeting-rules-container-light" id="rulesContainer-${envName}" data-env="${envName}">
                <!-- Rules will be added here dynamically -->
            </div>

            <button type="button" class="btn-add-rule-light" onclick="addTargetingRuleDetail('${envName}')">
                <span class="plus-icon">+</span> Add targeting rule
            </button>

            <div class="default-rule-light">
                <h6>Default rule</h6>
                <p class="rule-description">When targeting is on and no rules match, serve:</p>
                <div class="default-serve-light">
                    <label for="defaultServe-${envName}">Serve</label>
                    <select id="defaultServe-${envName}" class="light-select" data-env="${envName}" onchange="saveEnvironmentConfigDetail('${envName}')">
                        <option value="">Select variation...</option>
                        <option value="var-a" ${envConfig.defaultServe === 'var-a' ? 'selected' : ''}>var-a</option>
                        <option value="var-b" ${envConfig.defaultServe === 'var-b' ? 'selected' : ''}>var-b</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="form-actions">
            <button class="btn btn-primary" onclick="saveEnvironmentConfigDetail('${envName}')">Save ${displayName} Configuration</button>
        </div>
    `;
}

// Save environment configuration for detail page
function saveEnvironmentConfigDetail(envName) {
    // Check if this is a pattern
    const isPattern = envName.includes('*');
    
    // Create a new config or update existing one
    if (isPattern) {
        if (!patternConfigs[envName]) {
            patternConfigs[envName] = {...defaultEnvironmentConfig};
        }
    } else {
        if (!environmentConfigs[envName]) {
            environmentConfigs[envName] = {...defaultEnvironmentConfig};
        }
    }
    
    // Update config from form values
    const contextKeyType = document.getElementById(`contextKeyType-${envName}`)?.value;
    const secondaryContextKey = document.getElementById(`secondaryContextKey-${envName}`)?.value;
    const flagToggle = document.querySelector(`.flag-toggle-light[data-env="${envName}"]`)?.value;
    const offVariation = document.getElementById(`offVariation-${envName}`)?.value;
    const defaultServe = document.getElementById(`defaultServe-${envName}`)?.value;
    
    const targetConfig = isPattern ? patternConfigs[envName] : environmentConfigs[envName];
    
    if (contextKeyType) targetConfig.contextKeyType = contextKeyType;
    if (secondaryContextKey !== undefined) targetConfig.secondaryContextKey = secondaryContextKey;
    if (flagToggle) targetConfig.flagStatus = flagToggle;
    if (offVariation) targetConfig.offVariation = offVariation;
    if (defaultServe) targetConfig.defaultServe = defaultServe;
    
    showToast(`✓ ${envName} configuration saved!`);
    console.log(`${isPattern ? 'Pattern' : 'Environment'} config saved for ${envName}:`, targetConfig);
}

// Get all available environments from tiles (detail page)
function getAllAvailableEnvironmentsDetail() {
    const tiles = document.querySelectorAll('.env-tile[data-env]');
    const environments = [];
    
    tiles.forEach(tile => {
        const envName = tile.getAttribute('data-env');
        if (envName) {
            const isPattern = tile.getAttribute('data-pattern') === 'true';
            const displayName = tile.querySelector('.env-tile-name')?.textContent.trim() || envName;
            environments.push({
                name: envName,
                displayName: displayName,
                isPattern: isPattern
            });
        }
    });
    
    return environments;
}

// Show copy environment dialog (detail page)
function showCopyEnvironmentDialogDetail(sourceEnvName) {
    // Close any existing dropdown
    const existingDropdown = document.getElementById('copy-env-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }
    
    // Get all available environments except the source
    const allEnvs = getAllAvailableEnvironmentsDetail();
    const targetEnvs = allEnvs.filter(env => env.name !== sourceEnvName);
    
    if (targetEnvs.length === 0) {
        alert('No other environments available to copy to.');
        return;
    }
    
    // Get the actions container
    const actionsContainer = document.querySelector('.env-config-actions');
    if (!actionsContainer) return;
    
    // Create dropdown
    const dropdownHtml = `
        <div id="copy-env-dropdown" class="env-copy-dropdown">
            <div class="copy-dropdown-header">Copy configuration to:</div>
            ${targetEnvs.map(env => `
                <div class="env-dropdown-item" onclick="copyEnvironmentConfigDetail('${sourceEnvName}', '${env.name}')">
                    <span class="env-tile-dot ${env.isPattern ? 'yellow' : 'gray'}"></span>
                    ${env.displayName}
                </div>
            `).join('')}
        </div>
    `;
    
    actionsContainer.insertAdjacentHTML('beforeend', dropdownHtml);
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            const dropdown = document.getElementById('copy-env-dropdown');
            const copyButton = document.querySelector('.btn-copy-env');
            if (dropdown && !dropdown.contains(e.target) && !copyButton?.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

// Copy environment configuration (detail page)
function copyEnvironmentConfigDetail(sourceEnvName, targetEnvName) {
    // Close dropdown
    const dropdown = document.getElementById('copy-env-dropdown');
    if (dropdown) dropdown.remove();
    
    // Save current source config first (in case user made changes)
    saveEnvironmentConfigDetail(sourceEnvName);
    
    // Get source configuration from saved config
    const sourceResult = getEnvironmentConfigDetail(sourceEnvName);
    const sourceConfig = sourceResult.config;
    
    // Also capture current form values (in case they weren't saved yet)
    const contextKeyType = document.getElementById(`contextKeyType-${sourceEnvName}`)?.value || sourceConfig.contextKeyType;
    const secondaryContextKey = document.getElementById(`secondaryContextKey-${sourceEnvName}`)?.value || sourceConfig.secondaryContextKey;
    const flagStatus = document.querySelector(`.flag-toggle-light[data-env="${sourceEnvName}"]`)?.value || sourceConfig.flagStatus;
    const offVariation = document.getElementById(`offVariation-${sourceEnvName}`)?.value || sourceConfig.offVariation;
    const defaultServe = document.getElementById(`defaultServe-${sourceEnvName}`)?.value || sourceConfig.defaultServe;
    
    // Capture targeting rules from DOM
    const rulesContainer = document.querySelector(`.targeting-rules-container-light[data-env="${sourceEnvName}"]`);
    const targetingRules = [];
    
    if (rulesContainer) {
        const ruleElements = rulesContainer.querySelectorAll('.targeting-rule');
        ruleElements.forEach(ruleEl => {
            const ruleTitle = ruleEl.querySelector('.rule-title-input')?.value || '';
            const serveType = ruleEl.querySelector('.rule-serve-type-select')?.value || 'variation';
            const conditions = [];
            
            // Capture conditions
            const conditionElements = ruleEl.querySelectorAll('.rule-condition');
            conditionElements.forEach(condEl => {
                const field = condEl.querySelector('.condition-select')?.value || '';
                const operator = condEl.querySelector('.condition-select')?.value || '';
                const values = condEl.querySelector('.condition-input')?.value || '';
                if (field) {
                    conditions.push({
                        field: field,
                        operator: operator,
                        values: values.split(',').map(v => v.trim()).filter(v => v)
                    });
                }
            });
            
            // Capture serve configuration
            let serveConfig = {};
            if (serveType === 'variation') {
                const variation = ruleEl.querySelector('.rule-then-select')?.value || '';
                serveConfig = { type: 'variation', variation: variation };
            } else if (serveType === 'percentage') {
                const percentageKey = ruleEl.querySelector('.percentage-key-select')?.value || '';
                const distribution = [];
                const distItems = ruleEl.querySelectorAll('.distribution-item');
                distItems.forEach(item => {
                    const varName = item.querySelector('.distribution-label')?.textContent.trim() || '';
                    const percentage = item.querySelector('.distribution-input')?.value || '0';
                    if (varName) {
                        distribution.push({ variation: varName, percentage: parseInt(percentage) || 0 });
                    }
                });
                serveConfig = { type: 'percentage', key: percentageKey, distribution: distribution };
            }
            
            if (ruleTitle || conditions.length > 0) {
                targetingRules.push({
                    title: ruleTitle,
                    conditions: conditions,
                    serve: serveConfig
                });
            }
        });
    }
    
    // Check if target is a pattern
    const targetIsPattern = targetEnvName.includes('*');
    
    // Deep clone the configuration
    const clonedConfig = {
        contextKeyType: contextKeyType || defaultEnvironmentConfig.contextKeyType,
        secondaryContextKey: secondaryContextKey || '',
        flagStatus: flagStatus || defaultEnvironmentConfig.flagStatus,
        offVariation: offVariation || defaultEnvironmentConfig.offVariation,
        defaultServe: defaultServe || defaultEnvironmentConfig.defaultServe,
        targetingRules: targetingRules.length > 0 ? JSON.parse(JSON.stringify(targetingRules)) : (sourceConfig.targetingRules ? JSON.parse(JSON.stringify(sourceConfig.targetingRules)) : [])
    };
    
    // Save to target environment
    if (targetIsPattern) {
        patternConfigs[targetEnvName] = clonedConfig;
    } else {
        environmentConfigs[targetEnvName] = clonedConfig;
    }
    
    // Show success toast
    showToast(`✓ Configuration copied from ${sourceEnvName} to ${targetEnvName}`);
    
    // If target environment is currently selected, rebuild its overlay
    const activeTile = document.querySelector('.env-tile.active');
    if (activeTile && activeTile.getAttribute('data-env') === targetEnvName) {
        buildEnvironmentOverlayDetail(targetEnvName);
    }
    
    console.log(`Configuration copied from ${sourceEnvName} to ${targetEnvName}`, clonedConfig);
}

// Update flag status in detail page
function updateFlagStatusDetail(selectElement) {
    const status = selectElement.value;
    if (status === 'on') {
        selectElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else {
        selectElement.style.background = '#6c757d';
    }
}

// Add targeting rule for detail page
function addTargetingRuleDetail(envName) {
    detailRuleCounter++;
    const ruleId = `detail-rule-${envName}-${detailRuleCounter}`;
    const container = document.querySelector(`#rulesContainer-${envName}`);
    
    const ruleHtml = `
        <div class="targeting-rule" id="${ruleId}" data-env="${envName}">
            <div class="rule-header">
                <input type="text" class="rule-title-input" placeholder="Rule name (e.g., Enterprise customers)" />
                <button type="button" class="btn-icon" onclick="removeRuleDetail('${envName}', '${ruleId}')" title="Delete rule">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            
            <div class="rule-body">
                <div class="rule-conditions" id="conditions-${ruleId}">
                    <!-- Conditions will be added here -->
                </div>
                
                <button type="button" class="btn-add-condition" onclick="addConditionDetail('${envName}', '${ruleId}')">
                    <span class="plus-icon">+</span> Add condition
                </button>
                
                <!-- Serve Section -->
                <div class="rule-serve-section">
                    <label class="rule-serve-label">Serve</label>
                    <select class="rule-serve-type-select" onchange="toggleServeTypeDetail('${envName}', '${ruleId}')">
                        <option value="single">Single variation</option>
                        <option value="percentage">Percentage rollout</option>
                    </select>
                    
                    <div class="serve-variation-section" id="serveVariation-${ruleId}">
                        <select class="light-select">
                            <option value="">Select variation...</option>
                            <option value="var-a">var-a</option>
                            <option value="var-b">var-b</option>
                        </select>
                    </div>
                    
                    <div class="serve-percentage-section" id="servePercentage-${ruleId}" style="display: none;">
                        <!-- Percentage rollout UI will be populated here -->
                    </div>
                </div>
            </div>
            
            <div class="rule-warning" id="warning-${ruleId}" style="display: none;">
                <span class="warning-icon">⚠</span>
                <span>This rule has no conditions and will match all contexts</span>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', ruleHtml);
    
    // Add first condition by default
    addConditionDetail(envName, ruleId);
}

// Add condition to rule
function addConditionDetail(envName, ruleId) {
    detailConditionCounter++;
    const conditionId = `detail-condition-${ruleId}-${detailConditionCounter}`;
    const container = document.querySelector(`#conditions-${ruleId}`);
    
    const conditionHtml = `
        <div class="rule-condition" id="${conditionId}">
            <div class="condition-if">IF</div>
            
            <div class="condition-field">
                <label class="condition-label">Context</label>
                <select class="condition-select">
                    <option value="">Select context...</option>
                    <option value="organization_id">Organization ID</option>
                    <option value="user_id">User ID</option>
                    <option value="email">Email</option>
                    <option value="plan">Plan</option>
                    <option value="region">Region</option>
                    <option value="team_id">Team ID</option>
                    <option value="country">Country</option>
                    <option value="tier">Tier</option>
                </select>
            </div>
            
            <div class="condition-field">
                <label class="condition-label">Operator</label>
                <select class="condition-select">
                    <option value="">Select operator...</option>
                    <option value="equals">is one of (=)</option>
                    <option value="not_equals">is not one of (≠)</option>
                    <option value="contains">contains</option>
                    <option value="starts_with">starts with</option>
                    <option value="ends_with">ends with</option>
                    <option value="greater_than">greater than (>)</option>
                    <option value="less_than">less than (<)</option>
                    <option value="matches_regex">matches regex</option>
                </select>
            </div>
            
            <div class="condition-field">
                <label class="condition-label">Values</label>
                <input type="text" class="condition-input" placeholder="Enter values (comma-separated)" />
            </div>
            
            <button type="button" class="btn-icon" onclick="removeConditionDetail('${envName}', '${conditionId}')" title="Remove condition" style="margin-top: 20px;">
                ✕
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', conditionHtml);
    updateRuleWarningDetail(envName, ruleId);
}

// Remove condition
function removeConditionDetail(envName, conditionId) {
    const condition = document.getElementById(conditionId);
    if (condition) {
        const ruleId = conditionId.split('-')[2] + '-' + conditionId.split('-')[3] + '-' + conditionId.split('-')[4];
        condition.remove();
        updateRuleWarningDetail(envName, ruleId);
    }
}

// Remove rule
function removeRuleDetail(envName, ruleId) {
    const rule = document.getElementById(ruleId);
    if (rule) {
        rule.remove();
    }
}

// Update rule warning
function updateRuleWarningDetail(envName, ruleId) {
    const conditions = document.querySelectorAll(`#conditions-${ruleId} .rule-condition`);
    const warning = document.getElementById(`warning-${ruleId}`);
    
    if (warning) {
        if (conditions.length === 0) {
            warning.style.display = 'flex';
        } else {
            warning.style.display = 'none';
        }
    }
}

// Toggle serve type (single vs percentage)
function toggleServeTypeDetail(envName, ruleId) {
    const select = event.target;
    const variationSection = document.getElementById(`serveVariation-${ruleId}`);
    const percentageSection = document.getElementById(`servePercentage-${ruleId}`);
    
    if (select.value === 'single') {
        variationSection.style.display = 'block';
        percentageSection.style.display = 'none';
    } else {
        variationSection.style.display = 'none';
        percentageSection.style.display = 'block';
        buildPercentageDistributionDetail(envName, ruleId);
    }
}

// Build percentage distribution UI
function buildPercentageDistributionDetail(envName, ruleId) {
    const percentageSection = document.getElementById(`servePercentage-${ruleId}`);
    
    // For now, use hardcoded variations (var-a, var-b)
    // In a real implementation, this would fetch from currentFlag.variations
    const variations = ['var-a', 'var-b'];
    const equalPercent = Math.floor(100 / variations.length);
    
    let distributionHtml = `
        <div class="percentage-rollout-header">
            <span class="percentage-label">Rollout by</span>
            <select class="percentage-key-select">
                <option value="organization_id">Organization ID</option>
                <option value="user_id">User ID</option>
            </select>
        </div>
        <div class="percentage-distribution-container">
    `;
    
    variations.forEach((variation, index) => {
        const isLast = index === variations.length - 1;
        const percent = isLast ? (100 - (equalPercent * (variations.length - 1))) : equalPercent;
        
        distributionHtml += `
            <div class="percentage-distribution" data-variation="${variation}">
                <input type="number" 
                       class="distribution-input" 
                       min="0" 
                       max="100" 
                       value="${percent}"
                       onchange="updatePercentageFromInputDetail('${envName}', '${ruleId}')" />
                <span class="distribution-icon">%</span>
                <span class="distribution-label">${variation}</span>
            </div>
        `;
    });
    
    distributionHtml += `
        </div>
        <div class="percentage-warning" id="percentWarning-${ruleId}" style="display: none;">
            <span class="warning-icon">⚠</span>
            <span>Percentages must total 100%</span>
        </div>
    `;
    
    percentageSection.innerHTML = distributionHtml;
}

// Update percentage distribution
function updatePercentageFromInputDetail(envName, ruleId) {
    const inputs = document.querySelectorAll(`#servePercentage-${ruleId} .distribution-input`);
    let total = 0;
    
    inputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    
    // Show warning if not 100%
    showPercentageWarningDetail(envName, ruleId, total);
}

// Show percentage warning
function showPercentageWarningDetail(envName, ruleId, total) {
    const warning = document.getElementById(`percentWarning-${ruleId}`);
    if (warning) {
        if (total !== 100) {
            warning.style.display = 'flex';
            warning.querySelector('span:last-child').textContent = `Percentages must total 100% (currently ${total}%)`;
        } else {
            warning.style.display = 'none';
        }
    }
}

// Save environment configuration
function saveEnvironmentConfig(envName) {
    showToast(`✓ ${envName} configuration saved! Changes propagated to all clients in ~5 seconds.`);
}

// Handle flag type change in detail page
function handleFlagTypeChangeDetail() {
    const flagType = document.getElementById('flagTypeDetail').value;
    const container = document.getElementById('variationsContainerDetail');
    
    // Clear existing variations
    container.innerHTML = '';
    
    // Add default variations based on type
    if (flagType === 'boolean') {
        addBooleanVariationDetail('var-a', 'true');
        addBooleanVariationDetail('var-b', 'false');
    } else if (flagType === 'string') {
        addStringVariationDetail('var-a', 'value-a');
        addStringVariationDetail('var-b', 'value-b');
    } else if (flagType === 'number') {
        addNumberVariationDetail('var-a', '1');
        addNumberVariationDetail('var-b', '2');
    } else if (flagType === 'object') {
        addObjectVariationDetail('var-a', '{"key": "value-a"}');
        addObjectVariationDetail('var-b', '{"key": "value-b"}');
    }
}

// Add variation helpers for detail page
function addBooleanVariationDetail(name, value) {
    const container = document.getElementById('variationsContainerDetail');
    const color = 'blue';
    
    const variationHtml = `
        <div class="variation-item">
            <div class="variation-header">
                <div class="variation-icon ${color}">${name.charAt(0).toUpperCase()}</div>
                <div class="variation-name">${name}</div>
            </div>
            <div class="variation-value">
                <select class="form-control">
                    <option value="true" ${value === 'true' ? 'selected' : ''}>true</option>
                    <option value="false" ${value === 'false' ? 'selected' : ''}>false</option>
                </select>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', variationHtml);
}

function addStringVariationDetail(name, value) {
    const container = document.getElementById('variationsContainerDetail');
    const color = 'yellow';
    
    const variationHtml = `
        <div class="variation-item">
            <div class="variation-header">
                <div class="variation-icon ${color}">${name.charAt(0).toUpperCase()}</div>
                <div class="variation-name">${name}</div>
            </div>
            <div class="variation-value">
                <input type="text" class="form-control" value="${value}" placeholder="Enter string value" />
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', variationHtml);
}

function addNumberVariationDetail(name, value) {
    const container = document.getElementById('variationsContainerDetail');
    const color = 'green';
    
    const variationHtml = `
        <div class="variation-item">
            <div class="variation-header">
                <div class="variation-icon ${color}">${name.charAt(0).toUpperCase()}</div>
                <div class="variation-name">${name}</div>
            </div>
            <div class="variation-value">
                <input type="number" class="form-control" value="${value}" placeholder="Enter number" />
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', variationHtml);
}

function addObjectVariationDetail(name, value) {
    const container = document.getElementById('variationsContainerDetail');
    const color = 'purple';
    
    const variationHtml = `
        <div class="variation-item">
            <div class="variation-header">
                <div class="variation-icon ${color}">${name.charAt(0).toUpperCase()}</div>
                <div class="variation-name">${name}</div>
            </div>
            <div class="variation-value">
                <textarea class="form-control" rows="3" placeholder='{"key": "value"}'>${value}</textarea>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', variationHtml);
}

// Handle flag category change
function handleFlagCategoryChangeDetail() {
    const category = document.getElementById('flagCategoryDetail').value;
    const expiryDateInput = document.getElementById('expiryDateDetail');
    const expiryRequired = document.getElementById('expiryRequiredDetail');
    
    if (category === 'killswitch') {
        expiryDateInput.required = false;
        expiryDateInput.disabled = true;
        expiryDateInput.value = '';
        expiryRequired.style.display = 'none';
    } else {
        expiryDateInput.required = true;
        expiryDateInput.disabled = false;
        expiryRequired.style.display = 'inline';
    }
}

// Save variations
function saveVariations() {
    showToast('✓ Flag variations updated successfully!');
}

// Save settings
function saveSettings() {
    showToast('✓ Flag settings updated successfully!');
}

// Debug & Test Tab Functions
function updateDebugContextFields() {
    const contextType = document.getElementById('debugContextType').value;
    
    document.getElementById('debugOrgContext').style.display = contextType === 'org' ? 'block' : 'none';
    document.getElementById('debugUserContext').style.display = contextType === 'user' ? 'block' : 'none';
    document.getElementById('debugCustomContext').style.display = contextType === 'custom' ? 'block' : 'none';
}

function runFlagEvaluation() {
    if (!currentFlag) {
        alert('No flag loaded');
        return;
    }

    const contextType = document.getElementById('debugContextType').value;
    let context = {};
    
    // Build context based on type
    if (contextType === 'org') {
        const orgId = document.getElementById('debugOrgId').value;
        if (!orgId) {
            alert('Please enter an Organization ID');
            return;
        }
        
        context = {
            organization_id: orgId,
            org: {
                id: orgId,
                plan: document.getElementById('debugOrgPlan').value || 'free',
                region: document.getElementById('debugOrgRegion').value || 'US'
            }
        };
    } else if (contextType === 'user') {
        const userId = document.getElementById('debugUserId').value;
        if (!userId) {
            alert('Please enter a User ID');
            return;
        }
        
        context = {
            user_id: userId,
            user: {
                id: userId,
                email: document.getElementById('debugUserEmail').value,
                role: document.getElementById('debugUserRole').value || 'member'
            }
        };
    } else {
        const customJson = document.getElementById('debugCustomJson').value;
        if (!customJson) {
            alert('Please enter context JSON');
            return;
        }
        
        try {
            context = JSON.parse(customJson);
        } catch (e) {
            alert('Invalid JSON: ' + e.message);
            return;
        }
    }
    
    // Run evaluation using the engine from debug.js
    const startTime = performance.now();
    const result = evaluateSingleFlag(currentEnvironment, context, currentFlag);
    const endTime = performance.now();
    const evalTime = Math.round(endTime - startTime);
    
    // Save to flag-specific history
    const evaluation = {
        id: 'eval_' + Date.now(),
        timestamp: new Date().toISOString(),
        flagName: currentFlag.name,
        environment: currentEnvironment,
        context: context,
        result: result,
        evaluationTime: evalTime
    };
    saveFlagEvaluationHistory(evaluation);
    
    // Display result
    displayEvaluationResult(result, evalTime);
    
    // Refresh history display
    loadFlagEvaluationHistory();
}

// Evaluate a single flag (similar to evaluateFlags from debug.js)
function evaluateSingleFlag(env, context, flag) {
    // Load environment configs
    const envConfigs = JSON.parse(localStorage.getItem('environmentConfigs') || '{}');
    
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
                
                if (evaluateRuleForFlag(rule, context)) {
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
                            const hash = hashStringForFlag(String(key)) % 100;
                            
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
        default: flag.defaultVariation
    };
}

// Hash function for consistent bucketing
function hashStringForFlag(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// Evaluate rule
function evaluateRuleForFlag(rule, context) {
    if (!rule.conditions || rule.conditions.length === 0) {
        return false;
    }
    
    return rule.conditions.every(condition => evaluateConditionForFlag(condition, context));
}

// Evaluate condition
function evaluateConditionForFlag(condition, context) {
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

// Display evaluation result
function displayEvaluationResult(result, evalTime) {
    const resultBox = document.getElementById('evaluationResult');
    resultBox.style.display = 'block';
    
    document.getElementById('evalResultValue').textContent = formatValue(result.value);
    document.getElementById('evalResultVariation').textContent = result.variation;
    document.getElementById('evalResultReason').textContent = result.reason;
    document.getElementById('evalResultTime').textContent = evalTime + 'ms';
    
    // Show rule match details if available
    const detailsDiv = document.getElementById('evalResultDetails');
    if (result.ruleMatch) {
        detailsDiv.innerHTML = `
            <h5 style="margin-top: 15px; font-size: 14px;">Matching Logic:</h5>
            <pre style="background: #f8f9fa; padding: 12px; border-radius: 4px; font-size: 12px; overflow-x: auto;">${escapeHtmlForFlag(result.ruleMatch)}</pre>
        `;
    } else {
        detailsDiv.innerHTML = '';
    }
    
    // Scroll to result
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escapeHtmlForFlag(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatValue(value) {
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

// Save evaluation to flag-specific history
function saveFlagEvaluationHistory(evaluation) {
    const historyKey = 'flagEvaluationHistory_' + evaluation.flagName;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history.unshift(evaluation); // Add to beginning
    
    // Keep only last 50 evaluations per flag
    if (history.length > 50) {
        history.splice(50);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
}

// Load and display flag evaluation history
function loadFlagEvaluationHistory() {
    if (!currentFlag) return;
    
    const historyKey = 'flagEvaluationHistory_' + currentFlag.name;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // Filter to last 5 days
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const recentHistory = history.filter(eval => new Date(eval.timestamp) >= fiveDaysAgo);
    
    const historyContainer = document.getElementById('flagEvaluationHistory');
    
    if (recentHistory.length === 0) {
        historyContainer.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 40px 20px;">No evaluation history in the last 5 days. Run an evaluation to see it here.</p>';
        return;
    }
    
    // Show only top 6 most recent
    const displayHistory = recentHistory.slice(0, 6);
    
    historyContainer.innerHTML = displayHistory.map(eval => `
        <div class="history-item-flag" onclick="replayFlagEvaluation('${eval.id}')">
            <div class="history-item-header">
                <span class="history-time">${formatTimeAgo(eval.timestamp)}</span>
                <span class="history-env-badge">${eval.environment}</span>
            </div>
            <div class="history-item-body">
                <div class="history-context">
                    ${formatContextSummary(eval.context)}
                </div>
                <div class="history-result-summary">
                    <span class="history-value">Value: ${formatValue(eval.result.value)}</span>
                    <span class="history-variation">Variation: ${eval.result.variation}</span>
                    <span class="history-reason">${eval.result.reason}</span>
                </div>
                <div class="history-meta">
                    <span>⏱️ ${eval.evaluationTime}ms</span>
                    <span>•</span>
                    <span>${new Date(eval.timestamp).toLocaleString()}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add "View All" button if there are more
    if (recentHistory.length > 6) {
        historyContainer.innerHTML += `
            <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 10px;" onclick="showPreviousContextsModal()">
                View All ${recentHistory.length} Evaluations
            </button>
        `;
    }
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

// Show previous contexts modal
function showPreviousContextsModal() {
    if (!currentFlag) return;
    
    const historyKey = 'flagEvaluationHistory_' + currentFlag.name;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // Filter to last 5 days
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const recentHistory = history.filter(eval => new Date(eval.timestamp) >= fiveDaysAgo);
    
    const modal = document.getElementById('previousContextsModal');
    const listContainer = document.getElementById('previousContextsList');
    
    if (recentHistory.length === 0) {
        listContainer.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 40px 20px;">No evaluation history in the last 5 days.</p>';
    } else {
        listContainer.innerHTML = recentHistory.map(eval => `
            <div class="previous-context-card" onclick="loadAndEditContext('${eval.id}')">
                <div class="context-card-header">
                    <div class="context-card-title">
                        <span class="history-time">${new Date(eval.timestamp).toLocaleString()}</span>
                        <span class="history-env-badge">${eval.environment}</span>
                    </div>
                    <span class="context-time-ago">${formatTimeAgo(eval.timestamp)}</span>
                </div>
                <div class="context-card-body">
                    <div class="context-summary">
                        <strong>Context:</strong> ${formatContextSummary(eval.context)}
                    </div>
                    <div class="context-details">
                        <pre style="font-size: 11px; background: #f8f9fa; padding: 8px; border-radius: 4px; margin: 8px 0; max-height: 100px; overflow-y: auto;">${JSON.stringify(eval.context, null, 2)}</pre>
                    </div>
                    <div class="context-result">
                        <div class="result-row-compact">
                            <span class="result-label-compact">Result:</span>
                            <span class="result-value-compact" style="color: #667eea; font-weight: 600;">${formatValue(eval.result.value)}</span>
                        </div>
                        <div class="result-row-compact">
                            <span class="result-label-compact">Variation:</span>
                            <span class="result-value-compact">${eval.result.variation}</span>
                        </div>
                        <div class="result-row-compact">
                            <span class="result-label-compact">Reason:</span>
                            <span class="result-value-compact">${eval.result.reason}</span>
                        </div>
                        <div class="result-row-compact">
                            <span class="result-label-compact">Execution Time:</span>
                            <span class="result-value-compact">${eval.evaluationTime}ms</span>
                        </div>
                    </div>
                </div>
                <div class="context-card-footer">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); loadAndEditContext('${eval.id}')">
                        📝 Load & Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); loadAndRunContext('${eval.id}')">
                        ▶️ Run As-Is
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    modal.style.display = 'flex';
}

function closePreviousContextsModal() {
    document.getElementById('previousContextsModal').style.display = 'none';
}

// Load context and allow editing
function loadAndEditContext(evalId) {
    if (!currentFlag) return;
    
    const historyKey = 'flagEvaluationHistory_' + currentFlag.name;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const evaluation = history.find(e => e.id === evalId);
    
    if (!evaluation) {
        alert('Evaluation not found');
        return;
    }
    
    // Close modal
    closePreviousContextsModal();
    
    // Switch to Debug tab
    const debugTab = document.querySelector('.tab[onclick*="debug"]');
    if (debugTab) debugTab.click();
    
    // Populate the form with the context for editing
    populateDebugForm(evaluation.context);
    
    // Show previous result for comparison
    displayEvaluationResult(evaluation.result, evaluation.evaluationTime);
    
    // Scroll to form
    document.getElementById('debugTab').scrollIntoView({ behavior: 'smooth' });
    
    showToast('✓ Context loaded! Edit as needed and click "Run Evaluation"');
}

// Load context and run immediately
function loadAndRunContext(evalId) {
    if (!currentFlag) return;
    
    const historyKey = 'flagEvaluationHistory_' + currentFlag.name;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const evaluation = history.find(e => e.id === evalId);
    
    if (!evaluation) {
        alert('Evaluation not found');
        return;
    }
    
    // Close modal
    closePreviousContextsModal();
    
    // Switch to Debug tab
    const debugTab = document.querySelector('.tab[onclick*="debug"]');
    if (debugTab) debugTab.click();
    
    // Populate the form
    populateDebugForm(evaluation.context);
    
    // Run evaluation automatically
    setTimeout(() => {
        runFlagEvaluation();
    }, 300);
}

// Replay a previous evaluation
function replayFlagEvaluation(evalId) {
    loadAndEditContext(evalId);
}

// Populate debug form from context
function populateDebugForm(context) {
    if (context.org) {
        document.getElementById('debugContextType').value = 'org';
        updateDebugContextFields();
        document.getElementById('debugOrgId').value = context.org.id;
        document.getElementById('debugOrgPlan').value = context.org.plan || '';
        document.getElementById('debugOrgRegion').value = context.org.region || '';
    } else if (context.user) {
        document.getElementById('debugContextType').value = 'user';
        updateDebugContextFields();
        document.getElementById('debugUserId').value = context.user.id;
        document.getElementById('debugUserEmail').value = context.user.email || '';
        document.getElementById('debugUserRole').value = context.user.role || '';
    } else {
        document.getElementById('debugContextType').value = 'custom';
        updateDebugContextFields();
        document.getElementById('debugCustomJson').value = JSON.stringify(context, null, 2);
    }
}

// Clear flag history
function clearFlagHistory() {
    if (!currentFlag) return;
    
    if (confirm('Are you sure you want to clear all evaluation history for this flag?')) {
        const historyKey = 'flagEvaluationHistory_' + currentFlag.name;
        localStorage.removeItem(historyKey);
        loadFlagEvaluationHistory();
        showToast('✓ Evaluation history cleared');
    }
}

// Global variable for selected context
let selectedContextId = null;

// Generate sample evaluation data
function generateSampleEvaluationData() {
    if (!currentFlag) return;
    
    const historyKey = 'flagEvaluationHistory_' + currentFlag.name;
    const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // Only generate if no history exists
    if (existing.length > 0) return;
    
    const sampleContexts = [
        {
            context: {
                organization_id: "12345",
                org: { id: "12345", plan: "enterprise", region: "US" }
            },
            env: "prod"
        },
        {
            context: {
                organization_id: "67890",
                org: { id: "67890", plan: "professional", region: "EU" }
            },
            env: "prod"
        },
        {
            context: {
                user_id: "user_001",
                user: { id: "user_001", email: "john@example.com", role: "admin" }
            },
            env: "stage"
        },
        {
            context: {
                organization_id: "11111",
                org: { id: "11111", plan: "free", region: "APAC" }
            },
            env: "prod"
        },
        {
            context: {
                organization_id: "22222",
                org: { id: "22222", plan: "starter", region: "US" }
            },
            env: "stage"
        }
    ];
    
    const history = [];
    const now = Date.now();
    
    sampleContexts.forEach((sample, index) => {
        // Create evaluations at different times over last 3 days
        const timestamp = new Date(now - (index * 12 * 60 * 60 * 1000)); // 12 hours apart
        
        const result = evaluateSingleFlag(sample.env, sample.context, currentFlag);
        
        history.push({
            id: 'eval_' + timestamp.getTime(),
            timestamp: timestamp.toISOString(),
            flagName: currentFlag.name,
            environment: sample.env,
            context: sample.context,
            result: result,
            evaluationTime: Math.floor(Math.random() * 10) + 3
        });
    });
    
    localStorage.setItem(historyKey, JSON.stringify(history));
}

// Load context list
function loadContextList() {
    if (!currentFlag) return;
    
    const historyKey = 'flagEvaluationHistory_' + currentFlag.name;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // Filter to last 5 days
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const recentHistory = history.filter(eval => new Date(eval.timestamp) >= fiveDaysAgo);
    
    const listContainer = document.getElementById('contextList');
    
    if (recentHistory.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No contexts yet. Click "+ New Context" to create one.</div>';
        return;
    }
    
    listContainer.innerHTML = recentHistory.map(eval => {
        const contextSummary = formatContextSummary(eval.context);
        const isSelected = selectedContextId === eval.id;
        
        return `
            <div class="context-item ${isSelected ? 'selected' : ''}" onclick="selectContext('${eval.id}')" data-context-id="${eval.id}">
                <div class="context-item-header">
                    <span class="context-item-time">${formatTimeAgo(eval.timestamp)}</span>
                    <span class="context-item-env">${eval.environment}</span>
                </div>
                <div class="context-item-summary">${contextSummary}</div>
                <div class="context-item-result">
                    <span class="result-badge result-badge-${eval.result.variation}">${eval.result.value}</span>
                    <span class="context-item-exec-time">${eval.evaluationTime}ms</span>
                </div>
            </div>
        `;
    }).join('');
}

// Filter context list
function filterContextList() {
    const searchTerm = document.getElementById('contextSearchInput').value.toLowerCase();
    const items = document.querySelectorAll('.context-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Select a context from the list
function selectContext(contextId) {
    if (!currentFlag) return;
    
    const historyKey = 'flagEvaluationHistory_' + currentFlag.name;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const evaluation = history.find(e => e.id === contextId);
    
    if (!evaluation) return;
    
    selectedContextId = contextId;
    
    // Update UI
    document.querySelectorAll('.context-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-context-id="${contextId}"]`)?.classList.add('selected');
    
    // Load context into editor
    document.getElementById('contextJsonEditor').value = JSON.stringify(evaluation.context, null, 2);
    document.getElementById('selectedContextTitle').textContent = formatContextSummary(evaluation.context);
    document.getElementById('selectedContextEnv').textContent = evaluation.environment;
    document.getElementById('selectedContextEnv').style.display = 'inline-block';
    document.getElementById('runEvalButton').disabled = false;
    
    // Clear previous results
    document.getElementById('resultsSection').style.display = 'none';
}

// Create new context
function createNewContext() {
    selectedContextId = null;
    
    // Clear selection
    document.querySelectorAll('.context-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Set default context
    const defaultContext = {
        organization_id: "12345",
        org: {
            plan: "enterprise",
            region: "US"
        }
    };
    
    document.getElementById('contextJsonEditor').value = JSON.stringify(defaultContext, null, 2);
    document.getElementById('selectedContextTitle').textContent = 'New Context';
    document.getElementById('selectedContextEnv').textContent = currentEnvironment;
    document.getElementById('selectedContextEnv').style.display = 'inline-block';
    document.getElementById('runEvalButton').disabled = false;
    
    // Clear results
    document.getElementById('resultsSection').style.display = 'none';
}

// Run evaluation from JSON editor
function runContextEvaluation() {
    if (!currentFlag) return;
    
    const jsonEditor = document.getElementById('contextJsonEditor');
    let context;
    
    try {
        context = JSON.parse(jsonEditor.value);
    } catch (e) {
        alert('Invalid JSON: ' + e.message);
        return;
    }
    
    // Run evaluation
    const startTime = performance.now();
    const result = evaluateSingleFlag(currentEnvironment, context, currentFlag);
    const endTime = performance.now();
    const evalTime = Math.round(endTime - startTime);
    
    // Save to history
    const evaluation = {
        id: 'eval_' + Date.now(),
        timestamp: new Date().toISOString(),
        flagName: currentFlag.name,
        environment: currentEnvironment,
        context: context,
        result: result,
        evaluationTime: evalTime
    };
    saveFlagEvaluationHistory(evaluation);
    
    // Display result
    displayContextEvaluationResult(result, evalTime);
    
    // Reload context list
    loadContextList();
    
    // Select the new context
    selectedContextId = evaluation.id;
    setTimeout(() => {
        const newItem = document.querySelector(`[data-context-id="${evaluation.id}"]`);
        if (newItem) {
            newItem.classList.add('selected');
            newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

// Display evaluation result
function displayContextEvaluationResult(result, evalTime) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    
    document.getElementById('resultValue').textContent = formatValue(result.value);
    document.getElementById('resultVariation').textContent = result.variation;
    document.getElementById('resultExecTime').textContent = evalTime + 'ms';
    document.getElementById('resultReason').textContent = result.reason;
    document.getElementById('resultTimestamp').textContent = new Date().toLocaleTimeString();
    
    // Show matching logic if available
    const detailsBox = document.getElementById('resultDetailsBox');
    if (result.ruleMatch) {
        document.getElementById('resultDetails').textContent = result.ruleMatch;
        detailsBox.style.display = 'block';
    } else {
        detailsBox.style.display = 'none';
    }
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Load history when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for current flag to load
    setTimeout(() => {
        if (currentFlag) {
            generateSampleEvaluationData();
            loadContextList();
        }
    }, 500);
});

// Add CSS for toast animations
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

