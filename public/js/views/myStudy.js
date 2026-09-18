// My Study View Controller
const MyStudyView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
        <div class="pulse-indicator" style="width: 24px; height: 24px;"></div>
      </div>
    `;

    try {
      const data = await api.get('/my-study/subjects');
      const subjects = data.subjects || [];

      container.innerHTML = `
        <div style="max-width: 1000px; margin: 0 auto;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                📚 My Study Materials
              </h2>
              <p style="font-size: 14px; color: var(--text-secondary);">
                Manage your academic subjects, syllabus units, topics, and study notes.
              </p>
            </div>
            <button onclick="MyStudyView.openAddSubjectModal()" style="background: #2563eb; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;">
              + Add Subject
            </button>
          </div>

          <!-- Subjects List -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${subjects.map(s => `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-subtle);">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 42px; height: 42px; background: ${s.color || '#2563eb'}; color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800;">
                      ${s.name.substring(0, 1)}
                    </div>
                    <div>
                      <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0;">
                        ${s.name} (${s.code})
                      </h3>
                      <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Target Grade: ${s.target_grade || 'A+'}</span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="text-align: right;">
                      <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Progress</div>
                      <div style="font-size: 16px; font-weight: 800; color: #10b981;">${s.overall_progress}%</div>
                    </div>
                    <button onclick="MyStudyView.deleteSubject(${s.id})" style="background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer; padding: 6px;" title="Delete Subject">
                      🗑️
                    </button>
                  </div>
                </div>

                <!-- Units Progress List -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${(s.units || []).map(u => `
                    <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px 16px;">
                      <div style="display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">
                        <span>${u.unit_title}</span>
                        <span style="color: ${u.progress_pct >= 80 ? '#16a34a' : '#d97706'};">${u.progress_pct}%</span>
                      </div>
                      <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="background: ${u.progress_pct >= 80 ? '#10b981' : '#f59e0b'}; width: ${u.progress_pct}%; height: 100%; border-radius: 3px;"></div>
                      </div>
                      <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                        ${(u.topics || []).map(t => `
                          <span style="background: var(--bg-surface); border: 1px solid var(--border-subtle); font-size: 11px; padding: 3px 8px; border-radius: 6px; color: var(--text-secondary);">
                            ${t}
                          </span>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>

              </div>
            `).join('')}
          </div>

        </div>
      `;
    } catch (err) {
      console.error('My study render error:', err);
    }
  },

  async openAddSubjectModal() {
    const name = prompt('Enter Subject Name (e.g., Data Structures):');
    if (!name) return;
    const code = prompt('Enter Subject Code (e.g., CS301):') || 'CS101';

    try {
      await api.post('/my-study/subjects', { name, code });
      this.render();
    } catch (err) {
      alert('Error adding subject: ' + err.message);
    }
  },

  async deleteSubject(id) {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/my-study/subjects/${id}`);
      this.render();
    } catch (err) {
      alert('Error deleting subject: ' + err.message);
    }
  }
};
