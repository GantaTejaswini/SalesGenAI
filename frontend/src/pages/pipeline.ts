import { router } from '../router';
import { api, showToast } from '../api';
import { createLayout } from '../components/layout';

let activeView = localStorage.getItem('crm_pipeline_view') || 'kanban';
let currentLeads: any[] = [];
let pipelineStages: any[] = [];
let searchQuery = '';
let filterPriority = '';

export function renderPipeline() {
  const contentHtml = `
    <!-- Pipeline Header & View Switcher -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;">Sales Pipeline & Revenue Forecast</h1>
        <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Track deals, stage transitions, weighted revenue, and conversion forecasting.</p>
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <!-- 5 Views Switcher -->
        <div class="glass-card" style="display: flex; padding: 3px; gap: 2px; border-radius: var(--border-radius-sm);">
          <button class="icon-btn ${activeView === 'kanban' ? 'active-view-btn' : ''}" onclick="switchPipelineView('kanban')" title="Kanban Board" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Kanban
          </button>
          <button class="icon-btn ${activeView === 'table' ? 'active-view-btn' : ''}" onclick="switchPipelineView('table')" title="Table View" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Table
          </button>
          <button class="icon-btn ${activeView === 'timeline' ? 'active-view-btn' : ''}" onclick="switchPipelineView('timeline')" title="Timeline Roadmap" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><polyline points="12 6 18 12 12 18"></polyline></svg>
            Timeline
          </button>
          <button class="icon-btn ${activeView === 'calendar' ? 'active-view-btn' : ''}" onclick="switchPipelineView('calendar')" title="Calendar View" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Calendar
          </button>
          <button class="icon-btn ${activeView === 'forecast' ? 'active-view-btn' : ''}" onclick="switchPipelineView('forecast')" title="Forecast Dashboard" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Forecast
          </button>
        </div>

        <button class="icon-btn" onclick="openStageConfigModal()" title="Configure Stages" style="padding: 0.6rem 0.8rem; border-radius: var(--border-radius-sm);">
          ⚙️ Configure Stages
        </button>
      </div>
    </div>

    <!-- Search & Filter Controls Bar -->
    <div class="glass-card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
      <div style="position: relative; flex: 1; min-width: 260px;">
        <svg style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search deals by company, contact, status..." value="${searchQuery}" oninput="handlePipelineSearch(this.value)" style="width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; outline: none;" />
      </div>

      <select id="fPipelinePriority" onchange="applyPipelineFilters()" style="padding: 0.6rem 1rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; outline: none;">
        <option value="">All Priorities</option>
        <option value="Hot" ${filterPriority==='Hot'?'selected':''}>🔥 Hot Priority</option>
        <option value="Warm" ${filterPriority==='Warm'?'selected':''}>⚡ Warm Priority</option>
        <option value="Cold" ${filterPriority==='Cold'?'selected':''}>❄️ Cold Priority</option>
      </select>
    </div>

    <!-- Pipeline View Container -->
    <div id="pipelineViewContainer" style="min-height: 500px;">
      <div style="text-align: center; padding: 4rem; color: var(--text-secondary);">Loading pipeline board...</div>
    </div>
  `;

  router.mount(createLayout('/pipeline', contentHtml));
  fetchPipelineData();
}

// ─── Data Fetcher ─────────────────────────────────────────────────────────────

async function fetchPipelineData() {
  const container = document.getElementById('pipelineViewContainer');
  if (!container) return;

  try {
    const [stagesRes, leadsRes] = await Promise.all([
      api.get('/pipeline/stages'),
      api.get('/leads?limit=200')
    ]);

    pipelineStages = stagesRes || [];
    currentLeads = leadsRes.data || [];

    if (searchQuery) {
      currentLeads = currentLeads.filter(l => 
        (l.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.contact_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.lead_status || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterPriority) {
      currentLeads = currentLeads.filter(l => l.priority === filterPriority);
    }

    if (activeView === 'table') {
      renderTableView(container);
    } else if (activeView === 'timeline') {
      renderTimelineView(container);
    } else if (activeView === 'calendar') {
      renderCalendarView(container);
    } else if (activeView === 'forecast') {
      renderForecastView(container);
    } else {
      renderKanbanView(container);
    }
  } catch (err: any) {
    container.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--danger-color);" class="glass-card">Failed to load sales pipeline: ${err.message}</div>`;
  }
}

// ─── 1. Kanban Drag-and-Drop Board ────────────────────────────────────────────

function renderKanbanView(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: flex; gap: 1.25rem; overflow-x: auto; padding-bottom: 1.5rem; height: calc(100vh - 250px);">
      ${pipelineStages.map(stg => {
        const stageLeads = currentLeads.filter(l => (l.lead_status || 'Prospecting').toLowerCase() === stg.name.toLowerCase());
        const totalVal = stageLeads.reduce((acc, l) => acc + (l.estimated_deal_value || 0), 0);

        return `
          <div class="kanban-column" data-stage="${stg.name}" ondragover="allowDealDrop(event)" ondrop="dropDeal(event, '${stg.name}')" style="flex: 1; min-width: 290px; max-width: 330px; background: rgba(255,255,255,0.02); border-radius: var(--border-radius-md); border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column;">
            
            <!-- Stage Header -->
            <div style="padding: 1.25rem; border-bottom: 3px solid ${stg.color}; background: rgba(0,0,0,0.2); border-top-left-radius: var(--border-radius-md); border-top-right-radius: var(--border-radius-md);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <div style="font-size: 1rem; font-weight: 700; color: white;">${stg.name} <span style="color: var(--text-secondary); font-weight: 400; font-size: 0.8rem; margin-left: 0.4rem;">(${stageLeads.length})</span></div>
                <span style="font-size: 0.75rem; font-weight: 700; color: ${stg.color};">${stg.probability}%</span>
              </div>
              <div style="font-size: 0.85rem; color: var(--success-color); font-weight: 600;">$${totalVal.toLocaleString()}</div>
            </div>

            <!-- Stage Deal Cards -->
            <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem; flex: 1; overflow-y: auto;">
              ${stageLeads.map(l => `
                <div class="glass-card deal-card" draggable="true" ondragstart="dragDeal(event, '${l.id}')" onclick="navigate('/lead?id=${l.id}')" style="padding: 1.25rem; cursor: grab; transition: transform 0.2s, border-color 0.2s;" onmouseover="this.style.borderColor='${stg.color}'" onmouseout="this.style.borderColor='var(--border-color)'">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div style="font-size: 0.95rem; font-weight: 700; color: white;">${l.company_name}</div>
                    <span style="padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; background: ${l.priority==='Hot'?'rgba(239, 68, 68, 0.2)':'rgba(245, 158, 11, 0.2)'}; color: ${l.priority==='Hot'?'#ef4444':'#f59e0b'};">${l.priority || 'Cold'}</span>
                  </div>

                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">${l.contact_name}</div>

                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--success-color);">$${(l.estimated_deal_value || 0).toLocaleString()}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Score: <strong style="color: white;">${l.score || 70}</strong></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ─── Drag and Drop Handlers ───────────────────────────────────────────────────

(window as any).allowDealDrop = (ev: DragEvent) => {
  ev.preventDefault();
};

(window as any).dragDeal = (ev: DragEvent, leadId: string) => {
  ev.dataTransfer?.setData("text/plain", leadId);
};

(window as any).dropDeal = async (ev: DragEvent, targetStage: string) => {
  ev.preventDefault();
  const leadId = ev.dataTransfer?.getData("text/plain");
  if (!leadId) return;

  try {
    await api.patch(`/pipeline/deals/${leadId}/move`, { lead_status: targetStage });
    fetchPipelineData();
  } catch (err: any) {
    showToast(`Failed to move deal stage: ${err.message}`, 'error');
  }
};

// ─── 2. Table View ─────────────────────────────────────────────────────────────

function renderTableView(container: HTMLElement) {
  container.innerHTML = `
    <div class="glass-card" style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.3);">
            <th style="padding: 0.85rem 1rem;">Company Name</th>
            <th style="padding: 0.85rem 1rem;">Contact</th>
            <th style="padding: 0.85rem 1rem;">Pipeline Stage</th>
            <th style="padding: 0.85rem 1rem;">Priority</th>
            <th style="padding: 0.85rem 1rem;">Score</th>
            <th style="padding: 0.85rem 1rem;">Deal Value ($)</th>
            <th style="padding: 0.85rem 1rem; text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${currentLeads.map(l => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
              <td style="padding: 0.85rem 1rem; font-weight: 700; cursor: pointer;" onclick="navigate('/lead?id=${l.id}')">${l.company_name}</td>
              <td style="padding: 0.85rem 1rem; color: var(--text-secondary);">${l.contact_name}</td>
              <td style="padding: 0.85rem 1rem;"><span style="padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; background: rgba(79, 140, 255, 0.15); color: #4F8CFF; font-weight: 600;">${l.lead_status || 'Prospecting'}</span></td>
              <td style="padding: 0.85rem 1rem;">${l.priority}</td>
              <td style="padding: 0.85rem 1rem; font-weight: 700;">${l.score || 70}</td>
              <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--success-color);">$${(l.estimated_deal_value || 0).toLocaleString()}</td>
              <td style="padding: 0.85rem 1rem; text-align: right;">
                <button class="icon-btn" onclick="navigate('/lead?id=${l.id}')" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">View Deal</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ─── 3. Timeline View ──────────────────────────────────────────────────────────

function renderTimelineView(container: HTMLElement) {
  container.innerHTML = `
    <div class="glass-card" style="padding: 2rem;">
      <h3 style="margin-top: 0;">Deal Close Timeline Roadmap</h3>
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${currentLeads.map(l => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 700; font-size: 1rem;">${l.company_name}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">${l.lead_status || 'Prospecting'} • Contact: ${l.contact_name}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.1rem; font-weight: 800; color: var(--success-color);">$${(l.estimated_deal_value || 0).toLocaleString()}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">Target Close: ${l.expected_close_date ? l.expected_close_date.split('T')[0] : 'Q3 2026'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ─── 4. Calendar View ──────────────────────────────────────────────────────────

function renderCalendarView(container: HTMLElement) {
  container.innerHTML = `
    <div class="glass-card" style="padding: 2rem;">
      <h3 style="margin-top: 0; margin-bottom: 1.5rem;">Deal Close Calendar</h3>
      <div id="pipelineCalendarContainer" style="min-height: 600px; color: white;"></div>
    </div>
  `;

  setTimeout(() => {
    const calEl = document.getElementById('pipelineCalendarContainer');
    if (!calEl) return;

    if (!(window as any).FullCalendar) {
      calEl.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--danger-color);">FullCalendar library failed to load. Please check your internet connection.</div>';
      return;
    }

    const events = currentLeads
      .filter(l => l.expected_close_date)
      .map(l => ({
        id: l.id,
        title: `${l.company_name} - $${(l.estimated_deal_value || 0).toLocaleString()}`,
        date: l.expected_close_date.split('T')[0],
        color: l.lead_status === 'Closed Won' ? '#22c55e' : (l.priority === 'Hot' ? '#ef4444' : '#4F8CFF'),
        extendedProps: { leadId: l.id }
      }));

    const calendar = new (window as any).FullCalendar.Calendar(calEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: events,
      eventClick: function(info: any) {
        if (info.event.extendedProps.leadId) {
           (window as any).navigate('/lead?id=' + info.event.extendedProps.leadId);
        }
      }
    });

    calendar.render();
  }, 100);
}

// ─── 5. Forecast Dashboard View ───────────────────────────────────────────────

async function renderForecastView(container: HTMLElement) {
  try {
    const forecast = await api.get('/pipeline/forecast');

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
        <div class="glass-card" style="padding: 1.25rem; border-top: 4px solid var(--secondary-color);">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Total Pipeline Value</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: white; margin-top: 0.25rem;">$${forecast.total_pipeline_value.toLocaleString()}</div>
        </div>

        <div class="glass-card" style="padding: 1.25rem; border-top: 4px solid var(--success-color);">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Weighted Revenue</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: var(--success-color); margin-top: 0.25rem;">$${forecast.weighted_revenue.toLocaleString()}</div>
        </div>

        <div class="glass-card" style="padding: 1.25rem; border-top: 4px solid #4F8CFF;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Win Rate %</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #4F8CFF; margin-top: 0.25rem;">${forecast.win_rate_percent}%</div>
        </div>

        <div class="glass-card" style="padding: 1.25rem; border-top: 4px solid #f59e0b;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Average Deal Size</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #f59e0b; margin-top: 0.25rem;">$${forecast.avg_deal_size.toLocaleString()}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div class="glass-card" style="padding: 1.75rem;">
          <h3 style="margin-top: 0;">Quarterly Revenue Breakdown</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
            ${Object.entries(forecast.quarterly_forecast).map(([q, val]: any) => `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                  <strong>${q}</strong>
                  <span>$${val.toLocaleString()}</span>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${Math.min(100, (val / forecast.total_pipeline_value) * 100 * 3)}%; height: 100%; background: var(--primary-gradient);"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="glass-card" style="padding: 1.75rem;">
          <h3 style="margin-top: 0;">Monthly Velocity</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
            ${Object.entries(forecast.monthly_forecast).map(([m, val]: any) => `
              <div style="display: flex; justify-content: space-between; padding: 0.85rem; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px solid var(--border-color);">
                <span style="font-weight: 600;">${m}</span>
                <strong style="color: var(--success-color);">$${val.toLocaleString()}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } catch (err: any) {
    container.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--danger-color);" class="glass-card">Failed to load forecast metrics: ${err.message}</div>`;
  }
}

// ─── Handlers & Modals ────────────────────────────────────────────────────────

(window as any).switchPipelineView = (view: string) => {
  activeView = view;
  localStorage.setItem('crm_pipeline_view', view);
  renderPipeline();
};

(window as any).handlePipelineSearch = (val: string) => {
  searchQuery = val;
  fetchPipelineData();
};

(window as any).applyPipelineFilters = () => {
  filterPriority = (document.getElementById('fPipelinePriority') as HTMLSelectElement).value;
  fetchPipelineData();
};

(window as any).openStageConfigModal = () => {
  const modalHtml = `
    <div id="stageConfigModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 200; display: flex; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 500px; padding: 2rem; border-radius: var(--border-radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0;">Configure Pipeline Stages</h3>
          <button class="icon-btn" onclick="document.getElementById('stageConfigModal').remove()">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
          ${pipelineStages.map(stg => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: rgba(0,0,0,0.3); border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 16px; height: 16px; border-radius: 50%; background: ${stg.color};"></div>
                <span style="font-weight: 600;">${stg.name}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 0.8rem; color: var(--text-secondary);">${stg.probability}% Prob</span>
                <button type="button" class="icon-btn" onclick="deletePipelineStage('${stg.id}', '${stg.name}')" style="padding: 0.2rem 0.4rem; color: var(--danger-color); font-size: 1rem; border: none; background: transparent; cursor: pointer;" title="Delete Stage">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>

        <form onsubmit="saveNewStage(event)">
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="newStgName" required placeholder="New Stage Name" style="flex: 1; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
            <input type="number" id="newStgProb" min="0" max="100" value="50" placeholder="Prob %" style="width: 80px; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
            <button type="submit" class="gradient-btn">+ Add Stage</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

(window as any).saveNewStage = async (e: Event) => {
  e.preventDefault();
  const name = (document.getElementById('newStgName') as HTMLInputElement).value;
  const probability = parseInt((document.getElementById('newStgProb') as HTMLInputElement).value) || 50;

  try {
    await api.post('/pipeline/stages', { name, probability, color: '#4F8CFF' });
    document.getElementById('stageConfigModal')?.remove();
    showToast('Stage created successfully', 'success');
    fetchPipelineData();
  } catch (err: any) {
    showToast(`Failed to add stage: ${err.message}`, 'error');
  }
};

(window as any).deletePipelineStage = async (id: string, name: string) => {
  if (!confirm(`Are you sure you want to delete the stage "${name}"? Leads in this stage will not be deleted but will need to be reassigned to a valid stage.`)) return;
  
  try {
    await api.delete(`/pipeline/stages/${id}`);
    showToast(`Stage "${name}" deleted.`, 'success');
    document.getElementById('stageConfigModal')?.remove();
    fetchPipelineData();
  } catch (err: any) {
    showToast(`Failed to delete stage: ${err.message}`, 'error');
  }
};
