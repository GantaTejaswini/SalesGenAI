import { router } from '../router';
import { getDashboard, showToast, getToken } from '../api';
import { createLayout } from '../components/layout';
import { formatCurrency } from '../utils';

export function renderDashboard() {
  const content = `
        <!-- Welcome area -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <div>
                <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;" id="userGreeting">Welcome back 👋</h1>
                <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Here's your real-time revenue and sales velocity.</p>
            </div>
            <div style="position: relative; user-select: none;">
                <div class="glass-card" onclick="window.toggleTimeframe()" style="padding: 0.5rem 0.75rem; display: flex; align-items: center; gap: 0.5rem; border-radius: var(--border-radius-sm); cursor: pointer; transition: background 0.2s;">
                    <span id="timeframeLabel" style="font-size: 0.85rem; color: white;">This Month</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <div id="timeframeDropdown" class="glass-card" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 0.5rem; padding: 0.5rem; flex-direction: column; z-index: 100; box-shadow: 0 20px 60px rgba(0,0,0,0.5); width: 140px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);">
                    <a href="javascript:void(0)" onclick="window.selectTimeframe('this_month', 'This Month')" class="dropdown-item">This Month</a>
                    <a href="javascript:void(0)" onclick="window.selectTimeframe('last_month', 'Last Month')" class="dropdown-item">Last Month</a>
                    <a href="javascript:void(0)" onclick="window.selectTimeframe('this_quarter', 'This Quarter')" class="dropdown-item">This Quarter</a>
                    <a href="javascript:void(0)" onclick="window.selectTimeframe('this_year', 'This Year')" class="dropdown-item">This Year</a>
                </div>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="dashboard-kpi-grid">
          
          <div class="glass-card" style="padding: 1.25rem;">
             <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem;">
                <div style="width: 32px; height: 32px; background: rgba(124, 58, 237, 0.2); color: var(--secondary-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold;">$</div>
                <div>
                   <div style="font-size: 0.75rem; color: var(--text-secondary);">Pipeline Revenue</div>
                   <div style="font-size: 1.25rem; font-weight: 700;" id="kpiPipelineRev">$0</div>
                </div>
             </div>
             <div style="font-size: 0.7rem; color: var(--success-color); font-weight: 500;" id="trendPipelineRev"></div>
          </div>
          
          <div class="glass-card" style="padding: 1.25rem;">
             <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem;">
                <div style="width: 32px; height: 32px; background: rgba(34, 197, 94, 0.2); color: var(--success-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold;">W</div>
                <div>
                   <div style="font-size: 0.75rem; color: var(--text-secondary);">Win Rate</div>
                   <div style="font-size: 1.25rem; font-weight: 700;" id="kpiWinRate">0%</div>
                </div>
             </div>
          </div>

          <div class="glass-card" style="padding: 1.25rem;">
             <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem;">
                <div style="width: 32px; height: 32px; background: rgba(245, 158, 11, 0.2); color: var(--warning-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold;">V</div>
                <div>
                   <div style="font-size: 0.75rem; color: var(--text-secondary);">Sales Velocity</div>
                   <div style="font-size: 1.25rem; font-weight: 700;" id="kpiSalesVelocity">$0/day</div>
                </div>
             </div>
          </div>

          <div class="glass-card" style="padding: 1.25rem;">
             <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem;">
                <div style="width: 32px; height: 32px; background: rgba(79, 140, 255, 0.2); color: var(--primary-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold;">O</div>
                <div>
                   <div style="font-size: 0.75rem; color: var(--text-secondary);">Open Opportunities</div>
                   <div style="font-size: 1.25rem; font-weight: 700;" id="kpiOpenOpps">0</div>
                </div>
             </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="dashboard-chart-grid">
            <!-- Pipeline Overview Chart -->
            <div class="glass-card">
                <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 600;">Pipeline by Stage</h3>
                <div id="pipelineChart" style="height: 300px; width: 100%;"></div>
            </div>

            <!-- Lead Health -->
            <div class="glass-card">
                <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 600;">Lead Health</h3>
                <div id="healthChart" style="height: 300px; width: 100%;"></div>
            </div>
        </div>

        <!-- Bottom Section: Activity & Tasks -->
        <div class="dashboard-bottom-grid">
            
            <div class="glass-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Upcoming Tasks</h3>
                    <a href="javascript:void(0)" onclick="(window as any).navigate('/tasks')" style="font-size: 0.75rem; color: var(--secondary-color); text-decoration: none;">View all</a>
                </div>
                <div id="tasksList" style="display: flex; flex-direction: column; gap: 1rem;"></div>
            </div>

            <div class="glass-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Recent Activity</h3>
                </div>
                <div id="activityList" style="display: flex; flex-direction: column; gap: 1rem;"></div>
            </div>
            
        </div>
  `;
  const template = createLayout('/', content);
  router.mount(template);

  if (!getToken()) {
    router.navigate('/login');
    return;
  }

  // Modals
  (window as any).openAddLeadModal = () => { document.getElementById('addLeadModal')!.style.display = 'flex'; };
  (window as any).closeAddLeadModal = () => { document.getElementById('addLeadModal')!.style.display = 'none'; };

  (window as any).toggleTimeframe = () => {
      const dropdown = document.getElementById('timeframeDropdown');
      if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
  };

  (window as any).selectTimeframe = (val: string, label: string) => {
      document.getElementById('timeframeLabel')!.innerText = label;
      document.getElementById('timeframeDropdown')!.style.display = 'none';
      loadDashboardData(val);
  };

  loadDashboardData('this_month');
}

let pipelineChartInstance: any = null;
let healthChartInstance: any = null;

async function loadDashboardData(timeframe: string) {
  const greetingEl = document.getElementById('userGreeting');
  if (greetingEl) greetingEl.innerText = 'Loading...';

  try {
    const data = await getDashboard(timeframe);
    
    const user = JSON.parse(localStorage.getItem('sg_user') || '{}');
    const firstName = user.full_name?.split(' ')[0] || 'Admin';
    const justRegistered = localStorage.getItem('just_registered');
    
    if (greetingEl) {
      if (justRegistered && user.email === justRegistered) {
          greetingEl.innerText = `Welcome, ${firstName} 🖐️`;
          localStorage.removeItem('just_registered');
      } else {
          greetingEl.innerText = `Welcome back, ${firstName} 🖐️`;
      }
    }

    const kpis = data.kpis || {};
    document.getElementById('kpiPipelineRev')!.innerText = formatCurrency(kpis.pipeline_revenue?.value || 0);
    document.getElementById('kpiWinRate')!.innerText = `${kpis.win_rate?.value || 0}%`;
    document.getElementById('kpiSalesVelocity')!.innerText = formatCurrency(kpis.sales_velocity?.value || 0) + '/day';
    document.getElementById('kpiOpenOpps')!.innerText = String(kpis.open_opportunities?.value || 0);
    
    if (kpis.leads_added?.trend > 0) {
      document.getElementById('trendPipelineRev')!.innerHTML = `&uarr; ${kpis.leads_added.trend}% vs prev`;
    }

    renderCharts(data.pipeline, data.lead_health);
    
    // Tasks
    const tasksEl = document.getElementById('tasksList');
    if (tasksEl && data.tasks) {
      if (data.tasks.length === 0) {
        tasksEl.innerHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 2rem;">No pending tasks</div>';
      } else {
        tasksEl.innerHTML = data.tasks.map((t: any) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 500; font-size: 0.9rem;">${t.title}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${t.task_type} &bull; ${t.priority}</div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No due date'}</div>
          </div>
        `).join('');
      }
    }

    // Activity
    const activitiesEl = document.getElementById('activityList');
    if (activitiesEl && data.activities) {
      if (data.activities.length === 0) {
        activitiesEl.innerHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 2rem;">No recent activity</div>';
      } else {
        activitiesEl.innerHTML = data.activities.map((a: any) => `
          <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.6rem 0; border-bottom: 1px solid var(--border-color);">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary-color); margin-top: 6px; flex-shrink: 0;"></div>
            <div style="flex: 1;">
              <div style="font-size: 0.85rem;">${a.description}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${new Date(a.created_at).toLocaleString()}</div>
            </div>
          </div>
        `).join('');
      }
    }

  } catch (err: any) {
    console.error(err);
    showToast('Failed to load dashboard data: ' + (err.message || ''), 'error');
  }
}

function renderCharts(pipeline: any, health: any) {
    const ApexCharts = (window as any).ApexCharts;
    if (!ApexCharts) return;

    if (pipelineChartInstance) {
        pipelineChartInstance.destroy();
    }
    if (healthChartInstance) {
        healthChartInstance.destroy();
    }

    // Pipeline Chart
    const stages = Object.keys(pipeline || {});
    const counts = Object.values(pipeline || {});
    
    const pipelineOptions = {
        series: [{ name: 'Deals', data: counts }],
        chart: { type: 'bar', height: 300, background: 'transparent', toolbar: { show: false } },
        theme: { mode: 'dark' },
        plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '50%' } },
        dataLabels: { enabled: false },
        xaxis: { categories: stages, labels: { style: { colors: '#9ca3af' } } },
        yaxis: { labels: { style: { colors: '#9ca3af' } } },
        colors: ['#7c3aed']
    };
    pipelineChartInstance = new ApexCharts(document.querySelector("#pipelineChart"), pipelineOptions);
    pipelineChartInstance.render();

    // Health Chart
    const healthOptions = {
        series: [health.hot || 0, health.warm || 0, health.cold || 0],
        chart: { type: 'donut', height: 300, background: 'transparent' },
        labels: ['Hot', 'Warm', 'Cold'],
        colors: ['#ef4444', '#f59e0b', '#3b82f6'],
        theme: { mode: 'dark' },
        stroke: { show: false },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '75%', labels: { show: true, name: { show: true }, value: { show: true, color: '#fff' }, total: { show: true, label: 'Total', color: '#9ca3af', formatter: () => health.total || 0 } } } } },
        legend: { position: 'bottom' }
    };
    healthChartInstance = new ApexCharts(document.querySelector("#healthChart"), healthOptions);
    healthChartInstance.render();
}
