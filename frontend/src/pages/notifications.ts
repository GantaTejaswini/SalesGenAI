import { router } from '../router';
import { createLayout } from '../components/layout';
import { api, showToast } from '../api';

export function renderNotifications() {
  const content = `
    <div style="max-width: 900px; margin: 0 auto; padding-bottom: 3rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
            <div>
                <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.5rem 0;">Notification Center</h1>
                <p id="notifSubtitle" style="color: var(--text-secondary); margin: 0; font-size: 0.95rem;">Loading...</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="(window as any).markAllRead()" class="icon-btn" style="padding: 0.5rem 1rem; border-radius: var(--border-radius-md); font-size: 0.85rem; border: 1px solid var(--border-color); background: transparent; color: white;">Mark all read</button>
            </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;" id="notifTabs">
            <div class="notif-tab active" data-category="All">All</div>
            <div class="notif-tab" data-category="AI">AI Recommendations</div>
            <div class="notif-tab" data-category="CRM">CRM Updates</div>
            <div class="notif-tab" data-category="Meetings">Meetings</div>
            <div class="notif-tab" data-category="Tasks">Tasks</div>
            <div class="notif-tab" data-category="Archived" style="margin-left: auto;">Archived</div>
        </div>

        <div id="notificationsContainer" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <!-- Dynamic Content -->
        </div>
    </div>

    <style>
        .notif-tab {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
            color: var(--text-secondary);
            cursor: pointer;
            border-radius: var(--border-radius-sm);
            transition: all 0.2s;
            font-weight: 500;
        }
        .notif-tab:hover {
            color: white;
            background: rgba(255,255,255,0.05);
        }
        .notif-tab.active {
            color: white;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
        }
        .notif-card {
            padding: 1.25rem;
            display: flex;
            gap: 1rem;
            align-items: flex-start;
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
            transition: all 0.2s;
        }
        .notif-card:hover {
            background: rgba(255,255,255,0.04);
            border-color: rgba(255,255,255,0.2);
        }
        .notif-card.unread {
            border-left: 3px solid var(--primary-color);
            background: rgba(255,255,255,0.04);
        }
        .notif-action-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0.3rem;
            border-radius: 4px;
        }
        .notif-action-btn:hover {
            background: rgba(255,255,255,0.1);
            color: white;
        }
    </style>
  `;
  
  router.mount(createLayout('/notifications', content));

  let currentCategory = 'All';
  let isArchivedView = false;

  const loadNotifications = async () => {
      const container = document.getElementById('notificationsContainer');
      const subtitle = document.getElementById('notifSubtitle');
      if (!container || !subtitle) return;

      try {
          const endpoint = isArchivedView ? '/notifications?is_archived=true' : `/notifications?is_archived=false${currentCategory !== 'All' ? '&category=' + currentCategory : ''}`;
          const res = await api.get(endpoint);
          
          if (!isArchivedView) {
              subtitle.innerText = `You have ${res.unread} unread notifications.`;
          } else {
              subtitle.innerText = `Viewing archived notifications.`;
          }

          if (res.data.length === 0) {
              container.innerHTML = `<div style="text-align: center; padding: 3rem; color: var(--text-secondary);">No notifications found.</div>`;
              return;
          }

          container.innerHTML = res.data.map((n: any) => {
              const dateStr = new Date(n.created_at).toLocaleString();
              let iconColor = 'var(--text-secondary)';
              let iconBg = 'rgba(255,255,255,0.1)';
              let iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
              
              if (n.type === 'success') { iconColor = 'var(--success-color)'; iconBg = 'rgba(34, 197, 94, 0.2)'; iconSvg = '<polyline points="20 6 9 17 4 12"></polyline>'; }
              else if (n.type === 'warning') { iconColor = 'var(--warning-color)'; iconBg = 'rgba(245, 158, 11, 0.2)'; iconSvg = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'; }
              else if (n.type === 'error') { iconColor = 'var(--danger-color)'; iconBg = 'rgba(239, 68, 68, 0.2)'; iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'; }

              const borderColor = n.is_read ? 'transparent' : iconColor;

              return `
              <div class="notif-card ${n.is_read ? '' : 'unread'}" style="border-left-color: ${borderColor};">
                  <div style="width: 36px; height: 36px; background: ${iconBg}; color: ${iconColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconSvg}</svg>
                  </div>
                  <div style="flex: 1;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                          <div style="font-weight: 600; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                              ${n.title}
                              <span style="font-size: 0.65rem; background: rgba(255,255,255,0.1); padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 500;">${n.category || 'System'}</span>
                          </div>
                          <div style="font-size: 0.75rem; color: var(--text-secondary);">${dateStr}</div>
                      </div>
                      <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem; line-height: 1.4;">${n.message}</div>
                      ${n.link ? `<a href="#" onclick="(window as any).navigate('${n.link}'); return false;" style="font-size: 0.85rem; color: var(--primary-color); text-decoration: none; font-weight: 500;">View Details &rarr;</a>` : ''}
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
                      ${!n.is_read ? `<button class="notif-action-btn" onclick="(window as any).markRead('${n.id}')" title="Mark as read"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></button>` : ''}
                      ${!n.is_archived ? `<button class="notif-action-btn" onclick="(window as any).archiveNotif('${n.id}')" title="Archive"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg></button>` : `<button class="notif-action-btn" onclick="(window as any).restoreNotif('${n.id}')" title="Restore"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg></button>`}
                      <button class="notif-action-btn" onclick="(window as any).deleteNotif('${n.id}')" title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                  </div>
              </div>
              `;
          }).join('');

      } catch (err) {
          console.error(err);
          showToast('Failed to load notifications', 'error');
      }
  };

  // Bind global actions
  (window as any).markRead = async (id: string) => {
      await api.post(`/notifications/${id}/read`, {});
      loadNotifications();
  };
  (window as any).archiveNotif = async (id: string) => {
      await api.post(`/notifications/${id}/archive`, {});
      showToast('Notification archived', 'success');
      loadNotifications();
  };
  (window as any).restoreNotif = async (id: string) => {
      await api.post(`/notifications/${id}/restore`, {});
      showToast('Notification restored', 'success');
      loadNotifications();
  };
  (window as any).deleteNotif = async (id: string) => {
      await api.delete(`/notifications/${id}`);
      showToast('Notification deleted', 'success');
      loadNotifications();
  };
  (window as any).markAllRead = async () => {
      await api.post('/notifications/read-all', {});
      showToast('All marked as read', 'success');
      loadNotifications();
  };

  // Bind Tabs
  setTimeout(() => {
      document.querySelectorAll('.notif-tab').forEach(tab => {
          tab.addEventListener('click', (e) => {
              const target = e.target as HTMLElement;
              document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
              target.classList.add('active');
              
              const cat = target.getAttribute('data-category') || 'All';
              if (cat === 'Archived') {
                  isArchivedView = true;
              } else {
                  isArchivedView = false;
                  currentCategory = cat;
              }
              loadNotifications();
          });
      });
      loadNotifications();
  }, 100);
}
