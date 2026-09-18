// Exam Readiness View Controller
const ExamReadinessView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 32px; box-shadow: var(--shadow-subtle);">
        
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="font-size: 48px; margin-bottom: 8px;">🎯</div>
          <h2 style="font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
            Exam Readiness Report
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Estimated readiness score calculated from topic completion, test performance, revision history, and weak topics.
          </p>
        </div>

        <!-- Meter Gauge Card -->
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); border: 1px solid #c7d2fe; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <div style="font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            Current Preparation Score
          </div>
          <div style="font-size: 48px; font-weight: 800; color: #1d4ed8; margin-bottom: 8px;">
            78% Prepared
          </div>

          <div style="background: rgba(255, 255, 255, 0.8); height: 12px; border-radius: 6px; overflow: hidden; max-width: 400px; margin: 0 auto 12px auto;">
            <div style="background: #4f46e5; width: 78%; height: 100%; border-radius: 6px;"></div>
          </div>
          
          <p style="font-size: 12px; color: #3b82f6; font-weight: 500;">
            Estimated based on 14 completed topics and 8 diagnostic test attempts.
          </p>
        </div>

        <!-- Priority Focus Areas -->
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;">
          ⚠️ Key Focus Areas to Reach 90%+
        </h3>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fee2e2; border-radius: 10px; border: 1px solid #fca5a5;">
            <span style="font-size: 14px; font-weight: 700; color: #dc2626;">1. Trees & Height Balance Invariants (45% Accuracy)</span>
            <button onclick="window.location.hash='#revision-session?topic=Trees'" style="background: #dc2626; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">Revise Now</button>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fef3c7; border-radius: 10px; border: 1px solid #fde68a;">
            <span style="font-size: 14px; font-weight: 700; color: #b45309;">2. Normalization 3NF/BCNF Derivations (62% Accuracy)</span>
            <button onclick="window.location.hash='#revision-session?topic=Normalization'" style="background: #d97706; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">Revise Now</button>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fef3c7; border-radius: 10px; border: 1px solid #fde68a;">
            <span style="font-size: 14px; font-weight: 700; color: #b45309;">3. Naive Bayes Likelihood Estimation (68% Accuracy)</span>
            <button onclick="window.location.hash='#revision-session?topic=Naive%20Bayes'" style="background: #d97706; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">Revise Now</button>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="#analytics" style="color: #2563eb; font-size: 13.5px; font-weight: 700; text-decoration: none;">
            View Detailed Performance Analytics →
          </a>
        </div>

      </div>
    `;
  }
};
