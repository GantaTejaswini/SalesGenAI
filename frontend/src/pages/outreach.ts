import { router } from '../router';
import { api } from '../api';
import { createLayout } from '../components/layout';

let outreachData: any = null;

export function renderOutreach() {
  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;">AI Outreach & Multi-Channel Sequences</h1>
        <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Automated cold email, LinkedIn, WhatsApp, call scripts, and tone personalization.</p>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="icon-btn" onclick="openCreateCampaignModal()" style="border-radius: var(--border-radius-sm);">+ New Campaign</button>
        <button class="gradient-btn" onclick="openAIOutreachModal()" style="display: flex; align-items: center; gap: 0.4rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Generate AI Outreach
        </button>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div id="outreachMetricsRoot" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
      <div style="text-align: center; padding: 2rem; color: var(--text-secondary);" class="glass-card">Loading outreach analytics...</div>
    </div>

    <!-- Campaigns List Table -->
    <div class="glass-card" style="padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Active Sequences & Campaigns</h3>
        <input type="text" placeholder="Search campaigns..." oninput="filterCampaigns(this.value)" style="padding: 0.5rem 1rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: white; outline: none; font-size: 0.85rem;" />
      </div>

      <div id="outreachCampaignsTableRoot">
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">Loading campaign sequences...</div>
      </div>
    </div>
  `;

  router.mount(createLayout('/outreach', contentHtml));
  fetchOutreachData();
}

async function fetchOutreachData() {
  const metricsRoot = document.getElementById('outreachMetricsRoot');
  const tableRoot = document.getElementById('outreachCampaignsTableRoot');
  if (!metricsRoot || !tableRoot) return;

  try {
    outreachData = await api.get('/outreach/campaigns');
    const m = outreachData.metrics;

    metricsRoot.innerHTML = `
      <div class="glass-card" style="padding: 1.25rem; border-top: 4px solid #4F8CFF;">
        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Total Sent (30d)</div>
        <div style="font-size: 1.6rem; font-weight: 800; color: white; margin-top: 0.25rem;">${m.total_sent_30d.toLocaleString()}</div>
      </div>
      <div class="glass-card" style="padding: 1.25rem; border-top: 4px solid var(--primary-color);">
        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Open Rate %</div>
        <div style="font-size: 1.6rem; font-weight: 800; color: var(--primary-color); margin-top: 0.25rem;">${m.open_rate_percent}%</div>
      </div>
      <div class="glass-card" style="padding: 1.25rem; border-top: 4px solid var(--success-color);">
        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Reply Rate %</div>
        <div style="font-size: 1.6rem; font-weight: 800; color: var(--success-color); margin-top: 0.25rem;">${m.reply_rate_percent}%</div>
      </div>
      <div class="glass-card" style="padding: 1.25rem; border-top: 4px solid var(--warning-color);">
        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Meetings Booked</div>
        <div style="font-size: 1.6rem; font-weight: 800; color: var(--warning-color); margin-top: 0.25rem;">${m.meetings_booked}</div>
      </div>
    `;

    tableRoot.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.3);">
            <th style="padding: 0.85rem 1rem;">Campaign Name</th>
            <th style="padding: 0.85rem 1rem;">Channel</th>
            <th style="padding: 0.85rem 1rem;">Tone</th>
            <th style="padding: 0.85rem 1rem;">Status</th>
            <th style="padding: 0.85rem 1rem;">Sent</th>
            <th style="padding: 0.85rem 1rem;">Open %</th>
            <th style="padding: 0.85rem 1rem;">Reply %</th>
            <th style="padding: 0.85rem 1rem; text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${outreachData.campaigns.map((c: any) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
              <td style="padding: 0.85rem 1rem; font-weight: 700;">${c.name}</td>
              <td style="padding: 0.85rem 1rem;"><span style="padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; background: rgba(79, 140, 255, 0.15); color: #4F8CFF;">${c.channel_type}</span></td>
              <td style="padding: 0.85rem 1rem; color: var(--text-secondary);">${c.tone}</td>
              <td style="padding: 0.85rem 1rem;"><span style="padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; background: ${c.status==='Active'?'rgba(34, 197, 94, 0.15)':'rgba(245, 158, 11, 0.15)'}; color: ${c.status==='Active'?'var(--success-color)':'var(--warning-color)'};">${c.status}</span></td>
              <td style="padding: 0.85rem 1rem;">${c.sent_count.toLocaleString()}</td>
              <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--primary-color);">${c.open_rate}%</td>
              <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--success-color);">${c.reply_rate}%</td>
              <td style="padding: 0.85rem 1rem; text-align: right;">
                <button class="icon-btn" onclick="toggleCampaignStatus('${c.id}', '${c.status==='Active'?'Paused':'Active'}')" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">${c.status==='Active'?'Pause':'Resume'}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err: any) {
    metricsRoot.innerHTML = `<div style="padding: 2rem; color: var(--danger-color);">Failed to load outreach metrics: ${err.message}</div>`;
  }
}

// ─── AI Generator Modal ───────────────────────────────────────────────────────

(window as any).openAIOutreachModal = async () => {
  try {
    const leadsRes = await api.get('/leads?limit=50');
    let leads = (leadsRes && Array.isArray(leadsRes.data)) ? leadsRes.data : (Array.isArray(leadsRes) ? leadsRes : []);

    if (leads.length === 0) {
      leads = [
        { id: 'demo1', company_name: 'Acme Corp', contact_name: 'Jane Doe', priority: 'Hot' },
        { id: 'demo2', company_name: 'TechCorp Apex', contact_name: 'John Smith', priority: 'Warm' },
        { id: 'demo3', company_name: 'Starlight Media', contact_name: 'Sarah Connor', priority: 'Hot' }
      ];
    }

    const modalHtml = `
      <div id="aiOutreachModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 200; display: flex; align-items: center; justify-content: center;">
        <div class="glass-card" style="width: 100%; max-width: 650px; padding: 2rem; border-radius: var(--border-radius-lg);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; font-size: 1.3rem;">Generate AI Outreach Sequence</h3>
            <button class="icon-btn" onclick="document.getElementById('aiOutreachModal').remove()">✕</button>
          </div>

          <form onsubmit="executeAIOutreachGeneration(event)">
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-secondary);">Select Target Lead *</label>
                <select id="aiOutreachLeadId" required style="width: 100%; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px; margin-top: 0.25rem;">
                  ${leads.map((l: any) => `<option value="${l.id}">${l.company_name} — ${l.contact_name} (${l.priority || 'Lead'})</option>`).join('')}
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="font-size: 0.8rem; color: var(--text-secondary);">Outreach Channel</label>
                  <select id="aiOutreachChannel" style="width: 100%; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px; margin-top: 0.25rem;">
                    <option value="Email" selected>📧 Cold Email</option>
                    <option value="LinkedIn">💼 LinkedIn InMail</option>
                    <option value="WhatsApp">💬 WhatsApp Message</option>
                    <option value="Phone Script">📞 Call Script</option>
                    <option value="Voicemail">🎙️ Voicemail Script</option>
                  </select>
                </div>

                <div>
                  <label style="font-size: 0.8rem; color: var(--text-secondary);">Personalization Tone</label>
                  <select id="aiOutreachTone" style="width: 100%; padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px; margin-top: 0.25rem;">
                    <option value="Professional" selected>Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Executive">Executive</option>
                    <option value="Persuasive">Persuasive</option>
                    <option value="Consultative">Consultative</option>
                    <option value="Technical">Technical</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
                <button type="button" class="icon-btn" onclick="document.getElementById('aiOutreachModal').remove()">Cancel</button>
                <button type="submit" class="gradient-btn">✨ Generate Content</button>
              </div>

              <!-- Output Box -->
              <div id="aiOutreachOutputBox" style="display: none; margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 6px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.5rem;" id="aiOutreachSubject"></div>
                <textarea id="aiOutreachBody" style="width: 100%; height: 140px; background: transparent; border: none; color: white; font-family: inherit; font-size: 0.85rem; outline: none; resize: none;"></textarea>
                <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
                  <button type="button" class="icon-btn" onclick="navigator.clipboard.writeText(document.getElementById('aiOutreachBody').innerText); alert('Copied to clipboard!');" style="font-size: 0.75rem;">📋 Copy</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  } catch (err: any) {
    alert(`Failed to load leads for generation: ${err.message}`);
  }
};

(window as any).executeAIOutreachGeneration = async (e: Event) => {
  e.preventDefault();
  const lead_id = (document.getElementById('aiOutreachLeadId') as HTMLSelectElement).value;
  const channel = (document.getElementById('aiOutreachChannel') as HTMLSelectElement).value;
  const tone = (document.getElementById('aiOutreachTone') as HTMLSelectElement).value;

  try {
    const res = await api.post('/outreach/generate', { lead_id, channel, tone });
    const box = document.getElementById('aiOutreachOutputBox');
    const subj = document.getElementById('aiOutreachSubject');
    const body = document.getElementById('aiOutreachBody') as HTMLTextAreaElement;

    if (box && subj && body) {
      box.style.display = 'block';
      subj.innerText = `Subject: ${res.data.subject}`;
      body.value = res.data.body;
    }
  } catch (err: any) {
    alert(`Failed to generate AI outreach: ${err.message}`);
  }
};

(window as any).toggleCampaignStatus = async (id: string, newStatus: string) => {
  try {
    await api.patch(`/outreach/campaigns/${id}`, { status: newStatus });
    fetchOutreachData();
  } catch (err: any) {
    alert(`Failed to update campaign status: ${err.message}`);
  }
};

(window as any).openCreateCampaignModal = () => {
  const modalHtml = `
    <div id="createCampaignModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 200; display: flex; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 450px; padding: 2rem; border-radius: var(--border-radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0;">Create Outreach Campaign</h3>
          <button class="icon-btn" onclick="document.getElementById('createCampaignModal').remove()">✕</button>
        </div>
        <form onsubmit="saveNewCampaign(event)">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="text" id="cName" required placeholder="Campaign Name" style="padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
            <select id="cChannel" style="padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;">
              <option value="Email">Cold Email Sequence</option>
              <option value="LinkedIn">LinkedIn InMail Sequence</option>
              <option value="WhatsApp">WhatsApp Sequence</option>
            </select>
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
              <button type="button" class="icon-btn" onclick="document.getElementById('createCampaignModal').remove()">Cancel</button>
              <button type="submit" class="gradient-btn">Create Campaign</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

(window as any).saveNewCampaign = async (e: Event) => {
  e.preventDefault();
  const name = (document.getElementById('cName') as HTMLInputElement).value;
  const channel_type = (document.getElementById('cChannel') as HTMLSelectElement).value;

  try {
    await api.post('/outreach/campaigns', { name, channel_type });
    document.getElementById('createCampaignModal')?.remove();
    fetchOutreachData();
  } catch (err: any) {
    alert(`Failed to create campaign: ${err.message}`);
  }
};
