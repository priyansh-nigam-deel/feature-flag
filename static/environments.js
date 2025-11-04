// Initialize giger environments in localStorage
function initGigerEnvs() {
    if (!localStorage.getItem('gigerEnvironments')) {
        const defaultGigers = [
            {
                name: 'giger-checkout-test',
                creator: 'Mike Chen',
                createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
                expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
                baseEnv: 'dev',
                flags: 8,
                activeFlags: 5,
                status: 'active'
            },
            {
                name: 'giger-analytics-feature',
                creator: 'Sarah Johnson',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
                baseEnv: 'stage',
                flags: 12,
                activeFlags: 8,
                status: 'active'
            }
        ];
        localStorage.setItem('gigerEnvironments', JSON.stringify(defaultGigers));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initGigerEnvs();
    loadGigerEnvironments();
});

function loadGigerEnvironments() {
    const gigers = JSON.parse(localStorage.getItem('gigerEnvironments') || '[]');
    const gigerList = document.querySelector('.giger-list');
    
    if (!gigerList) return;
    
    // Keep the existing static items and add dynamic ones
    const activeGigers = gigers.filter(g => g.status === 'active');
    
    // Update the giger cards if they exist
    updateGigerCards(gigers);
}

function updateGigerCards(gigers) {
    // This will update the existing cards or could regenerate them
    console.log('Loaded giger environments:', gigers);
}

function viewEnvironment(envName) {
    showToast('Viewing environment: ' + envName);
    console.log('Navigating to environment:', envName);
}

function showCreateGigerModal() {
    document.getElementById('createGigerModal').style.display = 'flex';
}

function closeCreateGigerModal() {
    document.getElementById('createGigerModal').style.display = 'none';
}

function createGiger() {
    const name = document.getElementById('gigerName').value.trim();
    const baseEnv = document.getElementById('baseEnv').value;
    const duration = parseInt(document.getElementById('expiryDuration').value);
    
    if (!name) {
        alert('Please enter an environment name.');
        return;
    }
    
    // Validate name format
    if (!/^[a-z0-9-]+$/.test(name)) {
        alert('Environment name can only contain lowercase letters, numbers, and hyphens.');
        return;
    }
    
    const fullName = 'giger-' + name;
    
    // Check for duplicates
    const gigers = JSON.parse(localStorage.getItem('gigerEnvironments') || '[]');
    if (gigers.some(g => g.name === fullName)) {
        alert('A giger environment with this name already exists.');
        return;
    }
    
    // Create new giger
    const newGiger = {
        name: fullName,
        creator: 'John Doe (PM)',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
        baseEnv: baseEnv,
        flags: 0,
        activeFlags: 0,
        status: 'active'
    };
    
    gigers.push(newGiger);
    localStorage.setItem('gigerEnvironments', JSON.stringify(gigers));
    
    showToast('✓ Giger environment "' + fullName + '" created successfully!');
    
    closeCreateGigerModal();
    
    // Reload page to show new environment
    setTimeout(() => {
        location.reload();
    }, 1500);
}

function extendGiger(envName) {
    const extension = prompt('Extend ' + envName + ' by how many hours?', '24');
    if (extension) {
        const gigers = JSON.parse(localStorage.getItem('gigerEnvironments') || '[]');
        const giger = gigers.find(g => g.name === envName);
        
        if (giger) {
            const newExpiry = new Date(new Date(giger.expiresAt).getTime() + parseInt(extension) * 60 * 60 * 1000);
            giger.expiresAt = newExpiry.toISOString();
            localStorage.setItem('gigerEnvironments', JSON.stringify(gigers));
        }
        
        showToast('✓ Environment extended by ' + extension + ' hours.');
        
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}

function deleteGiger(envName) {
    if (confirm('Are you sure you want to delete ' + envName + '?\n\nThis action cannot be undone.')) {
        const gigers = JSON.parse(localStorage.getItem('gigerEnvironments') || '[]');
        const filtered = gigers.filter(g => g.name !== envName);
        localStorage.setItem('gigerEnvironments', JSON.stringify(filtered));
        
        showToast('✓ Environment ' + envName + ' deleted.');
        
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
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

