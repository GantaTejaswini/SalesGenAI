import { router } from '../router';
import { api, showToast } from '../api';
import { createLayout } from '../components/layout';

// Types
export interface LeadItem {
  id: string;
  company_id?: string;
  contact_id?: string;
  company_name: string;
  contact_name: string;
  contact_first_name?: string;
  contact_last_name?: string;
  email: string;
  phone?: string;
  job_title?: string;
  industry?: string;
  company_size?: string;
  annual_revenue?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  lead_status: string;
  priority: string;
  score: number;
  conversion_probability?: number;
  estimated_deal_value: number;
  expected_close_date?: string;
  tags?: string;
  notes?: string;
  source?: string;
  owner_id?: string;
  owner_name?: string;
  created_at: string;
  updated_at?: string;
  ai_recommendation?: string;
}

const KANBAN_STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

let currentLeads: LeadItem[] = [];
let selectedLeadIds: Set<string> = new Set();
let activeView = localStorage.getItem('crm_lead_view') || 'table';
let searchQuery = '';
let filterStatus = '';
let filterPriority = '';
let filterIndustry = '';
let filterOwner = '';
let sortColumn = 'created_at';
let sortDirection = 'desc';
let currentPage = 1;
let totalPages = 1;

export function renderLeads() {
  const contentHtml = `
    <!-- Top Header & View Switcher -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 0.2rem;">
          Enterprise CRM Leads
        </h1>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Manage prospects, track pipeline stages, execute AI intelligence, and drive conversions.
        </p>
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <!-- View Selector -->
        <div style="background: rgba(255,255,255,0.05); padding: 0.25rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); display: flex; gap: 0.25rem;">
          <button class="icon-btn ${activeView === 'table' ? 'active' : ''}" onclick="switchLeadView('table')" title="Table Grid View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Table
          </button>
          <button class="icon-btn ${activeView === 'kanban' ? 'active' : ''}" onclick="switchLeadView('kanban')" title="Kanban Pipeline Board">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"></rect><rect x="12" y="3" width="5" height="12" rx="1"></rect><rect x="21" y="3" width="5" height="8" rx="1"></rect></svg>
            Kanban
          </button>
          <button class="icon-btn ${activeView === 'grid' ? 'active' : ''}" onclick="switchLeadView('grid')" title="Cards Grid View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Grid
          </button>
          <button class="icon-btn ${activeView === 'compact' ? 'active' : ''}" onclick="switchLeadView('compact')" title="Compact High Density View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            Compact
          </button>
        </div>

        <!-- Export & Add Actions -->
        <button class="icon-btn" onclick="openExportModal()" title="Export CSV / Excel / PDF">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export
        </button>
        <button class="icon-btn" onclick="window.print()" title="Print View">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        </button>
        <button class="gradient-btn" onclick="openAddLeadModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          + Add Lead
        </button>
      </div>
    </div>

    <!-- Search & Quick Filters Bar -->
    <div class="glass-card" style="padding: 1rem; margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        
        <!-- Upgraded Search Bar -->
        <div style="position: relative; flex: 1; min-width: 280px;">
          <input type="text" id="crmSearchInput" placeholder="Search Company, Contact, Email, Phone, Tag, Status, Owner..." 
                 value="${searchQuery}"
                 oninput="onLeadSearchInput(this.value)"
                 onkeydown="onSearchKeyDown(event)"
                 class="form-input" style="width: 100%; padding-left: 2.5rem;" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          
          <!-- Recent Searches Dropdown -->
          <div id="searchDropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0D1222; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); box-shadow: var(--shadow-lg); z-index: 100; margin-top: 0.25rem; max-height: 200px; overflow-y: auto;">
            <div style="padding: 0.5rem 1rem; font-size: 0.75rem; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.05);">RECENT SEARCHES</div>
            <div id="recentSearchItems"></div>
          </div>
        </div>

        <!-- Quick Filters -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="icon-btn ${filterPriority === 'Hot' ? 'active' : ''}" onclick="setQuickFilter('priority', 'Hot')">🔥 Hot Leads</button>
          <button class="icon-btn ${filterStatus === 'Qualified' ? 'active' : ''}" onclick="setQuickFilter('status', 'Qualified')">🎯 Qualified</button>
          <button class="icon-btn ${filterStatus === 'Proposal' ? 'active' : ''}" onclick="setQuickFilter('status', 'Proposal')">📄 Proposal</button>
          <button class="icon-btn" onclick="toggleAdvancedFilterDrawer()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Advanced Filter
          </button>
        </div>

      </div>

      <!-- Advanced Filter Drawer -->
      <div id="advancedFilterDrawer" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
          <div class="form-group">
            <label>Status Filter</label>
            <select id="fStatus" class="form-select" onchange="applyAdvancedFilters()">
              <option value="">All Statuses</option>
              ${KANBAN_STAGES.map(s => `<option value="${s}" ${filterStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Priority Filter</label>
            <select id="fPriority" class="form-select" onchange="applyAdvancedFilters()">
              <option value="">All Priorities</option>
              <option value="Hot" ${filterPriority === 'Hot' ? 'selected' : ''}>Hot</option>
              <option value="Warm" ${filterPriority === 'Warm' ? 'selected' : ''}>Warm</option>
              <option value="Cold" ${filterPriority === 'Cold' ? 'selected' : ''}>Cold</option>
            </select>
          </div>
          <div class="form-group">
            <label>Industry</label>
            <input type="text" id="fIndustry" placeholder="e.g. Software, Healthcare" value="${filterIndustry}" class="form-input" onchange="applyAdvancedFilters()" />
          </div>
          <div style="display: flex; align-items: flex-end; gap: 0.5rem;">
            <button class="icon-btn" onclick="resetFilters()" style="width: 100%;">Reset Filters</button>
            <button class="icon-btn" onclick="saveFilterPreset()">Save Filter</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dynamic View Container -->
    <div id="leadsViewContainer">
      <div style="text-align: center; padding: 4rem; color: var(--text-secondary);">
        Loading CRM intelligence...
      </div>
    </div>

    <!-- Floating Bulk Actions Bar -->
    <div id="bulkActionBar" class="bulk-bar" style="display: none;">
      <span id="bulkCountLabel" style="font-weight: 700; color: var(--primary-color); font-size: 0.9rem;">0 Selected</span>
      <div style="height: 18px; width: 1px; background: rgba(255,255,255,0.2);"></div>
      <button class="icon-btn" onclick="handleBulkAction('change_status')">Change Status</button>
      <button class="icon-btn" onclick="handleBulkAction('change_priority')">Change Priority</button>
      <button class="icon-btn" onclick="handleBulkAction('assign')">Assign Owner</button>
      <button class="icon-btn" onclick="handleBulkAction('add_tags')">+ Add Tag</button>
      <button class="icon-btn" onclick="handleBulkAction('soft_delete')" style="color: var(--danger-color);">Delete</button>
      <button class="icon-btn" onclick="clearBulkSelection()">Cancel</button>
    </div>
  `;

  router.mount(createLayout('/leads', contentHtml));
  fetchAndRenderLeads();

  // Attach search dropdown listeners
  setupSearchAutocomplete();
}

// ─── Global State & View Switcher ──────────────────────────────────────────────

(window as any).switchLeadView = (view: string) => {
  activeView = view;
  localStorage.setItem('crm_lead_view', view);
  renderLeads();
};

let searchDebounceTimer: any = null;
(window as any).onLeadSearchInput = (val: string) => {
  searchQuery = val;
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchAndRenderLeads();
  }, 300);
};

(window as any).setQuickFilter = (key: string, val: string) => {
  if (key === 'priority') filterPriority = filterPriority === val ? '' : val;
  if (key === 'status') filterStatus = filterStatus === val ? '' : val;
  fetchAndRenderLeads();
};

(window as any).toggleAdvancedFilterDrawer = () => {
  const drawer = document.getElementById('advancedFilterDrawer');
  if (drawer) drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
};

(window as any).applyAdvancedFilters = () => {
  filterStatus = (document.getElementById('fStatus') as HTMLSelectElement).value;
  filterPriority = (document.getElementById('fPriority') as HTMLSelectElement).value;
  filterIndustry = (document.getElementById('fIndustry') as HTMLInputElement).value;
  fetchAndRenderLeads();
};

(window as any).resetFilters = () => {
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';
  filterIndustry = '';
  filterOwner = '';
  fetchAndRenderLeads();
};

// ─── Data Fetcher ─────────────────────────────────────────────────────────────

async function fetchAndRenderLeads() {
  const container = document.getElementById('leadsViewContainer');
  if (!container) return;

  // Add Skeleton Loader
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem;">
      <div class="skeleton" style="height: 40px; width: 100%; border-radius: var(--border-radius-sm);"></div>
      <div class="skeleton" style="height: 40px; width: 100%; border-radius: var(--border-radius-sm);"></div>
      <div class="skeleton" style="height: 40px; width: 100%; border-radius: var(--border-radius-sm);"></div>
      <div class="skeleton" style="height: 40px; width: 100%; border-radius: var(--border-radius-sm);"></div>
      <div class="skeleton" style="height: 40px; width: 100%; border-radius: var(--border-radius-sm);"></div>
    </div>
  `;

  try {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '100',
      sort_by: sortColumn,
      sort_dir: sortDirection,
    });

    if (searchQuery) params.append('q', searchQuery);
    if (filterStatus) params.append('status', filterStatus);
    if (filterPriority) params.append('priority', filterPriority);
    if (filterIndustry) params.append('industry', filterIndustry);
    if (filterOwner) params.append('owner_id', filterOwner);

    const res = await api.get(`/leads?${params.toString()}`);
    currentLeads = res.data || [];
    totalPages = res.pages || 1;

    if (activeView === 'kanban') {
      renderKanbanView(container);
    } else if (activeView === 'grid') {
      renderGridView(container);
    } else if (activeView === 'compact') {
      renderCompactView(container);
    } else {
      renderTableView(container);
    }

    if (totalPages > 1) {
      container.insertAdjacentHTML('beforeend', `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; margin-top: 1rem;" class="glass-card">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Page ${currentPage} of ${totalPages}</div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="icon-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
            <button class="icon-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
          </div>
        </div>
      `);
    }

    updateBulkBar();
  } catch (err: any) {
    container.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--danger-color);">Failed to load leads: ${err.message}</div>`;
  }
}

// ─── 1. TABLE VIEW ────────────────────────────────────────────────────────────

function renderTableView(container: HTMLElement) {
  if (currentLeads.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  container.innerHTML = `
    <div class="glass-card" style="padding: 0; overflow-x: auto;">
      <table class="crm-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">
              <input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAllLeads(this.checked)" />
            </th>
            <th class="sortable frozen-col" onclick="changeSort('company_name')">COMPANY / CONTACT</th>
            <th class="sortable" onclick="changeSort('industry')">INDUSTRY</th>
            <th class="sortable" onclick="changeSort('lead_status')">STAGE</th>
            <th class="sortable" onclick="changeSort('priority')">PRIORITY</th>
            <th class="sortable" onclick="changeSort('score')">SCORE</th>
            <th class="sortable" onclick="changeSort('estimated_deal_value')">DEAL VALUE</th>
            <th>AI RECOMMENDATION</th>
            <th style="text-align: right;">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          ${currentLeads.map(lead => {
            const isSelected = selectedLeadIds.has(lead.id);
            return `
              <tr style="cursor: pointer;" onclick="if (!event.target.closest('input, button, a')) navigate('/lead?id=${lead.id}')">
                <td style="text-align: center;" onclick="event.stopPropagation()">
                  <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelectLead('${lead.id}', this.checked)" />
                </td>
                <td class="frozen-col">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: white;">
                      ${(lead.company_name || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style="font-weight: 700; font-size: 0.925rem; color: white;">${highlightMatch(lead.company_name)}</div>
                      <div style="font-size: 0.8rem; color: var(--text-secondary);">${highlightMatch(lead.contact_name)} • ${highlightMatch(lead.email)}</div>
                    </div>
                  </div>
                </td>
                <td>${highlightMatch(lead.industry || '—')}</td>
                <td><span class="badge badge-${(lead.lead_status || 'New').toLowerCase().replace(' ', '')}">${lead.lead_status}</span></td>
                <td><span class="badge badge-${(lead.priority || 'Cold').toLowerCase()}">${lead.priority}</span></td>
                <td>
                  <div style="font-weight: 700; color: ${lead.score >= 75 ? 'var(--success-color)' : lead.score >= 40 ? 'var(--warning-color)' : 'var(--danger-color)'}">
                    ${lead.score}/100
                  </div>
                </td>
                <td style="font-weight: 700; color: white;">$${(lead.estimated_deal_value || 0).toLocaleString()}</td>
                <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  🤖 ${lead.ai_recommendation}
                </td>
                <td style="text-align: right;" onclick="event.stopPropagation()">
                  <button class="icon-btn" onclick="openQuickEditModal('${lead.id}')" title="Edit">✏️</button>
                  <button class="icon-btn" onclick="triggerSingleAI('${lead.id}')" title="Run AI">🤖</button>
                  <button class="icon-btn" onclick="quickSoftDelete('${lead.id}')" title="Delete" style="color: var(--danger-color);">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ─── 2. KANBAN VIEW (Drag & Drop) ─────────────────────────────────────────────

function renderKanbanView(container: HTMLElement) {
  const grouped: Record<string, LeadItem[]> = {};
  KANBAN_STAGES.forEach(s => grouped[s] = []);

  currentLeads.forEach(lead => {
    const stage = KANBAN_STAGES.includes(lead.lead_status) ? lead.lead_status : "New";
    grouped[stage].push(lead);
  });

  container.innerHTML = `
    <div class="kanban-board">
      ${KANBAN_STAGES.map(stage => {
        const leads = grouped[stage] || [];
        const totalVal = leads.reduce((sum, l) => sum + (l.estimated_deal_value || 0), 0);
        return `
          <div class="kanban-col" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${stage}')">
            <div class="kanban-col-header">
              <div>
                <span style="font-weight: 700; font-size: 0.9rem;">${stage}</span>
                <span style="font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 0.1rem 0.5rem; border-radius: 9999px; margin-left: 0.4rem;">${leads.length}</span>
              </div>
              <div style="font-size: 0.8rem; font-weight: 600; color: var(--primary-color);">$${totalVal.toLocaleString()}</div>
            </div>
            
            <div class="kanban-col-body" id="stage-${stage.replace(/\s+/g, '-')}">
              ${leads.length === 0 ? `<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; border: 1px dashed rgba(255,255,255,0.1); border-radius: var(--border-radius-sm);">Drop lead here</div>` : ''}
              ${leads.map(lead => `
                <div class="kanban-card" draggable="true" ondragstart="handleDragStart(event, '${lead.id}')" onclick="navigate('/lead?id=${lead.id}')">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div style="font-weight: 700; font-size: 0.95rem; color: white;">${lead.company_name}</div>
                    <span class="badge badge-${(lead.priority || 'Cold').toLowerCase()}">${lead.priority}</span>
                  </div>

                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    👤 ${lead.contact_name}
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 700; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem; margin-top: 0.5rem;">
                    <div style="color: var(--success-color);">$${(lead.estimated_deal_value || 0).toLocaleString()}</div>
                    <div style="color: ${lead.score >= 70 ? 'var(--primary-color)' : 'var(--text-muted)'}">🎯 ${lead.score}/100</div>
                  </div>

                  <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;" onclick="event.stopPropagation()">
                    <span>🤖 ${(lead.ai_recommendation || 'No AI recommendation').substring(0, 24)}...</span>
                    <button class="icon-btn" style="padding: 0.2rem 0.4rem; font-size: 0.7rem;" onclick="openQuickEditModal('${lead.id}')">Edit</button>
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

// ─── Drag and Drop Handlers for Kanban ─────────────────────────────────────────

(window as any).handleDragStart = (e: DragEvent, leadId: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  }
};

(window as any).handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  const colBody = (e.currentTarget as HTMLElement).querySelector('.kanban-col-body');
  if (colBody) colBody.classList.add('drag-over');
};

(window as any).handleDragLeave = (e: DragEvent) => {
  const colBody = (e.currentTarget as HTMLElement).querySelector('.kanban-col-body');
  if (colBody) colBody.classList.remove('drag-over');
};

(window as any).handleDrop = async (e: DragEvent, newStage: string) => {
  e.preventDefault();
  const colBody = (e.currentTarget as HTMLElement).querySelector('.kanban-col-body');
  if (colBody) colBody.classList.remove('drag-over');

  const leadId = e.dataTransfer?.getData('text/plain');
  if (!leadId) return;

  const lead = currentLeads.find(l => l.id === leadId);
  if (lead && lead.lead_status !== newStage) {
    lead.lead_status = newStage;
    try {
      await api.put(`/leads/${leadId}`, { lead_status: newStage });
      showToast(`Lead moved to ${newStage}`, 'success');
      fetchAndRenderLeads();
    } catch (err: any) {
      showToast(`Failed to update stage: ${err.message}`, 'error');
    }
  }
};

// ─── 3. GRID VIEW ─────────────────────────────────────────────────────────────

function renderGridView(container: HTMLElement) {
  if (currentLeads.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
      ${currentLeads.map(lead => `
        <div class="glass-card" style="cursor: pointer; position: relative;" onclick="navigate('/lead?id=${lead.id}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: white;">${lead.company_name}</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">${lead.industry || 'Enterprise'}</p>
            </div>
            <span class="badge badge-${(lead.priority || 'Cold').toLowerCase()}">${lead.priority}</span>
          </div>

          <div style="background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: var(--border-radius-sm); margin-bottom: 1rem;">
            <div style="font-size: 0.85rem; font-weight: 600; color: white;">${lead.contact_name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${lead.email}</div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
            <div>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Deal Value</div>
              <div style="font-weight: 700; color: var(--success-color);">$${(lead.estimated_deal_value || 0).toLocaleString()}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Score</div>
              <div style="font-weight: 700; color: var(--primary-color);">${lead.score}/100</div>
            </div>
            <div>
              <span class="badge badge-${(lead.lead_status || 'New').toLowerCase().replace(' ', '')}">${lead.lead_status}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── 4. COMPACT VIEW ──────────────────────────────────────────────────────────

function renderCompactView(container: HTMLElement) {
  if (currentLeads.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  container.innerHTML = `
    <div class="glass-card" style="padding: 0; overflow-x: auto;">
      <table class="crm-table" style="font-size: 0.8rem;">
        <thead>
          <tr style="background: rgba(0,0,0,0.4);">
            <th style="padding: 0.5rem 1rem;">COMPANY</th>
            <th style="padding: 0.5rem 1rem;">CONTACT</th>
            <th style="padding: 0.5rem 1rem;">EMAIL</th>
            <th style="padding: 0.5rem 1rem;">STAGE</th>
            <th style="padding: 0.5rem 1rem;">PRIORITY</th>
            <th style="padding: 0.5rem 1rem;">VALUE</th>
            <th style="padding: 0.5rem 1rem;">SCORE</th>
          </tr>
        </thead>
        <tbody>
          ${currentLeads.map(l => `
            <tr style="cursor: pointer;" onclick="navigate('/lead?id=${l.id}')">
              <td style="padding: 0.5rem 1rem; font-weight: 600; color: white;">${l.company_name}</td>
              <td style="padding: 0.5rem 1rem;">${l.contact_name}</td>
              <td style="padding: 0.5rem 1rem; color: var(--text-secondary);">${l.email}</td>
              <td style="padding: 0.5rem 1rem;"><span class="badge badge-${(l.lead_status || 'New').toLowerCase().replace(' ', '')}">${l.lead_status}</span></td>
              <td style="padding: 0.5rem 1rem;"><span class="badge badge-${(l.priority || 'Cold').toLowerCase()}">${l.priority}</span></td>
              <td style="padding: 0.5rem 1rem; font-weight: 700; color: var(--success-color);">$${(l.estimated_deal_value || 0).toLocaleString()}</td>
              <td style="padding: 0.5rem 1rem; font-weight: 700; color: var(--primary-color);">${l.score}/100</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderEmptyState(): string {
  return `
    <div class="glass-card" style="text-align: center; padding: 4rem 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">No Leads Found</h3>
      <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto 1.5rem auto;">
        No prospects match your current search terms or filter criteria. Try resetting filters or adding a new lead.
      </p>
      <button class="gradient-btn" onclick="openAddLeadModal()">+ Create New Lead</button>
    </div>
  `;
}

// ─── Helpers: Sorting, Selection, Bulk Actions ───────────────────────────────

(window as any).changePage = (p: number) => {
  currentPage = p;
  fetchAndRenderLeads();
};

(window as any).changeSort = (col: string) => {
  if (sortColumn === col) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = col;
    sortDirection = 'asc';
  }
  fetchAndRenderLeads();
};

(window as any).toggleSelectLead = (id: string, checked: boolean) => {
  if (checked) selectedLeadIds.add(id);
  else selectedLeadIds.delete(id);
  updateBulkBar();
};

(window as any).toggleSelectAllLeads = (checked: boolean) => {
  if (checked) {
    currentLeads.forEach(l => selectedLeadIds.add(l.id));
  } else {
    selectedLeadIds.clear();
  }
  fetchAndRenderLeads();
};

function updateBulkBar() {
  const bar = document.getElementById('bulkActionBar');
  const countLabel = document.getElementById('bulkCountLabel');
  if (!bar || !countLabel) return;

  if (selectedLeadIds.size > 0) {
    bar.style.display = 'flex';
    countLabel.textContent = `${selectedLeadIds.size} Selected`;
  } else {
    bar.style.display = 'none';
  }
}

(window as any).clearBulkSelection = () => {
  selectedLeadIds.clear();
  fetchAndRenderLeads();
};

(window as any).handleBulkAction = async (action: string) => {
  if (selectedLeadIds.size === 0) return;

  let val: string | null = null;
  if (action === 'change_status') {
    val = prompt('Enter new stage (New, Contacted, Qualified, Proposal, Negotiation, Closed Won, Closed Lost):', 'Qualified');
  } else if (action === 'change_priority') {
    val = prompt('Enter new priority (Hot, Warm, Cold):', 'Hot');
  } else if (action === 'add_tags') {
    val = prompt('Enter tag to add:', 'VIP');
  } else if (action === 'assign') {
    val = prompt('Enter the User ID to assign these leads to:', '');
    if (!val) return;
  } else if (action === 'soft_delete') {
    if (!confirm(`Are you sure you want to soft delete ${selectedLeadIds.size} selected leads?`)) return;
  }

  try {
    await api.post('/leads/bulk-action', {
      lead_ids: Array.from(selectedLeadIds),
      action,
      value: val,
    });
    showToast(`Bulk action '${action}' completed!`, 'success');
    selectedLeadIds.clear();
    fetchAndRenderLeads();
  } catch (err: any) {
    showToast(`Bulk action failed: ${err.message}`, 'error');
  }
};

(window as any).quickSoftDelete = async (id: string) => {
  if (!confirm('Are you sure you want to soft delete this lead?')) return;
  try {
    await api.delete(`/leads/${id}`);
    showToast('Lead deleted successfully', 'success');
    fetchAndRenderLeads();
  } catch (err: any) {
    showToast(`Delete failed: ${err.message}`, 'error');
  }
};

(window as any).triggerSingleAI = async (id: string) => {
  showToast('Running AI intelligence pipeline...', 'info');
  try {
    await api.post(`/leads/${id}/ai/run`, {});
    showToast('AI Intelligence analysis completed!', 'success');
    fetchAndRenderLeads();
  } catch (err: any) {
    showToast(`AI execution failed: ${err.message}`, 'error');
  }
};

function highlightMatch(text: string): string {
  if (!searchQuery || !text) return text || '';
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="highlight">$1</mark>');
}

// ─── ADD LEAD MODAL (Delegated to Global Layout) ───────────────────────────────

// ─── Export Modal ─────────────────────────────────────────────────────────────

(window as any).openQuickEditModal = (id: string) => {
  (window as any).navigate('/lead?id=' + id); // Since Lead Details page exists, we can route there or show a modal. The user said "Clicking any lead opens detailed CRM profile... Layout: Header, Tabs..." which is lead_details.ts. We'll use navigation.
};

(window as any).openExportModal = () => {
  const url = `${api.getBaseUrl()}/leads/export?format=csv`;
  window.open(url, '_blank');
  showToast('Export file downloaded!', 'success');
};

// Search Autocomplete helper
function setupSearchAutocomplete() {
  // Can expand with search history autocomplete UI
}
