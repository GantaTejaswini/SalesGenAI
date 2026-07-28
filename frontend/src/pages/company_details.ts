import { router } from '../router';
import { api } from '../api';
import { createLayout } from '../components/layout';

let activeTab = 'overview';
let companyData: any = null;

export function renderCompanyDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('id');

  if (!companyId) {
    router.mount(createLayout('/companies', `<div style="padding: 3rem; text-align: center; color: var(--danger-color);">No company account ID provided.</div>`));
    return;
  }

  const containerHtml = `
    <div id="companyProfileRoot" style="min-height: 800px;">
      <div style="padding: 4rem; text-align: center; color: var(--text-secondary);">Loading Target Account Profile...</div>
    </div>
  `;

  router.mount(createLayout('/companies', containerHtml));
  loadCompanyProfile(companyId);
}

async function loadCompanyProfile(id: string) {
  const root = document.getElementById('companyProfileRoot');
  if (!root) return;

  try {
    companyData = await api.get(`/companies/${id}`);
    renderProfileContent(root);
  } catch (err: any) {
    root.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--danger-color);" class="glass-card">Failed to load company profile: ${err.message}</div>`;
  }
}

function renderProfileContent(root: HTMLElement) {
  const c = companyData;

  root.innerHTML = `
    <!-- Account Header Card -->
    <div class="glass-card" style="padding: 1.75rem; margin-bottom: 1.5rem; position: relative; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <div style="width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, #1e293b, #0f172a); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; border: 1px solid var(--border-color); color: #38bdf8;">
            ${c.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <h1 style="margin: 0; font-size: 1.6rem; font-weight: 700; color: white;">${c.name}</h1>
              <span style="padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; background: rgba(79, 140, 255, 0.15); color: #4F8CFF;">${c.buying_intent}</span>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">
              ${c.industry} • ${c.location} • ${c.company_size} • ${c.website ? `<a href="${c.website}" target="_blank" style="color: #38bdf8; text-decoration: none;">${c.website}</a>` : ''}
            </div>
          </div>
        </div>

        <!-- Quick ABM Health Metrics & Buttons -->
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="text-align: center; padding: 0.5rem 1rem; background: rgba(0,0,0,0.3); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Health Score</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: ${c.health_score > 75 ? 'var(--success-color)' : 'var(--warning-color)'};">${c.health_score} / 100</div>
          </div>

          <div style="text-align: center; padding: 0.5rem 1rem; background: rgba(0,0,0,0.3); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Annual ARR</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--success-color);">${c.annual_revenue}</div>
          </div>

          <button class="gradient-btn" onclick="triggerCompanyAIRun('${c.id}')" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Run AI Intelligence
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);">
      ${['overview', 'info', 'contacts', 'leads', 'ai', 'timeline', 'meetings', 'files', 'notes', 'tech', 'audit'].map(t => `
        <button class="icon-btn ${activeTab === t ? 'active-view-btn' : ''}" onclick="switchCompanyTab('${t}')" style="padding: 0.6rem 1rem; font-size: 0.85rem; text-transform: capitalize; border-radius: var(--border-radius-sm);">
          ${t === 'ai' ? 'AI Intelligence' : t === 'info' ? 'Information' : t === 'tech' ? 'Tech & Competitors' : t}
        </button>
      `).join('')}
    </div>

    <!-- Tab Content -->
    <div id="companyTabContent">
      ${renderTabBody(c)}
    </div>
  `;
}

function renderTabBody(c: any): string {
  if (activeTab === 'info') {
    return `
      <div class="glass-card" style="padding: 2rem;">
        <h3 style="margin-top: 0;">Account Information</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><strong style="color: var(--text-secondary);">Company Name:</strong> ${c.name}</div>
          <div><strong style="color: var(--text-secondary);">Industry:</strong> ${c.industry}</div>
          <div><strong style="color: var(--text-secondary);">Website:</strong> ${c.website}</div>
          <div><strong style="color: var(--text-secondary);">Location:</strong> ${c.location}</div>
          <div><strong style="color: var(--text-secondary);">Company Size:</strong> ${c.company_size}</div>
          <div><strong style="color: var(--text-secondary);">Annual Revenue:</strong> ${c.annual_revenue}</div>
          <div><strong style="color: var(--text-secondary);">Account Owner:</strong> ${c.owner_name}</div>
          <div><strong style="color: var(--text-secondary);">Risk Score:</strong> ${c.risk_score}</div>
        </div>
      </div>
    `;
  }

  if (activeTab === 'contacts') {
    return `
      <div class="glass-card" style="padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0;">Associated Contacts & Decision Makers</h3>
          <button class="gradient-btn" onclick="openAddCompanyContactModal('${c.id}')">+ Add Contact</button>
        </div>
        ${c.contacts.length === 0 ? '<div style="color: var(--text-secondary);">No contacts linked yet.</div>' : `
          <table style="width: 100%; text-align: left; font-size: 0.85rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <th style="padding: 0.75rem;">Name</th>
                <th style="padding: 0.75rem;">Job Title</th>
                <th style="padding: 0.75rem;">Email</th>
                <th style="padding: 0.75rem;">Phone</th>
              </tr>
            </thead>
            <tbody>
              ${c.contacts.map((cnt: any) => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 0.75rem; font-weight: 600;">${cnt.name}</td>
                  <td style="padding: 0.75rem;">${cnt.job_title}</td>
                  <td style="padding: 0.75rem; color: #38bdf8;">${cnt.email}</td>
                  <td style="padding: 0.75rem;">${cnt.phone}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  }

  if (activeTab === 'ai') {
    return `
      <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">Gemini AI Account Intelligence</h3>
          <span style="font-size: 0.85rem; color: var(--success-color); font-weight: 700;">Confidence: ${(c.ai_confidence * 100).toFixed(0)}%</span>
        </div>

        <div style="background: rgba(79, 140, 255, 0.1); border: 1px solid rgba(79, 140, 255, 0.3); border-radius: var(--border-radius-md); padding: 1.25rem;">
          <strong style="color: #4F8CFF;">🎯 AI Next Best Action:</strong>
          <div style="font-size: 1rem; font-weight: 600; margin-top: 0.3rem;">${c.ai_next_best_action || 'Schedule executive intro call with key decision makers.'}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div style="background: rgba(0,0,0,0.2); padding: 1.25rem; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <strong>Business Summary:</strong>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">${c.ai_business_summary || 'Target account expanding technology footprint.'}</p>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 1.25rem; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <strong>Pain Points:</strong>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">${c.ai_pain_points || 'CRM data fragmentation and slow lead response time.'}</p>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.2); padding: 1.25rem; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
          <strong>Suggested Outreach Email:</strong>
          <pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem; background: var(--bg-color); padding: 1rem; border-radius: 6px;">${c.ai_suggested_outreach || 'AI outreach ready to generate.'}</pre>
        </div>
      </div>
    `;
  }

  // Default Overview Tab
  return `
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="glass-card" style="padding: 1.5rem;">
          <h3 style="margin-top: 0;">Account Overview</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">${c.description || 'Target account actively tracked in ABM intelligence workflow.'}</p>
        </div>

        <div class="glass-card" style="padding: 1.5rem;">
          <h3 style="margin-top: 0;">Timeline & Recent Events</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${c.timeline.map((t: any) => `
              <div style="display: flex; gap: 1rem; align-items: flex-start;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--secondary-color); margin-top: 0.4rem;"></div>
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600;">${t.description}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">${new Date(t.created_at).toLocaleString()}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="glass-card" style="padding: 1.5rem;">
          <h3 style="margin-top: 0;">Decision Makers (${c.contacts.length})</h3>
          ${c.contacts.slice(0, 3).map((cnt: any) => `
            <div style="margin-bottom: 0.75rem;">
              <div style="font-weight: 600; font-size: 0.85rem;">${cnt.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${cnt.job_title}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

(window as any).switchCompanyTab = (tab: string) => {
  activeTab = tab;
  const root = document.getElementById('companyProfileRoot');
  if (root && companyData) renderProfileContent(root);
};

(window as any).triggerCompanyAIRun = async (id: string) => {
  try {
    await api.post(`/companies/${id}/ai/run`);
    loadCompanyProfile(id);
  } catch (err: any) {
    alert(`Failed to execute AI analysis: ${err.message}`);
  }
};

(window as any).openAddCompanyContactModal = (companyId: string) => {
  const modalHtml = `
    <div id="addCompanyContactModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 200; display: flex; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 450px; padding: 2rem; border-radius: var(--border-radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0;">Add Contact Decision Maker</h3>
          <button class="icon-btn" onclick="document.getElementById('addCompanyContactModal').remove()">✕</button>
        </div>
        <form onsubmit="saveCompanyContact(event, '${companyId}')">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="text" id="cntFn" required placeholder="First Name" style="padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
            <input type="text" id="cntLn" required placeholder="Last Name" style="padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
            <input type="email" id="cntEm" required placeholder="Email Address" style="padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
            <input type="text" id="cntJt" placeholder="Job Title (e.g. VP of Sales)" style="padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
              <button type="button" class="icon-btn" onclick="document.getElementById('addCompanyContactModal').remove()">Cancel</button>
              <button type="submit" class="gradient-btn">Save Contact</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

(window as any).saveCompanyContact = async (e: Event, companyId: string) => {
  e.preventDefault();
  const first_name = (document.getElementById('cntFn') as HTMLInputElement).value;
  const last_name = (document.getElementById('cntLn') as HTMLInputElement).value;
  const email = (document.getElementById('cntEm') as HTMLInputElement).value;
  const job_title = (document.getElementById('cntJt') as HTMLInputElement).value;

  try {
    await api.post(`/companies/${companyId}/contacts`, { first_name, last_name, email, job_title });
    document.getElementById('addCompanyContactModal')?.remove();
    loadCompanyProfile(companyId);
  } catch (err: any) {
    alert(`Failed to save contact: ${err.message}`);
  }
};
