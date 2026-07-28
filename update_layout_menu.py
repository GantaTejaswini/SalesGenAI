import re

fpath = 'frontend/src/components/layout.ts'
with open(fpath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the sidebar user profile block with interactive dropdown and avatar generator
old_profile_block = """        <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; cursor: pointer;">
            <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden;">
              <img src="https://ui-avatars.com/api/?name=Admin&background=random" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="flex: 1;">
              <div id="sidebarUserName" style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">User</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">Admin</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <button id="logoutBtn" onclick="localStorage.removeItem('token'); navigate('/login');" style="margin-top: 0.5rem; width: 100%; padding: 0.5rem; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: var(--border-radius-sm); cursor: pointer; font-size: 0.8rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
            Sign Out
          </button>
        </div>"""

new_profile_block = """        <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem; position: relative;">
          <div onclick="(window as any).toggleUserMenu()" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem; cursor: pointer; border-radius: var(--border-radius-sm); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
            <div id="sidebarAvatarContainer" style="width: 34px; height: 34px; border-radius: 50%; overflow: hidden; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.9rem;">
              <img id="sidebarUserAvatarImg" src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="flex: 1; overflow: hidden;">
              <div id="sidebarUserName" style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">User</div>
              <div id="sidebarUserRole" style="font-size: 0.75rem; color: var(--text-secondary);">Super Admin</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <!-- User Profile Dropdown Menu -->
          <div id="userMenuDropdown" class="glass-card" style="display: none; position: absolute; bottom: 100%; left: 0; right: 0; margin-bottom: 0.5rem; background: var(--sidebar-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 0.5rem 0; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.5); flex-direction: column;">
             <div style="padding: 0.5rem 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 0.25rem;">
                <div id="dropdownUserTitle" style="font-weight: 600; font-size: 0.85rem;">User Account</div>
                <div id="dropdownUserEmail" style="font-size: 0.75rem; color: var(--text-secondary);">admin@salesgenie.ai</div>
             </div>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=profile'); (window as any).closeUserMenu();" style="padding: 0.5rem 1rem; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">👤 My Profile</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=account'); (window as any).closeUserMenu();" style="padding: 0.5rem 1rem; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">🔐 Security & Sessions</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=team'); (window as any).closeUserMenu();" style="padding: 0.5rem 1rem; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">👥 Team & Roles</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=notifications'); (window as any).closeUserMenu();" style="padding: 0.5rem 1rem; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">🔔 Notifications</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=api-keys'); (window as any).closeUserMenu();" style="padding: 0.5rem 1rem; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">🔑 API Keys</a>
             <a href="javascript:void(0)" onclick="navigate('/settings?tab=audit-logs'); (window as any).closeUserMenu();" style="padding: 0.5rem 1rem; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">📋 Audit Logs</a>
             <div style="border-top: 1px solid var(--border-color); margin: 0.25rem 0;"></div>
             <a href="javascript:void(0)" onclick="(window as any).handleSignOut()" style="padding: 0.5rem 1rem; color: var(--danger-color); text-decoration: none; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='transparent'">🚪 Sign Out</a>
          </div>

          <button id="logoutBtn" onclick="(window as any).handleSignOut()" style="margin-top: 0.5rem; width: 100%; padding: 0.5rem; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: var(--border-radius-sm); cursor: pointer; font-size: 0.8rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
            Sign Out
          </button>
        </div>"""

content = content.replace(old_profile_block, new_profile_block)

# Add window helper functions inside script section in layout.ts
script_end_tag = "</script>"
handlers_js = """
      // User Profile Dropdown handlers
      window.toggleUserMenu = function() {
          const menu = document.getElementById('userMenuDropdown');
          if (menu) {
              menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
          }
      };

      window.closeUserMenu = function() {
          const menu = document.getElementById('userMenuDropdown');
          if (menu) menu.style.display = 'none';
      };

      window.handleSignOut = async function() {
          try {
              const api = await import('../api');
              await api.apiLogout();
          } catch(e) {
              console.warn(e);
          } finally {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
          }
      };

      // Auto-load current user profile into sidebar
      (async function loadUserProfileHeader() {
          try {
              const api = await import('../api');
              const res = await api.getUserProfile();
              if (res) {
                  const nameEl = document.getElementById('sidebarUserName');
                  const roleEl = document.getElementById('sidebarUserRole');
                  const titleEl = document.getElementById('dropdownUserTitle');
                  const emailEl = document.getElementById('dropdownUserEmail');
                  const imgEl = document.getElementById('sidebarUserAvatarImg') as HTMLImageElement;

                  if (nameEl) nameEl.innerText = res.full_name || 'User';
                  if (roleEl) roleEl.innerText = (res.role || 'Super Admin').toUpperCase();
                  if (titleEl) titleEl.innerText = res.full_name || 'User Account';
                  if (emailEl) emailEl.innerText = res.email || '';
                  if (imgEl && res.profile_picture) {
                      imgEl.src = res.profile_picture;
                  }
              }
          } catch(e) {}
      })();
    </script>"""

content = content.replace(script_end_tag, handlers_js)

with open(fpath, 'w', encoding='utf-8') as f:
    f.write(content)

print("layout.ts updated with SaaS User Dropdown & Sign Out")
