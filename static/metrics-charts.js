// Metrics Charts JavaScript
// Simple line chart implementation for metrics visualization

// Initialize charts on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('metricChart1')) {
        initializeMetricsCharts();
    }
});

function initializeMetricsCharts() {
    // Initialize all metric charts with dummy data
    drawMetricChart('metricChart1', 'request_duration');
    drawMetricChart('metricChart2', 'impressions');
    drawMetricChart('metricChart3', 'reasons');
    drawMetricChart('metricChart4', 'variations');
}

// Generate dummy time-series data
function generateTimeSeriesData(metricType, points = 24) {
    const data = [];
    const now = Date.now();
    
    for (let i = points; i >= 0; i--) {
        const timestamp = now - (i * 3600000); // 1 hour intervals
        let value;
        
        switch(metricType) {
            case 'request_duration':
                value = 35 + Math.random() * 25 + Math.sin(i / 3) * 10;
                break;
            case 'response_size':
                value = 1.0 + Math.random() * 0.5;
                break;
            case 'active_requests':
                value = 80 + Math.random() * 60;
                break;
            case 'impressions':
                value = 1500 + Math.random() * 800 + Math.sin(i / 4) * 200;
                break;
            case 'unique_orgs':
                value = 1000 + Math.random() * 400;
                break;
            case 'unique_users':
                value = 7000 + Math.random() * 3000;
                break;
            case 'success_rate':
                value = 99.5 + Math.random() * 0.48;
                break;
            default:
                value = Math.random() * 100;
        }
        
        data.push({ timestamp, value });
    }
    
    return data;
}

// Draw a simple line chart
function drawMetricChart(canvasId, metricType) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Generate data
    const data = generateTimeSeriesData(metricType);
    
    // Set up chart area
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Find min/max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;
    
    // Draw background grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Y-axis labels
        const value = maxValue - (valueRange / 5) * i;
        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value.toFixed(1), padding - 5, y + 4);
    }
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw filled area under line
    ctx.lineTo(width - padding, padding + chartHeight);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.closePath();
    ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
    ctx.fill();
    
    // Draw data points
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#667eea';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // X-axis labels (time)
    const labelInterval = Math.floor(data.length / 6);
    data.forEach((point, index) => {
        if (index % labelInterval === 0 || index === data.length - 1) {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const time = new Date(point.timestamp);
            const label = time.getHours() + ':00';
            
            ctx.fillStyle = '#64748b';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, height - padding + 20);
        }
    });
}

// Draw stacked area chart for evaluation reasons
function drawStackedChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = 24;
    const colors = [
        { color: '#10b981', alpha: 0.7 }, // Targeting Match
        { color: '#3b82f6', alpha: 0.7 }, // Default
        { color: '#f59e0b', alpha: 0.7 }, // Disabled
        { color: '#ef4444', alpha: 0.7 }  // Error
    ];
    
    // Generate stacked data
    const series = [
        { name: 'Targeting', values: [] },
        { name: 'Default', values: [] },
        { name: 'Disabled', values: [] },
        { name: 'Error', values: [] }
    ];
    
    for (let i = 0; i < points; i++) {
        series[0].values.push(700 + Math.random() * 100);
        series[1].values.push(180 + Math.random() * 40);
        series[2].values.push(40 + Math.random() * 20);
        series[3].values.push(5 + Math.random() * 5);
    }
    
    // Draw each series as stacked area
    let previousY = Array(points).fill(padding + chartHeight);
    
    series.reverse().forEach((s, seriesIndex) => {
        ctx.beginPath();
        ctx.fillStyle = colors[3 - seriesIndex].color;
        ctx.globalAlpha = colors[3 - seriesIndex].alpha;
        
        // Draw top line
        s.values.forEach((value, index) => {
            const x = padding + (chartWidth / (points - 1)) * index;
            const y = previousY[index] - (value / 10);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        // Draw bottom line (previous series or baseline)
        for (let i = points - 1; i >= 0; i--) {
            const x = padding + (chartWidth / (points - 1)) * i;
            ctx.lineTo(x, previousY[i]);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Update previousY for next series
        s.values.forEach((value, index) => {
            previousY[index] -= (value / 10);
        });
    });
    
    ctx.globalAlpha = 1;
}

// Change metric type in a panel
function changeMetricType(selectElement, panelId) {
    const metricType = selectElement.value;
    const canvasId = panelId.replace('panel', 'metricChart');
    
    // Update panel title and subtitle
    const panel = selectElement.closest('.metric-panel');
    const titleElement = panel.querySelector('.metric-panel-title h4');
    const subtitleElement = panel.querySelector('.metric-panel-subtitle');
    
    const metricInfo = {
        'request_duration': {
            title: 'Request Duration',
            subtitle: 'http.server.request.duration',
            stats: { current: '45.2 ms', avg: '42.8 ms', min: '35.1 ms', max: '89.5 ms' }
        },
        'response_size': {
            title: 'Response Size',
            subtitle: 'http.server.response.body.size',
            stats: { current: '1.2 KB', avg: '1.15 KB', min: '0.8 KB', max: '2.1 KB' }
        },
        'active_requests': {
            title: 'Active Requests',
            subtitle: 'http.server.active_requests',
            stats: { current: '127', avg: '118', min: '85', max: '156' }
        },
        'error_rate': {
            title: 'Error Rate',
            subtitle: 'Calculated from errors/total',
            stats: { current: '0.02%', avg: '0.03%', min: '0.00%', max: '0.08%' }
        },
        'impressions': {
            title: 'Flag Evaluations',
            subtitle: 'feature_flag.flagd.impression',
            stats: { current: '1,912/min', avg: '1,870/min', total: '45,892' }
        },
        'unique_orgs': {
            title: 'Unique Organizations',
            subtitle: 'Calculated from evaluation data',
            stats: { current: '1,234', avg: '1,189', growth: '+8%' }
        },
        'unique_users': {
            title: 'Unique Users',
            subtitle: 'Calculated from evaluation data',
            stats: { current: '8,567', avg: '8,201', growth: '+15%' }
        },
        'success_rate': {
            title: 'Success Rate',
            subtitle: 'Calculated from evaluation results',
            stats: { current: '99.98%', avg: '99.97%', min: '99.90%' }
        }
    };
    
    const info = metricInfo[metricType];
    if (info) {
        titleElement.textContent = info.title;
        subtitleElement.textContent = info.subtitle;
        
        // Update stats
        const statsContainer = panel.querySelector('.metric-panel-stats');
        if (statsContainer && info.stats) {
            const statItems = statsContainer.querySelectorAll('.stat-item');
            const statKeys = Object.keys(info.stats);
            statItems.forEach((item, index) => {
                if (statKeys[index]) {
                    const label = item.querySelector('.stat-label');
                    const value = item.querySelector('.stat-value');
                    label.textContent = statKeys[index].charAt(0).toUpperCase() + statKeys[index].slice(1) + ':';
                    value.textContent = info.stats[statKeys[index]];
                }
            });
        }
    }
    
    // Redraw chart
    if (metricType === 'reasons' || metricType === 'targeting_match' || metricType === 'default' || metricType === 'errors') {
        drawStackedChart(canvasId);
    } else {
        drawMetricChart(canvasId, metricType);
    }
    
    showToast(`Switched to ${info ? info.title : metricType}`);
}

// Update time range
function updateTimeRange(range) {
    showToast(`Updated time range to ${range}`);
    // Reinitialize all charts with new time range
    setTimeout(() => {
        initializeMetricsCharts();
    }, 300);
}

// Refresh metrics
function refreshMetrics() {
    showToast('Refreshing metrics data...');
    setTimeout(() => {
        initializeMetricsCharts();
        showToast('Metrics refreshed successfully');
    }, 500);
}

// Show external dashboard
function showExternalDashboard() {
    const dashboardSection = document.querySelector('.external-dashboard-section');
    if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
        showToast('Scroll down to embed external dashboards');
    }
}

// Switch dashboard tab
function switchDashboard(type) {
    // Update active tab
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all dashboard containers
    document.querySelectorAll('.dashboard-iframe-container').forEach(container => {
        container.style.display = 'none';
    });
    
    // Show selected dashboard
    const containerId = type + 'Dashboard';
    const container = document.getElementById(containerId);
    if (container) {
        container.style.display = 'block';
    }
}

// Embed dashboard
function embedDashboard(type) {
    const container = document.getElementById(type + 'Dashboard');
    const input = container.querySelector('.iframe-url-input');
    const url = input.value.trim();
    
    if (!url) {
        showToast('Please enter a valid URL');
        return;
    }
    
    const placeholder = container.querySelector('.iframe-placeholder');
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'dashboard-iframe';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    
    // Replace placeholder with iframe
    placeholder.style.display = 'none';
    container.appendChild(iframe);
    
    showToast(`Loading ${type.charAt(0).toUpperCase() + type.slice(1)} dashboard...`);
}

// Show toast notification
function showToast(message) {
    // Check if function already exists
    if (typeof window.showToast === 'function') {
        return window.showToast(message);
    }
    
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #1e293b;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

