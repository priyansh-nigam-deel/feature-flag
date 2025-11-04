// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setupFilters();
});

function loadDashboard() {
    const flags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
    
    // Update stats
    updateStats(flags);
    
    // Render flags table
    renderFlagsTable(flags);
}

function updateStats(flags) {
    const totalFlags = flags.length;
    const activeFlags = flags.filter(f => f.status === 'active').length;
    const inactiveFlags = flags.filter(f => f.status === 'inactive').length;
    const expiringFlags = flags.filter(f => {
        const daysUntilExpiry = Math.ceil((new Date(f.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;
    
    document.querySelectorAll('.stat-value')[0].textContent = totalFlags;
    document.querySelectorAll('.stat-value')[1].textContent = activeFlags;
    document.querySelectorAll('.stat-value')[2].textContent = inactiveFlags;
    document.querySelectorAll('.stat-value')[3].textContent = expiringFlags;
}

function renderFlagsTable(flags) {
    const tbody = document.querySelector('.flags-table tbody');
    if (!tbody) return;
    
    if (flags.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No flags found. <a href="create-flag.html">Create your first flag</a></td></tr>';
        return;
    }
    
    tbody.innerHTML = flags.map(flag => `
        <tr>
            <td>
                <a href="flag-detail.html?flag=${encodeURIComponent(flag.name)}" class="flag-name-link">
                    <div class="flag-name">${escapeHtml(flag.name)}</div>
                    <div class="flag-desc">${escapeHtml(flag.description || '')}</div>
                </a>
            </td>
            <td><span class="type-badge ${flag.type}">${flag.type}</span></td>
            <td><span class="status-badge ${flag.status}">${flag.status === 'active' ? 'Active' : 'Inactive'}</span></td>
            <td>${flag.environment}</td>
            <td>${escapeHtml(flag.owner)}</td>
            <td>${flag.expiryDate}</td>
            <td>
                <a href="flag-detail.html?flag=${encodeURIComponent(flag.name)}"><button class="btn-icon" title="View Details">👁️</button></a>
                <button class="btn-icon" title="Copy Link" onclick="copyFlagLink('${escapeHtml(flag.name)}')">🔗</button>
            </td>
        </tr>
    `).join('');
}

function setupFilters() {
    const searchInput = document.querySelector('.search-input');
    const filterSelects = document.querySelectorAll('.filter-select');
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    filterSelects.forEach(select => {
        select.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const flags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const envFilter = document.querySelectorAll('.filter-select')[0]?.value || 'All Environments';
    const typeFilter = document.querySelectorAll('.filter-select')[1]?.value || 'All Types';
    const statusFilter = document.querySelectorAll('.filter-select')[2]?.value || 'All Status';
    
    let filtered = flags;
    
    // Apply search
    if (searchTerm) {
        filtered = filtered.filter(f => 
            f.name.toLowerCase().includes(searchTerm) ||
            (f.description && f.description.toLowerCase().includes(searchTerm)) ||
            f.owner.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply environment filter
    if (envFilter !== 'All Environments') {
        filtered = filtered.filter(f => f.environment === envFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'All Types') {
        filtered = filtered.filter(f => f.type.toLowerCase() === typeFilter.toLowerCase());
    }
    
    // Apply status filter
    if (statusFilter !== 'All Status') {
        filtered = filtered.filter(f => f.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    renderFlagsTable(filtered);
}

function copyFlagLink(flagName) {
    const link = window.location.origin + window.location.pathname.replace('index.html', '') + 'flag-detail.html?flag=' + encodeURIComponent(flagName);
    navigator.clipboard.writeText(link).then(() => {
        showToast('✓ Flag link copied to clipboard!');
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message) {
    // Create toast element
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

