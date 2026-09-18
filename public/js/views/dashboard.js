// Dashboard View Controller matching Screenshot 1 Mockup
const DashboardView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
        <div class="pulse-indicator" style="width: 24px; height: 24px;"></div>
      </div>
    `;

    try {
      const [weakData, plannerData, profileData] = await Promise.all([
        api.get('/weak-topics').catch(() => ({ summary: { total_weak: 3, needs_practice: 2 } })),
        api.get('/planner').catch(() => ({ tasks: [] })),
        api.get('/auth/me').catch(() => ({ user: { username: 'praveen' }, profile: { full_name: 'Praveen Kumar' } }))
      ]);

      const user = profileData.profile || { full_name: 'Praveen Kumar' };
      const firstName = user.full_name ? user.full_name.split(' ')[0] : 'Praveen';
      const weakCount = weakData.summary ? weakData.summary.total_weak : 3;

      container.innerHTML = `
        <!-- Main Dashboard Layout Grid -->
        <div style="display: grid; grid-template-columns: 1fr 340px; gap: 24px;">
          
          <!-- Left Column (Main Content & Cards) -->
          <div>
            <!-- Hero Welcome Card with Graphic Illustration -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); border-radius: 20px; padding: 28px; margin-bottom: 24px; position: relative; overflow: hidden; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between;">
              <div style="max-width: 440px; z-index: 2;">
                <h1 style="font-size: 28px; font-weight: 800; color: #1e3a8a; margin-bottom: 8px;">
                  Hello, ${user.full_name || 'Praveen Kumar'}! 👋
                </h1>
                <p style="font-size: 15px; color: #3b82f6; font-weight: 500; margin-bottom: 16px;">
                  Keep going! Your goals are closer than you think.
                </p>
                <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(8px); padding: 8px 16px; border-radius: 20px; border: 1px solid #93c5fd; font-size: 13px; font-weight: 600; color: #1d4ed8;">
                  <span>💡</span> "Study Today for a Better Tomorrow"
                </div>
              </div>
              <div style="font-size: 90px; opacity: 0.9; line-height: 1; z-index: 1;">
                👨‍💻
              </div>
            </div>

            <!-- Top 4 Statistics Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
              
              <!-- 🧠 AI Performance -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 18px; box-shadow: var(--shadow-subtle);">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px;">
                  <span style="font-size: 18px; background: #f3e8ff; padding: 6px; border-radius: 8px;">🧠</span> AI Performance
                </div>
                <div style="font-size: 28px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                  72%
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Preparation</div>
                <div style="background: #e2e8f0; height: 6px; border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
                  <div style="background: #10b981; width: 72%; height: 100%; border-radius: 4px;"></div>
                </div>
                <a href="#analytics" style="font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                  View Details →
                </a>
              </div>

              <!-- 🎯 Exam Readiness -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 18px; box-shadow: var(--shadow-subtle);">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px;">
                  <span style="font-size: 18px; background: #e0e7ff; padding: 6px; border-radius: 8px;">🎯</span> Exam Readiness
                </div>
                <div style="font-size: 28px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                  78%
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Prepared</div>
                <div style="background: #e2e8f0; height: 6px; border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
                  <div style="background: #6366f1; width: 78%; height: 100%; border-radius: 4px;"></div>
                </div>
                <a href="#exam-readiness" style="font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                  View Details →
                </a>
              </div>

              <!-- ⚠️ Weak Topics -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 18px; box-shadow: var(--shadow-subtle);">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px;">
                  <span style="font-size: 18px; background: #fee2e2; padding: 6px; border-radius: 8px;">⚠️</span> Weak Topics
                </div>
                <div style="font-size: 28px; font-weight: 800; color: #ef4444; margin-bottom: 4px;">
                  ${weakCount}
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 18px;">Topics Needs Attention</div>
                <a href="#weak-topics" style="font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                  View All →
                </a>
              </div>

              <!-- 🔄 Recommended Revision -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 18px; box-shadow: var(--shadow-subtle);">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px;">
                  <span style="font-size: 18px; background: #e0f2fe; padding: 6px; border-radius: 8px;">🔄</span> Recommended Revision
                </div>
                <div style="font-size: 28px; font-weight: 800; color: #0284c7; margin-bottom: 4px;">
                  2
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 18px;">Tasks Scheduled</div>
                <a href="#planner" style="font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                  View Plan →
                </a>
              </div>

            </div>

            <!-- Quick Access Section Header -->
            <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">
              Quick Access
            </h3>

            <!-- Quick Access Cards Grid -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
              
              <!-- My Study Card -->
              <div onclick="window.location.hash='#my-study'" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="width: 44px; height: 44px; background: #f3e8ff; color: #9333ea; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 12px;">
                  📚
                </div>
                <h4 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                  My Study
                </h4>
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
                  Access your subjects, syllabus, and study materials.
                </p>
                <span style="font-size: 13px; font-weight: 700; color: #9333ea; display: inline-flex; align-items: center; gap: 4px;">
                  Explore →
                </span>
              </div>

              <!-- PDF Analysis Card -->
              <div onclick="window.location.hash='#pdf-lab'" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="width: 44px; height: 44px; background: #ffe4e6; color: #e11d48; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 12px;">
                  📄
                </div>
                <h4 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                  PDF Analysis
                </h4>
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
                  Get summary, important questions, formulas & flashcards.
                </p>
                <span style="font-size: 13px; font-weight: 700; color: #e11d48; display: inline-flex; align-items: center; gap: 4px;">
                  Upload PDF →
                </span>
              </div>

              <!-- Tests & Quizzes Card -->
              <div onclick="window.location.hash='#tests'" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="width: 44px; height: 44px; background: #dcfce7; color: #16a34a; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 12px;">
                  📝
                </div>
                <h4 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                  Tests & Quizzes
                </h4>
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
                  Practice AI-generated unit tests and improve your score.
                </p>
                <span style="font-size: 13px; font-weight: 700; color: #16a34a; display: inline-flex; align-items: center; gap: 4px;">
                  Take Test →
                </span>
              </div>

              <!-- AI Assistant Card -->
              <div onclick="window.location.hash='#ai-agent'" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="width: 44px; height: 44px; background: #dbeafe; color: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 12px;">
                  🤖
                </div>
                <h4 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                  AI Assistant
                </h4>
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
                  Ask doubts, voice questions, and get step-by-step solutions.
                </p>
                <span style="font-size: 13px; font-weight: 700; color: #2563eb; display: inline-flex; align-items: center; gap: 4px;">
                  Ask Doubt →
                </span>
              </div>

            </div>
          </div>

          <!-- Right Column (Study Plan & Quick Links) -->
          <div>
            
            <!-- Today's Study Plan Card -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow-subtle);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">
                  📅 Today's Study Plan
                </h3>
                <a href="#planner" style="font-size: 12px; color: #2563eb; text-decoration: none; font-weight: 600;">View All</a>
              </div>

              <!-- Task Checkbox Items -->
              <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface-elevated); border-radius: 10px; border: 1px solid var(--border-subtle);" onclick="window.location.hash='#revision-session?topic=Trees'">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" style="width: 18px; height: 18px; cursor: pointer;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Revise Trees — 30 min</span>
                  </div>
                  <span style="font-size: 12px; color: var(--text-muted);">›</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface-elevated); border-radius: 10px; border: 1px solid var(--border-subtle);">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" style="width: 18px; height: 18px; cursor: pointer;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Practice Graphs — 20 min</span>
                  </div>
                  <span style="font-size: 12px; color: var(--text-muted);">›</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface-elevated); border-radius: 10px; border: 1px solid var(--border-subtle);">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" style="width: 18px; height: 18px; cursor: pointer;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Take Unit 2 Mini Test — 15 min</span>
                  </div>
                  <span style="font-size: 12px; color: var(--text-muted);">›</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #ecfdf5; border-radius: 10px; border: 1px solid #a7f3d0;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" checked style="width: 18px; height: 18px; cursor: pointer;">
                    <span style="font-size: 13px; font-weight: 600; color: #047857; text-decoration: line-through;">Complete Searching revision</span>
                  </div>
                  <span style="font-size: 12px; color: #047857;">✓</span>
                </div>

              </div>

              <!-- Overall Progress Bar -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">
                  <span>Overall Progress</span>
                  <span style="color: #10b981;">60%</span>
                </div>
                <div style="background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="background: #10b981; width: 60%; height: 100%; border-radius: 4px;"></div>
                </div>
              </div>

            </div>

            <!-- Quick Links List Card -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow-subtle);">
              <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                <span>🔗</span> Quick Links
              </h3>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <a href="#pdf-lab" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; text-decoration: none; color: var(--text-primary); font-size: 13px; font-weight: 600; border-radius: 8px; transition: background 0.15s;" onmouseover="this.style.background='var(--bg-surface-hover)'" onmouseout="this.style.background='none'">
                  <span>📤 Upload PDF</span>
                  <span style="color: var(--text-muted);">›</span>
                </a>
                <a href="#tests" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; text-decoration: none; color: var(--text-primary); font-size: 13px; font-weight: 600; border-radius: 8px; transition: background 0.15s;" onmouseover="this.style.background='var(--bg-surface-hover)'" onmouseout="this.style.background='none'">
                  <span>📝 View Previous Tests</span>
                  <span style="color: var(--text-muted);">›</span>
                </a>
                <a href="#ai-agent" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; text-decoration: none; color: var(--text-primary); font-size: 13px; font-weight: 600; border-radius: 8px; transition: background 0.15s;" onmouseover="this.style.background='var(--bg-surface-hover)'" onmouseout="this.style.background='none'">
                  <span>🤖 Ask AI Doubt</span>
                  <span style="color: var(--text-muted);">›</span>
                </a>
                <a href="#social" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; text-decoration: none; color: var(--text-primary); font-size: 13px; font-weight: 600; border-radius: 8px; transition: background 0.15s;" onmouseover="this.style.background='var(--bg-surface-hover)'" onmouseout="this.style.background='none'">
                  <span>👥 My Friends</span>
                  <span style="color: var(--text-muted);">›</span>
                </a>
              </div>
            </div>

            <!-- Encouragement Champion Banner -->
            <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 1px solid #e9d5ff; border-radius: 16px; padding: 18px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 6px;">🏆</div>
              <h4 style="font-size: 15px; font-weight: 700; color: #7e22ce; margin-bottom: 4px;">
                You are doing great!
              </h4>
              <p style="font-size: 12px; color: #9333ea; font-weight: 500;">
                Keep going, champion!
              </p>
            </div>

          </div>

        </div>
      `;
    } catch (err) {
      console.error('Dashboard render error:', err);
    }
  }
};
