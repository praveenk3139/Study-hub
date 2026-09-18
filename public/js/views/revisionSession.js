// Revision Session View Controller matching Screenshot 3 Mockup
const RevisionSessionView = {
  currentTopic: 'Trees',
  activeStep: 1, // 1: Quick Revision, 2: Key Concepts, 3: Formulas, 4: Mistakes, 5: Examples, 6: Practice, 7: Mini Test
  revisionData: null,
  userMiniAnswers: {},

  async render() {
    const container = document.getElementById('view-content');
    
    // Parse topic parameter from hash URL e.g. #revision-session?topic=Trees
    const hashParts = window.location.hash.split('?topic=');
    if (hashParts.length > 1) {
      this.currentTopic = decodeURIComponent(hashParts[1]);
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
        <div class="pulse-indicator" style="width: 24px; height: 24px;"></div>
      </div>
    `;

    try {
      this.revisionData = await api.get(`/revision/${encodeURIComponent(this.currentTopic)}`);
      this.renderSessionUI();
    } catch (err) {
      console.error('Revision session load error:', err);
    }
  },

  renderSessionUI() {
    const container = document.getElementById('view-content');
    const data = this.revisionData || {
      topic: 'Trees',
      subject: 'Data Structures',
      unit: 'Unit 2',
      revisionText: 'A tree is a non-linear data structure that consists of nodes connected by edges.',
      keyPoints: ['Root node (topmost node)', 'Parent and child relationship', 'Leaf node (no children)', 'Binary tree (max 2 children)']
    };

    container.innerHTML = `
      <div style="max-width: 1100px; margin: 0 auto;">
        
        <!-- Top Session Title & Subtitle -->
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
            Revision Session
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">
            ${data.topic} • ${data.subject} • ${data.unit}
          </p>
        </div>

        <!-- Stepper Bar (1. Quick Revision -> 2. Practice Questions -> 3. Mini Test -> 4. Results) -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 16px 28px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-subtle);">
          
          <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="RevisionSessionView.setStep(1)">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #10b981; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 14px;">1</div>
            <span style="font-size: 14px; font-weight: 700; color: #10b981;">Quick Revision</span>
          </div>

          <div style="flex: 1; height: 2px; background: #e2e8f0; margin: 0 16px;"></div>

          <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="RevisionSessionView.setStep(6)">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${this.activeStep >= 6 ? '#10b981' : '#cbd5e1'}; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 14px;">2</div>
            <span style="font-size: 14px; font-weight: 600; color: ${this.activeStep >= 6 ? '#10b981' : 'var(--text-muted)'};">Practice Questions</span>
          </div>

          <div style="flex: 1; height: 2px; background: #e2e8f0; margin: 0 16px;"></div>

          <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="RevisionSessionView.setStep(7)">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${this.activeStep >= 7 ? '#10b981' : '#cbd5e1'}; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 14px;">3</div>
            <span style="font-size: 14px; font-weight: 600; color: ${this.activeStep >= 7 ? '#10b981' : 'var(--text-muted)'};">Mini Test</span>
          </div>

          <div style="flex: 1; height: 2px; background: #e2e8f0; margin: 0 16px;"></div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #cbd5e1; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 14px;">4</div>
            <span style="font-size: 14px; font-weight: 600; color: var(--text-muted);">Results</span>
          </div>

        </div>

        <!-- Session Content Container (Left Subnav + Right Panel) -->
        <div style="display: grid; grid-template-columns: 240px 1fr; gap: 24px;">
          
          <!-- Left Sub-Navigation Menu -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 12px; height: fit-content; box-shadow: var(--shadow-subtle);">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <button onclick="RevisionSessionView.setStep(1)" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; border: none; border-radius: 10px; text-align: left; font-size: 13px; font-weight: 700; cursor: pointer; background: ${this.activeStep === 1 ? '#dbeafe' : 'none'}; color: ${this.activeStep === 1 ? '#2563eb' : 'var(--text-secondary)'};">
                <span>💧</span> Quick Revision
              </button>
              <button onclick="RevisionSessionView.setStep(2)" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; border: none; border-radius: 10px; text-align: left; font-size: 13px; font-weight: 700; cursor: pointer; background: ${this.activeStep === 2 ? '#dbeafe' : 'none'}; color: ${this.activeStep === 2 ? '#2563eb' : 'var(--text-secondary)'};">
                <span>🔑</span> Key Concepts
              </button>
              <button onclick="RevisionSessionView.setStep(3)" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; border: none; border-radius: 10px; text-align: left; font-size: 13px; font-weight: 700; cursor: pointer; background: ${this.activeStep === 3 ? '#dbeafe' : 'none'}; color: ${this.activeStep === 3 ? '#2563eb' : 'var(--text-secondary)'};">
                <span>📝</span> Formulas / Definitions
              </button>
              <button onclick="RevisionSessionView.setStep(4)" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; border: none; border-radius: 10px; text-align: left; font-size: 13px; font-weight: 700; cursor: pointer; background: ${this.activeStep === 4 ? '#dbeafe' : 'none'}; color: ${this.activeStep === 4 ? '#2563eb' : 'var(--text-secondary)'};">
                <span>⚠️</span> Common Mistakes
              </button>
              <button onclick="RevisionSessionView.setStep(5)" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; border: none; border-radius: 10px; text-align: left; font-size: 13px; font-weight: 700; cursor: pointer; background: ${this.activeStep === 5 ? '#dbeafe' : 'none'}; color: ${this.activeStep === 5 ? '#2563eb' : 'var(--text-secondary)'};">
                <span>💡</span> Examples
              </button>
              <button onclick="RevisionSessionView.setStep(6)" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; border: none; border-radius: 10px; text-align: left; font-size: 13px; font-weight: 700; cursor: pointer; background: ${this.activeStep === 6 ? '#dbeafe' : 'none'}; color: ${this.activeStep === 6 ? '#2563eb' : 'var(--text-secondary)'};">
                <span>❓</span> Practice Questions
              </button>
              <button onclick="RevisionSessionView.setStep(7)" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; border: none; border-radius: 10px; text-align: left; font-size: 13px; font-weight: 700; cursor: pointer; background: ${this.activeStep === 7 ? '#dbeafe' : 'none'}; color: ${this.activeStep === 7 ? '#2563eb' : 'var(--text-secondary)'};">
                <span>🎯</span> Mini Test
              </button>
            </div>
          </div>

          <!-- Right Main Content Panel -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 28px; box-shadow: var(--shadow-subtle);">
            ${this.renderStepContent(data)}
          </div>

        </div>
      </div>
    `;
  },

  renderStepContent(data) {
    if (this.activeStep === 1) {
      return `
        <!-- Quick Revision Step -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">
            1. Quick Revision
          </h3>
          <span style="background: #f3e8ff; color: #7e22ce; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
            ⚡ Powered by AI
          </span>
        </div>

        <p style="font-size: 14.5px; color: var(--text-primary); line-height: 1.6; margin-bottom: 20px;">
          ${data.revisionText}
        </p>

        <!-- Key Points Box -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
          <h4 style="font-size: 14px; font-weight: 700; color: #1e40af; margin-bottom: 12px;">
            Key Points
          </h4>
          <ul style="margin-left: 20px; font-size: 13.5px; color: #1e3a8a; line-height: 1.8;">
            ${(data.keyPoints || []).map(kp => `<li>${kp}</li>`).join('')}
          </ul>
        </div>

        <!-- Interactive Visual Tree Diagram (Matching Screenshot 3 Diagram) -->
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <h5 style="font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
            Interactive Tree Concept Diagram
          </h5>

          <!-- SVG Visual Tree Representation -->
          <div style="display: inline-block; position: relative; width: 280px; height: 170px;">
            <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
              <!-- Edge Lines -->
              <line x1="140" y1="20" x2="80" y2="70" stroke="#94a3b8" stroke-width="2" />
              <line x1="140" y1="20" x2="200" y2="70" stroke="#94a3b8" stroke-width="2" />
              <line x1="80" y1="70" x2="40" y2="120" stroke="#94a3b8" stroke-width="2" />
              <line x1="80" y1="70" x2="110" y2="120" stroke="#94a3b8" stroke-width="2" />
              <line x1="200" y1="70" x2="170" y2="120" stroke="#94a3b8" stroke-width="2" />
              <line x1="200" y1="70" x2="240" y2="120" stroke="#94a3b8" stroke-width="2" />
            </svg>

            <!-- Nodes -->
            <div style="position: absolute; top: 5px; left: 125px; z-index: 2; width: 30px; height: 30px; background: #3b82f6; color: #fff; border-radius: 50%; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(59,130,246,0.3);">A</div>

            <div style="position: absolute; top: 55px; left: 65px; z-index: 2; width: 30px; height: 30px; background: #10b981; color: #fff; border-radius: 50%; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">B</div>
            <div style="position: absolute; top: 55px; left: 185px; z-index: 2; width: 30px; height: 30px; background: #10b981; color: #fff; border-radius: 50%; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">C</div>

            <div style="position: absolute; top: 105px; left: 25px; z-index: 2; width: 30px; height: 30px; background: #8b5cf6; color: #fff; border-radius: 50%; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center;">D</div>
            <div style="position: absolute; top: 105px; left: 95px; z-index: 2; width: 30px; height: 30px; background: #8b5cf6; color: #fff; border-radius: 50%; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center;">E</div>
            <div style="position: absolute; top: 105px; left: 155px; z-index: 2; width: 30px; height: 30px; background: #8b5cf6; color: #fff; border-radius: 50%; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center;">F</div>
            <div style="position: absolute; top: 105px; left: 225px; z-index: 2; width: 30px; height: 30px; background: #8b5cf6; color: #fff; border-radius: 50%; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center;">G</div>
          </div>
        </div>

        <!-- Footer Control Buttons -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button onclick="window.location.hash='#weak-topics'" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer;">
            ← Back
          </button>
          <button onclick="RevisionSessionView.setStep(2)" style="background: #2563eb; color: #ffffff; border: none; padding: 10px 22px; border-radius: 10px; font-weight: 700; cursor: pointer;">
            Next: Key Concepts →
          </button>
        </div>
      `;
    }

    if (this.activeStep === 7) {
      // Mini Test Step
      const qList = data.miniTestQuestions || [];
      return `
        <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
          🎯 Mini Retest Sprint
        </h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 24px;">
          Answer these 3 questions focused on ${data.topic} to retest your mastery and update your topic status.
        </p>

        <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 28px;">
          ${qList.map((q, idx) => `
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px;">
              <div style="font-weight: 700; font-size: 14.5px; color: var(--text-primary); margin-bottom: 12px;">
                ${idx + 1}. ${q.question}
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${q.options.map(opt => `
                  <label style="display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: var(--text-primary); cursor: pointer; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-surface);">
                    <input type="radio" name="mini_q_${q.id}" value="${opt}" onchange="RevisionSessionView.userMiniAnswers[${q.id}]='${opt}'">
                    <span>${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <button onclick="RevisionSessionView.submitMiniTest()" style="background: #10b981; color: #ffffff; border: none; padding: 12px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; width: 100%;">
          Submit Retest & Update Score
        </button>
      `;
    }

    // Default step content (Key concepts, formulas, mistakes, examples, practice)
    return `
      <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
        Topic Revision: ${data.topic}
      </h3>
      <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <ul style="margin-left: 20px; line-height: 1.8; color: #1e3a8a;">
          ${(data.formulas || data.keyPoints || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <button onclick="RevisionSessionView.setStep(${Math.max(1, this.activeStep - 1)})" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer;">← Previous</button>
        <button onclick="RevisionSessionView.setStep(${Math.min(7, this.activeStep + 1)})" style="background: #2563eb; color: #fff; border: none; padding: 10px 22px; border-radius: 10px; font-weight: 700; cursor: pointer;">Next Step →</button>
      </div>
    `;
  },

  setStep(step) {
    this.activeStep = step;
    this.renderSessionUI();
  },

  async submitMiniTest() {
    const qList = (this.revisionData && this.revisionData.miniTestQuestions) || [];
    let correct = 0;
    qList.forEach(q => {
      if (this.userMiniAnswers[q.id] === q.correct) correct++;
    });

    try {
      const res = await api.post(`/revision/${encodeURIComponent(this.currentTopic)}/retest`, {
        score: correct,
        total: qList.length
      });

      const container = document.getElementById('view-content');
      container.innerHTML = `
        <div style="max-width: 600px; margin: 40px auto; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 36px; text-align: center; box-shadow: var(--shadow-elevated);">
          <div style="font-size: 56px; margin-bottom: 12px;">🎉</div>
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
            Retest Completed!
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">
            Awesome job revising ${this.currentTopic}. Your accuracy has significantly improved!
          </p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-around; align-items: center;">
              <div>
                <div style="font-size: 12px; color: #166534; font-weight: 600;">Previous Score</div>
                <div style="font-size: 22px; font-weight: 800; color: #15803d;">${res.previous_score}%</div>
              </div>
              <div style="font-size: 24px; color: #16a34a;">→</div>
              <div>
                <div style="font-size: 12px; color: #166534; font-weight: 600;">Retest Score</div>
                <div style="font-size: 28px; font-weight: 800; color: #15803d;">${res.retest_score}%</div>
              </div>
            </div>
            <div style="margin-top: 12px; font-size: 14px; font-weight: 700; color: #16a34a;">
              Improvement: +${res.improvement_points} percentage points 📈
            </div>
          </div>

          <div style="display: flex; gap: 12px;">
            <button onclick="window.location.hash='#weak-topics'" style="flex: 1; background: #2563eb; color: #fff; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              Return to Weak Topics
            </button>
            <button onclick="window.location.hash='#analytics'" style="flex: 1; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              View Analytics
            </button>
          </div>
        </div>
      `;
    } catch (err) {
      alert('Error submitting retest: ' + err.message);
    }
  }
};
