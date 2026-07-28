import { router } from '../router';
import { createLayout } from '../components/layout';

export function renderInsights() {
  const content = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
            <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;">AI Insights Feed</h1>
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Real-time signals and opportunities detected by SalesGenie AI.</p>
        </div>
        <div style="display: flex; gap: 1rem;">
            <select style="background: var(--card-bg); border: 1px solid var(--border-color); color: white; padding: 0.5rem 1rem; border-radius: var(--border-radius-md); outline: none;">
                <option>All Signals</option>
                <option>High Intent</option>
                <option>Risk</option>
                <option>Opportunities</option>
            </select>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
        
        <!-- Insight Card 1 -->
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); color: var(--danger-color); display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <span style="background: rgba(239, 68, 68, 0.15); color: var(--danger-color); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">High Intent</span>
            </div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600;">Globex Corp Expansion</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin: 0 0 1.5rem 0; flex: 1;">Globex Corp is actively hiring for 5 new Sales Director positions. This indicates a high likelihood of budget allocation for new sales tooling.</p>
            <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--text-secondary);">Detected 2h ago</span>
                <button onclick="navigate('/lead?id=2')" style="background: transparent; border: none; color: var(--primary-color); font-size: 0.85rem; font-weight: 600; cursor: pointer;">Take Action &rarr;</button>
            </div>
        </div>

        <!-- Insight Card 2 -->
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(79, 140, 255, 0.1); color: var(--primary-color); display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </div>
                <span style="background: rgba(79, 140, 255, 0.15); color: var(--primary-color); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Deal Risk</span>
            </div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600;">Umbrella Corp Stalling</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin: 0 0 1.5rem 0; flex: 1;">Engagement score for Umbrella Corp has dropped by 45% in the last two weeks. No replies to the last 3 emails.</p>
            <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--text-secondary);">Detected 1d ago</span>
                <button onclick="navigate('/lead?id=3')" style="background: transparent; border: none; color: var(--primary-color); font-size: 0.85rem; font-weight: 600; cursor: pointer;">Review Account &rarr;</button>
            </div>
        </div>

        <!-- Insight Card 3 -->
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(34, 197, 94, 0.1); color: var(--success-color); display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <span style="background: rgba(34, 197, 94, 0.15); color: var(--success-color); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Opportunity</span>
            </div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600;">Initech Web Activity</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin: 0 0 1.5rem 0; flex: 1;">Multiple decision makers from Initech have visited the pricing page 4 times today. Recommended to follow up immediately.</p>
            <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--text-secondary);">Detected 3h ago</span>
                <button onclick="navigate('/lead?id=4')" style="background: transparent; border: none; color: var(--primary-color); font-size: 0.85rem; font-weight: 600; cursor: pointer;">Draft Email &rarr;</button>
            </div>
        </div>

        <!-- Insight Card 4 -->
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(124, 58, 237, 0.1); color: var(--secondary-color); display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <span style="background: rgba(124, 58, 237, 0.15); color: var(--secondary-color); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">News Event</span>
            </div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600;">Stark Ind. Funding</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin: 0 0 1.5rem 0; flex: 1;">Stark Industries just announced a $50M Series C round. Great trigger event for a congratulatory outreach.</p>
            <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--text-secondary);">Detected 1w ago</span>
                <button onclick="navigate('/lead?id=5')" style="background: transparent; border: none; color: var(--primary-color); font-size: 0.85rem; font-weight: 600; cursor: pointer;">Draft Email &rarr;</button>
            </div>
        </div>
    </div>
  `;
  
  router.mount(createLayout('/insights', content));
}
