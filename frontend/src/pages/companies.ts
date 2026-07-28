import { router } from '../router';
import { api } from '../api';
import { createLayout } from '../components/layout';

let activeView = localStorage.getItem('crm_company_view') || 'grid';
let currentCompanies: any[] = [];
let selectedCompanyIds: Set<string> = new Set();
let searchQuery = '';
let filterIndustry = '';
let filterCountry = '';
let filterSize = '';
let filterMinHealth = 0;
let filterOwner = '';
let sortColumn = 'created_at';
let sortDirection = 'desc';
let currentPage = 1;
let totalPages = 1;

export function renderCompanies() {
  const contentHtml = `
    <!-- Top Header & View Controls -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;">Target Accounts & ABM</h1>
        <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Account intelligence, health scoring, decision makers, and intent signals.</p>
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <!-- View Switcher (Grid, Table, Compact, Card) -->
        <div class="glass-card" style="display: flex; padding: 3px; gap: 2px; border-radius: var(--border-radius-sm);">
          <button class="icon-btn ${activeView === 'grid' ? 'active-view-btn' : ''}" onclick="switchCompanyView('grid')" title="Grid View" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Grid
          </button>
          <button class="icon-btn ${activeView === 'table' ? 'active-view-btn' : ''}" onclick="switchCompanyView('table')" title="Table View" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Table
          </button>
          <button class="icon-btn ${activeView === 'compact' ? 'active-view-btn' : ''}" onclick="switchCompanyView('compact')" title="Compact View" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            Compact
          </button>
          <button class="icon-btn ${activeView === 'card' ? 'active-view-btn' : ''}" onclick="switchCompanyView('card')" title="ABM Card View" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            Cards
          </button>
        </div>

        <button class="gradient-btn" onclick="openAddCompanyModal()" style="display: flex; align-items: center; gap: 0.5rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          + Add Account
        </button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="glass-card" style="padding: 1.25rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
        <!-- Search Field -->
        <div style="position: relative; flex: 1; min-width: 260px;">
          <svg style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="companySearchInput" placeholder="Search company name, domain, industry, location..." value="${searchQuery}" oninput="handleCompanySearch(this.value)" style="width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; outline: none;" />
        </div>

        <!-- Quick Filters -->
        <select id="fCompanyIndustry" onchange="applyCompanyFilters()" style="padding: 0.65rem 1rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; outline: none; min-width: 150px;">
          <option value="">All Industries</option>
          <option value="Software" ${filterIndustry==='Software'?'selected':''}>Software & SaaS</option>
          <option value="Finance" ${filterIndustry==='Finance'?'selected':''}>Financial Services</option>
          <option value="Healthcare" ${filterIndustry==='Healthcare'?'selected':''}>Healthcare & Bio</option>
          <option value="Manufacturing" ${filterIndustry==='Manufacturing'?'selected':''}>Manufacturing</option>
          <option value="Consulting" ${filterIndustry==='Consulting'?'selected':''}>Consulting</option>
        </select>

        <select id="fCompanySize" onchange="applyCompanyFilters()" style="padding: 0.65rem 1rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; outline: none; min-width: 140px;">
          <option value="">All Sizes</option>
          <option value="1-10" ${filterSize==='1-10'?'selected':''}>1-10 employees</option>
          <option value="11-50" ${filterSize==='11-50'?'selected':''}>11-50 employees</option>
          <option value="51-200" ${filterSize==='51-200'?'selected':''}>51-200 employees</option>
          <option value="201-1000" ${filterSize==='201-1000'?'selected':''}>201-1000 employees</option>
          <option value="1000+" ${filterSize==='1000+'?'selected':''}>1000+ Enterprise</option>
        </select>

        <button class="icon-btn" onclick="exportCompaniesCSV()" style="padding: 0.65rem 1rem; display: flex; align-items: center; gap: 0.4rem; border-radius: var(--border-radius-sm);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Dynamic Container -->
    <div id="companyViewContainer" style="min-height: 400px;">
      <div style="text-align: center; padding: 4rem; color: var(--text-secondary);">Loading accounts...</div>
    </div>

    <!-- Bulk Action Floating Bar -->
    <div id="companyBulkBar" style="display: none; position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #0f172a; border: 1px solid var(--border-color); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); padding: 0.85rem 1.5rem; border-radius: 9999px; z-index: 100; display: flex; align-items: center; gap: 1.5rem;">
      <div style="font-size: 0.85rem; font-weight: 600;" id="companyBulkCount">0 selected</div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="icon-btn" onclick="bulkAssignCompanies()" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Assign Owner</button>
        <button class="icon-btn" onclick="bulkSoftDeleteCompanies()" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; border-color: var(--danger-color); color: var(--danger-color);">Delete</button>
      </div>
    </div>
  `;

  router.mount(createLayout('/companies', contentHtml));
  fetchAndRenderCompanies();
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchAndRenderCompanies() {
  const container = document.getElementById('companyViewContainer');
  if (!container) return;

  try {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '50',
      sort_by: sortColumn,
      sort_dir: sortDirection,
    });

    if (searchQuery) params.append('q', searchQuery);
    if (filterIndustry) params.append('industry', filterIndustry);
    if (filterCountry) params.append('country', filterCountry);
    if (filterSize) params.append('company_size', filterSize);
    if (filterMinHealth > 0) params.append('min_health', filterMinHealth.toString());
    if (filterOwner) params.append('owner_id', filterOwner);

    const res = await api.get(`/companies?${params.toString()}`);
    currentCompanies = res.data || [];
    totalPages = res.pages || 1;

    if (activeView === 'table') {
      renderTableView(container);
    } else if (activeView === 'compact') {
      renderCompactView(container);
    } else if (activeView === 'card') {
      renderABMCardView(container);
    } else {
      renderGridView(container);
    }

    if (totalPages > 1) {
      container.insertAdjacentHTML('beforeend', `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; margin-top: 1.5rem;" class="glass-card">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Page ${currentPage} of ${totalPages} (${res.total || 0} Total Accounts)</div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="icon-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="changeCompanyPage(${currentPage - 1})">Previous</button>
            <button class="icon-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="changeCompanyPage(${currentPage + 1})">Next</button>
          </div>
        </div>
      `);
    }

  } catch (err: any) {
    container.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--danger-color);">Failed to load target accounts: ${err.message}</div>`;
  }
}

// ─── 1. Grid View ──────────────────────────────────────────────────────────────

function renderGridView(container: HTMLElement) {
  if (currentCompanies.length === 0) {
    container.innerHTML = `<div style="padding: 4rem; text-align: center; color: var(--text-secondary);" class="glass-card">No target accounts found matching your filters.</div>`;
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
      ${currentCompanies.map(c => `
        <div class="glass-card" style="padding: 1.5rem; transition: transform 0.2s; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'" onclick="navigate('/company?id=${c.id}')">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #1e293b, #0f172a); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 700; border: 1px solid var(--border-color); color: #38bdf8;">
                  ${c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; font-weight: 600; color: white;">${c.name}</h3>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">${c.industry} • ${c.location}</div>
                </div>
              </div>
              <div style="width: 36px; height: 36px; border-radius: 50%; background: ${c.health_score > 75 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${c.health_score > 75 ? 'var(--success-color)' : 'var(--warning-color)'}; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; border: 1px solid currentColor;">
                ${c.health_score}
              </div>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${c.description || 'Target account actively tracked in ABM intelligence workflow.'}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); text-align: center;">
            <div>
              <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Contacts</div>
              <div style="font-size: 0.95rem; font-weight: 600; margin-top: 0.2rem;">${c.contacts_count}</div>
            </div>
            <div>
              <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Leads</div>
              <div style="font-size: 0.95rem; font-weight: 600; margin-top: 0.2rem;">${c.leads_count}</div>
            </div>
            <div>
              <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Revenue</div>
              <div style="font-size: 0.95rem; font-weight: 600; margin-top: 0.2rem; color: var(--success-color);">${c.annual_revenue}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── 2. Table View ─────────────────────────────────────────────────────────────

function renderTableView(container: HTMLElement) {
  if (currentCompanies.length === 0) {
    container.innerHTML = `<div style="padding: 4rem; text-align: center; color: var(--text-secondary);" class="glass-card">No target accounts found.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="glass-card" style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.3); text-align: left;">
            <th style="padding: 0.75rem 1rem;"><input type="checkbox" onchange="toggleSelectAllCompanies(this.checked)" /></th>
            <th style="padding: 0.75rem 1rem; cursor: pointer;" onclick="changeCompanySort('name')">Company Name ${sortColumn==='name'?(sortDirection==='asc'?'▲':'▼'):''}</th>
            <th style="padding: 0.75rem 1rem; cursor: pointer;" onclick="changeCompanySort('industry')">Industry ${sortColumn==='industry'?(sortDirection==='asc'?'▲':'▼'):''}</th>
            <th style="padding: 0.75rem 1rem;">Location</th>
            <th style="padding: 0.75rem 1rem; cursor: pointer;" onclick="changeCompanySort('health_score')">Health Score ${sortColumn==='health_score'?(sortDirection==='asc'?'▲':'▼'):''}</th>
            <th style="padding: 0.75rem 1rem;">Buying Intent</th>
            <th style="padding: 0.75rem 1rem;">Contacts</th>
            <th style="padding: 0.75rem 1rem;">ARR / Revenue</th>
            <th style="padding: 0.75rem 1rem; text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${currentCompanies.map(c => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
              <td style="padding: 0.75rem 1rem;"><input type="checkbox" value="${c.id}" ${selectedCompanyIds.has(c.id)?'checked':''} onchange="toggleSelectCompany('${c.id}', this.checked)" /></td>
              <td style="padding: 0.75rem 1rem; font-weight: 600; cursor: pointer;" onclick="navigate('/company?id=${c.id}')">${c.name}</td>
              <td style="padding: 0.75rem 1rem; color: var(--text-secondary);">${c.industry}</td>
              <td style="padding: 0.75rem 1rem; color: var(--text-secondary);">${c.location}</td>
              <td style="padding: 0.75rem 1rem;"><span style="padding: 0.2rem 0.5rem; border-radius: 9999px; font-weight: 700; font-size: 0.75rem; background: ${c.health_score > 75 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${c.health_score > 75 ? 'var(--success-color)' : 'var(--warning-color)'};">${c.health_score} / 100</span></td>
              <td style="padding: 0.75rem 1rem;"><span style="padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; background: rgba(79, 140, 255, 0.15); color: #4F8CFF;">${c.buying_intent}</span></td>
              <td style="padding: 0.75rem 1rem;">${c.contacts_count} contacts</td>
              <td style="padding: 0.75rem 1rem; font-weight: 600; color: var(--success-color);">${c.annual_revenue}</td>
              <td style="padding: 0.75rem 1rem; text-align: right;">
                <button class="icon-btn" onclick="navigate('/company?id=${c.id}')" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">View Profile</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ─── 3. Compact View ──────────────────────────────────────────────────────────

function renderCompactView(container: HTMLElement) {
  container.innerHTML = `
    <div class="glass-card" style="display: flex; flex-direction: column;">
      ${currentCompanies.map(c => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;" onclick="navigate('/company?id=${c.id}')" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="font-weight: 600; font-size: 0.95rem;">${c.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${c.industry}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 1.5rem; font-size: 0.85rem;">
            <div>${c.location}</div>
            <div style="font-weight: 600; color: var(--success-color);">${c.annual_revenue}</div>
            <div style="font-weight: 700; color: var(--warning-color);">${c.health_score} pts</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── 4. ABM Card View ──────────────────────────────────────────────────────────

function renderABMCardView(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
      ${currentCompanies.map(c => `
        <div class="glass-card" style="padding: 1.5rem; border-top: 4px solid var(--secondary-color); cursor: pointer;" onclick="navigate('/company?id=${c.id}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <h3 style="margin: 0 0 0.2rem 0; font-size: 1.15rem; font-weight: 700;">${c.name}</h3>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">${c.industry} • ${c.company_size}</div>
            </div>
            <span style="padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; background: rgba(124, 58, 237, 0.2); color: var(--secondary-color); border: 1px solid var(--secondary-color);">${c.buying_intent}</span>
          </div>

          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
            <strong>Tech Stack:</strong> ${c.technology_stack || 'Salesforce, HubSpot, Slack'}
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <div>Health Score: <strong style="color: var(--success-color);">${c.health_score}/100</strong></div>
            <div>ARR: <strong style="color: white;">${c.annual_revenue}</strong></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Event Handlers & Modals ───────────────────────────────────────────────────

(window as any).switchCompanyView = (view: string) => {
  activeView = view;
  localStorage.setItem('crm_company_view', view);
  renderCompanies();
};

(window as any).handleCompanySearch = (val: string) => {
  searchQuery = val;
  currentPage = 1;
  fetchAndRenderCompanies();
};

(window as any).applyCompanyFilters = () => {
  filterIndustry = (document.getElementById('fCompanyIndustry') as HTMLSelectElement).value;
  filterSize = (document.getElementById('fCompanySize') as HTMLSelectElement).value;
  currentPage = 1;
  fetchAndRenderCompanies();
};

(window as any).changeCompanySort = (col: string) => {
  if (sortColumn === col) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = col;
    sortDirection = 'asc';
  }
  fetchAndRenderCompanies();
};

(window as any).changeCompanyPage = (p: number) => {
  currentPage = p;
  fetchAndRenderCompanies();
};

(window as any).exportCompaniesCSV = () => {
  window.open('/api/companies/export?format=csv', '_blank');
};

(window as any).openAddCompanyModal = () => {
  const modalHtml = `
    <div id="addCompanyModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 200; display: flex; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 550px; padding: 2rem; border-radius: var(--border-radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="margin: 0; font-size: 1.3rem;">Create Target Account</h2>
          <button class="icon-btn" onclick="document.getElementById('addCompanyModal').remove()">✕</button>
        </div>

        <form onsubmit="saveCompanyAccount(event)">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-secondary);">Company Name *</label>
              <input type="text" id="mCompName" required placeholder="Acme Corporation" style="width: 100%; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; margin-top: 0.25rem;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-secondary);">Industry</label>
                <input type="text" id="mCompIndustry" placeholder="Software & SaaS" style="width: 100%; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; margin-top: 0.25rem;" />
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-secondary);">Website URL</label>
                <input type="text" id="mCompWebsite" placeholder="https://acme.com" style="width: 100%; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; margin-top: 0.25rem;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-secondary);">Company Size</label>
                <select id="mCompSize" style="width: 100%; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; margin-top: 0.25rem;">
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200" selected>51-200 employees</option>
                  <option value="201-1000">201-1000 employees</option>
                  <option value="1000+">1000+ Enterprise</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--text-secondary);">Annual Revenue</label>
                <input type="text" id="mCompRevenue" placeholder="$10M - $50M" style="width: 100%; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; margin-top: 0.25rem;" />
              </div>
            </div>

            <div>
              <label style="font-size: 0.8rem; color: var(--text-secondary);">Location / Headquarters</label>
              <input type="text" id="mCompLocation" placeholder="San Francisco, CA, USA" style="width: 100%; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; margin-top: 0.25rem;" />
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
              <button type="button" class="icon-btn" onclick="document.getElementById('addCompanyModal').remove()">Cancel</button>
              <button type="submit" class="gradient-btn">Create Account</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

(window as any).saveCompanyAccount = async (e: Event) => {
  e.preventDefault();
  const name = (document.getElementById('mCompName') as HTMLInputElement).value;
  const industry = (document.getElementById('mCompIndustry') as HTMLInputElement).value;
  const website = (document.getElementById('mCompWebsite') as HTMLInputElement).value;
  const company_size = (document.getElementById('mCompSize') as HTMLSelectElement).value;
  const annual_revenue = (document.getElementById('mCompRevenue') as HTMLInputElement).value;
  const location = (document.getElementById('mCompLocation') as HTMLInputElement).value;

  try {
    await api.post('/companies', { name, industry, website, company_size, annual_revenue, location });
    document.getElementById('addCompanyModal')?.remove();
    fetchAndRenderCompanies();
  } catch (err: any) {
    alert(`Failed to create company account: ${err.message}`);
  }
};
