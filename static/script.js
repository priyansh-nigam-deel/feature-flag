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

// Initialize flags in localStorage if not exists
function initializeFlags() {
    if (!localStorage.getItem('featureFlags')) {
        const defaultFlags = [
            {
                name: 'enable_new_dashboard',
                description: 'Enable new analytics dashboard for users',
                type: 'boolean',
                status: 'active',
                environment: 'prod',
                owner: 'Sarah Johnson',
                team: 'Analytics Team',
                maintainer: 'Mike Chen',
                expiryDate: '2025-12-15',
                defaultVariation: 'false',
                createdAt: '2025-10-01T10:00:00Z',
                rolloutPercentage: 75
            },
            {
                name: 'payment_v2_enabled',
                description: 'Enable v2 payment processing system',
                type: 'boolean',
                status: 'active',
                environment: 'stage',
                owner: 'Mike Chen',
                team: 'Payments Team',
                maintainer: 'Lisa Brown',
                expiryDate: '2025-11-20',
                defaultVariation: 'false',
                createdAt: '2025-10-05T14:30:00Z',
                rolloutPercentage: 50
            },
            {
                name: 'theme_variant',
                description: 'UI theme selection for A/B testing',
                type: 'string',
                status: 'inactive',
                environment: 'dev',
                owner: 'Emma Davis',
                team: 'Platform Team',
                maintainer: 'Emma Davis',
                expiryDate: '2025-12-01',
                defaultVariation: 'light',
                createdAt: '2025-10-10T09:15:00Z',
                rolloutPercentage: 0
            },
            {
                name: 'max_upload_size',
                description: 'Maximum file upload size in MB',
                type: 'number',
                status: 'active',
                environment: 'prod',
                owner: 'David Wilson',
                team: 'Infrastructure Team',
                maintainer: 'Tom Anderson',
                expiryDate: '2026-01-10',
                defaultVariation: '100',
                createdAt: '2025-09-20T16:45:00Z',
                rolloutPercentage: 100
            },
            {
                name: 'feature_config',
                description: 'Complex feature configuration object',
                type: 'object',
                status: 'inactive',
                environment: 'demo',
                owner: 'Lisa Brown',
                team: 'Platform Team',
                maintainer: 'David Wilson',
                expiryDate: '2025-11-25',
                defaultVariation: '{"enabled": false}',
                createdAt: '2025-10-15T11:20:00Z',
                rolloutPercentage: 0
            },
            {
                name: 'enable_notifications',
                description: 'Enable push notifications feature',
                type: 'boolean',
                status: 'active',
                environment: 'prod',
                owner: 'Tom Anderson',
                team: 'Mobile Team',
                maintainer: 'Sarah Johnson',
                expiryDate: '2025-11-18',
                defaultVariation: 'false',
                createdAt: '2025-10-01T13:00:00Z',
                rolloutPercentage: 85
            }
        ];
        localStorage.setItem('featureFlags', JSON.stringify(defaultFlags));
    }
}

// Set default expiry date to +90 days
document.addEventListener('DOMContentLoaded', function() {
    initializeFlags();
    
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        const today = new Date();
        const ninetyDaysLater = new Date(today.setDate(today.getDate() + 90));
        const formattedDate = ninetyDaysLater.toISOString().split('T')[0];
        expiryDateInput.value = formattedDate;
    }
});

// Update default variation placeholder based on flag type
function updateDefaultVariation() {
    const flagType = document.getElementById('flagType').value;
    const defaultVariation = document.getElementById('defaultVariation');
    
    const placeholders = {
        'boolean': 'true or false',
        'string': 'e.g., variant_a, default, control',
        'number': 'e.g., 100, 0, 50',
        'object': 'e.g., {"key": "value"}'
    };
    
    if (flagType && placeholders[flagType]) {
        defaultVariation.placeholder = placeholders[flagType];
    }
}

// Validate JSON in targeting rules
function validateJSON() {
    const targetingRules = document.getElementById('targetingRules').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (!targetingRules) {
        errorMessage.style.display = 'none';
        alert('✓ No JSON to validate. Targeting rules are optional.');
        return;
    }
    
    try {
        JSON.parse(targetingRules);
        errorMessage.style.display = 'none';
        alert('✓ Valid JSON! Schema validation passed.');
    } catch (e) {
        errorText.textContent = 'Invalid JSON in Targeting Rules: ' + e.message;
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth' });
    }
}


// Variations Management
let variationCounter = 0;
const variationColors = ['blue', 'yellow', 'green', 'purple', 'red'];

function addVariation() {
    variationCounter++;
    const container = document.getElementById('variationsContainer');
    const colorClass = variationColors[(variationCounter - 1) % variationColors.length];
    
    const variationHtml = `
        <div class="variation-card" id="variation-${variationCounter}">
            <div class="variation-header">
                <div class="variation-icon ${colorClass}"></div>
                <h4 class="variation-title">Variation ${variationCounter}</h4>
            </div>
            
            <div class="variation-fields">
                <div class="variation-field">
                    <label class="variation-label">Name (optional)</label>
                    <input type="text" class="variation-input variation-name" placeholder="var-${String.fromCharCode(96 + variationCounter)}" value="var-${String.fromCharCode(96 + variationCounter)}">
                </div>
                <div class="variation-field">
                    <label class="variation-label">Description (optional)</label>
                    <input type="text" class="variation-input" placeholder="Description for this variation">
                </div>
            </div>
            
            <div class="variation-field">
                <label class="variation-label">Value</label>
                <textarea class="variation-textarea" placeholder='{\n  "enabled": "${String.fromCharCode(96 + variationCounter)}"\n}'>{\n  "enabled": "${String.fromCharCode(96 + variationCounter)}"\n}</textarea>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', variationHtml);
}

// Environment Management
let currentEnvironment = 'dev';
let gigerCounter = 1;

function selectEnvironmentTile(event, envName) {
    currentEnvironment = envName;
    
    // Update active tile
    document.querySelectorAll('.env-tile').forEach(tile => {
        if (tile.classList.contains('env-tile-add')) return;
        tile.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Build and show environment overlay
    buildEnvironmentOverlay(envName);
}

// Match environment against pattern (e.g., 'giger-*' matches 'giger-1', 'giger-2')
function matchesPattern(envName, pattern) {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(envName);
}

// Get config for environment (checks exact match, then patterns, then default)
function getEnvironmentConfig(envName) {
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

function buildEnvironmentOverlay(envName) {
    const overlay = document.getElementById('envConfigOverlay');
    
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
        const result = getEnvironmentConfig(envName);
        envConfig = result.config;
        source = result.source;
        pattern = result.pattern;
    }
    
    // Get env display name
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
        
        <!-- Targeting Context Keys -->
        <div class="env-config-section">
            <h5>Targeting Context Keys</h5>
            <div class="targeting-keys-light">
                <div class="form-row">
                    <div class="form-group">
                        <label for="contextKeyType-${envName}">Primary Context Key *</label>
                        <select id="contextKeyType-${envName}" name="contextKeyType-${envName}" class="light-select" onchange="saveEnvironmentConfig('${envName}')">
                            <option value="organization_id" ${envConfig.contextKeyType === 'organization_id' ? 'selected' : ''}>Organization ID</option>
                            <option value="user_id" ${envConfig.contextKeyType === 'user_id' ? 'selected' : ''}>User ID</option>
                        </select>
                        <small>Primary key for targeting and rollout</small>
                    </div>
                    <div class="form-group">
                        <label for="secondaryContextKey-${envName}">Secondary Context Key (Optional)</label>
                        <select id="secondaryContextKey-${envName}" name="secondaryContextKey-${envName}" class="light-select" onchange="saveEnvironmentConfig('${envName}')">
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
                <select class="flag-toggle-light" data-env="${envName}" onchange="updateFlagStatus(this)">
                    <option value="off" ${envConfig.flagStatus === 'off' ? 'selected' : ''}>Off</option>
                    <option value="on" ${envConfig.flagStatus === 'on' ? 'selected' : ''}>On</option>
                </select>
                <span>serving</span>
                <select class="variation-select-light" id="offVariation-${envName}" onchange="saveEnvironmentConfig('${envName}')">
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
            
            <div class="targeting-rules-container-light" data-env="${envName}">
                <!-- Rules will be added here dynamically -->
            </div>

            <button type="button" class="btn-add-rule-light" onclick="addTargetingRule('${envName}')">
                <span class="plus-icon">+</span> Add targeting rule
            </button>

            <div class="default-rule-light">
                <h6>Default rule</h6>
                <p class="rule-description">When targeting is on and no rules match, serve:</p>
                <div class="default-serve-light">
                    <label for="defaultServe-${envName}">Serve</label>
                    <select id="defaultServe-${envName}" class="light-select" data-env="${envName}" onchange="saveEnvironmentConfig('${envName}')">
                        <option value="">Select variation...</option>
                        <option value="var-a" ${envConfig.defaultServe === 'var-a' ? 'selected' : ''}>var-a</option>
                        <option value="var-b" ${envConfig.defaultServe === 'var-b' ? 'selected' : ''}>var-b</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

// Save environment configuration
function saveEnvironmentConfig(envName) {
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
    
    console.log(`${isPattern ? 'Pattern' : 'Environment'} config saved for ${envName}:`, targetConfig);
}

function showAddEnvironmentDialog() {
    const dropdown = document.getElementById('env-dropdown');
    
    if (dropdown) {
        dropdown.remove();
        return;
    }
    
    const addTile = document.querySelector('.env-tile-add');
    const dropdownHtml = `
        <div id="env-dropdown" class="env-add-dropdown">
            <div class="env-dropdown-item" onclick="addNewEnvironmentTile('specific')">
                <span class="env-tile-dot gray"></span> Specific Environment
            </div>
            <div class="env-dropdown-item" onclick="addNewEnvironmentTile('pattern')">
                <span class="env-tile-dot yellow"></span> Pattern-based Configuration
            </div>
        </div>
    `;
    
    addTile.style.position = 'relative';
    addTile.insertAdjacentHTML('beforeend', dropdownHtml);
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            const dropdown = document.getElementById('env-dropdown');
            if (dropdown && !dropdown.contains(e.target) && !addTile.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

function addNewEnvironmentTile(type) {
    const dropdown = document.getElementById('env-dropdown');
    if (dropdown) dropdown.remove();
    
    let envName;
    let displayName;
    let description;
    let isPattern = false;
    
    if (type === 'pattern') {
        envName = prompt('Enter environment pattern (e.g., giger-*, feature-*, test-*):\n\n* = matches any characters');
        if (!envName) return;
        
        // Validate pattern
        if (!envName.includes('*')) {
            alert('Pattern must include * wildcard');
            return;
        }
        
        displayName = envName;
        description = 'Pattern-based config';
        isPattern = true;
        
        // Initialize pattern config with default values
        patternConfigs[envName] = {...defaultEnvironmentConfig};
    } else {
        envName = prompt('Enter specific environment name:');
        if (!envName) return;
        displayName = envName;
        envName = envName.toLowerCase().replace(/\s+/g, '-');
        description = 'Specific environment';
        
        // Initialize environment config with default values
        environmentConfigs[envName] = {...defaultEnvironmentConfig};
    }
    
    const container = document.getElementById('envTilesContainer');
    const addTile = container.querySelector('.env-tile-add');
    
    const colorClass = isPattern ? 'yellow' : 'gray';
    const icon = isPattern ? '🔍' : '';
    
    const newTileHtml = `
        <div class="env-tile" data-env="${envName}" ${isPattern ? 'data-pattern="true"' : ''} onclick="selectEnvironmentTile(event, '${envName}')">
            <div class="env-tile-header">
                <span class="env-tile-dot ${colorClass}"></span>
                <h4 class="env-tile-name">${icon} ${displayName}</h4>
            </div>
            <p class="env-tile-description">${description}</p>
        </div>
    `;
    
    addTile.insertAdjacentHTML('beforebegin', newTileHtml);
    
    // Auto-select the new tile
    const newTile = addTile.previousElementSibling;
    selectEnvironmentTile({ currentTarget: newTile }, envName);
}

// Flag Category Change Handler
function handleFlagCategoryChange() {
    const flagCategory = document.getElementById('flagCategory').value;
    const expiryDate = document.getElementById('expiryDate');
    const expiryRequired = document.getElementById('expiryRequired');
    
    if (flagCategory === 'killswitch') {
        expiryDate.required = false;
        expiryDate.disabled = true;
        expiryDate.value = '';
        expiryRequired.style.display = 'none';
    } else if (flagCategory === 'custom') {
        expiryDate.required = true;
        expiryDate.disabled = false;
        expiryRequired.style.display = 'inline';
        
        // Set default +90 days
        const date = new Date();
        date.setDate(date.getDate() + 90);
        expiryDate.value = date.toISOString().split('T')[0];
    }
}


// Flag Type Change Handler
function handleFlagTypeChange() {
    const flagType = document.getElementById('flagType').value;
    
    // Clear existing variations
    const container = document.getElementById('variationsContainer');
    container.innerHTML = '';
    variationCounter = 0;
    
    // Add variations based on flag type
    if (flagType === 'boolean') {
        addBooleanVariation('true', true);
        addBooleanVariation('false', false);
    } else if (flagType === 'string') {
        addStringVariation('var-a', 'string-value-a');
        addStringVariation('var-b', 'string-value-b');
    } else if (flagType === 'number') {
        addNumberVariation('var-a', 0);
        addNumberVariation('var-b', 1);
    } else if (flagType === 'object') {
        addObjectVariation('var-a', '{\n  "enabled": "a"\n}');
        addObjectVariation('var-b', '{\n  "enabled": "b"\n}');
    } else {
        addVariation(); // Default
        addVariation();
    }
}

function addBooleanVariation(name, value) {
    variationCounter++;
    const container = document.getElementById('variationsContainer');
    const colorClass = value ? 'blue' : 'yellow';
    
    const variationHtml = `
        <div class="variation-card" id="variation-${variationCounter}">
            <div class="variation-header">
                <div class="variation-icon ${colorClass}"></div>
                <h4 class="variation-title">Variation ${variationCounter}</h4>
            </div>
            
            <div class="variation-fields">
                <div class="variation-field">
                    <label class="variation-label">Name (optional)</label>
                    <input type="text" class="variation-input variation-name" placeholder="${name}" value="${name}">
                </div>
                <div class="variation-field">
                    <label class="variation-label">Description (optional)</label>
                    <input type="text" class="variation-input" placeholder="Description for this variation">
                </div>
            </div>
            
            <div class="variation-field">
                <label class="variation-label">Value</label>
                <textarea class="variation-textarea" placeholder='${value}'>${value}</textarea>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', variationHtml);
}

function addStringVariation(name, value) {
    variationCounter++;
    const container = document.getElementById('variationsContainer');
    const colorClass = variationColors[(variationCounter - 1) % variationColors.length];
    
    const variationHtml = `
        <div class="variation-card" id="variation-${variationCounter}">
            <div class="variation-header">
                <div class="variation-icon ${colorClass}"></div>
                <h4 class="variation-title">Variation ${variationCounter}</h4>
            </div>
            
            <div class="variation-fields">
                <div class="variation-field">
                    <label class="variation-label">Name (optional)</label>
                    <input type="text" class="variation-input variation-name" placeholder="${name}" value="${name}">
                </div>
                <div class="variation-field">
                    <label class="variation-label">Description (optional)</label>
                    <input type="text" class="variation-input" placeholder="Description for this variation">
                </div>
            </div>
            
            <div class="variation-field">
                <label class="variation-label">Value</label>
                <input type="text" class="variation-input" placeholder="${value}" value="${value}">
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', variationHtml);
}

function addNumberVariation(name, value) {
    variationCounter++;
    const container = document.getElementById('variationsContainer');
    const colorClass = variationColors[(variationCounter - 1) % variationColors.length];
    
    const variationHtml = `
        <div class="variation-card" id="variation-${variationCounter}">
            <div class="variation-header">
                <div class="variation-icon ${colorClass}"></div>
                <h4 class="variation-title">Variation ${variationCounter}</h4>
            </div>
            
            <div class="variation-fields">
                <div class="variation-field">
                    <label class="variation-label">Name (optional)</label>
                    <input type="text" class="variation-input variation-name" placeholder="${name}" value="${name}">
                </div>
                <div class="variation-field">
                    <label class="variation-label">Description (optional)</label>
                    <input type="text" class="variation-input" placeholder="Description for this variation">
                </div>
            </div>
            
            <div class="variation-field">
                <label class="variation-label">Value</label>
                <input type="number" class="variation-input" placeholder="${value}" value="${value}">
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', variationHtml);
}

function addObjectVariation(name, value) {
    variationCounter++;
    const container = document.getElementById('variationsContainer');
    const colorClass = variationColors[(variationCounter - 1) % variationColors.length];
    
    const variationHtml = `
        <div class="variation-card" id="variation-${variationCounter}">
            <div class="variation-header">
                <div class="variation-icon ${colorClass}"></div>
                <h4 class="variation-title">Variation ${variationCounter}</h4>
            </div>
            
            <div class="variation-fields">
                <div class="variation-field">
                    <label class="variation-label">Name (optional)</label>
                    <input type="text" class="variation-input variation-name" placeholder="${name}" value="${name}">
                </div>
                <div class="variation-field">
                    <label class="variation-label">Description (optional)</label>
                    <input type="text" class="variation-input" placeholder="Description for this variation">
                </div>
            </div>
            
            <div class="variation-field">
                <label class="variation-label">Value (JSON)</label>
                <textarea class="variation-textarea" placeholder='${value}'>${value}</textarea>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', variationHtml);
}

// Flag Status Update
function updateFlagStatus(selectElement) {
    if (selectElement.value === 'on') {
        selectElement.style.background = '#10b981';
        // Show targeting rules when flag is on
    } else {
        selectElement.style.background = '#64748b';
    }
}

// Initialize with 2 default variations
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('variationsContainer')) {
        addVariation(); // var-a
        addVariation(); // var-b
    }
    
    // Set default expiry date to +90 days
    const expiryDate = document.getElementById('expiryDate');
    if (expiryDate) {
        const date = new Date();
        date.setDate(date.getDate() + 90);
        expiryDate.value = date.toISOString().split('T')[0];
    }
    
    // Initialize dev environment overlay
    if (document.getElementById('envConfigOverlay')) {
        buildEnvironmentOverlay('default');
    }
});

// Targeting Rules Management (Simplified - No "Kind" field)
let ruleCounter = 0;
let conditionCounter = 0;

function addTargetingRule(envName) {
    ruleCounter++;
    const container = document.querySelector(`.targeting-rules-container-light[data-env="${envName}"]`);
    
    if (!container) {
        console.error('Container not found for', envName);
        return;
    }
    
    const ruleHtml = `
        <div class="targeting-rule" id="rule-${envName}-${ruleCounter}" data-env="${envName}">
            <div class="rule-header">
                <input type="text" class="rule-title-input" value="Rule ${ruleCounter}" placeholder="Rule name">
                <div class="rule-actions">
                    <button type="button" class="btn-icon" onclick="removeRule('${envName}', ${ruleCounter})" title="Delete rule">
                        🗑️
                    </button>
                    <button type="button" class="btn-icon" title="More options">⋯</button>
                    <button type="button" class="btn-icon" title="Undo">↶</button>
                </div>
            </div>
            <div id="conditions-${envName}-${ruleCounter}">
                <!-- Conditions will be added here -->
            </div>
            <button type="button" class="btn-add-condition" onclick="addCondition('${envName}', ${ruleCounter})" title="Add condition">+</button>
            
            <div class="rule-serve-section">
                <span class="rule-serve-label">Serve</span>
                <select class="rule-serve-type-select" id="serveType-${envName}-${ruleCounter}" onchange="toggleServeType('${envName}', ${ruleCounter})">
                    <option value="variation">Single variation</option>
                    <option value="percentage">Percentage rollout</option>
                </select>
            </div>
            
            <div id="serve-variation-${envName}-${ruleCounter}" class="serve-variation-section">
                <span class="rule-then-label">Then serve:</span>
                <select class="rule-then-select">
                    <option value="">Select variation...</option>
                    <option value="var-a">var-a</option>
                    <option value="var-b">var-b</option>
                </select>
            </div>
            
            <div id="serve-percentage-${envName}-${ruleCounter}" class="serve-percentage-section" style="display: none;">
                <div class="percentage-rollout-header">
                    <span class="percentage-label">Percentage rollout based on:</span>
                    <select class="percentage-key-select">
                        <option value="organization_id">Organization ID</option>
                        <option value="user_id">User ID</option>
                        <option value="team_id">Team ID</option>
                        <option value="email">Email</option>
                    </select>
                </div>
                <div id="percentage-distribution-${envName}-${ruleCounter}" class="percentage-distribution-container">
                    <!-- Dynamic percentage distribution will be added here -->
                </div>
            </div>
            
            <div class="rule-warning">
                <span class="warning-icon">⚠️</span>
                <span>This rule needs at least one condition to be valid</span>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', ruleHtml);
    
    // Add first condition by default
    addCondition(envName, ruleCounter);
}

function toggleServeType(envName, ruleId) {
    const serveType = document.getElementById(`serveType-${envName}-${ruleId}`).value;
    const variationSection = document.getElementById(`serve-variation-${envName}-${ruleId}`);
    const percentageSection = document.getElementById(`serve-percentage-${envName}-${ruleId}`);
    
    if (serveType === 'percentage') {
        variationSection.style.display = 'none';
        percentageSection.style.display = 'block';
        
        // Build percentage distribution dynamically
        buildPercentageDistribution(envName, ruleId);
    } else {
        variationSection.style.display = 'flex';
        percentageSection.style.display = 'none';
    }
}

function buildPercentageDistribution(envName, ruleId) {
    const container = document.getElementById(`percentage-distribution-${envName}-${ruleId}`);
    
    // Get all variations
    const variations = getAllVariations();
    
    if (variations.length === 0) {
        container.innerHTML = '<p style="color: #a0aec0;">Please define variations first in the Variations tab.</p>';
        return;
    }
    
    // Calculate initial equal distribution
    const equalPercentage = Math.floor(100 / variations.length);
    const remainder = 100 - (equalPercentage * variations.length);
    
    let distributionHtml = '<div class="percentage-distribution">';
    
    variations.forEach((variation, index) => {
        const percentage = index === 0 ? equalPercentage + remainder : equalPercentage;
        const colorClass = variationColors[index % variationColors.length];
        
        distributionHtml += `
            <div class="distribution-item">
                <input type="number" 
                       class="distribution-input percentage-input" 
                       id="dist-${index + 1}-${envName}-${ruleId}" 
                       value="${percentage}" 
                       min="0" 
                       max="100"
                       data-variation="${variation}"
                       oninput="updatePercentageFromInput('${envName}', ${ruleId})"> %
                <span class="distribution-icon ${colorClass}">◆</span>
                <span class="distribution-label">${variation}</span>
            </div>
        `;
    });
    
    distributionHtml += '</div>';
    container.innerHTML = distributionHtml;
}

function getAllVariations() {
    const variations = [];
    const variationCards = document.querySelectorAll('.variation-card');
    
    variationCards.forEach(card => {
        const nameInput = card.querySelector('.variation-name');
        if (nameInput && nameInput.value) {
            variations.push(nameInput.value);
        }
    });
    
    return variations;
}

function updatePercentageFromInput(envName, ruleId) {
    const percentageInputs = document.querySelectorAll(`#percentage-distribution-${envName}-${ruleId} .percentage-input`);
    
    if (percentageInputs.length === 0) return;
    
    // Get all values
    const values = Array.from(percentageInputs).map(input => {
        let val = parseInt(input.value) || 0;
        if (val < 0) val = 0;
        if (val > 100) val = 100;
        return val;
    });
    
    // Calculate total
    const total = values.reduce((sum, val) => sum + val, 0);
    
    // If total exceeds 100, normalize
    if (total > 100) {
        const scale = 100 / total;
        values.forEach((val, index) => {
            percentageInputs[index].value = Math.floor(val * scale);
        });
        
        // Adjust last value to make exactly 100
        const newTotal = Array.from(percentageInputs).reduce((sum, input) => sum + parseInt(input.value), 0);
        if (newTotal !== 100) {
            percentageInputs[percentageInputs.length - 1].value = parseInt(percentageInputs[percentageInputs.length - 1].value) + (100 - newTotal);
        }
    }
    
    // Show warning if total doesn't equal 100
    showPercentageWarning(envName, ruleId, total);
}

function showPercentageWarning(envName, ruleId, total) {
    const container = document.getElementById(`percentage-distribution-${envName}-${ruleId}`);
    let warningDiv = container.querySelector('.percentage-warning');
    
    if (total !== 100) {
        if (!warningDiv) {
            warningDiv = document.createElement('div');
            warningDiv.className = 'percentage-warning';
            container.appendChild(warningDiv);
        }
        warningDiv.innerHTML = `
            <span class="warning-icon">⚠️</span>
            <span>Total must equal 100% (current: ${total}%)</span>
        `;
        warningDiv.style.display = 'flex';
    } else {
        if (warningDiv) {
            warningDiv.style.display = 'none';
        }
    }
}

function addCondition(envName, ruleId) {
    conditionCounter++;
    const conditionsContainer = document.getElementById(`conditions-${envName}-${ruleId}`);
    
    const conditionHtml = `
        <div class="rule-condition" id="condition-${envName}-${conditionCounter}">
            <div class="condition-if">IF</div>
            
            <div class="condition-field">
                <label class="condition-label">Attribute</label>
                <select class="condition-select">
                    <option value="">Select an attribute</option>
                    <option value="user_id">user_id</option>
                    <option value="organization_id">organization_id</option>
                    <option value="team_id">team_id</option>
                    <option value="email">email</option>
                    <option value="country">country</option>
                    <option value="plan">plan</option>
                    <option value="tier">tier</option>
                    <option value="region">region</option>
                </select>
            </div>
            
            <div class="condition-field">
                <label class="condition-label">Operator</label>
                <select class="condition-select">
                    <option value="">Select an operator</option>
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
                <input type="text" class="condition-input" placeholder="Enter values (comma-separated)">
            </div>
            
            <button type="button" class="btn-icon" onclick="removeCondition('${envName}', ${conditionCounter})" title="Remove condition" style="margin-top: 20px;">
                ✕
            </button>
        </div>
    `;
    
    conditionsContainer.insertAdjacentHTML('beforeend', conditionHtml);
    
    // Hide warning if rule has conditions
    updateRuleWarning(envName, ruleId);
}

function removeRule(envName, ruleId) {
    const rule = document.getElementById(`rule-${envName}-${ruleId}`);
    if (rule && confirm('Are you sure you want to delete this rule?')) {
        rule.remove();
    }
}

function removeCondition(envName, conditionId) {
    const condition = document.getElementById(`condition-${envName}-${conditionId}`);
    if (condition) {
        const ruleElement = condition.closest('.targeting-rule');
        const ruleId = ruleElement.id.split('-')[2];
        condition.remove();
        updateRuleWarning(envName, ruleId);
    }
}

function updateRuleWarning(envName, ruleId) {
    const conditionsContainer = document.getElementById(`conditions-${envName}-${ruleId}`);
    const warning = document.querySelector(`#rule-${envName}-${ruleId} .rule-warning`);
    
    if (conditionsContainer && warning) {
        const hasConditions = conditionsContainer.querySelectorAll('.rule-condition').length > 0;
        warning.style.display = hasConditions ? 'none' : 'flex';
    }
}

// Form submission handler
document.getElementById('flagForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const flagName = document.getElementById('flagName').value;
    const targetingRules = document.getElementById('targetingRules').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    
    // Hide previous messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Validate targeting rules JSON if provided
    if (targetingRules) {
        try {
            JSON.parse(targetingRules);
        } catch (e) {
            errorText.textContent = 'Invalid JSON in Targeting Rules: ' + e.message;
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth' });
            return;
        }
    }
    
    // Get existing flags
    const flags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
    
    // Check for duplicate flag name
    if (flags.some(f => f.name.toLowerCase() === flagName.toLowerCase())) {
        errorText.textContent = 'Flag name "' + flagName + '" already exists. Please choose a different name.';
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // Get selected environments
    const environments = Array.from(document.querySelectorAll('input[name="environments"]:checked')).map(cb => cb.value);
    
    // Collect form data
    const newFlag = {
        name: flagName,
        description: document.getElementById('description').value,
        team: document.getElementById('productTeam').options[document.getElementById('productTeam').selectedIndex].text,
        owner: document.getElementById('maintainer').value,
        maintainer: document.getElementById('maintainer').value,
        linkedTicket: document.getElementById('linkedTicket').value,
        expiryDate: document.getElementById('expiryDate').value,
        type: document.getElementById('flagType').value,
        defaultVariation: document.getElementById('defaultVariation').value,
        environment: environments[0] || 'dev',
        targetingRules: targetingRules || null,
        prerequisiteFlag: document.getElementById('prerequisiteFlag').value || null,
        prerequisiteVariation: document.getElementById('prerequisiteVariation').value || null,
        flagId: 'flag_' + Date.now(),
        createdAt: new Date().toISOString(),
        status: 'inactive',
        rolloutPercentage: 0
    };
    
    // Add to flags
    flags.push(newFlag);
    localStorage.setItem('featureFlags', JSON.stringify(flags));
    
    // Log to console (for demo purposes)
    console.log('Feature Flag Created:', newFlag);
    console.log('✓ Flag registered in feature flag service');
    console.log('✓ Audit log entry created');
    console.log('✓ Slack notification sent to #engineering channel');
    console.log('✓ Flag created in environments:', environments.join(', '));
    
    // Show success message
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth' });
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
});


