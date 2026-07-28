import { router } from '../router';
import { createLayout } from '../components/layout';

export function renderSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';

  const content = `
    <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;">Search Results</h1>
        <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Found 3 results for "${query}"</p>
    </div>

    <!-- Results Section -->
    <div style="display: flex; flex-direction: column; gap: 1rem;">
        
        <div class="glass-card" style="padding: 1.5rem; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="display: flex; gap: 1rem; align-items: center;">
                <div style="width: 40px; height: 40px; background: rgba(79, 140, 255, 0.2); color: var(--primary-color); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Jane Doe</h3>
                        <span style="font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 4px;">Lead</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">VP Sales • Acme Corp • jane.doe@acme.com</div>
                </div>
            </div>
        </div>

        <div class="glass-card" style="padding: 1.5rem; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="display: flex; gap: 1rem; align-items: center;">
                <div style="width: 40px; height: 40px; background: rgba(34, 197, 94, 0.2); color: var(--success-color); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Acme Corp</h3>
                        <span style="font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 4px;">Company</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Enterprise Software • New York, NY • $24M ARR</div>
                </div>
            </div>
        </div>
        
        <div class="glass-card" style="padding: 1.5rem; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="display: flex; gap: 1rem; align-items: center;">
                <div style="width: 40px; height: 40px; background: rgba(124, 58, 237, 0.2); color: var(--secondary-color); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">AI Insight: Acme Expansion</h3>
                        <span style="font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 4px;">Insight</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Acme Corp is actively expanding their sales team...</div>
                </div>
            </div>
        </div>

    </div>
  `;
  
  router.mount(createLayout('/search', content));
}
