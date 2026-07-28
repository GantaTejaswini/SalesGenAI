import { router } from '../router';
import { createLayout } from '../components/layout';
import { api, showToast } from '../api';

export function renderUpdates() {
  const content = `
    <div style="max-width: 800px; margin: 0 auto; padding-bottom: 3rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
            <div style="width: 64px; height: 64px; background: var(--primary-gradient); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
            </div>
            <h1 style="font-size: 2.5rem; font-weight: 700; margin: 0 0 0.5rem 0;">What's New</h1>
            <p style="color: var(--text-secondary); margin: 0; font-size: 1.1rem;">The latest product updates and releases.</p>
        </div>

        <div id="updatesContainer" style="display: flex; flex-direction: column; gap: 3rem; position: relative;">
            <!-- Dynamic Content -->
            <div style="text-align: center; color: var(--text-secondary);">Loading updates...</div>
        </div>
    </div>
  `;
  
  router.mount(createLayout('/updates', content));

  const loadUpdates = async () => {
      const container = document.getElementById('updatesContainer');
      if (!container) return;

      try {
          const res = await api.get('/updates');
          
          if (!res.releases || res.releases.length === 0) {
              container.innerHTML = `<div style="text-align: center; color: var(--text-secondary);">No updates available yet.</div>`;
              return;
          }

          let html = `<div style="position: absolute; left: 19px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.05); z-index: 0;"></div>`;
          
          res.releases.forEach((r: any) => {
              const dateStr = new Date(r.release_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              
              let iconColor = 'var(--primary-color)';
              let iconBg = 'rgba(79, 140, 255, 0.2)';
              let iconSvg = '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>';

              if (r.category === 'Feature') {
                  iconColor = 'var(--secondary-color)';
                  iconBg = 'rgba(124, 58, 237, 0.2)';
                  iconSvg = '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>';
              } else if (r.category === 'Improvement') {
                  iconColor = '#4F8CFF';
                  iconBg = 'rgba(79, 140, 255, 0.2)';
                  iconSvg = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>';
              } else if (r.category === 'Bugfix') {
                  iconColor = 'var(--success-color)';
                  iconBg = 'rgba(34, 197, 94, 0.2)';
                  iconSvg = '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>';
              }

              html += `
                  <div style="display: flex; gap: 1.5rem; position: relative; z-index: 1;">
                      <div style="width: 40px; height: 40px; border-radius: 50%; background: ${iconBg}; border: 1px solid ${iconColor}; display: flex; align-items: center; justify-content: center; color: ${iconColor}; flex-shrink: 0;">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">${iconSvg}</svg>
                  </div>
                  <div class="glass-card" style="flex: 1; padding: 2rem; position: relative;">
                      ${r.is_pinned ? `<div style="position: absolute; top: -12px; right: 2rem; background: var(--secondary-color); color: white; padding: 0.2rem 0.8rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);">Pinned</div>` : ''}
                      
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                          <div style="font-size: 0.85rem; color: ${iconColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${dateStr} Release</div>
                          ${!r.is_read ? `<button onclick="(window as any).markUpdateRead('${r.id}')" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">Mark Read</button>` : `<div style="font-size: 0.75rem; color: var(--text-secondary);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg>Read</div>`}
                      </div>
                      
                      <h2 style="font-size: 1.5rem; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.75rem;">
                          ${r.title}
                          <span style="font-size: 0.7rem; font-weight: 500; background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">v${r.version}</span>
                      </h2>
                      
                      <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">${r.summary}</p>
                      
                      <div style="display: flex; gap: 1rem;">
                          <span style="background: rgba(255,255,255,0.05); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem;">${r.category}</span>
                      </div>
                  </div>
              </div>
              `;
          });

          container.innerHTML = html;

      } catch (err) {
          console.error(err);
          showToast('Failed to load updates', 'error');
      }
  };

  (window as any).markUpdateRead = async (id: string) => {
      try {
          await api.post(`/updates/${id}/read`, {});
          loadUpdates();
      } catch (err) {
          console.error(err);
      }
  };

  setTimeout(loadUpdates, 100);
}
