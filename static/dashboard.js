// Dashboard functionality
let allFlags = [];
let filteredFlags = [];
let currentSort = { field: 'created', order: 'desc' };

// Autocomplete data stores
let autocompleteData = {
    teams: new Set(),
    owners: new Set(),
    environments: new Set()
};

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

function initDashboard() {
    allFlags = JSON.parse(localStorage.getItem('featureFlags') || '[]');
    filteredFlags = [...allFlags];
    
    // Build autocomplete data from all flags
    buildAutocompleteData();
    
    updateStats(allFlags);
    applyFilters();
}

// Build autocomplete data from all flags
function buildAutocompleteData() {
    autocompleteData.teams.clear();
    autocompleteData.owners.clear();
    autocompleteData.environments.clear();
    
    allFlags.forEach(flag => {
        if (flag.team) autocompleteData.teams.add(flag.team);
        if (flag.owner) autocompleteData.owners.add(flag.owner);
        if (flag.environment) autocompleteData.environments.add(flag.environment);
    });
}

function updateStats(flags) {
    const totalFlags = flags.length;
    const activeFlags = flags.filter(f => f.status === 'active').length;
    const inactiveFlags = flags.filter(f => f.status === 'inactive').length;
    const expiringFlags = flags.filter(f => {
        if (!f.expiryDate) return false;
        const daysUntilExpiry = Math.ceil((new Date(f.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;
    
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
        statValues[0].textContent = totalFlags;
        statValues[1].textContent = activeFlags;
        statValues[2].textContent = inactiveFlags;
        statValues[3].textContent = expiringFlags;
    }
}

// Advanced filtering and search with targeting context support
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const team = document.getElementById('filterTeam')?.value || '';
    const owner = document.getElementById('filterOwner')?.value || '';
    const environment = document.getElementById('filterEnvironment')?.value || 
                       document.getElementById('quickFilterEnvironment')?.value || '';
    const type = document.getElementById('filterType')?.value || 
                document.getElementById('quickFilterType')?.value || '';
    const status = document.getElementById('filterStatus')?.value || 
                  document.getElementById('quickFilterStatus')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 
                  document.getElementById('quickSort')?.value || 'created-desc';

    // Start with all flags
    filteredFlags = allFlags.filter(flag => {
        // Search in name, description, targeting context, owner, team
        if (searchTerm) {
            const searchMatch = 
                flag.name.toLowerCase().includes(searchTerm) ||
                (flag.description && flag.description.toLowerCase().includes(searchTerm)) ||
                (flag.owner && flag.owner.toLowerCase().includes(searchTerm)) ||
                (flag.team && flag.team.toLowerCase().includes(searchTerm)) ||
                (flag.targetingContext && flag.targetingContext.toLowerCase().includes(searchTerm));
            
            if (!searchMatch) return false;
        }

        // Filter by team
        if (team && flag.team !== team) return false;

        // Filter by owner
        if (owner && flag.owner !== owner) return false;

        // Filter by environment
        if (environment && flag.environment !== environment) return false;

        // Filter by type
        if (type && flag.type.toLowerCase() !== type.toLowerCase()) return false;

        // Filter by status
        if (status && flag.status.toLowerCase() !== status.toLowerCase()) return false;

        return true;
    });

    // Sort flags
    sortFlags(sortBy);

    // Update display
    renderFlagsTable(filteredFlags);
    updateFilterResults();
}

function sortFlags(sortBy) {
    const [field, order] = sortBy.split('-');
    currentSort = { field, order };

    filteredFlags.sort((a, b) => {
        let aVal, bVal;

        switch (field) {
            case 'created':
                aVal = new Date(a.createdAt || '2025-01-01');
                bVal = new Date(b.createdAt || '2025-01-01');
                break;
            case 'expiry':
                aVal = a.expiryDate ? new Date(a.expiryDate) : new Date('9999-12-31');
                bVal = b.expiryDate ? new Date(b.expiryDate) : new Date('9999-12-31');
                break;
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
            default:
                return 0;
        }

        if (order === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });
}

function sortTable(field) {
    // Toggle sort order if clicking the same field
    if (currentSort.field === field || 
        (field === 'createdAt' && currentSort.field === 'created') ||
        (field === 'expiryDate' && currentSort.field === 'expiry')) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field === 'createdAt' ? 'created' : 'expiry';
        currentSort.order = 'desc';
    }

    const sortBy = `${currentSort.field}-${currentSort.order}`;
    sortFlags(sortBy);
    renderFlagsTable(filteredFlags);
    
    // Update UI to show which column is sorted
    document.querySelectorAll('.sort-icon').forEach(icon => icon.textContent = '↕️');
    const activeIcon = event?.target.querySelector('.sort-icon');
    if (activeIcon) {
        activeIcon.textContent = currentSort.order === 'asc' ? '↑' : '↓';
    }
}

function updateFilterResults() {
    const resultsDiv = document.getElementById('filterResults');
    if (!resultsDiv) return;
    
    if (filteredFlags.length === allFlags.length) {
        resultsDiv.textContent = '';
        resultsDiv.style.display = 'none';
    } else {
        resultsDiv.textContent = `Showing ${filteredFlags.length} of ${allFlags.length} flags`;
        resultsDiv.style.display = 'block';
        resultsDiv.style.padding = '10px';
        resultsDiv.style.background = '#e3f2fd';
        resultsDiv.style.borderRadius = '6px';
        resultsDiv.style.marginTop = '10px';
        resultsDiv.style.fontSize = '14px';
        resultsDiv.style.fontWeight = '500';
        resultsDiv.style.color = '#0d47a1';
    }
}

function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advancedFilters');
    const icon = document.getElementById('filterToggleIcon');
    
    if (advancedFilters.style.display === 'none' || !advancedFilters.style.display) {
        advancedFilters.style.display = 'block';
        icon.textContent = '▲';
    } else {
        advancedFilters.style.display = 'none';
        icon.textContent = '⚙️';
    }
}

function clearFilters() {
    // Clear all filter inputs (text inputs and selects)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    // Clear autocomplete text inputs
    const filterTeam = document.getElementById('filterTeam');
    if (filterTeam) filterTeam.value = '';
    
    const filterOwner = document.getElementById('filterOwner');
    if (filterOwner) filterOwner.value = '';
    
    const filterEnvironment = document.getElementById('filterEnvironment');
    if (filterEnvironment) filterEnvironment.value = '';
    
    // Clear select dropdowns
    const filterType = document.getElementById('filterType');
    if (filterType) filterType.value = '';
    
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) filterStatus.value = '';
    
    const sortBy = document.getElementById('sortBy');
    if (sortBy) sortBy.value = 'created-desc';
    
    // Clear quick filters
    const quickFilterEnvironment = document.getElementById('quickFilterEnvironment');
    if (quickFilterEnvironment) quickFilterEnvironment.value = '';
    
    const quickFilterType = document.getElementById('quickFilterType');
    if (quickFilterType) quickFilterType.value = '';
    
    const quickFilterStatus = document.getElementById('quickFilterStatus');
    if (quickFilterStatus) quickFilterStatus.value = '';
    
    const quickSort = document.getElementById('quickSort');
    if (quickSort) quickSort.value = 'created-desc';

    // Hide all autocomplete dropdowns
    document.querySelectorAll('.autocomplete-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
    });

    // Reapply filters (will show all)
    applyFilters();
}

function renderFlagsTable(flags) {
    const tbody = document.getElementById('flagsTableBody');
    if (!tbody) return;
    
    if (flags.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;">No flags found. <a href="create-flag.html">Create your first flag</a></td></tr>';
        return;
    }
    
    tbody.innerHTML = flags.map(flag => {
        const createdDate = flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : 'N/A';
        const expiryDate = flag.expiryDate || 'No expiry';
        
        return `
        <tr>
            <td>
                <a href="flag-detail.html?flag=${encodeURIComponent(flag.name)}" class="flag-name-link">
                    <div class="flag-name">${escapeHtml(flag.name)}</div>
                    <div class="flag-desc">${escapeHtml(flag.description || '')}</div>
                </a>
            </td>
            <td><span class="type-badge ${flag.type.toLowerCase()}">${flag.type}</span></td>
            <td><span class="status-badge ${flag.status}">${flag.status === 'active' ? 'Active' : 'Inactive'}</span></td>
            <td>${escapeHtml(flag.environment || 'N/A')}</td>
            <td>${escapeHtml(flag.owner || 'N/A')}</td>
            <td>${escapeHtml(flag.team || 'N/A')}</td>
            <td>${createdDate}</td>
            <td>${expiryDate}</td>
            <td>
                <a href="flag-detail.html?flag=${encodeURIComponent(flag.name)}"><button class="btn-icon" title="View Details">👁️</button></a>
                <button class="btn-icon" title="Copy Link" onclick="copyFlagLink('${escapeHtml(flag.name)}')">🔗</button>
            </td>
        </tr>
    `;
    }).join('');
}

function copyFlagLink(flagName) {
    const link = window.location.origin + window.location.pathname.replace('index.html', '') + 'flag-detail.html?flag=' + encodeURIComponent(flagName);
    navigator.clipboard.writeText(link).then(() => {
        showToast('✓ Flag link copied to clipboard!');
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// Autocomplete functionality
function showAutocomplete(inputElement, type) {
    const searchTerm = inputElement.value.toLowerCase();
    const dropdownId = inputElement.id + '-dropdown';
    const dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) return;
    
    // Get the appropriate data set
    let dataSet = [];
    switch(type) {
        case 'teams':
            dataSet = Array.from(autocompleteData.teams);
            break;
        case 'owners':
            dataSet = Array.from(autocompleteData.owners);
            break;
        case 'environments':
            dataSet = Array.from(autocompleteData.environments);
            break;
    }
    
    // Filter based on search term
    const filtered = searchTerm 
        ? dataSet.filter(item => item.toLowerCase().includes(searchTerm))
        : dataSet;
    
    // Show dropdown if there are results
    if (filtered.length === 0 || (searchTerm && filtered.length === 1 && filtered[0].toLowerCase() === searchTerm)) {
        dropdown.style.display = 'none';
        applyFilters();
        return;
    }
    
    // Build dropdown HTML
    dropdown.innerHTML = filtered
        .sort()
        .slice(0, 10) // Limit to 10 results
        .map(item => `
            <div class="autocomplete-item" onmousedown="selectAutocomplete('${inputElement.id}', '${escapeHtml(item)}')">
                ${highlightMatch(escapeHtml(item), searchTerm)}
            </div>
        `).join('');
    
    dropdown.style.display = 'block';
}

function selectAutocomplete(inputId, value) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = value;
        const dropdown = document.getElementById(inputId + '-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
        applyFilters();
    }
}

function hideAutocomplete(inputElement) {
    setTimeout(() => {
        const dropdown = document.getElementById(inputElement.id + '-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
        // Trigger filter even if user just typed without selecting
        applyFilters();
    }, 200);
}

function highlightMatch(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

// Add CSS for toast animations and autocomplete
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
