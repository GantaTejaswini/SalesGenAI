import { router } from '../router';
import { createLayout } from '../components/layout';
import * as api from '../api';

export function renderSettings() {
  (window as any).switchTab = function(tabName: string) {
      ['org', 'profile', 'team', 'security', 'notifications', 'api', 'billing'].forEach(id => {
          const el = document.getElementById('tab-' + id);
          if (el) el.style.display = 'none';
          const btn = document.getElementById('btn-' + id);
          if (btn) {
              btn.style.background = 'transparent';
              btn.style.color = 'var(--text-secondary)';
              btn.style.borderLeft = 'none';
          }
      });
      const selected = document.getElementById('tab-' + tabName);
      if (selected) selected.style.display = 'block';
      
      const activeBtn = document.getElementById('btn-' + tabName);
      if (activeBtn) {
          activeBtn.style.background = 'var(--card-bg)';
          activeBtn.style.color = 'white';
          activeBtn.style.borderLeft = '3px solid var(--primary-color)';
      }

      // Load data dynamically based on tab
      if (tabName === 'profile') loadProfile();
      if (tabName === 'org') loadOrganization();
      if (tabName === 'team') loadTeam();
      if (tabName === 'security') loadSecurity();
      if (tabName === 'notifications') loadPreferences();
      if (tabName === 'api') loadApiKeys();
  };

  const content = `
    <div style="max-width: 1000px; margin: 0 auto;">
        
        <div style="margin-bottom: 2rem;">
            <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;">Settings</h1>
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Manage your organization, team, security, and preferences.</p>
        </div>

        <div style="display: flex; gap: 2rem;">
            
            <!-- Settings Sidebar -->
            <div style="width: 220px; display: flex; flex-direction: column; gap: 0.25rem; flex-shrink: 0;" id="settingsSidebar">
                <div id="btn-profile" onclick="window.switchTab('profile')" style="padding: 0.6rem 1rem; border-radius: var(--border-radius-sm); font-size: 0.9rem; font-weight: 500; cursor: pointer; background: var(--card-bg); color: white; border-left: 3px solid var(--primary-color);">My Profile</div>
                <div id="btn-org" onclick="window.switchTab('org')" style="padding: 0.6rem 1rem; border-radius: var(--border-radius-sm); font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--text-secondary); transition: background 0.2s;">Organization</div>
                <div id="btn-team" onclick="window.switchTab('team')" style="padding: 0.6rem 1rem; border-radius: var(--border-radius-sm); font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--text-secondary); transition: background 0.2s;">Team Members</div>
                <div id="btn-security" onclick="window.switchTab('security')" style="padding: 0.6rem 1rem; border-radius: var(--border-radius-sm); font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--text-secondary); transition: background 0.2s;">Security</div>
                <div id="btn-notifications" onclick="window.switchTab('notifications')" style="padding: 0.6rem 1rem; border-radius: var(--border-radius-sm); font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--text-secondary); transition: background 0.2s;">Notifications</div>
                <div id="btn-api" onclick="window.switchTab('api')" style="padding: 0.6rem 1rem; border-radius: var(--border-radius-sm); font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--text-secondary); transition: background 0.2s;">API Keys</div>
                <div id="btn-billing" onclick="window.switchTab('billing')" style="padding: 0.6rem 1rem; border-radius: var(--border-radius-sm); font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--text-secondary); transition: background 0.2s;">Billing</div>
            </div>

            <!-- Settings Content Container -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 2rem;">
                
                <!-- TAB: PROFILE -->
                <div id="tab-profile" style="display: block;">
                    <div class="glass-card" style="padding: 2rem;">
                        <h3 style="margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">Personal Profile</h3>
                        
                        <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
                            <div id="profileAvatarContainer" style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                <img id="profileAvatar" src="https://ui-avatars.com/api/?name=User" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div style="display: flex; flex-direction: column; justify-content: center; gap: 0.5rem;">
                                <input type="file" id="avatarUpload" accept="image/png, image/jpeg, image/gif" style="display: none;" onchange="(window as any).handleAvatarUpload(this)">
                                <div style="display: flex; gap: 1rem;">
                                    <button onclick="document.getElementById('avatarUpload').click()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.4rem 1rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">Upload Photo</button>
                                    <button onclick="(window as any).removeAvatar()" style="background: transparent; border: 1px solid var(--border-color); color: var(--danger-color); padding: 0.4rem 1rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">Remove</button>
                                </div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">JPG, GIF or PNG. Max size 2MB.</div>
                            </div>
                        </div>

                        <form id="profileForm" onsubmit="(window as any).saveProfile(event)" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <label class="settings-label">Full Name</label>
                                <input type="text" id="profFullName" class="settings-input" required>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <label class="settings-label">Phone Number</label>
                                <input type="text" id="profPhone" class="settings-input">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <label class="settings-label">Job Title</label>
                                <input type="text" id="profTitle" class="settings-input">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <label class="settings-label">Department</label>
                                <input type="text" id="profDept" class="settings-input">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <label class="settings-label">Time Zone</label>
                                <select id="profTimezone" class="settings-input">
                                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                                    <option value="EST">EST (Eastern Standard Time)</option>
                                    <option value="PST">PST (Pacific Standard Time)</option>
                                    <option value="IST">IST (Indian Standard Time)</option>
                                </select>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <label class="settings-label">Language</label>
                                <select id="profLang" class="settings-input">
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                </select>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem; grid-column: span 2;">
                                <label class="settings-label">Biography</label>
                                <textarea id="profBio" class="settings-input" style="min-height: 80px; resize: vertical;"></textarea>
                            </div>
                            <div style="grid-column: span 2; display: flex; justify-content: flex-end; margin-top: 1rem;">
                                <button type="submit" class="gradient-btn" style="padding: 0.6rem 1.5rem;" id="profSaveBtn">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- TAB: ORGANIZATION -->
                <div id="tab-org" style="display: none;">
                    <div class="glass-card" style="padding: 2rem;">
                        <h3 style="margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">Organization Profile</h3>
                        <form id="orgForm" onsubmit="(window as any).saveOrganization(event)" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <div style="display: flex; flex-direction: column; gap: 0.5rem; grid-column: span 2;">
                                <label class="settings-label">Organization Name</label>
                                <input type="text" id="orgName" class="settings-input" required>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <label class="settings-label">Industry</label>
                                <input type="text" id="orgIndustry" class="settings-input">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <label class="settings-label">Website</label>
                                <input type="url" id="orgWebsite" class="settings-input">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem; grid-column: span 2;">
                                <label class="settings-label">Address</label>
                                <textarea id="orgAddress" class="settings-input" style="min-height: 60px;"></textarea>
                            </div>
                            <div style="grid-column: span 2; display: flex; justify-content: flex-end; margin-top: 1rem;">
                                <button type="submit" class="gradient-btn" style="padding: 0.6rem 1.5rem;" id="orgSaveBtn">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- TAB: SECURITY -->
                <div id="tab-security" style="display: none;">
                    
                    <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem;">
                        <h3 style="margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">Change Password</h3>
                        <form id="passwordForm" onsubmit="(window as any).savePassword(event)" style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
                            <input type="password" id="currentPwd" placeholder="Current Password" required class="settings-input">
                            <input type="password" id="newPwd" placeholder="New Password" required minlength="6" class="settings-input">
                            <input type="password" id="confirmPwd" placeholder="Confirm New Password" required minlength="6" class="settings-input">
                            <button type="submit" class="gradient-btn" style="padding: 0.6rem; margin-top: 0.5rem;" id="pwdSaveBtn">Update Password</button>
                        </form>
                    </div>

                    <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600;">Two-Factor Authentication (2FA)</h3>
                                <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Add an extra layer of security to your account.</p>
                            </div>
                            <label class="switch">
                              <input type="checkbox" id="tfaToggle" onchange="(window as any).toggle2FA(this.checked)">
                              <span class="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
                            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Logged-in Devices</h3>
                            <button onclick="(window as any).revokeAllSessions()" style="background: transparent; border: 1px solid var(--border-color); color: var(--danger-color); padding: 0.4rem 1rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">Sign Out All Other Devices</button>
                        </div>
                        <div id="sessionsList" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="padding: 2rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">Loading sessions...</div>
                        </div>
                    </div>
                </div>

                <!-- TAB: TEAM -->
                <div id="tab-team" style="display: none;">
                    <div class="glass-card" style="padding: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                            <div>
                                <h3 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; font-weight: 600;">Team Members</h3>
                                <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Manage who has access to your organization.</p>
                            </div>
                            <button onclick="document.getElementById('inviteModal').style.display='flex'" class="gradient-btn" style="padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.85rem;">+ Invite Member</button>
                        </div>
                        
                        <div id="teamList" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="padding: 2rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">Loading team...</div>
                        </div>
                    </div>
                </div>

                <!-- TAB: NOTIFICATIONS -->
                <div id="tab-notifications" style="display: none;">
                    <div class="glass-card" style="padding: 2rem;">
                        <h3 style="margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">Notification Preferences</h3>
                        <form id="notifForm" onchange="(window as any).savePreferences()" style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                                <input type="checkbox" id="prefEmail" style="width: 18px; height: 18px;">
                                <div>
                                    <div style="font-weight: 500; font-size: 0.95rem;">Email Notifications</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Receive daily summaries and important alerts via email.</div>
                                </div>
                            </label>
                            <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                                <input type="checkbox" id="prefInApp" style="width: 18px; height: 18px;">
                                <div>
                                    <div style="font-weight: 500; font-size: 0.95rem;">In-App Notifications</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Show notification badge for updates while using the app.</div>
                                </div>
                            </label>
                            <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                                <input type="checkbox" id="prefAI" style="width: 18px; height: 18px;">
                                <div>
                                    <div style="font-weight: 500; font-size: 0.95rem;">AI Alerts</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Notify me when AI generates new insights for my leads.</div>
                                </div>
                            </label>
                            <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                                <input type="checkbox" id="prefMarketing" style="width: 18px; height: 18px;">
                                <div>
                                    <div style="font-weight: 500; font-size: 0.95rem;">Marketing & Product Updates</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Receive emails about new features and best practices.</div>
                                </div>
                            </label>
                        </form>
                    </div>
                </div>

                <!-- TAB: API KEYS -->
                <div id="tab-api" style="display: none;">
                    <div class="glass-card" style="padding: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem;">
                            <div>
                                <h3 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; font-weight: 600;">API Access</h3>
                                <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Manage your API keys for integrating SalesGenie AI with your internal tools.</p>
                            </div>
                            <button onclick="(window as any).createApiKey()" class="gradient-btn" style="padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.85rem;">+ Create Key</button>
                        </div>
                        
                        <div id="apiKeysList" style="display: flex; flex-direction: column; gap: 1rem;">
                            <!-- Keys will render here -->
                        </div>
                    </div>
                </div>
                
                <!-- TAB: BILLING -->
                <div id="tab-billing" style="display: none;">
                    <div class="glass-card" style="padding: 2rem;">
                        <h3 style="margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">Billing & Plans</h3>
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(124, 58, 237, 0.1); border: 1px solid var(--secondary-color); padding: 1.5rem; border-radius: var(--border-radius-md); margin-bottom: 2rem;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                    <h4 style="margin: 0; font-size: 1.2rem;">Enterprise Plan</h4>
                                    <span style="background: var(--secondary-color); color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">Active</span>
                                </div>
                                <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Managed via external provider.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Invite Modal -->
    <div id="inviteModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 200; align-items: center; justify-content: center;">
        <div class="glass-card" style="width: 100%; max-width: 450px; background: var(--sidebar-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0;">Invite Team Member</h3>
                <button onclick="document.getElementById('inviteModal').style.display='none'" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 1.2rem;">✕</button>
            </div>
            <form id="inviteForm" onsubmit="(window as any).sendInvite(event)" style="display: flex; flex-direction: column; gap: 1rem;">
                <input type="email" id="invEmail" placeholder="Email Address" required class="settings-input">
                <select id="invRole" class="settings-input">
                    <option value="sales_rep">Sales Representative</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                </select>
                <button type="submit" class="gradient-btn" style="padding: 0.75rem; margin-top: 1rem;" id="invBtn">Send Invitation</button>
            </form>
        </div>
    </div>

    <style>
        .settings-label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }
        .settings-input { padding: 0.75rem 1rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: white; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; }
        .settings-input:focus { border-color: var(--secondary-color); }
        
        /* Switch styling */
        .switch { position: relative; display: inline-block; width: 46px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 24px; border: 1px solid var(--border-color); }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--success-color); border-color: var(--success-color); }
        input:checked + .slider:before { transform: translateX(22px); }
    </style>
  `;

  // -------------------------------------------------------------
  // Data Loading Logic
  // -------------------------------------------------------------
  async function loadProfile() {
      try {
          const p = await api.getUserProfile();
          if(p) {
              (document.getElementById('profFullName') as HTMLInputElement).value = p.full_name || '';
              (document.getElementById('profPhone') as HTMLInputElement).value = p.phone_number || '';
              (document.getElementById('profTitle') as HTMLInputElement).value = p.job_title || '';
              (document.getElementById('profDept') as HTMLInputElement).value = p.department || '';
              (document.getElementById('profTimezone') as HTMLInputElement).value = p.timezone || 'UTC';
              (document.getElementById('profLang') as HTMLInputElement).value = p.language || 'en';
              (document.getElementById('profBio') as HTMLTextAreaElement).value = p.bio || '';
              
              const ava = document.getElementById('profileAvatar') as HTMLImageElement;
              if (ava) {
                  ava.src = p.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || p.email)}&background=random`;
              }
          }
      } catch (e: any) { api.showToast(e.message, 'error'); }
  }

  async function loadOrganization() {
      try {
          const p = await api.getUserProfile();
          if(p && p.organization) {
              (document.getElementById('orgName') as HTMLInputElement).value = p.organization.name || '';
              (document.getElementById('orgIndustry') as HTMLInputElement).value = p.organization.industry || '';
              (document.getElementById('orgWebsite') as HTMLInputElement).value = p.organization.website || '';
              (document.getElementById('orgAddress') as HTMLTextAreaElement).value = p.organization.address || '';
          }
      } catch (e: any) {}
  }

  async function loadTeam() {
      try {
          const res = await api.getTeamMembers();
          const list = document.getElementById('teamList');
          if (!list) return;

          let html = '';
          const currentUserId = api.getUser()?.id;

          res.members?.forEach((m: any) => {
              const isMe = m.id === currentUserId;
              html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: var(--border-radius-md); border: 1px solid var(--border-color); ${!m.is_active ? 'opacity: 0.5;' : ''}">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden;"><img src="${m.profile_picture || 'https://ui-avatars.com/api/?name='+encodeURIComponent(m.full_name||m.email)}" style="width:100%;"></div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.95rem;">${m.full_name || m.email} ${isMe ? '<span style="color:var(--secondary-color);font-size:0.75rem;">(You)</span>' : ''}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${m.email} ${!m.is_active ? '- Suspended' : ''}</div>
                        </div>
                    </div>
                    ${isMe ? `<span style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; text-transform: capitalize;">${m.role}</span>` 
                    : `
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <select onchange="(window as any).changeRole('${m.id}', this.value)" style="background: rgba(255,255,255,0.1); border: 1px solid transparent; color: white; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; outline: none; cursor: pointer;">
                                <option value="super_admin" ${m.role==='super_admin'?'selected':''}>Super Admin</option>
                                <option value="admin" ${m.role==='admin'?'selected':''}>Admin</option>
                                <option value="manager" ${m.role==='manager'?'selected':''}>Manager</option>
                                <option value="sales_rep" ${m.role==='sales_rep'?'selected':''}>Sales Rep</option>
                                <option value="viewer" ${m.role==='viewer'?'selected':''}>Viewer</option>
                            </select>
                            ${m.is_active 
                                ? `<button onclick="(window as any).suspendMbr('${m.id}')" style="background:transparent; border:1px solid var(--border-color); color:var(--warning-color); padding:0.3rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;">Suspend</button>`
                                : `<button onclick="(window as any).activateMbr('${m.id}')" style="background:transparent; border:1px solid var(--border-color); color:var(--success-color); padding:0.3rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;">Activate</button>`
                            }
                            <button onclick="(window as any).removeMbr('${m.id}')" style="background:transparent; border:1px solid var(--border-color); color:var(--danger-color); padding:0.3rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;">Remove</button>
                        </div>
                    `}
                </div>
              `;
          });
          
          res.pending_invitations?.forEach((i: any) => {
              html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: var(--border-radius-md); border: 1px dashed var(--border-color);">
                    <div>
                        <div style="font-weight: 600; font-size: 0.95rem;">${i.email}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Pending Invite • Role: ${i.role}</div>
                    </div>
                </div>
              `;
          });

          list.innerHTML = html || '<div style="padding:1rem;color:var(--text-secondary);">No team members found.</div>';
      } catch (e: any) { api.showToast(e.message, 'error'); }
  }

  async function loadSecurity() {
      try {
          const res = await api.getActiveSessions();
          const list = document.getElementById('sessionsList');
          if (!list) return;

          let html = '';
          res.sessions?.forEach((s: any) => {
              html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: var(--border-radius-md); border: 1px solid var(--border-color);">
                    <div>
                        <div style="font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
                            ${s.device_name}
                            ${s.is_current ? '<span style="background:var(--success-color); color:white; padding:0.1rem 0.4rem; border-radius:4px; font-size:0.6rem;">Current</span>' : ''}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${s.browser} on ${s.os} • IP: ${s.ip_address}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">Last active: ${new Date(s.last_active_at).toLocaleString()}</div>
                    </div>
                    ${!s.is_current ? `<button onclick="(window as any).revokeSess('${s.id}')" style="background:transparent; border:1px solid var(--border-color); color:var(--danger-color); padding:0.3rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;">Revoke</button>` : ''}
                </div>
              `;
          });
          list.innerHTML = html;

          // load 2fa status (requires fetching profile again)
          const p = await api.getUserProfile();
          if (p) (document.getElementById('tfaToggle') as HTMLInputElement).checked = !!p.two_factor_enabled;

      } catch (e: any) { }
  }

  async function loadPreferences() {
      try {
          const pref = await api.getNotificationPreferences();
          if(pref) {
              (document.getElementById('prefEmail') as HTMLInputElement).checked = !!pref.email_notifications;
              (document.getElementById('prefInApp') as HTMLInputElement).checked = !!pref.in_app_notifications;
              (document.getElementById('prefAI') as HTMLInputElement).checked = !!pref.ai_alerts;
              (document.getElementById('prefMarketing') as HTMLInputElement).checked = !!pref.marketing_emails;
          }
      } catch (e) {}
  }

  async function loadApiKeys() {
      try {
          const res = await api.getApiKeys();
          const list = document.getElementById('apiKeysList');
          if (!list) return;

          let html = '';
          res.api_keys?.forEach((k: any) => {
              html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: var(--border-radius-md); border: 1px solid var(--border-color);">
                    <div>
                        <div style="font-weight: 600; font-size: 0.95rem;">${k.name}</div>
                        <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 0.2rem 0.4rem; border-radius: 4px; display: inline-block; margin-top: 0.25rem;">${k.key_prefix}*******************</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">Created: ${new Date(k.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="(window as any).rotateKey('${k.id}')" style="background:transparent; border:1px solid var(--border-color); color:var(--warning-color); padding:0.3rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;">Rotate</button>
                        <button onclick="(window as any).revokeKey('${k.id}')" style="background:transparent; border:1px solid var(--border-color); color:var(--danger-color); padding:0.3rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;">Revoke</button>
                    </div>
                </div>
              `;
          });
          list.innerHTML = html || '<div style="padding:1rem;color:var(--text-secondary);">No API keys found.</div>';
      } catch (e: any) { api.showToast(e.message, 'error'); }
  }


  // -------------------------------------------------------------
  // Window Handlers
  // -------------------------------------------------------------
  
  (window as any).saveProfile = async function(e: Event) {
      e.preventDefault();
      const btn = document.getElementById('profSaveBtn') as HTMLButtonElement;
      btn.innerText = 'Saving...';
      try {
          const payload = {
              full_name: (document.getElementById('profFullName') as HTMLInputElement).value,
              phone_number: (document.getElementById('profPhone') as HTMLInputElement).value,
              job_title: (document.getElementById('profTitle') as HTMLInputElement).value,
              department: (document.getElementById('profDept') as HTMLInputElement).value,
              timezone: (document.getElementById('profTimezone') as HTMLInputElement).value,
              language: (document.getElementById('profLang') as HTMLInputElement).value,
              bio: (document.getElementById('profBio') as HTMLTextAreaElement).value,
          };
          await api.updateUserProfile(payload);
          api.showToast('Profile updated successfully', 'success');
          // update user cache
          const u = api.getUser();
          if (u) { u.full_name = payload.full_name; api.setUser(u); }
      } catch (err: any) {
          api.showToast(err.message, 'error');
      } finally {
          btn.innerText = 'Save Changes';
      }
  };

  (window as any).handleAvatarUpload = function(input: HTMLInputElement) {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e: any) => {
          const base64 = e.target.result;
          try {
              await api.uploadAvatar(base64);
              api.showToast('Avatar updated', 'success');
              const ava = document.getElementById('profileAvatar') as HTMLImageElement;
              if (ava) ava.src = base64;
          } catch(err: any) { api.showToast(err.message, 'error'); }
      };
      reader.readAsDataURL(file);
  };

  (window as any).removeAvatar = async function() {
      try {
          await api.removeAvatar();
          api.showToast('Avatar removed', 'success');
          loadProfile();
      } catch(err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).saveOrganization = async function(e: Event) {
      e.preventDefault();
      const btn = document.getElementById('orgSaveBtn') as HTMLButtonElement;
      btn.innerText = 'Saving...';
      try {
          const payload = {
              name: (document.getElementById('orgName') as HTMLInputElement).value,
              industry: (document.getElementById('orgIndustry') as HTMLInputElement).value,
              website: (document.getElementById('orgWebsite') as HTMLInputElement).value,
              address: (document.getElementById('orgAddress') as HTMLTextAreaElement).value,
          };
          await api.updateOrganizationSettings(payload);
          api.showToast('Organization updated successfully', 'success');
      } catch (err: any) {
          api.showToast(err.message, 'error');
      } finally {
          btn.innerText = 'Save Changes';
      }
  };

  (window as any).savePassword = async function(e: Event) {
      e.preventDefault();
      const cp = (document.getElementById('currentPwd') as HTMLInputElement).value;
      const np = (document.getElementById('newPwd') as HTMLInputElement).value;
      const cnp = (document.getElementById('confirmPwd') as HTMLInputElement).value;
      if (np !== cnp) return api.showToast('Passwords do not match', 'error');
      try {
          await api.changePassword({ current_password: cp, new_password: np });
          api.showToast('Password changed successfully. You will be logged out.', 'success');
          setTimeout(() => (window as any).handleSecureLogout(), 2000);
      } catch (err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).toggle2FA = async function(checked: boolean) {
      try {
          await api.toggle2FA(checked);
          api.showToast('2FA settings updated', 'success');
      } catch(err: any) { api.showToast(err.message, 'error'); loadSecurity(); }
  };

  (window as any).revokeSess = async function(id: string) {
      if(!confirm('Revoke this session?')) return;
      try {
          await api.revokeSession(id);
          api.showToast('Session revoked', 'success');
          loadSecurity();
      } catch(err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).revokeAllSessions = async function() {
      if(!confirm('Are you sure you want to log out of all other devices?')) return;
      try {
          await api.revokeOtherSessions();
          api.showToast('All other sessions revoked', 'success');
          loadSecurity();
      } catch(err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).savePreferences = async function() {
      try {
          const payload = {
              email_notifications: (document.getElementById('prefEmail') as HTMLInputElement).checked,
              in_app_notifications: (document.getElementById('prefInApp') as HTMLInputElement).checked,
              ai_alerts: (document.getElementById('prefAI') as HTMLInputElement).checked,
              marketing_emails: (document.getElementById('prefMarketing') as HTMLInputElement).checked,
          };
          await api.updateNotificationPreferences(payload);
          api.showToast('Preferences saved', 'success');
      } catch(err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).sendInvite = async function(e: Event) {
      e.preventDefault();
      const email = (document.getElementById('invEmail') as HTMLInputElement).value;
      const role = (document.getElementById('invRole') as HTMLSelectElement).value;
      try {
          const res = await api.inviteTeamMember({ email, role });
          api.showToast(res.message || 'Invitation sent', 'success');
          document.getElementById('inviteModal')!.style.display = 'none';
          loadTeam();
      } catch (err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).changeRole = async function(id: string, role: string) {
      try {
          await api.updateMemberRole(id, role);
          api.showToast('Role updated', 'success');
      } catch (err: any) { api.showToast(err.message, 'error'); loadTeam(); }
  };

  (window as any).suspendMbr = async function(id: string) {
      if(!confirm('Suspend this member?')) return;
      try { await api.suspendMember(id); api.showToast('Member suspended', 'success'); loadTeam(); } 
      catch (err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).activateMbr = async function(id: string) {
      try { await api.activateMember(id); api.showToast('Member activated', 'success'); loadTeam(); } 
      catch (err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).removeMbr = async function(id: string) {
      if(!confirm('Are you sure you want to permanently remove this member?')) return;
      try { await api.removeMember(id); api.showToast('Member removed', 'success'); loadTeam(); } 
      catch (err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).createApiKey = async function() {
      const name = prompt('Enter a name for this API Key:');
      if (!name) return;
      try {
          const res = await api.createApiKey({ name });
          prompt('API Key generated successfully. Copy it now, it will not be shown again:', res.api_key);
          loadApiKeys();
      } catch (err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).revokeKey = async function(id: string) {
      if(!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
      try { await api.revokeApiKey(id); api.showToast('API key revoked', 'success'); loadApiKeys(); } 
      catch (err: any) { api.showToast(err.message, 'error'); }
  };

  (window as any).rotateKey = async function(id: string) {
      if(!confirm('Are you sure you want to rotate this key? The old key will immediately stop working.')) return;
      try {
          const res = await api.rotateApiKey(id);
          prompt('API Key rotated successfully. Copy your new key now:', res.api_key);
          loadApiKeys();
      } catch (err: any) { api.showToast(err.message, 'error'); }
  };

  router.mount(createLayout('/settings', content));
  
  // Default tab from URL or profile
  setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab') || 'profile';
      (window as any).switchTab(tab);
  }, 50);
}
