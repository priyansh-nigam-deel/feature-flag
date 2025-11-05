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

