import { router } from '../router';
import { createLayout } from '../components/layout';
import { getRevenueAnalytics, getFunnelAnalytics, exportReport, showToast, getDashboard } from '../api';
import { formatCurrency } from '../utils';

export function renderAnalytics() {
  const content = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
            <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;">Analytics & Reports</h1>
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Deep dive into your sales performance metrics.</p>
        </div>
        <div style="display: flex; gap: 1rem;">
            <select id="reportTimeframe" style="background: var(--card-bg); border: 1px solid var(--border-color); color: white; padding: 0.5rem 1rem; border-radius: var(--border-radius-md); outline: none;">
                <option value="this_quarter">This Quarter</option>
                <option value="last_quarter">Last Quarter</option>
                <option value="this_year">This Year</option>
            </select>
            <button class="gradient-btn" onclick="(window as any).handleExportReport()">Export Report</button>
        </div>
    </div>

    <!-- KPI Row -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
        <div class="glass-card" style="padding: 1.5rem;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Revenue Closed</div>
            <div style="font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem;" id="aRevClosed">$0</div>
        </div>
        <div class="glass-card" style="padding: 1.5rem;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Win Rate</div>
            <div style="font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem;" id="aWinRate">0%</div>
        </div>
        <div class="glass-card" style="padding: 1.5rem;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Avg Deal Size</div>
            <div style="font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem;" id="aAvgDeal">$0</div>
        </div>
        <div class="glass-card" style="padding: 1.5rem;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Sales Velocity</div>
            <div style="font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem;" id="aSalesVelocity">$0/day</div>
        </div>
    </div>

    <!-- Charts Row -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 2rem;">
        
        <!-- Revenue Chart -->
        <div class="glass-card" style="padding: 1.5rem; height: 350px; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 600;">Revenue Forecast</h3>
            <div id="revenueChart" style="flex: 1; position: relative;"></div>
        </div>

        <!-- Conversion Funnel -->
        <div class="glass-card" style="padding: 1.5rem; height: 350px; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 600;">Conversion Funnel</h3>
            <div id="funnelChart" style="flex: 1; position: relative;"></div>
        </div>
    </div>
  `;
  
  router.mount(createLayout('/analytics', content));

  (window as any).handleExportReport = async () => {
      try {
          const res = await exportReport('Executive Summary');
          showToast(res.message || 'Report generation started', 'success');
      } catch (e: any) {
          showToast(e.message || 'Failed to export report', 'error');
      }
  };

  loadAnalyticsData();
}

let revChartInstance: any = null;
let funnelChartInstance: any = null;

async function loadAnalyticsData() {
    try {
        // Fetch dashboard data for KPIs
        const dashData = await getDashboard('this_year');
        const kpis = dashData.kpis || {};
        document.getElementById('aRevClosed')!.innerText = formatCurrency(kpis.closed_won_revenue?.value || 0);
        document.getElementById('aWinRate')!.innerText = (kpis.win_rate?.value || 0) + '%';
        document.getElementById('aAvgDeal')!.innerText = formatCurrency(kpis.average_deal_value?.value || 0);
        document.getElementById('aSalesVelocity')!.innerText = formatCurrency(kpis.sales_velocity?.value || 0) + '/day';

        // Fetch Analytics Chart Data
        const [revRes, funnelRes] = await Promise.all([
            getRevenueAnalytics(),
            getFunnelAnalytics()
        ]);
        
        const ApexCharts = (window as any).ApexCharts;
        if (!ApexCharts) return;

        if (revChartInstance) revChartInstance.destroy();
        if (funnelChartInstance) funnelChartInstance.destroy();

        // Revenue Chart
        const revData = revRes.data || [];
        const revCategories = revData.map((r: any) => r.month);
        const revValues = revData.map((r: any) => r.revenue);
        
        const revOptions = {
            series: [{ name: 'Revenue', data: revValues }],
            chart: { type: 'area', height: 280, background: 'transparent', toolbar: { show: false } },
            theme: { mode: 'dark' },
            stroke: { curve: 'smooth', width: 2 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 90, 100] } },
            xaxis: { categories: revCategories, labels: { style: { colors: '#9ca3af' } } },
            yaxis: { labels: { style: { colors: '#9ca3af' }, formatter: (v: number) => formatCurrency(v) } },
            colors: ['#00C9A7'],
            dataLabels: { enabled: false }
        };
        revChartInstance = new ApexCharts(document.querySelector("#revenueChart"), revOptions);
        revChartInstance.render();

        // Funnel Chart
        const funnelData = funnelRes.data || [];
        const funnelCategories = funnelData.map((f: any) => f.stage);
        const funnelValues = funnelData.map((f: any) => f.count);

        const funnelOptions = {
            series: [{ name: 'Leads', data: funnelValues }],
            chart: { type: 'bar', height: 280, background: 'transparent', toolbar: { show: false } },
            theme: { mode: 'dark' },
            plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
            dataLabels: { enabled: true, style: { colors: ['#fff'] } },
            xaxis: { categories: funnelCategories, labels: { style: { colors: '#9ca3af' } } },
            yaxis: { labels: { style: { colors: '#9ca3af' } } },
            colors: ['#7c3aed']
        };
        funnelChartInstance = new ApexCharts(document.querySelector("#funnelChart"), funnelOptions);
        funnelChartInstance.render();

    } catch(e) {
        showToast('Failed to load analytics', 'error');
    }
}
