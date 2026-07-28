import './style.css';
import { router } from './router';
import './layoutLogic';
import { initLayoutDOM } from './layoutLogic';

window.addEventListener('route-mounted', () => {
    initLayoutDOM();
});

// Dummy Pages for now
import { renderLogin } from './pages/login';
import { renderDashboard } from './pages/dashboard';

import { renderLeadDetails } from './pages/lead_details';
import { renderLeads } from './pages/leads';
import { renderCompanies } from './pages/companies';
import { renderCompanyDetails } from './pages/company_details';
import { renderPipeline } from './pages/pipeline';
import { renderOutreach } from './pages/outreach';
import { renderConversations } from './pages/conversations';
import { renderTasks } from './pages/tasks';
import { renderCalendar } from './pages/calendar';
import { renderAnalytics } from './pages/analytics';
import { renderSearch } from './pages/search';
import { renderUpdates } from './pages/updates';
import { renderNotifications } from './pages/notifications';
import { renderSettings } from './pages/settings';
import { renderInsights } from './pages/insights';

router.addRoute('/', renderDashboard);
router.addRoute('/login', renderLogin);
router.addRoute('/lead', renderLeadDetails);
router.addRoute('/leads', renderLeads);
router.addRoute('/companies', renderCompanies);
router.addRoute('/company', renderCompanyDetails);
router.addRoute('/pipeline', renderPipeline);
router.addRoute('/outreach', renderOutreach);
router.addRoute('/conversations', renderConversations);
router.addRoute('/tasks', renderTasks);
router.addRoute('/calendar', renderCalendar);
router.addRoute('/analytics', renderAnalytics);
router.addRoute('/search', renderSearch);
router.addRoute('/updates', renderUpdates);
router.addRoute('/notifications', renderNotifications);
router.addRoute('/settings', renderSettings);
router.addRoute('/insights', renderInsights);
router.addRoute('/404', () => {
  router.mount(`<div style="text-align: center; padding: 50px;">
    <h1 style="color: var(--danger-color); font-size: 3rem;">404</h1>
    <p>Page Not Found</p>
    <button onclick="window.history.pushState({}, '', '/'); window.dispatchEvent(new Event('popstate'));" 
            style="margin-top: 20px; padding: 10px 20px; background: var(--accent-color); border: none; border-radius: 8px; color: white; cursor: pointer;">
      Go Home
    </button>
  </div>`);
});

// Init router
router.handleRoute();

// Global navigate helper for inline onclicks
(window as any).navigate = (path: string) => {
  router.navigate(path);
};

// Global event delegation for dynamically inserted layout elements
import { api, showToast } from './api';

document.addEventListener('submit', async (e) => {
    const form = e.target as HTMLFormElement;
    if (form && form.id === 'addLeadForm') {
        e.preventDefault();
        
        const data = {
            company_name: (document.getElementById('lCompany') as HTMLInputElement).value.trim(),
            website: (document.getElementById('lWebsite') as HTMLInputElement).value,
            industry: (document.getElementById('lIndustry') as HTMLInputElement).value,
            country: (document.getElementById('lCountry') as HTMLInputElement).value,
            company_size: (document.getElementById('lSize') as HTMLSelectElement).value,
            annual_revenue: (document.getElementById('lRevenue') as HTMLInputElement).value,
            contact_first_name: (document.getElementById('lContactFirst') as HTMLInputElement).value.trim(),
            contact_last_name: (document.getElementById('lContactLast') as HTMLInputElement).value.trim(),
            email: (document.getElementById('lEmail') as HTMLInputElement).value.trim(),
            phone: (document.getElementById('lPhone') as HTMLInputElement).value,
            job_title: (document.getElementById('lJobTitle') as HTMLInputElement).value,
            linkedin_url: (document.getElementById('lLinkedIn') as HTMLInputElement).value,
            priority: (document.getElementById('lPriority') as HTMLSelectElement).value,
            source: (document.getElementById('lSource') as HTMLSelectElement).value,
            estimated_deal_value: parseFloat((document.getElementById('lDealValue') as HTMLInputElement).value || "0"),
            expected_close_date: (document.getElementById('lCloseDate') as HTMLInputElement).value || null,
            tags: (document.getElementById('lTags') as HTMLInputElement).value,
            notes: (document.getElementById('lNotes') as HTMLTextAreaElement).value,
        };

        if (!data.company_name) {
            showToast('Company Name is required', 'error');
            return;
        }
        if (!data.contact_first_name || !data.contact_last_name) {
            showToast('Contact First and Last Name are required', 'error');
            return;
        }
        if (!data.email) {
            showToast('Email Address is required', 'error');
            return;
        }

        try {
            await api.post('/leads', data);
            showToast('Lead created successfully!', 'success');
            (window as any).closeAddLeadModal();
            form.reset();
            if (window.location.hash === '#/' || window.location.hash === '') {
                renderDashboard();
            } else {
                window.location.reload();
            }
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    }
});

let debounceTimer: any;
document.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    if (input && input.id === 'cmdSearchInput') {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const val = input.value.trim();
            const resContainer = document.getElementById('searchResults');
            if (!resContainer) return;

            if (!val) {
                resContainer.innerHTML = '';
                return;
            }

            try {
                const res = await api.get(`/search?q=${encodeURIComponent(val)}`);
                if (res.results && res.results.length > 0) {
                    resContainer.innerHTML = res.results.map((r: any) => `
                        <div class="search-res-item" onclick="(window as any).navigate('${r.link}'); (window as any).closeSearchModal();">
                            <div style="font-weight: 500; font-size: 0.95rem; color: white;">${r.title}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">
                                <span style="background: rgba(124, 58, 237, 0.2); color: var(--secondary-color); padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.65rem; margin-right: 0.5rem;">${r.type}</span>
                                ${r.subtitle}
                            </div>
                        </div>
                    `).join('');
                } else {
                    resContainer.innerHTML = `<div style="padding: 1rem; color: var(--text-secondary); text-align: center;">No results found for "${val}"</div>`;
                }
            } catch (err) {
                console.error(err);
            }
        }, 300);
    }
});

(window as any).loadSearchHistory = async () => {
    try {
        const res = await api.get('/search/history');
        const resContainer = document.getElementById('searchResults');
        if (resContainer && res.history && res.history.length > 0) {
            resContainer.innerHTML = `
                <div style="padding: 0.5rem 1rem; font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.05em;">RECENT SEARCHES</div>
                ${res.history.map((h: string) => `
                    <div class="search-res-item" onclick="document.getElementById('cmdSearchInput').value = '${h}'; document.getElementById('cmdSearchInput').dispatchEvent(new Event('input', {bubbles:true}));">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span style="color: white; font-size: 0.95rem;">${h}</span>
                        </div>
                    </div>
                `).join('')}
            `;
        }
    } catch (err) {
        console.error("Failed to load search history", err);
    }
};
