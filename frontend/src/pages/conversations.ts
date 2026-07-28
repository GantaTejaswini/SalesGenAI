import { router } from '../router';
import { api, showToast } from '../api';
import { createLayout } from '../components/layout';

let conversationsList: any[] = [];
let selectedConv: any = null;

export function renderConversations() {
  const contentHtml = `
    <div style="display: flex; height: calc(100vh - 120px); background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); overflow: hidden;">
      
      <!-- Inbox Sidebar -->
      <div style="width: 320px; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; background: rgba(255,255,255,0.02);">
        <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700;">AI Inbox</h2>
            <button class="gradient-btn" onclick="openSubmitTranscriptModal()" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">+ Analyze Call</button>
          </div>
          <div style="position: relative;">
            <input type="text" placeholder="Search conversations..." oninput="handleConvSearch(this.value)" style="width: 100%; padding: 0.5rem 1rem 0.5rem 2.5rem; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); color: white; outline: none; font-size: 0.8rem; box-sizing: border-box;">
            <svg style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary);" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
        
        <div style="flex: 1; overflow-y: auto;" id="convListRoot">
          <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Loading conversations...</div>
        </div>
      </div>

      <!-- Center Thread View -->
      <div style="flex: 1; display: flex; flex-direction: column; border-right: 1px solid var(--border-color);" id="convThreadRoot">
        <div style="padding: 4rem; text-align: center; color: var(--text-secondary);">Select a conversation from the left inbox.</div>
      </div>

      <!-- Right Panel: AI Intelligence & Deal Risk -->
      <div style="width: 340px; background: rgba(0,0,0,0.3); padding: 1.5rem; overflow-y: auto;" id="convIntelligenceRoot">
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">AI Intelligence Panel</div>
      </div>

    </div>
  `;

  router.mount(createLayout('/conversations', contentHtml));
  fetchConversationsData();
}

async function fetchConversationsData() {
  const listRoot = document.getElementById('convListRoot');
  if (!listRoot) return;

  try {
    conversationsList = await api.get('/conversations');

    if (conversationsList.length === 0) {
      listRoot.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No conversations found.</div>`;
      return;
    }

    if (!selectedConv && conversationsList.length > 0) {
      selectedConv = conversationsList[0];
    }

    renderInboxList(listRoot);
    renderSelectedThread();
    renderIntelligencePanel();
  } catch (err: any) {
    listRoot.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--danger-color);">Failed to load conversations: ${err.message}</div>`;
  }
}

function renderInboxList(root: HTMLElement) {
  root.innerHTML = conversationsList.map(c => {
    const isSelected = selectedConv && selectedConv.id === c.id;
    return `
      <div onclick="selectConversation('${c.id}')" style="padding: 1rem; border-bottom: 1px solid var(--border-color); border-left: 3px solid ${isSelected ? 'var(--primary-color)' : 'transparent'}; background: ${isSelected ? 'rgba(255,255,255,0.05)' : 'transparent'}; cursor: pointer;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <div style="font-weight: 700; font-size: 0.9rem; color: white;">${c.contact_name}</div>
          <span style="font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700; background: ${c.deal_risk==='Low'?'rgba(34, 197, 94, 0.15)':'rgba(245, 158, 11, 0.15)'}; color: ${c.deal_risk==='Low'?'var(--success-color)':'var(--warning-color)'};">${c.deal_risk} Risk</span>
        </div>
        <div style="font-size: 0.8rem; font-weight: 600; color: #38bdf8; margin-bottom: 0.25rem;">${c.title}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.summary}</div>
      </div>
    `;
  }).join('');
}

function renderSelectedThread() {
  const root = document.getElementById('convThreadRoot');
  if (!root || !selectedConv) return;

  const c = selectedConv;
  root.innerHTML = `
    <!-- Thread Header -->
    <div style="padding: 1.25rem 2rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #1e293b, #0f172a); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; border: 1px solid var(--border-color); color: #38bdf8;">
          ${c.contact_name.charAt(0)}
        </div>
        <div>
          <div style="font-weight: 700; font-size: 1.05rem; color: white;">${c.contact_name}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${c.contact_email} • Source: ${c.source_type}</div>
        </div>
      </div>
      <button id="generateAiReplyBtn" class="gradient-btn" onclick="generateAIDraftResponse('${c.id}')" style="font-size: 0.8rem; padding: 0.4rem 0.85rem; min-width: 150px;">✨ Generate AI Reply</button>
    </div>
    
    <!-- Thread Body -->
    <div style="flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 600;">TRANSCRIPT SUMMARY</div>
        <div style="font-size: 0.95rem; line-height: 1.6; color: white; white-space: pre-wrap;">${c.summary}</div>
      </div>
    </div>

    <!-- Reply Box -->
    <div style="padding: 1.5rem; border-top: 1px solid var(--border-color); background: var(--bg-color);">
      <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius-md); background: var(--card-bg); overflow: hidden;">
        <textarea id="convReplyTextArea" placeholder="Reply to ${c.contact_name}..." style="width: 100%; height: 90px; padding: 1rem; background: transparent; border: none; color: white; outline: none; resize: none; font-family: inherit; font-size: 0.85rem; box-sizing: border-box;"></textarea>
        <div style="padding: 0.75rem 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
          <button id="sendMsgBtn" class="gradient-btn" onclick="simulateSendMessage()" style="padding: 0.4rem 1.2rem; font-size: 0.8rem; min-width: 120px;">Send Message</button>
        </div>
      </div>
    </div>
  `;
}

function renderIntelligencePanel() {
  const root = document.getElementById('convIntelligenceRoot');
  if (!root || !selectedConv) return;

  const c = selectedConv;
  root.innerHTML = `
    <h3 style="margin-top: 0; font-size: 1.1rem; font-weight: 700;">AI Conversation Intelligence</h3>

    <!-- Sentiment Badge -->
    <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
      <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Tone & Sentiment</div>
      <div style="font-size: 1.1rem; font-weight: 800; color: ${c.sentiment==='Positive'?'var(--success-color)':'var(--warning-color)'}; margin-top: 0.25rem;">
        ${c.sentiment === 'Positive' ? '😊 Positive Sentiment' : '😐 Neutral Sentiment'}
      </div>
      <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">AI Confidence: ${(c.confidence_score * 100).toFixed(0)}%</div>
    </div>

    <!-- Deal Risk Assessment -->
    <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
      <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Deal Risk Assessment</div>
      <div style="font-size: 1.1rem; font-weight: 800; color: ${c.deal_risk==='Low'?'var(--success-color)':'var(--warning-color)'}; margin-top: 0.25rem;">
        ${c.deal_risk} Risk
      </div>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.4;">${c.deal_risk_reasoning || 'No major deal risks detected.'}</p>
    </div>

    <!-- Discussion Points -->
    <div style="margin-bottom: 1.5rem;">
      <strong style="font-size: 0.85rem; color: white;">Discussion Points:</strong>
      <ul style="padding-left: 1.2rem; font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.4rem; line-height: 1.5;">
        ${(c.key_discussion_points || []).map((pt: string) => `<li>${pt}</li>`).join('')}
      </ul>
    </div>

    <!-- Action Items -->
    <div>
      <strong style="font-size: 0.85rem; color: white;">Agreed Action Items:</strong>
      <ul style="padding-left: 1.2rem; font-size: 0.8rem; color: var(--success-color); margin-top: 0.4rem; line-height: 1.5;">
        ${(c.action_items || []).map((item: string) => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `;
}

// ─── Handlers & Modals ────────────────────────────────────────────────────────

(window as any).selectConversation = (id: string) => {
  selectedConv = conversationsList.find(c => c.id === id) || null;
  const listRoot = document.getElementById('convListRoot');
  if (listRoot) renderInboxList(listRoot);
  renderSelectedThread();
  renderIntelligencePanel();
};

(window as any).handleConvSearch = (query: string) => {
  if (!query) {
    fetchConversationsData();
    return;
  }
  conversationsList = conversationsList.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.contact_name.toLowerCase().includes(query.toLowerCase())
  );
  const listRoot = document.getElementById('convListRoot');
  if (listRoot) renderInboxList(listRoot);
};

(window as any).simulateSendMessage = () => {
  const btn = document.getElementById('sendMsgBtn') as HTMLButtonElement;
  const area = document.getElementById('convReplyTextArea') as HTMLTextAreaElement;
  if (!area || !area.value.trim()) {
    showToast('Please enter a message to send', 'warning');
    return;
  }
  
  btn.innerText = 'Sending...';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    showToast('Message queued for delivery successfully!', 'success');
    area.value = '';
    btn.innerText = 'Send Message';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  }, 1200);
};

(window as any).generateAIDraftResponse = async (id: string) => {
  const btn = document.getElementById('generateAiReplyBtn') as HTMLButtonElement;
  if (btn) {
    btn.innerText = '✨ Generating...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
  }
  try {
    const res = await api.post(`/conversations/${id}/generate-draft`);
    const area = document.getElementById('convReplyTextArea') as HTMLTextAreaElement;
    if (area) area.value = res.draft;
    showToast('AI Draft generated successfully!', 'success');
  } catch (err: any) {
    showToast(`Failed to generate draft: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.innerText = '✨ Generate AI Reply';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  }
};

(window as any).openSubmitTranscriptModal = () => {
  const modalHtml = `
    <div id="submitTranscriptModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 200; display: flex; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 550px; padding: 2rem; border-radius: var(--border-radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0;">Analyze Meeting Transcript</h3>
          <button class="icon-btn" onclick="document.getElementById('submitTranscriptModal').remove()">✕</button>
        </div>
        <form onsubmit="executeTranscriptAnalysis(event)">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="text" id="trTitle" required placeholder="Meeting Title (e.g. Acme Corp Sales Call)" style="padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <input type="text" id="trContact" placeholder="Contact Name" style="padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
              <input type="email" id="trEmail" placeholder="Contact Email" style="padding: 0.6rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px;" />
            </div>

            <textarea id="trText" required placeholder="Paste call transcript or meeting notes text here..." style="width: 100%; height: 140px; padding: 0.75rem; background: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px; font-family: inherit; font-size: 0.85rem; outline: none; resize: none;"></textarea>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
              <button type="button" class="icon-btn" onclick="document.getElementById('submitTranscriptModal').remove()">Cancel</button>
              <button type="submit" id="analyzeSubmitBtn" class="gradient-btn" style="min-width: 180px;">✨ Analyze Transcript</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

(window as any).executeTranscriptAnalysis = async (e: Event) => {
  e.preventDefault();
  const btn = document.getElementById('analyzeSubmitBtn') as HTMLButtonElement;
  if (btn) {
    btn.innerText = '✨ Analyzing...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
  }

  const title = (document.getElementById('trTitle') as HTMLInputElement).value;
  const contact_name = (document.getElementById('trContact') as HTMLInputElement).value;
  const contact_email = (document.getElementById('trEmail') as HTMLInputElement).value;
  const raw_text = (document.getElementById('trText') as HTMLTextAreaElement).value;

  try {
    const res = await api.post('/conversations/analyze', { title, contact_name, contact_email, raw_text });
    document.getElementById('submitTranscriptModal')?.remove();
    showToast('Transcript analyzed successfully!', 'success');
    
    // Refresh data and auto-select the new conversation
    const newConvList = await api.get('/conversations');
    conversationsList = newConvList;
    if (res.data && res.data.id) {
      selectedConv = conversationsList.find((c: any) => c.id === res.data.id) || conversationsList[0];
    }
    const listRoot = document.getElementById('convListRoot');
    if (listRoot) renderInboxList(listRoot);
    renderSelectedThread();
    renderIntelligencePanel();
  } catch (err: any) {
    showToast(`Failed to analyze transcript: ${err.message}`, 'error');
    if (btn) {
      btn.innerText = '✨ Analyze Transcript';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  }
};
