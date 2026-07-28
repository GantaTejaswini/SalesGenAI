import { router } from '../router';
import { api, showToast } from '../api';
import { createLayout } from '../components/layout';

export async function renderLeadDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const leadId = urlParams.get('id');

  if (!leadId) {
    router.navigate('/leads');
    return;
  }

  // Initial loading view
  const loadingLayout = createLayout('/leads', `
    <div style="text-align: center; padding: 5rem; color: var(--text-secondary);">
      <div style="font-size: 2rem; margin-bottom: 1rem;">🤖</div>
      Loading Lead CRM Profile & Intelligence...
    </div>
  `);
  router.mount(loadingLayout);

  try {
    const lead = await api.get(`/leads/${leadId}`);
    renderProfilePage(lead);
  } catch (err: any) {
    showToast(`Failed to load lead profile: ${err.message}`, 'error');
    router.navigate('/leads');
  }
}

function renderProfilePage(lead: any) {
  // Parse JSON AI fields if needed
  let companyAnalysis: any = null;
  let leadScoreDetails: any = null;
  let outreachEmail: any = null;

  try { if (lead.ai_company_analysis) companyAnalysis = typeof lead.ai_company_analysis === 'string' ? JSON.parse(lead.ai_company_analysis) : lead.ai_company_analysis; } catch (e) {}
  try { if (lead.ai_lead_score_details) leadScoreDetails = typeof lead.ai_lead_score_details === 'string' ? JSON.parse(lead.ai_lead_score_details) : lead.ai_lead_score_details; } catch (e) {}
  try { if (lead.ai_outreach_email) outreachEmail = typeof lead.ai_outreach_email === 'string' ? JSON.parse(lead.ai_outreach_email) : lead.ai_outreach_email; } catch (e) {}

  const profileHtml = `
    <!-- Top Nav Header -->
    <div style="margin-bottom: 1.5rem;">
      <button onclick="navigate('/leads')" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.875rem; margin-bottom: 0.75rem;">
        &larr; Back to Leads Directory
      </button>

      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
            <h1 style="font-size: 2rem; font-weight: 800; color: white;">${lead.company_name}</h1>
            <span class="badge badge-${(lead.priority || 'Cold').toLowerCase()}">${lead.priority} Priority</span>
            <span class="badge badge-${(lead.lead_status || 'New').toLowerCase().replace(' ', '')}">${lead.lead_status}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">
            👤 ${lead.contact_name} • ${lead.job_title || 'Decision Maker'} • ✉️ ${lead.email} • 📞 ${lead.phone || 'N/A'}
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="icon-btn" onclick="openScheduleMeetingModal('${lead.id}')">📅 Schedule Meeting</button>
          <button class="icon-btn" onclick="openAddTaskModal('${lead.id}')">+ Create Task</button>
          <button id="runAIBtn" class="gradient-btn" onclick="runAIPipeline('${lead.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Run AI Intelligence
          </button>
        </div>
      </div>
    </div>

    <!-- Pipeline Stage Progress Bar -->
    <div class="glass-card" style="padding: 1rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; gap: 0.5rem; overflow-x: auto;">
        ${['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'].map(stage => {
          const isCurrent = lead.lead_status === stage;
          return `
            <div style="flex: 1; min-width: 100px; text-align: center; padding: 0.5rem; border-radius: var(--border-radius-sm); font-size: 0.8rem; font-weight: 700; background: ${isCurrent ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.03)'}; color: ${isCurrent ? 'white' : 'var(--text-muted)'}; border: 1px solid ${isCurrent ? 'var(--primary-color)' : 'var(--border-color)'};">
              ${stage}
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Profile Tabs -->
    <div class="tab-list">
      <button class="tab-btn active" onclick="switchProfileTab('overview', this)">Overview</button>
      <button class="tab-btn" onclick="switchProfileTab('ai-intelligence', this)">🤖 AI Intelligence</button>
      <button class="tab-btn" onclick="switchProfileTab('activity', this)">Timeline & History</button>
      <button class="tab-btn" onclick="switchProfileTab('notes', this)">Notes (${(lead.notes || []).length})</button>
      <button class="tab-btn" onclick="switchProfileTab('meetings-tasks', this)">Meetings & Tasks</button>
      <button class="tab-btn" onclick="switchProfileTab('files', this)">Files & Documents (${(lead.attachments || []).length})</button>
      <button class="tab-btn" onclick="switchProfileTab('emails', this)">Emails</button>
      <button class="tab-btn" onclick="switchProfileTab('audit', this)">Audit Logs</button>
    </div>

    <!-- Tab 1: Overview -->
    <div id="tab-overview" class="profile-tab-content">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        
        <!-- Left: Key Details -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="glass-card">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: white;">Executive Lead Summary</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Estimated Deal Value</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--success-color);">$${(lead.estimated_deal_value || 0).toLocaleString()}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">AI Lead Quality Score</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-color);">${lead.score || 0}/100</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Industry</div>
                <div style="font-weight: 600; color: white;">${lead.industry || 'N/A'}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Company Size / Revenue</div>
                <div style="font-weight: 600; color: white;">${lead.company_size || '50-200'} • ${lead.annual_revenue || '$10M+'}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Website</div>
                <div style="font-weight: 600;"><a href="${lead.website || '#'}" target="_blank" style="color: var(--accent-color);">${lead.website || 'N/A'}</a></div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Owner</div>
                <div style="font-weight: 600; color: white;">${lead.owner_name || 'Unassigned'}</div>
              </div>
            </div>
          </div>

          <!-- AI Next Best Action Alert -->
          <div style="background: rgba(0, 201, 167, 0.1); border: 1px solid var(--primary-color); border-radius: var(--border-radius-md); padding: 1.25rem;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-color); text-transform: uppercase; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
              ⚡ AI Next Best Action
            </div>
            <div style="font-size: 0.95rem; color: white; line-height: 1.5;">
              ${lead.next_best_action || 'Run AI Intelligence to compute recommended action.'}
            </div>
          </div>

          <!-- Related Leads -->
          <div class="glass-card">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem; color: white;">Related Leads (${(lead.related_leads || []).length})</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${(lead.related_leads || []).map((rl: any) => `
                <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border-radius: var(--border-radius-sm); display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="navigate('/lead?id=${rl.id}')">
                  <div>
                    <div style="font-weight: 600; color: white;">${rl.company_name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${rl.lead_status} • Score: ${rl.score}/100</div>
                  </div>
                  <div style="font-weight: 700; color: var(--success-color);">$${(rl.estimated_deal_value || 0).toLocaleString()}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Recent Activity -->
        <div class="glass-card">
          <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem; color: white;">Recent Activity Feed</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${(lead.activity_timeline || []).slice(0, 8).map((act: any) => `
              <div style="padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.85rem; font-weight: 600; color: white;">${act.description}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${act.user_name} • ${new Date(act.created_at).toLocaleString()}</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>

    <!-- Tab 2: AI Intelligence -->
    <div id="tab-ai-intelligence" class="profile-tab-content" style="display: none;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        
        <div class="glass-card">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: white;">🎯 Lead Score & Factors</h3>
          <div style="display: flex; gap: 2rem; margin-bottom: 1rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">SCORE</div>
              <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary-color);">${lead.score}/100</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">CONVERSION PROBABILITY</div>
              <div style="font-size: 2.5rem; font-weight: 800; color: var(--success-color);">${Math.round((lead.conversion_probability || 0.85) * 100)}%</div>
            </div>
          </div>
          <div style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary); background: rgba(0,0,0,0.3); padding: 1rem; border-radius: var(--border-radius-sm);">
            ${leadScoreDetails?.scoring_factors || 'High score based on revenue potential, company size, and key decision-maker title.'}
          </div>
        </div>

        <div class="glass-card">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: white;">🏢 Company Analysis & Business Needs</h3>
          <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
            <p style="margin-bottom: 0.75rem;"><strong style="color: white;">Business Needs:</strong> ${companyAnalysis?.business_needs || lead.pain_points || 'Automated CRM intelligence and workflow optimization.'}</p>
            <p style="margin-bottom: 0.75rem;"><strong style="color: white;">Buying Intent:</strong> ${lead.buying_intent || 'High intent'}</p>
            <p><strong style="color: white;">Risk Score:</strong> ${lead.risk_score || 'Low Risk'}</p>
          </div>
        </div>

        <div class="glass-card" style="grid-column: span 2;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: white;">💡 Strategic Intelligence Overview</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--border-radius-sm);">
              <div style="font-weight: 700; color: var(--primary-color); font-size: 0.85rem; margin-bottom: 0.4rem;">DECISION MAKERS</div>
              <div style="font-size: 0.9rem; color: white;">${lead.decision_makers || 'VP of Sales, CTO'}</div>
            </div>
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--border-radius-sm);">
              <div style="font-weight: 700; color: var(--primary-color); font-size: 0.85rem; margin-bottom: 0.4rem;">TECH STACK</div>
              <div style="font-size: 0.9rem; color: white;">${lead.technology_stack || 'Salesforce, HubSpot, Apollo'}</div>
            </div>
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--border-radius-sm);">
              <div style="font-weight: 700; color: var(--primary-color); font-size: 0.85rem; margin-bottom: 0.4rem;">COMPETITOR ANALYSIS</div>
              <div style="font-size: 0.9rem; color: white;">${lead.competitor_analysis || 'Legacy solutions'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Tab 3: Timeline & History -->
    <div id="tab-activity" class="profile-tab-content" style="display: none;">
      <div class="glass-card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: white;">Complete Field Change History</h3>
        <table class="crm-table">
          <thead>
            <tr>
              <th>FIELD CHANGED</th>
              <th>OLD VALUE</th>
              <th>NEW VALUE</th>
              <th>USER</th>
              <th>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            ${(lead.history || []).map((h: any) => `
              <tr>
                <td style="font-weight: 700; color: white;">${h.field_changed}</td>
                <td style="color: var(--text-muted);">${h.old_value || '—'}</td>
                <td style="color: var(--primary-color); font-weight: 600;">${h.new_value || '—'}</td>
                <td>${h.user_name}</td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${new Date(h.changed_at).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 4: Notes -->
    <div id="tab-notes" class="profile-tab-content" style="display: none;">
      <div class="glass-card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: white;">Add Note</h3>
        <textarea id="newNoteInput" class="form-textarea" rows="3" placeholder="Add meeting notes, call summaries, use @mentions or #tags..."></textarea>
        <div style="display: flex; justify-content: flex-end; margin-top: 0.75rem;">
          <button class="gradient-btn" onclick="saveLeadNote('${lead.id}')">Save Note</button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${(lead.notes || []).map((note: any) => `
          <div class="glass-card">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; color: white;">${note.user_name}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(note.created_at).toLocaleString()}</span>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-secondary); white-space: pre-wrap;">${note.content}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Tab 5: Meetings & Tasks -->
    <div id="tab-meetings-tasks" class="profile-tab-content" style="display: none;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        
        <!-- Meetings -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: white;">Meetings (${(lead.meetings || []).length})</h3>
            <button class="icon-btn" onclick="openScheduleMeetingModal('${lead.id}')">+ Meeting</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${(lead.meetings || []).map((m: any) => `
              <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--border-radius-sm);">
                <div style="font-weight: 700; color: white;">${m.title}</div>
                <div style="font-size: 0.8rem; color: var(--primary-color);">${new Date(m.start_time).toLocaleString()}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.4rem;">Status: ${m.status}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tasks -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: white;">Tasks (${(lead.tasks || []).length})</h3>
            <button class="icon-btn" onclick="openAddTaskModal('${lead.id}')">+ Task</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${(lead.tasks || []).map((t: any) => `
              <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--border-radius-sm); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-weight: 700; color: white; text-decoration: ${t.is_completed ? 'line-through' : 'none'}">${t.title}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Due: ${t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date'}</div>
                </div>
                <button class="icon-btn" onclick="toggleTaskComplete('${t.id}')">${t.is_completed ? '✓ Done' : 'Complete'}</button>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>

    <!-- Tab 6: Files -->
    <div id="tab-files" class="profile-tab-content" style="display: none;">
      <div class="glass-card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: white;">Upload Documents & Attachments</h3>
        <input type="file" id="fileUploadInput" class="form-input" style="margin-bottom: 1rem;" />
        <button class="gradient-btn" onclick="uploadLeadFile('${lead.id}')">Upload File</button>
      </div>

      <div class="glass-card">
        <table class="crm-table">
          <thead>
            <tr>
              <th>FILE NAME</th>
              <th>SIZE</th>
              <th>TYPE</th>
              <th>UPLOADED BY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${(lead.attachments || []).map((att: any) => `
              <tr>
                <td style="font-weight: 700; color: white;">${att.file_name}</td>
                <td>${(att.file_size / 1024).toFixed(1)} KB</td>
                <td>${att.file_type}</td>
                <td>${att.user_name}</td>
                <td>
                  <a href="${att.file_url}" target="_blank" class="icon-btn" style="text-decoration: none;">Download</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 7: Emails -->
    <div id="tab-emails" class="profile-tab-content" style="display: none;">
      <div class="glass-card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: white;">Generated Outreach Email</h3>
        ${outreachEmail ? `
          <div style="background: rgba(0,0,0,0.3); padding: 1.25rem; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: white; font-size: 1rem; margin-bottom: 0.5rem;">Subject: ${outreachEmail.subject}</div>
            <div style="font-size: 0.9rem; color: var(--text-secondary); white-space: pre-wrap; line-height: 1.6;">${outreachEmail.body}</div>
            <div style="margin-top: 1rem;">
              <button class="gradient-btn" onclick="navigator.clipboard.writeText(\`${outreachEmail.subject}\\n\\n${outreachEmail.body}\`); showToast('Copied to clipboard!', 'success');">Copy Outreach Email</button>
            </div>
          </div>
        ` : `<p style="color: var(--text-muted);">Run AI Intelligence to generate personalized cold outreach email.</p>`}
      </div>
    </div>

    <!-- Tab 8: Audit Logs -->
    <div id="tab-audit" class="profile-tab-content" style="display: none;">
      <div class="glass-card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: white;">Security & System Audit Logs</h3>
        <table class="crm-table">
          <thead>
            <tr>
              <th>ACTION</th>
              <th>ENTITY</th>
              <th>CHANGES</th>
              <th>USER</th>
              <th>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            ${(lead.audit_logs || []).map((a: any) => `
              <tr>
                <td style="font-weight: 700; color: var(--primary-color);">${a.action}</td>
                <td>${a.entity_type}</td>
                <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis;">${a.changes || '—'}</td>
                <td>${a.user_name}</td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${new Date(a.created_at).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  router.mount(createLayout('/leads', profileHtml));
}

// Tab switcher handler
(window as any).switchProfileTab = (tabId: string, btn: HTMLElement) => {
  document.querySelectorAll('.profile-tab-content').forEach(el => (el as HTMLElement).style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.style.display = 'block';
  btn.classList.add('active');
};

// AI Pipeline trigger
(window as any).runAIPipeline = async (leadId: string) => {
  const btn = document.getElementById('runAIBtn');
  if (btn) btn.innerHTML = 'Running...';
  try {
    await api.post(`/leads/${leadId}/ai/run`, {});
    showToast('AI Intelligence generated!', 'success');
    renderLeadDetails();
  } catch (err: any) {
    showToast(`AI execution failed: ${err.message}`, 'error');
  } finally {
    if (btn) btn.innerHTML = 'Run AI Intelligence';
  }
};

// Note saver
(window as any).saveLeadNote = async (leadId: string) => {
  const input = document.getElementById('newNoteInput') as HTMLTextAreaElement;
  if (!input || !input.value.trim()) return;

  try {
    await api.post(`/leads/${leadId}/notes`, { content: input.value.trim() });
    showToast('Note added successfully!', 'success');
    renderLeadDetails();
  } catch (err: any) {
    showToast(`Failed to add note: ${err.message}`, 'error');
  }
};

// Task complete toggle
(window as any).toggleTaskComplete = async (taskId: string) => {
  try {
    await api.patch(`/leads/tasks/${taskId}/toggle`, {});
    showToast('Task toggled!', 'success');
    renderLeadDetails();
  } catch (err: any) {
    showToast(`Task toggle failed: ${err.message}`, 'error');
  }
};

// File Uploader
(window as any).uploadLeadFile = async (leadId: string) => {
  const fileInput = document.getElementById('fileUploadInput') as HTMLInputElement;
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showToast('Select a file to upload', 'warning');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    await api.postMultiPart(`/leads/${leadId}/attachments`, formData);
    showToast('File uploaded successfully!', 'success');
    renderLeadDetails();
  } catch (err: any) {
    showToast(`Upload failed: ${err.message}`, 'error');
  }
};

// Schedule Meeting Modal
(window as any).openScheduleMeetingModal = (leadId: string) => {
  const title = prompt('Enter Meeting Title:', 'Discovery & Product Demo');
  if (!title) return;
  api.post(`/leads/${leadId}/meetings`, {
    title,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
    status: 'Scheduled'
  }).then(() => {
    showToast('Meeting scheduled!', 'success');
    renderLeadDetails();
  }).catch((err: any) => showToast(err.message, 'error'));
};

// Add Task Modal
(window as any).openAddTaskModal = (leadId: string) => {
  const title = prompt('Enter Task Title:', 'Follow up call with decision maker');
  if (!title) return;
  api.post(`/leads/${leadId}/tasks`, {
    title,
    priority: 'High',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString()
  }).then(() => {
    showToast('Task created!', 'success');
    renderLeadDetails();
  }).catch((err: any) => showToast(err.message, 'error'));
};
