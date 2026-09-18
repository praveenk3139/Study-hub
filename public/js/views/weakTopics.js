// Weak Topics View Controller matching Screenshot 2 Mockup
const WeakTopicsView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
        <div class="pulse-indicator" style="width: 24px; height: 24px;"></div>
      </div>
    `;

    try {
      const data = await api.get('/weak-topics');
      const topics = data.topics || [];
      const summary = data.summary || { total_weak: 3, needs_practice: 2, strong: 5 };

      container.innerHTML = `
        <div style="max-width: 1000px; margin: 0 auto;">
          <!-- Header Section -->
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px;">
            <div style="font-size: 32px; background: #fee2e2; width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center;">
              🧠
            </div>
            <div>
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">
                Weak Topics
              </h2>
              <p style="font-size: 14px; color: var(--text-secondary);">
                Focus on your weak areas and improve step by step.
              </p>
            </div>
          </div>

          <!-- Summary Statistics Counters -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px;">
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-subtle);">
              <div style="width: 44px; height: 44px; background: #fee2e2; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                ⚠️
              </div>
              <div>
                <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Total Weak Topics</div>
                <div style="font-size: 26px; font-weight: 800; color: #ef4444;">${summary.total_weak}</div>
              </div>
            </div>

            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-subtle);">
              <div style="width: 44px; height: 44px; background: #fef3c7; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                ⚠️
              </div>
              <div>
                <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Needs Practice</div>
                <div style="font-size: 26px; font-weight: 800; color: #d97706;">${summary.needs_practice}</div>
              </div>
            </div>

            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-subtle);">
              <div style="width: 44px; height: 44px; background: #dcfce7; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                🟢
              </div>
              <div>
                <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Strong</div>
                <div style="font-size: 26px; font-weight: 800; color: #16a34a;">${summary.strong}</div>
              </div>
            </div>
          </div>

          <!-- Topic Cards List -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${topics.map(t => {
              let icon = '🌲';
              if (t.topic_name.includes('Graph')) icon = '🔀';
              else if (t.topic_name.includes('Bayes')) icon = '⚙️';
              else if (t.topic_name.includes('Norm')) icon = '💾';
              else if (t.topic_name.includes('Memory')) icon = '⚙️';

              let statusBadge = '<span style="background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 12px;">● Weak</span>';
              let barColor = '#ef4444';

              if (t.status === 'needs_practice') {
                statusBadge = '<span style="background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 12px;">● Needs Practice</span>';
                barColor = '#f59e0b';
              } else if (t.status === 'strong') {
                statusBadge = '<span style="background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 12px;">◆ Strong</span>';
                barColor = '#10b981';
              }

              return `
                <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; box-shadow: var(--shadow-subtle);">
                  
                  <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                    <div style="width: 46px; height: 46px; background: #ecfdf5; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                      ${icon}
                    </div>
                    
                    <div style="flex: 1;">
                      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                        <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 0;">
                          ${t.topic_name}
                        </h3>
                        ${statusBadge}
                      </div>
                      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">
                        ${t.subject_name} • ${t.unit_name}
                      </div>

                      <!-- Progress Bar -->
                      <div style="display: flex; align-items: center; gap: 12px; max-width: 320px;">
                        <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Accuracy: ${t.accuracy_pct}%</span>
                        <div style="flex: 1; background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                          <div style="background: ${barColor}; width: ${t.accuracy_pct}%; height: 100%; border-radius: 3px;"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Buttons -->
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="window.location.hash='#revision-session?topic=${encodeURIComponent(t.topic_name)}'" style="background: #4f46e5; color: #ffffff; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'">
                      Revise Now
                    </button>
                    <button onclick="WeakTopicsView.startPractice('${t.topic_name}')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                      Practice
                    </button>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Weak topics render error:', err);
    }
  },

  startPractice(topic) {
    window.location.hash = `#tests?topic=${encodeURIComponent(topic)}`;
  }
};
