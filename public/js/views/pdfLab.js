// PDF Study Lab View
const PdfLabView = {
  selectedPdfId: null,
  activeTab: 'summary',
  flashcardIndex: 0,
  flashcards: [],

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 800;">📄 PDF Study Lab</h2>
          <p style="color: var(--text-secondary); font-size: 13px;">
            Upload lecture notes and textbooks. Automatically generate PDF Summary, Model Question Papers, Important Questions (2m, 5m, 10m, 16m), and Practice Tests powered by AI.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" onclick="PdfLabView.clearAllPdfData()" style="color: #ef4444; border-color: #fca5a5;">
            <span>🗑️ Clear All PDF Data</span>
          </button>
          <label class="btn btn-primary" style="cursor: pointer;">
            <span>📤 Upload PDF</span>
            <input type="file" id="pdf-upload-input" accept="application/pdf" style="display: none;" onchange="PdfLabView.handleUpload(this.files[0])" />
          </label>
        </div>
      </div>

      <!-- Main Two-Column Layout: Documents List & Analysis Workspace -->
      <div class="grid-dashboard" style="grid-template-columns: 320px 1fr;">
        <!-- Left Column: Uploaded Documents Shelf -->
        <div class="card" style="padding: 16px; display: flex; flex-direction: column; max-height: calc(100vh - 180px);">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>📚 Study Materials</span>
            <span id="pdf-count" class="badge badge-low">Loading...</span>
          </div>

          <div id="pdf-doc-list" style="overflow-y: auto; display: flex; flex-direction: column; gap: 8px; flex: 1;">
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">Fetching uploaded documents...</div>
          </div>
        </div>

        <!-- Right Column: Document Viewer & AI Analysis Panel -->
        <div class="card" id="pdf-analysis-panel" style="padding: 24px; min-height: 540px;">
          <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <div style="font-size: 40px; margin-bottom: 12px;">📑</div>
            <p>Select an uploaded PDF from the shelf or upload a new lecture handout.</p>
          </div>
        </div>
      </div>
    `;

    this.loadDocuments();
  },

  async loadDocuments() {
    const listEl = document.getElementById('pdf-doc-list');
    const countEl = document.getElementById('pdf-count');

    try {
      const res = await api.get('/pdf');
      countEl.innerText = `${res.documents.length} Files`;

      if (res.documents.length === 0) {
        listEl.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">No documents yet. Click "Upload PDF" above!</div>`;
        document.getElementById('pdf-analysis-panel').innerHTML = `
          <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <div style="font-size: 40px; margin-bottom: 12px;">📑</div>
            <p>PDF shelf is empty. Click "Upload PDF" above to start fresh!</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = res.documents.map(doc => `
        <div class="nav-item ${this.selectedPdfId === doc.id ? 'active' : ''}" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 10px;" onclick="PdfLabView.selectDocument(${doc.id})">
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 600; font-size: 13.5px; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${doc.title}</div>
            <div style="display: flex; gap: 8px; font-size: 11px; color: var(--text-muted);">
              <span>${doc.page_count} Pages</span> • 
              <span>${Math.round(doc.file_size / 1024)} KB</span>
            </div>
          </div>
          <button onclick="event.stopPropagation(); PdfLabView.deleteDocument(${doc.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; font-size: 14px;" title="Delete Document">
            🗑️
          </button>
        </div>
      `).join('');

      // Auto-select first document
      if (!this.selectedPdfId && res.documents.length > 0) {
        this.selectDocument(res.documents[0].id);
      }
    } catch (e) {
      listEl.innerHTML = `<div style="color: var(--accent-rose); padding: 10px;">Failed to load PDF shelf</div>`;
    }
  },

  async clearAllPdfData() {
    if (!confirm('Are you sure you want to remove all uploaded PDFs and PDF analysis data? This will let you start completely fresh.')) return;
    try {
      await api.delete('/pdf/clear-all');
      this.selectedPdfId = null;
      showToast('All PDF data cleared successfully', 'success');
      this.loadDocuments();
    } catch (err) {
      alert('Error clearing PDF data: ' + err.message);
    }
  },

  async deleteDocument(id) {
    if (!confirm('Delete this PDF document?')) return;
    try {
      await api.delete(`/pdf/${id}`);
      if (this.selectedPdfId === id) this.selectedPdfId = null;
      showToast('PDF document deleted', 'info');
      this.loadDocuments();
    } catch (err) {
      alert('Error deleting PDF: ' + err.message);
    }
  },

  async selectDocument(id) {
    this.selectedPdfId = id;
    const panel = document.getElementById('pdf-analysis-panel');
    panel.innerHTML = `<div style="text-align: center; padding: 60px;"><div class="pulse-indicator"></div></div>`;

    // Update active state in list
    const items = document.querySelectorAll('#pdf-doc-list .nav-item');
    items.forEach(el => el.classList.remove('active'));

    try {
      const res = await api.get(`/pdf/${id}`);
      const doc = res.document;
      const analysis = res.analysis || {};
      this.flashcards = analysis.flashcards || [];
      this.flashcardIndex = 0;

      panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-size: 18px; font-weight: 700;">${doc.title}</h3>
              <span class="badge badge-low">${doc.category || 'Lecture Notes'}</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              ${doc.original_name} • ${doc.page_count} Pages • Uploaded ${new Date(doc.created_at).toLocaleDateString()}
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="PdfLabView.exportNotes('${doc.title.replace(/'/g, "\\'")}')">
              📥 Export Notes
            </button>
          </div>
        </div>

        <!-- In-PDF Search Bar -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <input type="text" id="pdf-search-input" class="input" placeholder="Search keywords inside this document..." onkeydown="if (event.key === 'Enter') PdfLabView.searchDocument(${doc.id})" />
          <button class="btn btn-secondary" onclick="PdfLabView.searchDocument(${doc.id})">🔍 Search</button>
        </div>
        <div id="pdf-search-results" style="margin-bottom: 16px;"></div>

        <!-- Navigation Tabs for Analysis -->
        <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 20px; overflow-x: auto; padding-bottom: 8px;">
          <button class="btn ${this.activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="PdfLabView.setTab('summary')">
            📋 PDF Summary & Notes
          </button>
          <button class="btn ${this.activeTab === 'question_paper' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="PdfLabView.setTab('question_paper')">
            📝 Question Papers
          </button>
          <button class="btn ${this.activeTab === 'test' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="PdfLabView.setTab('test')">
            🧪 Take Practice Test
          </button>
          <button class="btn ${this.activeTab === 'flashcards' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="PdfLabView.setTab('flashcards')">
            🃏 Flashcards (${this.flashcards.length})
          </button>
          <button class="btn ${this.activeTab === 'ask' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="PdfLabView.setTab('ask')">
            🤖 Ask PDF AI
          </button>
        </div>

        <!-- Tab Content Viewport -->
        <div id="pdf-tab-content">
          ${this.renderTabContent(analysis, doc)}
        </div>
      `;
    } catch (e) {
      panel.innerHTML = `<div style="color: var(--accent-rose); padding: 40px; text-align: center;">Could not load document analysis</div>`;
    }
  },

  setTab(tabName) {
    this.activeTab = tabName;
    this.selectDocument(this.selectedPdfId);
  },

  renderTabContent(analysis, doc) {
    if (this.activeTab === 'summary') {
      return `
        <div>
          <h4 style="font-size: 15px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 10px;">📋 Executive Summary</h4>
          <p style="font-size: 14px; line-height: 1.7; color: var(--text-primary); margin-bottom: 20px;">
            ${analysis.summary || 'Summary unavailable.'}
          </p>

          <h4 style="font-size: 15px; font-weight: 700; color: var(--accent-purple); margin-bottom: 10px;">🔑 Extracted Key Concepts</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
            ${(analysis.key_concepts || []).map(c => `
              <span class="badge badge-low" style="padding: 6px 12px; font-size: 12.5px;">${c}</span>
            `).join('')}
          </div>

          <h4 style="font-size: 15px; font-weight: 700; color: var(--accent-emerald); margin-bottom: 10px;">📌 Quick Revision Notes</h4>
          <div style="background: var(--bg-base); padding: 16px; border-radius: var(--radius-md); font-size: 13.5px; line-height: 1.8; color: var(--text-secondary); white-space: pre-line; margin-bottom: 24px;">
            ${analysis.short_notes || ''}
          </div>

          <h4 style="font-size: 15px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 10px;">📖 Comprehensive Study Notes</h4>
          <div style="background: var(--bg-base); padding: 20px; border-radius: var(--radius-md); font-size: 14px; line-height: 1.8; color: var(--text-primary); white-space: pre-line;">
            ${analysis.detailed_notes || 'Detailed notes unavailable.'}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'question_paper') {
      const qp = analysis.question_paper || {};
      const partA = qp.part_a || [];
      const partB = qp.part_b || [];

      return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Question Paper Header Banner -->
          <div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(147, 51, 234, 0.15)); border: 1px solid var(--accent-purple); padding: 20px; border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; color: var(--accent-cyan); margin-bottom: 4px;">AI-Generated Model Question Paper</div>
            <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">${qp.title || doc.title + ' Question Paper'}</h3>
            <div style="display: flex; justify-content: center; gap: 20px; font-size: 13px; color: var(--text-muted);">
              <span>⏱️ Duration: ${qp.duration || '3 Hours'}</span>
              <span>🎯 Total Marks: ${qp.total_marks || 100}</span>
            </div>
          </div>

          <!-- Part A: 2 Marks Questions -->
          <div>
            <h4 style="font-size: 15px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
              <span>PART A — Short Answer Questions (5 x 2 = 10 Marks)</span>
            </h4>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${partA.map((q, idx) => `
                <div style="background: var(--bg-base); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--accent-cyan);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div style="font-weight: 700; font-size: 14px;">Q${q.q_num || (idx + 1)}. ${q.question}</div>
                    <span class="badge badge-low">${q.marks || 2} Marks</span>
                  </div>
                  ${q.answer ? `
                    <button class="btn btn-secondary btn-sm" style="margin-top: 6px; margin-right: 6px;" onclick="PdfLabView.toggleAnswer('qp-a-${idx}')">💡 View Model Answer</button>
                  ` : ''}
                  <button class="btn btn-primary btn-sm" style="margin-top: 6px;" onclick="PdfLabView.generateAiAnswerForQuestion(\`${(q.question || '').replace(/`/g, '\\`')}\`, ${q.marks || 2}, 'qp-a-ai-${idx}', \`${(doc.title || '').replace(/`/g, '\\`')}\`)">
                    ⚡ Generate AI Answer (Gemini API)
                  </button>
                  <div id="qp-a-ai-${idx}" style="display: none;"></div>
                  ${q.answer ? `
                    <div id="qp-a-${idx}" style="display: none; margin-top: 10px; background: rgba(16, 185, 129, 0.08); border: 1px dashed #10b981; padding: 12px; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-primary); line-height: 1.6;">
                      <strong>Model Answer:</strong> ${q.answer}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Part B: 13 / 16 Marks Essay Questions -->
          <div>
            <h4 style="font-size: 15px; font-weight: 700; color: var(--accent-purple); margin-bottom: 12px; margin-top: 12px;">
              PART B — University Descriptive / Essay Questions (13 & 16 Marks)
            </h4>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${partB.map((q, idx) => `
                <div style="background: var(--bg-base); padding: 18px; border-radius: var(--radius-md); border-left: 4px solid var(--accent-purple);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div style="font-weight: 700; font-size: 14.5px;">Q${q.q_num || (11 + idx)}. ${q.question}</div>
                    <span class="badge badge-high" style="font-size: 12px;">${q.marks || 13} Marks</span>
                  </div>
                  ${q.answer ? `
                    <button class="btn btn-secondary btn-sm" style="margin-top: 6px; margin-right: 6px;" onclick="PdfLabView.toggleAnswer('qp-b-${idx}')">📖 View Step-by-Step Model Response</button>
                  ` : ''}
                  <button class="btn btn-primary btn-sm" style="margin-top: 6px;" onclick="PdfLabView.generateAiAnswerForQuestion(\`${(q.question || '').replace(/`/g, '\\`')}\`, ${q.marks || 13}, 'qp-b-ai-${idx}', \`${(doc.title || '').replace(/`/g, '\\`')}\`)">
                    ⚡ Generate AI Answer (Gemini API)
                  </button>
                  <div id="qp-b-ai-${idx}" style="display: none;"></div>
                  ${q.answer ? `
                    <div id="qp-b-${idx}" style="display: none; margin-top: 10px; background: rgba(147, 51, 234, 0.08); border: 1px dashed var(--accent-purple); padding: 14px; border-radius: var(--radius-sm); font-size: 13.5px; color: var(--text-primary); line-height: 1.7; white-space: pre-line;">
                      <strong>Step-by-Step Response Guide:</strong>\n${q.answer}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'important_qs') {
      const iqs = analysis.important_questions || [];

      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h4 style="font-size: 15px; font-weight: 700; color: var(--accent-emerald);">⭐ High-Priority Exam Important Questions</h4>
              <span class="badge badge-low">${iqs.length} Questions Extracted by AI</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="PdfLabView.syncQuestionsToRepository(${doc.id})">
              ⭐ Export All to Important Questions Repository
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${iqs.map((q, idx) => `
              <div style="background: var(--bg-base); padding: 18px; border-radius: var(--radius-md); border-left: 4px solid var(--accent-emerald);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge badge-high" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;">${q.marks} Marks</span>
                    <span class="badge badge-low">${q.category || 'Exam Q'}</span>
                    ${q.priority ? `<span class="badge badge-high">${q.priority}</span>` : ''}
                  </div>
                </div>
                <div style="font-weight: 700; font-size: 14.5px; margin-bottom: 10px; color: var(--text-primary);">
                  ${q.question}
                </div>
                ${q.answer ? `
                  <button class="btn btn-secondary btn-sm" onclick="PdfLabView.toggleAnswer('iq-${idx}')">💡 View Answer & Solution Hints</button>
                  <div id="iq-${idx}" style="display: none; margin-top: 10px; background: rgba(16, 185, 129, 0.08); border: 1px dashed #10b981; padding: 14px; border-radius: var(--radius-sm); font-size: 13.5px; color: var(--text-primary); line-height: 1.7; white-space: pre-line;">
                    <strong>Model Answer / Solution Guide:</strong>\n${q.answer}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'test') {
      const test = analysis.test || {};
      const questions = test.questions || analysis.mcqs || [];

      return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Test Header Card -->
          <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15)); border: 1px solid #10b981; padding: 20px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="font-size: 17px; font-weight: 800;">🧪 ${test.title || doc.title + ' Practice Test'}</h3>
              <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                Test your mastery with instant evaluation and AI step-by-step explanations.
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="text-align: right;">
                <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted);">Current Score</div>
                <div id="test-score-display" style="font-size: 20px; font-weight: 900; color: #10b981;">0 / ${questions.length}</div>
              </div>
            </div>
          </div>

          <!-- Questions List -->
          <div style="display: flex; flex-direction: column; gap: 18px;">
            ${questions.map((q, idx) => `
              <div style="background: var(--bg-base); padding: 18px; border-radius: var(--radius-md); border-left: 4px solid var(--accent-cyan);">
                <div style="font-weight: 700; font-size: 14.5px; margin-bottom: 12px;">
                  Q${idx + 1}. ${q.question}
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${(q.options || []).map(opt => `
                    <button class="btn btn-secondary btn-sm test-opt-btn-${idx}" style="justify-content: flex-start; text-align: left;" onclick="PdfLabView.evaluateTestOption(this, ${idx}, '${opt.replace(/'/g, "\\'")}', '${q.correct.replace(/'/g, "\\'")}', '${(q.explanation || '').replace(/'/g, "\\'")}', ${questions.length})">
                      ${opt}
                    </button>
                  `).join('')}
                </div>
                <div id="test-feedback-${idx}" class="feedback-msg" style="margin-top: 10px; font-size: 13px; display: none;"></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'flashcards') {
      if (this.flashcards.length === 0) {
        return `<div style="text-align: center; padding: 40px; color: var(--text-muted);">No flashcards generated for this file yet.</div>`;
      }
      const card = this.flashcards[this.flashcardIndex];
      return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 0;">
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            Flashcard ${this.flashcardIndex + 1} of ${this.flashcards.length} (Click card to reveal answer)
          </div>

          <!-- Flip Card -->
          <div id="flashcard-box" style="width: 100%; max-width: 500px; min-height: 220px; background: var(--bg-surface-elevated); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; text-align: center; cursor: pointer; transition: all 0.3s ease; box-shadow: var(--shadow-subtle);" onclick="PdfLabView.flipCard()">
            <div id="flashcard-badge" class="badge badge-low" style="margin-bottom: 12px;">QUESTION</div>
            <div id="flashcard-text" style="font-size: 16px; font-weight: 600; color: var(--text-primary);">
              ${card.front}
            </div>
          </div>

          <div style="display: flex; gap: 14px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="PdfLabView.prevCard()" ${this.flashcardIndex === 0 ? 'disabled' : ''}>← Previous</button>
            <button class="btn btn-primary" onclick="PdfLabView.flipCard()">🔄 Flip Card</button>
            <button class="btn btn-secondary" onclick="PdfLabView.nextCard()" ${this.flashcardIndex === this.flashcards.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'mcqs') {
      const mcqs = analysis.mcqs || [];
      return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${mcqs.map((mcq, idx) => `
            <div style="background: var(--bg-base); padding: 18px; border-radius: var(--radius-md); border-left: 4px solid var(--accent-cyan);">
              <div style="font-weight: 700; font-size: 14.5px; margin-bottom: 12px;">
                Q${idx + 1}. ${mcq.question}
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${mcq.options.map(opt => `
                  <button class="btn btn-secondary btn-sm" style="justify-content: flex-start; text-align: left;" onclick="PdfLabView.checkOption(this, '${opt.replace(/'/g, "\\'")}', '${mcq.correct.replace(/'/g, "\\'")}', '${(mcq.explanation || '').replace(/'/g, "\\'")}')">
                    ${opt}
                  </button>
                `).join('')}
              </div>
              <div class="feedback-msg" style="margin-top: 10px; font-size: 13px; display: none;"></div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'ask') {
      return `
        <div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
            Ask any question strictly anchored to the contents of <strong>${doc.title}</strong>:
          </p>
          <div style="display: flex; gap: 10px; margin-bottom: 18px;">
            <input type="text" id="ask-pdf-input" class="input" placeholder="e.g. What does this document say about balance factor bounds?" onkeydown="if (event.key === 'Enter') PdfLabView.askAboutPdf(${doc.id})" />
            <button class="btn btn-primary" onclick="PdfLabView.askAboutPdf(${doc.id})">Ask PDF</button>
          </div>
          <div id="ask-pdf-answer" style="background: var(--bg-base); padding: 18px; border-radius: var(--radius-md); display: none;"></div>
        </div>
      `;
    }

    return '';
  },

  toggleAnswer(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (el.style.display === 'none' || !el.style.display) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  },

  evaluateTestOption(btn, qIdx, chosen, correct, explanation, totalQuestions) {
    const fb = document.getElementById(`test-feedback-${qIdx}`);
    if (!fb) return;

    const allBtns = document.querySelectorAll(`.test-opt-btn-${qIdx}`);
    allBtns.forEach(b => b.disabled = true);

    fb.style.display = 'block';
    if (chosen === correct) {
      fb.innerHTML = `<span style="color: #10b981; font-weight: bold;">✓ Correct!</span> ${explanation}`;
      btn.style.background = 'rgba(16, 185, 129, 0.2)';
      btn.style.borderColor = '#10b981';
      if (typeof playAudioChime === 'function') playAudioChime('success');
      
      this.currentTestScore = (this.currentTestScore || 0) + 1;
    } else {
      fb.innerHTML = `<span style="color: #f43f5e; font-weight: bold;">✗ Incorrect.</span> Expected: <strong>${correct}</strong>. ${explanation}`;
      btn.style.background = 'rgba(244, 63, 94, 0.2)';
      btn.style.borderColor = '#f43f5e';
    }

    const scoreDisplay = document.getElementById('test-score-display');
    if (scoreDisplay) {
      scoreDisplay.innerText = `${this.currentTestScore || 0} / ${totalQuestions}`;
    }
  },

  flipCard() {
    const card = this.flashcards[this.flashcardIndex];
    const textEl = document.getElementById('flashcard-text');
    const badgeEl = document.getElementById('flashcard-badge');
    const boxEl = document.getElementById('flashcard-box');

    if (badgeEl.innerText === 'QUESTION') {
      badgeEl.innerText = 'ANSWER';
      badgeEl.className = 'badge badge-high';
      textEl.innerText = card.back;
      boxEl.style.borderColor = 'var(--accent-purple)';
      playAudioChime('chime');
    } else {
      badgeEl.innerText = 'QUESTION';
      badgeEl.className = 'badge badge-low';
      textEl.innerText = card.front;
      boxEl.style.borderColor = 'var(--border-subtle)';
    }
  },

  nextCard() {
    if (this.flashcardIndex < this.flashcards.length - 1) {
      this.flashcardIndex++;
      this.selectDocument(this.selectedPdfId);
    }
  },

  prevCard() {
    if (this.flashcardIndex > 0) {
      this.flashcardIndex--;
      this.selectDocument(this.selectedPdfId);
    }
  },

  checkOption(btn, chosen, correct, explanation) {
    const parent = btn.parentElement.parentElement;
    const msg = parent.querySelector('.feedback-msg');
    msg.style.display = 'block';

    if (chosen === correct) {
      msg.innerHTML = `<span style="color: #10b981; font-weight: bold;">✓ Correct!</span> ${explanation}`;
      btn.style.background = 'rgba(16, 185, 129, 0.2)';
      btn.style.borderColor = '#10b981';
      playAudioChime('success');
    } else {
      msg.innerHTML = `<span style="color: #f43f5e; font-weight: bold;">✗ Incorrect.</span> Expected: <strong>${correct}</strong>. ${explanation}`;
      btn.style.background = 'rgba(244, 63, 94, 0.2)';
      btn.style.borderColor = '#f43f5e';
    }
  },

  async askAboutPdf(pdfId) {
    const input = document.getElementById('ask-pdf-input');
    const ansEl = document.getElementById('ask-pdf-answer');
    const q = input.value.trim();
    if (!q) return;

    ansEl.style.display = 'block';
    ansEl.innerHTML = `<div class="pulse-indicator"></div> Analyzing PDF context...`;

    try {
      const res = await api.post(`/pdf/${pdfId}/ask`, { question: q });
      ansEl.innerHTML = `
        <h4 style="font-size: 14px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 8px;">Answer from Document:</h4>
        <div style="font-size: 13.5px; line-height: 1.7; color: var(--text-primary); white-space: pre-line;">
          ${res.answer}
        </div>
      `;
    } catch (e) {
      ansEl.innerHTML = `<span style="color: var(--accent-rose);">Failed to analyze document question</span>`;
    }
  },

  async searchDocument(pdfId) {
    const query = document.getElementById('pdf-search-input').value.trim();
    const resultsEl = document.getElementById('pdf-search-results');
    if (!query) return;

    resultsEl.innerHTML = `<div class="pulse-indicator"></div> Searching...`;

    try {
      const res = await api.get(`/pdf/${pdfId}/search?query=${encodeURIComponent(query)}`);
      if (res.matches.length === 0) {
        resultsEl.innerHTML = `<div style="font-size: 12.5px; color: var(--text-muted);">No matches found for "${query}".</div>`;
        return;
      }

      resultsEl.innerHTML = `
        <div style="font-size: 12.5px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">
          Found ${res.match_count} match(es):
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${res.matches.map(m => `
            <div style="background: var(--bg-base); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 12px; color: var(--text-secondary); border-left: 2px solid var(--accent-cyan);">
              "...${m.snippet}..."
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {}
  },

  async handleUpload(file) {
    if (!file) return;
    showToast('Uploading and parsing PDF document with AI...', 'info');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await api.post('/pdf/upload', formData, true);
      showToast('PDF analyzed successfully! +50 XP gained.', 'success');
      this.selectedPdfId = res.document.id;
      this.loadDocuments();
      this.selectDocument(res.document.id);
    } catch (e) {
      showToast('Upload failed: ' + e.message, 'error');
    }
  },

  async syncQuestionsToRepository(pdfId) {
    try {
      const res = await api.post('/important-questions/sync-from-pdf', { pdf_id: pdfId });
      showToast(res.message, 'success');
      if (typeof playAudioChime === 'function') playAudioChime('chime');
    } catch (e) {
      showToast('Could not sync questions to repository', 'error');
    }
  },

  exportNotes(title) {
    const content = document.getElementById('pdf-tab-content').innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_Notes.txt`;
    a.click();
    showToast('Notes exported to file', 'success');
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
