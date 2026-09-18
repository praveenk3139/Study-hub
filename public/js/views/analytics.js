// Analytics View Controller matching Screenshot 4 Mockup
const AnalyticsView = {
  activeTab: 'overview',

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
        <div class="pulse-indicator" style="width: 24px; height: 24px;"></div>
      </div>
    `;

    try {
      const data = await api.get('/weak-topics').catch(() => ({ topics: [] }));
      const topics = data.topics || [];

      container.innerHTML = `
        <div style="max-width: 1100px; margin: 0 auto;">
          <!-- Header -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
              Performance Analytics
            </h2>
            <p style="font-size: 14px; color: var(--text-secondary);">
              Track your progress and find areas to improve.
            </p>
          </div>

          <!-- Tabs (Overview | Subject Performance | Topic Performance) -->
          <div style="display: flex; gap: 8px; border-bottom: 2px solid var(--border-subtle); padding-bottom: 8px; margin-bottom: 24px;">
            <button onclick="AnalyticsView.setTab('overview')" style="background: ${this.activeTab === 'overview' ? '#dbeafe' : 'none'}; color: ${this.activeTab === 'overview' ? '#2563eb' : 'var(--text-secondary)'}; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;">
              Overview
            </button>
            <button onclick="AnalyticsView.setTab('subjects')" style="background: ${this.activeTab === 'subjects' ? '#dbeafe' : 'none'}; color: ${this.activeTab === 'subjects' ? '#2563eb' : 'var(--text-secondary)'}; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;">
              Subject Performance
            </button>
            <button onclick="AnalyticsView.setTab('topics')" style="background: ${this.activeTab === 'topics' ? '#dbeafe' : 'none'}; color: ${this.activeTab === 'topics' ? '#2563eb' : 'var(--text-secondary)'}; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;">
              Topic Performance
            </button>
          </div>

          <!-- Overview Grid (Subject Table + Overall Doughnut Gauge Chart) -->
          <div style="display: grid; grid-template-columns: 1fr 340px; gap: 24px; margin-bottom: 28px;">
            
            <!-- Subject Performance Table -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-subtle);">
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">
                Subject Performance
              </h3>

              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); text-transform: uppercase;">
                    <th style="padding: 10px 0;">Subject</th>
                    <th style="padding: 10px 0;">Score</th>
                    <th style="padding: 10px 0;">Status</th>
                  </tr>
                </thead>
                <tbody style="font-size: 13.5px;">
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 14px 0; font-weight: 600; color: var(--text-primary);">Data Structures</td>
                    <td style="padding: 14px 0; font-weight: 700; color: #d97706;">72%</td>
                    <td style="padding: 14px 0;">
                      <span style="background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 10px;">● Needs Practice</span>
                    </td>
                  </tr>

                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 14px 0; font-weight: 600; color: var(--text-primary);">Machine Learning</td>
                    <td style="padding: 14px 0; font-weight: 700; color: #16a34a;">84%</td>
                    <td style="padding: 14px 0;">
                      <span style="background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 10px;">◆ Strong</span>
                    </td>
                  </tr>

                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 14px 0; font-weight: 600; color: var(--text-primary);">DBMS</td>
                    <td style="padding: 14px 0; font-weight: 700; color: #dc2626;">46%</td>
                    <td style="padding: 14px 0;">
                      <span style="background: #fee2e2; color: #dc2626; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 10px;">● Weak</span>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 14px 0; font-weight: 600; color: var(--text-primary);">Operating Systems</td>
                    <td style="padding: 14px 0; font-weight: 700; color: #16a34a;">78%</td>
                    <td style="padding: 14px 0;">
                      <span style="background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 10px;">◆ Strong</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Overall Progress Doughnut SVG Gauge Card -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; text-align: center; box-shadow: var(--shadow-subtle); display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">
                Overall Progress
              </h3>

              <!-- SVG Doughnut Ring Gauge -->
              <div style="position: relative; width: 160px; height: 160px; margin-bottom: 16px;">
                <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" stroke-width="3.5" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" stroke-width="3.5" stroke-dasharray="72, 100" stroke-linecap="round" />
                </svg>

                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <span style="font-size: 28px; font-weight: 800; color: var(--text-primary);">72%</span>
                  <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Preparation</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Topic Performance Table -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-subtle);">
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">
              Topic Performance
            </h3>

            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); text-transform: uppercase;">
                  <th style="padding: 10px 0;">Topic</th>
                  <th style="padding: 10px 0;">Accuracy</th>
                  <th style="padding: 10px 0;">Attempts</th>
                  <th style="padding: 10px 0;">Last Tested</th>
                  <th style="padding: 10px 0;">Improvement</th>
                  <th style="padding: 10px 0;">Status</th>
                </tr>
              </thead>
              <tbody style="font-size: 13.5px;">
                ${topics.map(t => {
                  let badge = '<span style="background: #fee2e2; color: #dc2626; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 10px;">● Weak</span>';
                  if (t.status === 'needs_practice') {
                    badge = '<span style="background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 10px;">● Needs Practice</span>';
                  } else if (t.status === 'strong') {
                    badge = '<span style="background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 10px;">◆ Strong</span>';
                  }

                  const lastTestedStr = t.last_tested ? new Date(t.last_tested).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 Sep 2025';

                  return `
                    <tr style="border-bottom: 1px solid var(--border-subtle);">
                      <td style="padding: 14px 0; font-weight: 600; color: var(--text-primary);">${t.topic_name}</td>
                      <td style="padding: 14px 0; font-weight: 700; color: ${t.accuracy_pct >= 80 ? '#16a34a' : (t.accuracy_pct >= 60 ? '#d97706' : '#dc2626')};">${t.accuracy_pct}%</td>
                      <td style="padding: 14px 0; color: var(--text-secondary);">${t.attempts}</td>
                      <td style="padding: 14px 0; color: var(--text-secondary);">${lastTestedStr}</td>
                      <td style="padding: 14px 0; font-weight: 700; color: #16a34a;">+${t.improvement_pct || 15}%</td>
                      <td style="padding: 14px 0;">${badge}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

        </div>
      `;
    } catch (err) {
      console.error('Analytics render error:', err);
    }
  },

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  }
};
