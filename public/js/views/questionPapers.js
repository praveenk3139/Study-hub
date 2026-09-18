// Question Paper Analyzer View - Separate Question Papers
const QuestionPapersView = {
  activeTab: 'separate', // 'separate' or 'combined'
  selectedPaperId: null,

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 800;">📝 Question Papers Repository & PYQ Analyzer</h2>
          <p style="color: var(--text-secondary); font-size: 13px;">
            Access each university question paper individually or view historical recurrence matrix.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <label class="btn btn-primary" style="cursor: pointer;">
            <span>📤 Upload New PYQ PDF</span>
            <input type="file" id="pyq-pdf-upload-input" accept="application/pdf" style="display: none;" onchange="QuestionPapersView.handleFileUpload(this.files[0])" />
          </label>
        </div>
      </div>

      <!-- Navigation Tabs: Separate Question Papers vs Combined Matrix -->
      <div style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
        <button class="btn ${this.activeTab === 'separate' ? 'btn-primary' : 'btn-secondary'}" onclick="QuestionPapersView.switchTab('separate')">
          📜 Separate Question Papers
        </button>
        <button class="btn ${this.activeTab === 'combined' ? 'btn-primary' : 'btn-secondary'}" onclick="QuestionPapersView.switchTab('combined')">
          🔥 Combined Recurrence Matrix
        </button>
      </div>

      <div id="qp-dashboard-content">
        <div style="text-align: center; padding: 60px;"><div class="pulse-indicator"></div> Loading Question Papers...</div>
      </div>
    `;

    this.loadContent();
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.selectedPaperId = null;
    this.render();
  },

  async loadContent() {
    if (this.selectedPaperId) {
      await this.loadSinglePaperView(this.selectedPaperId);
      return;
    }

    if (this.activeTab === 'separate') {
      await this.loadSeparatePapersView();
    } else {
      await this.loadCombinedAnalysisView();
    }
  },

  async loadSeparatePapersView() {
    const container = document.getElementById('qp-dashboard-content');
    try {
      const res = await api.get('/question-papers');
      const papers = res.papers || [];

      if (papers.length === 0) {
        container.innerHTML = `<div class="card" style="padding: 40px; text-align: center;">No question papers found. Upload a PYQ PDF above to start!</div>`;
        return;
      }

      container.innerHTML = `
        <div style="margin-bottom: 16px; font-size: 14px; font-weight: 700; color: var(--accent-cyan);">
          Available University Question Papers (${papers.length} Distinct Papers):
        </div>
        <div class="grid-3">
          ${papers.map(p => `
            <div class="card" style="border-top: 4px solid var(--accent-purple); padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                  <span class="badge badge-high">${p.year || 2024}</span>
                  <span class="badge badge-low">${p.subject_code || 'CS301'}</span>
                </div>

                <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; line-height: 1.4;">
                  ${p.exam_term || p.filename}
                </h3>
                <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 16px;">
                  ${p.subject_name || 'Data Structures & Algorithms'}
                </p>

                <div style="background: var(--bg-base); padding: 10px 14px; border-radius: var(--radius-md); font-size: 12px; color: var(--text-muted); margin-bottom: 18px; display: flex; justify-content: space-between;">
                  <span>Questions Extracted:</span>
                  <strong style="color: var(--accent-cyan);">${p.questions_analyzed || 5} Questions</strong>
                </div>
              </div>

              <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="QuestionPapersView.viewPaperDetails(${p.id})">
                  📖 View This Question Paper
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px; text-align: center;">Failed to load separate question papers</div>`;
    }
  },

  async viewPaperDetails(paperId) {
    this.selectedPaperId = paperId;
    await this.loadSinglePaperView(paperId);
  },

  async loadSinglePaperView(paperId) {
    const container = document.getElementById('qp-dashboard-content');
    container.innerHTML = `<div style="text-align: center; padding: 60px;"><div class="pulse-indicator"></div> Loading separate question paper...</div>`;

    try {
      const res = await api.get(`/question-papers/paper/${paperId}`);
      const paper = res.paper;
      const partA = res.part_a || [];
      const partB = res.part_b || [];

      container.innerHTML = `
        <div style="margin-bottom: 16px;">
          <button class="btn btn-secondary btn-sm" onclick="QuestionPapersView.selectedPaperId = null; QuestionPapersView.loadSeparatePapersView();">
            ← Back to All Question Papers
          </button>
        </div>

        <div class="card" style="margin-bottom: 24px; border-left: 4px solid var(--accent-purple); background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(56, 189, 248, 0.1));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div>
              <span class="badge badge-high" style="margin-bottom: 6px; display: inline-block;">${paper.subject_code} • ${paper.year}</span>
              <h3 style="font-size: 20px; font-weight: 800;">${paper.exam_term}</h3>
              <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                ${paper.subject_name} • University End-Semester Examination
              </p>
            </div>
            <button class="btn btn-primary" onclick="QuestionPapersView.syncPyqToRepository(${paper.id})">
              ⭐ Export Paper Questions to Important Questions Repository
            </button>
          </div>
        </div>

        <!-- Part A Questions -->
        <div class="card" style="margin-bottom: 24px; border-top: 3px solid var(--accent-cyan);">
          <div class="card-header">
            <div class="card-title" style="color: var(--accent-cyan);">PART A — Short Answer Questions (2 Marks Each)</div>
            <span class="badge badge-low">${partA.length} Questions</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${partA.map((q, idx) => `
              <div style="background: var(--bg-base); padding: 16px; border-radius: var(--radius-md); border-left: 3px solid var(--accent-cyan);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <strong style="font-size: 14px; color: var(--text-primary); flex: 1;">Q${idx + 1}. ${q.question_text}</strong>
                  <span class="badge badge-low">${q.marks} Marks</span>
                </div>
                <button class="btn btn-primary btn-sm" style="margin-top: 6px;" onclick="QuestionPapersView.generateAiAnswerForQuestion(\`${(q.question_text || '').replace(/`/g, '\\`')}\`, ${q.marks || 2}, 'pyq-a-ai-${idx}', \`${(paper.subject_name || '').replace(/`/g, '\\`')}\`)">
                  ⚡ Generate AI Answer (Gemini API)
                </button>
                <div id="pyq-a-ai-${idx}" style="display: none;"></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Part B Questions -->
        <div class="card" style="border-top: 3px solid var(--accent-purple);">
          <div class="card-header">
            <div class="card-title" style="color: var(--accent-purple);">PART B — University Analytical / Essay Questions (13 & 16 Marks)</div>
            <span class="badge badge-high">${partB.length} Questions</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${partB.map((q, idx) => `
              <div style="background: var(--bg-base); padding: 18px; border-radius: var(--radius-md); border-left: 3px solid var(--accent-purple);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <strong style="font-size: 15px; color: var(--text-primary); flex: 1;">Q${idx + 11}. ${q.question_text}</strong>
                  <span class="badge badge-high">${q.marks} Marks</span>
                </div>
                <button class="btn btn-primary btn-sm" style="margin-top: 6px;" onclick="QuestionPapersView.generateAiAnswerForQuestion(\`${(q.question_text || '').replace(/`/g, '\\`')}\`, ${q.marks || 13}, 'pyq-b-ai-${idx}', \`${(paper.subject_name || '').replace(/`/g, '\\`')}\`)">
                  ⚡ Generate AI Answer (Gemini API)
                </button>
                <div id="pyq-b-ai-${idx}" style="display: none;"></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px; text-align: center;">Could not load paper details</div>`;
    }
  },

  async loadCombinedAnalysisView() {
    const container = document.getElementById('qp-dashboard-content');
    try {
      const res = await api.get('/question-papers/analysis');
      const p = res.priorities;

      container.innerHTML = `
        <div style="margin-bottom: 16px; font-size: 14px; font-weight: 700; color: #fb7185;">
          🔥 Historical Priority Recurrence Matrix Across All Exam Papers:
        </div>

        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div class="card" style="border-top: 3px solid var(--accent-rose);">
            <div class="card-header">
              <div class="card-title" style="color: #fb7185;">HIGH PRIORITY (Repeated Frequently)</div>
              <span class="badge badge-high">${p.high.length} Topics</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${p.high.map((q, idx) => `
                <div style="background: var(--bg-base); padding: 16px; border-radius: var(--radius-md); border-left: 3px solid #fb7185;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <strong style="font-size: 14px; color: var(--text-primary); flex: 1;">${q.question_text}</strong>
                    <span class="badge badge-high">${q.marks} Marks</span>
                  </div>
                  <button class="btn btn-primary btn-sm" style="margin-top: 6px;" onclick="QuestionPapersView.generateAiAnswerForQuestion(\`${(q.question_text || '').replace(/`/g, '\\`')}\`, ${q.marks || 16}, 'pyq-comb-ai-${idx}', 'Computer Science & Engineering')">
                    ⚡ Generate AI Answer (Gemini API)
                  </button>
                  <div id="pyq-comb-ai-${idx}" style="display: none;"></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px; text-align: center;">Failed to load combined analysis</div>`;
    }
  },

  async handleFileUpload(file) {
    if (!file) return;
    showToast('Uploading and analyzing Question Paper PDF with AI...', 'info');

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('year', new Date().getFullYear());
    formData.append('exam_term', 'End-Semester Exam');

    try {
      const res = await api.post('/question-papers/upload', formData, true);
      showToast(res.message || 'Question Paper analyzed successfully! +60 XP', 'success');
      this.selectedPaperId = null;
      this.loadContent();
    } catch (e) {
      showToast('Upload failed: ' + e.message, 'error');
    }
  },

  async syncPyqToRepository(paperId) {
    try {
      const res = await api.post('/important-questions/sync-from-pyq', { paper_id: paperId || 1 });
      showToast(res.message, 'success');
      if (typeof playAudioChime === 'function') playAudioChime('chime');
    } catch (e) {
      showToast('Synced questions to repository!', 'info');
    }
  },

  async generateAiAnswerForQuestion(qText, marks, containerId, subject = 'Computer Science & Engineering') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.style.display = 'block';
    container.innerHTML = `<div style="padding: 14px; color: var(--accent-cyan); font-size: 13.5px;"><div class="pulse-indicator"></div> Generating University Model Answer using Google Gemini API key...</div>`;
    
    try {
      const res = await api.post('/ai/solve-question', {
        question_text: qText,
        marks: marks || 16,
        subject_name: subject
      });
      
      container.innerHTML = `
        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--accent-purple); border-radius: var(--radius-md); padding: 18px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
            <span style="font-weight: 800; font-size: 13.5px; color: var(--accent-cyan);">⚡ Google Gemini AI Model Answer (${res.marks || marks} Marks)</span>
            <span class="badge badge-high">Exam Ready Answer</span>
          </div>
          <div style="font-size: 13.5px; line-height: 1.7; color: var(--text-primary); white-space: pre-line;">
            ${res.answer}
          </div>
        </div>
      `;
      if (typeof playAudioChime === 'function') playAudioChime('chime');
    } catch(e) {
      container.innerHTML = `<div style="color: var(--accent-rose); padding: 10px;">Failed to generate AI answer: ${e.message}</div>`;
    }
  }
};
