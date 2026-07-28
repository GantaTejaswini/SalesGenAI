import { api } from './api';

export function initLayoutDOM() {
    // Scroll listener
    const main = document.querySelector('main');
    const header = document.getElementById('mainHeader');
    if (main && header) {
        main.addEventListener('scroll', () => {
            if (main.scrollTop > 10) {
                header.style.borderBottom = '1px solid var(--border-color)';
            } else {
                header.style.borderBottom = '1px solid transparent';
            }
        });
    }

    // Load Sidebar User Profile Data
    async function loadSidebarUser() {
        if (window.location.pathname === '/login') return;
        try {
            let user = api.getUser();
            if (!user) {
                const profile = await api.getUserProfile();
                if (profile) {
                    api.setUser(profile);
                    user = profile;
                }
            }
            if (user) {
                const nameEl = document.getElementById('sidebarUserName');
                const roleEl = document.getElementById('sidebarUserRole');
                const avatarEl = document.getElementById('sidebarUserAvatar');
                if (nameEl) nameEl.innerText = user.full_name || user.email || 'User';
                if (roleEl) roleEl.innerText = user.role || 'Sales Rep';
                if (avatarEl) {
                    (avatarEl as HTMLImageElement).src = user.profile_picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.full_name || user.email || 'User') + '&background=random';
                }
            }
        } catch (e) { console.error('Failed to load user:', e); const nameEl = document.getElementById('sidebarUserName'); if (nameEl) nameEl.innerText = 'Offline User'; }
    }
    loadSidebarUser();

    // Load Notifications
    async function loadNotifications() {
        if (window.location.pathname === '/login') return;
        try {
            const res = await api.getNotifications();
            const list = document.getElementById('notifList');
            const badge = document.getElementById('notifBadge');
            if (list && res.data) {
                if (res.data.length === 0) {
                    list.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No notifications</div>';
                } else {
                    list.innerHTML = res.data.map((n: any) => 
                        '<div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; ' + (!n.is_read ? 'background: rgba(124,58,237,0.1);' : '') + '">' +
                            '<div style="font-size: 0.85rem; margin-bottom: 0.2rem;">' + n.message + '</div>' +
                            '<div style="font-size: 0.7rem; color: var(--text-secondary);">' + new Date(n.created_at).toLocaleString() + '</div>' +
                        '</div>'
                    ).join('');
                }
                
                const unread = res.data.filter((n: any) => !n.is_read).length;
                if (badge) {
                    if (unread > 0) {
                        badge.innerText = unread.toString();
                        badge.style.display = 'flex';
                    } else {
                        badge.style.display = 'none';
                    }
                }
            }
        } catch(e) {}
    }
    (window as any).loadNotifications = loadNotifications;
    loadNotifications();
}

// Global functions
(window as any).openAddLeadModal = function() {
    const m = document.getElementById('addLeadModal');
    if(m) m.style.display = 'flex';
};
(window as any).closeAddLeadModal = function() {
    const m = document.getElementById('addLeadModal');
    if(m) m.style.display = 'none';
};
(window as any).openSearchModal = function() {
    const sm = document.getElementById('searchModal');
    if(sm) {
        sm.style.display = 'flex';
        const input = document.getElementById('cmdSearchInput');
        if(input) input.focus();
        if ((window as any).loadSearchHistory) (window as any).loadSearchHistory();
    }
};
(window as any).closeSearchModal = function() {
    const sm = document.getElementById('searchModal');
    if(sm) sm.style.display = 'none';
};
(window as any).toggleNotificationDropdown = function() {
    const dd = document.getElementById('notifDropdown');
    if (dd) {
        dd.style.display = dd.style.display === 'none' ? 'flex' : 'none';
        if (dd.style.display === 'flex' && (window as any).loadNotifications) {
            (window as any).loadNotifications();
        }
    }
};
(window as any).markAllRead = async function() {
    try {
        await api.markAllNotificationsRead();
        if ((window as any).loadNotifications) (window as any).loadNotifications();
    } catch(e) {}
};
(window as any).handleSecureLogout = async function() {
    try {
        await api.apiLogout();
    } catch(e) {
        console.error(e);
    } finally {
        localStorage.clear();
        sessionStorage.clear();
        location.replace('/login');
    }
};
(window as any).toggleSidebar = function() {
    const sidebar = document.getElementById('appSidebar');
    const main = document.getElementById('appMain');
    if (sidebar && main) {
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        main.style.marginLeft = isCollapsed ? '112px' : '292px';
    }
};

// Global event listeners
document.addEventListener('click', (e: any) => {
    const dd = document.getElementById('notifDropdown');
    if (dd && dd.style.display === 'flex' && !e.target.closest('#notifDropdown') && !e.target.closest('button[onclick*="toggleNotificationDropdown"]')) {
        dd.style.display = 'none';
    }
    const ud = document.getElementById('userMenuDropdown');
    if (ud && ud.style.display === 'flex' && !e.target.closest('#userMenuDropdown') && !e.target.closest('#userMenuTrigger')) {
        ud.style.display = 'none';
    }
});

document.addEventListener('keydown', (e: any) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        (window as any).openSearchModal();
    }
    if (e.key === 'Escape') {
        (window as any).closeSearchModal();
        (window as any).closeAddLeadModal();
    }
});
