export function createLayout(activePath: string, content: string): string {
    const navItems = [
        { section: 'MAIN', items: [
            { path: '/', label: 'Dashboard', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>' },
            { path: '/leads', label: 'Leads', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
            { path: '/companies', label: 'Companies', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>' },
            { path: '/pipeline', label: 'Pipeline', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>' }
        ]},
        { section: 'WORKSPACE', items: [
            { path: '/outreach', label: 'Outreach', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>' },
            { path: '/conversations', label: 'Conversations', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' }
        ]},
        { section: 'GENERAL', items: [
            { path: '/tasks', label: 'Tasks', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' },
            { path: '/calendar', label: 'Calendar', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>' },
            { path: '/analytics', label: 'Analytics', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>' }
        ]}
    ];

    let navHtml = '';
    navItems.forEach((group, index) => {
        const marginStyle = index > 0 ? 'margin-top: 1.5rem;' : '';
        navHtml += '<div class="sidebar-text" style="font-size: 0.75rem; color: var(--text-secondary); ' + marginStyle + ' margin-bottom: 0.5rem; padding-left: 0.75rem; font-weight: 600; white-space: nowrap; overflow: hidden; opacity: 1; transition: opacity 0.2s;">' + group.section + '</div>';
        group.items.forEach(item => {
            const isActive = activePath === item.path;
            const activeStyle = isActive 
                ? 'background: var(--card-bg); color: var(--text-primary); border-left: 3px solid var(--secondary-color);' 
                : 'color: var(--text-secondary);';
            navHtml += '<a href="javascript:void(0)" onclick="navigate(\'' + item.path + '\')" class="nav-item ' + (isActive ? 'active' : '') + '" style="padding: 0.6rem 0.75rem; border-radius: var(--border-radius-sm); text-decoration: none; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 0.75rem; ' + activeStyle + ' transition: background 0.2s, color 0.2s; white-space: nowrap; overflow: hidden;">' +
                    '<div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;">' + item.icon + '</div>' +
                    '<span class="sidebar-text" style="opacity: 1; transition: opacity 0.2s;">' + item.label + '</span>' +
                '</a>';
        });
    });

    return `
    <div style="display: flex; height: 100vh; overflow: hidden; background: transparent;">
      <!-- Sidebar -->
      <aside id="appSidebar" class="glass" style="width: 260px; display: flex; flex-direction: column; padding: 1.5rem; margin: 1rem; position: fixed; height: calc(100vh - 2rem); overflow-y: auto; z-index: 50; transition: width 0.3s ease;">
        <div id="sidebarHeader" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; flex-direction: row;">
          <div style="width: 28px; height: 28px; background: var(--primary-gradient); border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
          <span class="sidebar-text" style="font-weight: 600; font-size: 1.1rem; letter-spacing: -0.5px; opacity: 1; transition: opacity 0.2s; white-space: nowrap;">SalesGenie AI</span>
          <svg class="toggle-icon" onclick="window.toggleSidebar()" style="margin-left: auto; cursor: pointer; color: var(--text-secondary); flex-shrink: 0;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
        </div>
        
        <nav style="display: flex; flex-direction: column; gap: 0.25rem; flex: 1;">
            ${navHtml}
        </nav>
        
        <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem; position: relative;">
          <div id="userMenuTrigger" onclick="document.getElementById('userMenuDropdown').style.display = document.getElementById('userMenuDropdown').style.display === 'none' ? 'flex' : 'none'" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; cursor: pointer; border-radius: var(--border-radius-sm); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
            <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0;">
              <img id="sidebarUserAvatar" src="https://ui-avatars.com/api/?name=User&background=random" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div class="sidebar-text" style="flex: 1; overflow: hidden; opacity: 1; transition: opacity 0.2s; white-space: nowrap;">
              <div id="sidebarUserName" style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden;">Loading...</div>
              <div id="sidebarUserRole" style="font-size: 0.75rem; color: var(--text-secondary); text-transform: capitalize;"></div>
            </div>
            <svg class="sidebar-text" style="opacity: 1; transition: opacity 0.2s; flex-shrink: 0;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          
          <div id="userMenuDropdown" style="display: none; position: absolute; bottom: 100%; left: 0; right: 0; margin-bottom: 0.5rem; padding: 0.5rem; flex-direction: column; z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.5); background: #081120; border: 1px solid rgba(255,255,255,0.2); border-radius: 16px;">
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=profile'); if(window.switchTab) window.switchTab('profile');" style="padding: 0.5rem 0.75rem; color: white; text-decoration: none; font-size: 0.85rem; border-radius: 4px; display: block; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">My Profile</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=org'); if(window.switchTab) window.switchTab('org');" style="padding: 0.5rem 0.75rem; color: white; text-decoration: none; font-size: 0.85rem; border-radius: 4px; display: block; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">My Account</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=security'); if(window.switchTab) window.switchTab('security');" style="padding: 0.5rem 0.75rem; color: white; text-decoration: none; font-size: 0.85rem; border-radius: 4px; display: block; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">Security</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=notifications'); if(window.switchTab) window.switchTab('notifications');" style="padding: 0.5rem 0.75rem; color: white; text-decoration: none; font-size: 0.85rem; border-radius: 4px; display: block; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">Notifications</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=api'); if(window.switchTab) window.switchTab('api');" style="padding: 0.5rem 0.75rem; color: white; text-decoration: none; font-size: 0.85rem; border-radius: 4px; display: block; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">API Keys</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=team'); if(window.switchTab) window.switchTab('team');" style="padding: 0.5rem 0.75rem; color: white; text-decoration: none; font-size: 0.85rem; border-radius: 4px; display: block; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">Team</a>
             <div style="height: 1px; background: var(--border-color); margin: 0.25rem 0;"></div>
             <button onclick="window.handleSecureLogout()" style="width: 100%; text-align: left; padding: 0.5rem 0.75rem; background: transparent; border: none; color: var(--danger-color); font-size: 0.85rem; cursor: pointer; border-radius: 4px; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='transparent'">Sign Out</button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main id="appMain" style="flex: 1; margin-left: 292px; padding: 2rem; max-width: 1400px; margin-right: auto; overflow-y: auto; height: 100vh; padding-bottom: 4rem; transition: margin-left 0.3s ease; min-width: 0;">
        
        <!-- Header -->
        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; position: relative; background: transparent; padding-top: 1rem; padding-bottom: 1rem; z-index: 40; border-bottom: none;" id="mainHeader">
          <div style="position: relative; width: 400px;">
            <svg style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search anything..." style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 999px; color: white; outline: none; transition: border-color 0.2s; backdrop-filter: blur(20px);" onfocus="this.style.borderColor='var(--secondary-color)'" onblur="this.style.borderColor='var(--border-color)'" onkeydown="if(event.key === 'Enter' && this.value) navigate('/search?q=' + encodeURIComponent(this.value))">
          </div>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <button class="icon-btn" onclick="navigate('/updates')" style="border-radius: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg></button>
            <div style="position: relative;">
                <button class="icon-btn" onclick="window.toggleNotificationDropdown()" style="border-radius: 8px; position: relative;">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                   <div id="notifBadge" style="position: absolute; top: -5px; right: -5px; background: var(--danger-color); color: white; font-size: 0.6rem; width: 16px; height: 16px; display: none; align-items: center; justify-content: center; border-radius: 50%;">0</div>
                </button>
                <div id="notifDropdown" class="glass-card" style="display: none; position: absolute; top: 120%; right: 0; width: 320px; padding: 0; max-height: 400px; overflow-y: auto; z-index: 50; flex-direction: column;">
                    <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="margin: 0; font-size: 0.95rem;">Notifications</h4>
                        <button onclick="window.markAllRead()" style="background: transparent; border: none; color: var(--secondary-color); font-size: 0.75rem; cursor: pointer;">Mark all read</button>
                    </div>
                    <div id="notifList" style="display: flex; flex-direction: column;">
                        <!-- notifications here -->
                    </div>
                </div>
            </div>
            <div class="glass-card" onclick="navigate('/settings')" style="padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; border-radius: var(--border-radius-sm);">
                <div style="width: 20px; height: 20px; background: var(--primary-gradient); border-radius: 50%;"></div>
                <span id="headerOrgName" style="font-size: 0.85rem; font-weight: 500;">SalesGenAI</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </header>

        ${content}

      </main>

      <!-- Global Search Command Palette Modal -->
      <div id="searchModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 200; align-items: flex-start; justify-content: center; padding-top: 10vh;">
          <div class="glass-card" style="width: 100%; max-width: 600px; background: var(--sidebar-color); border-radius: var(--border-radius-lg); overflow: hidden; display: flex; flex-direction: column;">
              <div style="display: flex; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" id="cmdSearchInput" placeholder="Search anything (Organizations, Leads, Tasks, Notifications)..." style="flex: 1; background: transparent; border: none; color: white; font-size: 1.1rem; padding: 0 1rem; outline: none;">
                  <div style="font-size: 0.75rem; color: var(--text-secondary); background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">ESC</div>
              </div>
              <div id="searchResults" style="max-height: 400px; overflow-y: auto; padding: 0.5rem;">
                  <!-- Results populate here -->
              </div>
          </div>
      </div>

      <!-- Add Lead Modal Overlay (Global) -->
      <div id="addLeadModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 100; align-items: center; justify-content: center;">
          <div class="glass-card" style="width: 100%; max-width: 700px; background: var(--sidebar-color); max-height: 90vh; overflow-y: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1.5rem 1.5rem 0 1.5rem;">
                  <h2 style="margin: 0; font-size: 1.25rem;">Add New Lead</h2>
                  <button onclick="closeAddLeadModal()" class="icon-btn" style="border: none; background: transparent;">✕</button>
              </div>
              <form id="addLeadForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 0 1.5rem 1.5rem 1.5rem;">
                  <div style="grid-column: span 2; font-size: 0.85rem; color: var(--primary-color); font-weight: 600; margin-top: 0.5rem;">COMPANY DETAILS</div>
                  <input type="text" id="lCompany" placeholder="Company Name *" class="form-input">
                  <input type="text" id="lWebsite" placeholder="Website URL" class="form-input">
                  <input type="text" id="lIndustry" placeholder="Industry" class="form-input">
                  <input type="text" id="lCountry" placeholder="Country" class="form-input">
                  <select id="lSize" class="form-input">
                      <option value="">Company Size</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="500+">500+</option>
                  </select>
                  <input type="text" id="lRevenue" placeholder="Annual Revenue" class="form-input">

                  <div style="grid-column: span 2; font-size: 0.85rem; color: var(--primary-color); font-weight: 600; margin-top: 0.5rem;">CONTACT DETAILS</div>
                  <input type="text" id="lContactFirst" placeholder="First Name *" class="form-input">
                  <input type="text" id="lContactLast" placeholder="Last Name *" class="form-input">
                  <input type="email" id="lEmail" placeholder="Email Address *" class="form-input">
                  <input type="text" id="lPhone" placeholder="Phone Number" class="form-input">
                  <input type="text" id="lJobTitle" placeholder="Job Title" class="form-input">
                  <input type="text" id="lLinkedIn" placeholder="LinkedIn URL" class="form-input">

                  <div style="grid-column: span 2; font-size: 0.85rem; color: var(--primary-color); font-weight: 600; margin-top: 0.5rem;">LEAD DETAILS</div>
                  <select id="lPriority" class="form-input">
                      <option value="Cold">Cold</option>
                      <option value="Warm">Warm</option>
                      <option value="Hot">Hot</option>
                  </select>
                  <select id="lSource" class="form-input">
                      <option value="Manual">Manual</option>
                      <option value="Inbound">Inbound</option>
                      <option value="Outbound">Outbound</option>
                      <option value="Referral">Referral</option>
                  </select>
                  <input type="number" id="lDealValue" placeholder="Estimated Deal Value ($)" class="form-input">
                  <input type="date" id="lCloseDate" placeholder="Expected Close Date" class="form-input">
                  <input type="text" id="lTags" placeholder="Tags (comma separated)" class="form-input" style="grid-column: span 2;">
                  <textarea id="lNotes" placeholder="Notes..." class="form-input" style="grid-column: span 2; min-height: 80px; resize: vertical;"></textarea>

                  <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
                      <button type="button" onclick="closeAddLeadModal()" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--border-color); color: white; border-radius: var(--border-radius-md); cursor: pointer;">Cancel</button>
                      <button type="submit" class="gradient-btn" style="padding: 0.6rem 1.2rem;">Create Complete Lead</button>
                  </div>
              </form>
          </div>
      </div>
    </div>
    `;
}
