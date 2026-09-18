// Strict Study Planner View Controller with Excel Sheet Import/Export
const PlannerView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="max-width: 1050px; margin: 0 auto;">
        
        <!-- Header & Action Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0;">
                📅 Strict Study Planner
              </h2>
              <span style="background: #10b981; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px;">
                ● STRICT ENFORCEMENT ON
              </span>
            </div>
            <p style="color: var(--text-secondary); font-size: 13.5px; margin-top: 4px;">
              Enforces planned study schedules, Excel schedule sync, task recovery queues, and meal/sleep boundaries.
            </p>
          </div>

          <!-- Excel & Action Buttons -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="PlannerView.downloadExcelTemplate()" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">
              📄 Excel Template
            </button>

            <input type="file" id="planner-excel-input" accept=".xlsx,.xls" style="display: none;" onchange="PlannerView.importExcelFile(event)">
            <button onclick="document.getElementById('planner-excel-input').click()" style="background: #059669; color: #fff; border: none; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">
              📤 Import Excel
            </button>

            <button onclick="PlannerView.exportExcelFile()" style="background: #0284c7; color: #fff; border: none; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">
              📥 Export Excel
            </button>

            <button onclick="PlannerView.generateAiPlan()" style="background: #7c3aed; color: #fff; border: none; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">
              🤖 AI Generate Plan
            </button>

            <button onclick="PlannerView.addTaskModal()" style="background: #2563eb; color: #fff; border: none; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">
              + Add Task
            </button>
          </div>
        </div>

        <!-- Schedule Content Area -->
        <div id="planner-schedule-content">
          <div style="text-align: center; padding: 60px;">
            <div class="pulse-indicator" style="width: 24px; height: 24px; margin: 0 auto 12px auto;"></div>
            Loading study schedule...
          </div>
        </div>

      </div>
    `;

    this.loadPlanner();
  },

  async loadPlanner() {
    const container = document.getElementById('planner-schedule-content');

    try {
      const data = await api.get('/planner');
      const active = data.active_task;
      const tasks = data.tasks || [];
      const recovery = data.recovery_queue || [];
      const stats = data.stats || { total: 0, completed: 0, completion_pct: 0 };

      container.innerHTML = `
        <!-- Active Strict Task Banner -->
        ${active ? `
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); border: 2px solid #3b82f6; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: var(--shadow-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="background: #2563eb; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 10px; text-transform: uppercase;">● CURRENT ACTIVE TASK</span>
                  <span style="font-size: 13px; color: #475569; font-weight: 600;">${active.subject_name || 'Subject'}</span>
                </div>
                <h3 style="font-size: 22px; font-weight: 800; color: #1e3a8a; margin-bottom: 6px;">
                  ${active.topic}
                </h3>
                <p style="font-size: 14px; color: #3b82f6; max-width: 600px;">
                  🎯 <strong>Session Goal:</strong> ${active.goal || 'Complete practice problems and review key invariants.'}
                </p>
              </div>

              <div style="text-align: right;">
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-bottom: 12px;">
                  <div style="background: #ffffff; padding: 10px 16px; border-radius: 12px; border: 1px solid #bfdbfe; text-align: center;">
                    <div style="font-size: 22px; font-weight: 800; color: #1d4ed8;">30</div>
                    <div style="font-size: 10px; font-weight: 700; color: #60a5fa; text-transform: uppercase;">Mins Left</div>
                  </div>
                </div>

                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                  <button onclick="PlannerView.completeTask(${active.id})" style="background: #10b981; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer;">
                    ✓ Complete Task
                  </button>
                  <button onclick="PlannerView.postponeTask(${active.id})" style="background: #ef4444; color: #fff; border: none; padding: 10px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">
                    Skip / Postpone
                  </button>
                </div>
              </div>
            </div>
          </div>
        ` : `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; text-align: center; padding: 28px; margin-bottom: 24px;">
            <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">All planned study tasks are complete!</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Import an Excel study sheet or click "AI Generate Plan" to add more tasks.</p>
          </div>
        `}

        <!-- Missed Tasks Recovery Queue -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-left: 4px solid #f59e0b; border-radius: 16px; padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-subtle);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; color: #b45309; margin: 0;">
                🔄 Missed Tasks Recovery Queue
              </h3>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                Missed or postponed tasks are queued here and protected from being lost.
              </p>
            </div>
            <span style="background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 10px;">
              ${recovery.length} Queued
            </span>
          </div>

          ${recovery.length === 0 ? `
            <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
              ✨ Zero missed tasks in recovery queue.
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${recovery.map(task => `
                <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${task.topic}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">${task.subject_name || 'General'} • ${task.duration_mins} Mins</div>
                  </div>
                  <button onclick="PlannerView.reinstateTask(${task.id})" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
                    Re-schedule into Plan 🔁
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Chronological Tasks Schedule -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-subtle);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
            <h3 style="font-size: 16.5px; font-weight: 700; color: var(--text-primary); margin: 0;">
              📋 Planned Study Schedule
            </h3>
            <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">
              Overall Completion: <strong style="color: #10b981;">${stats.completion_pct}%</strong> (${stats.completed}/${stats.total} Tasks)
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${tasks.map(t => {
              const isComp = t.status === 'completed';
              const isProg = t.status === 'in_progress';
              return `
                <div style="background: ${isComp ? '#f0fdf4' : 'var(--bg-surface-elevated)'}; border: 1px solid ${isComp ? '#bbf7d0' : 'var(--border-subtle)'}; border-left: 4px solid ${isComp ? '#10b981' : (isProg ? '#3b82f6' : '#cbd5e1')}; padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
                  
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <input type="checkbox" ${isComp ? 'checked' : ''} onchange="PlannerView.toggleTaskComplete(${t.id}, this.checked)" style="width: 20px; height: 20px; cursor: pointer;">
                    <div>
                      <div style="font-weight: 700; font-size: 14.5px; color: ${isComp ? '#15803d' : 'var(--text-primary)'}; ${isComp ? 'text-decoration: line-through;' : ''}">
                        ${t.topic}
                      </div>
                      <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
                        ${t.subject_name || 'General'} • ${t.duration_mins} Mins • ${t.goal || 'Study sprint'}
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 10px;">
                    ${isProg ? '<span style="background: #dbeafe; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 10px;">IN PROGRESS</span>' : ''}
                    ${!isComp && !isProg ? `<button onclick="PlannerView.startTask(${t.id})" style="background: #2563eb; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">Start Task</button>` : ''}
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Planner load error:', err);
    }
  },

  async toggleTaskComplete(id, completed) {
    try {
      if (completed) {
        await api.post(`/planner/task/${id}/complete`);
      }
      this.loadPlanner();
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  },

  async startTask(id) {
    try {
      await api.post(`/planner/task/${id}/start`);
      this.loadPlanner();
    } catch (err) {
      alert('Error starting task: ' + err.message);
    }
  },

  async completeTask(id) {
    try {
      await api.post(`/planner/task/${id}/complete`);
      this.loadPlanner();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    }
  },

  async postponeTask(id) {
    const reason = prompt('Reason for postponing task (logged in recovery queue):');
    try {
      await api.post(`/planner/task/${id}/postpone`, { reason });
      this.loadPlanner();
    } catch (err) {
      alert('Error postponing task: ' + err.message);
    }
  },

  async reinstateTask(id) {
    try {
      await api.post('/planner/recovery/reorganize', { task_id: id });
      this.loadPlanner();
    } catch (err) {
      alert('Error reinstating task: ' + err.message);
    }
  },

  async generateAiPlan() {
    try {
      const res = await api.post('/planner/generate-ai', { available_hours: 4 });
      alert(res.message);
      this.loadPlanner();
    } catch (err) {
      alert('Error generating AI plan: ' + err.message);
    }
  },

  exportExcelFile() {
    window.location.href = '/api/planner/export-excel';
  },

  downloadExcelTemplate() {
    window.location.href = '/api/planner/sample-excel';
  },

  async importExcelFile(e) {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const res = await fetch('/api/planner/import-excel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${api.token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        this.loadPlanner();
      } else {
        alert(data.error || 'Import failed');
      }
    } catch (err) {
      alert('Excel upload error: ' + err.message);
    }
  },

  async addTaskModal() {
    let subjects = [];
    try {
      const res = await api.get('/my-study/subjects');
      subjects = res.subjects || [];
    } catch (e) {}

    const modalHtml = `
      <div id="add-task-modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 20px; width: 100%; max-width: 480px; padding: 28px; box-shadow: var(--shadow-elevated); animation: authFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">
              ➕ Add Study Task to Planner
            </h3>
            <button onclick="document.getElementById('add-task-modal-overlay').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted);">✕</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Subject</label>
              <select id="modal-task-subject" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-surface-elevated); color: var(--text-primary); font-size: 14px; outline: none;">
                <option value="">Select Subject (Optional)</option>
                ${subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Task Topic *</label>
              <input type="text" id="modal-task-topic" placeholder="e.g. AVL Tree Rotations & Invariants" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-surface-elevated); color: var(--text-primary); font-size: 14px; outline: none;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Duration</label>
                <select id="modal-task-duration" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-surface-elevated); color: var(--text-primary); font-size: 14px; outline: none;">
                  <option value="15">15 Minutes</option>
                  <option value="20">20 Minutes</option>
                  <option value="30" selected>30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="90">90 Minutes</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Priority</label>
                <select id="modal-task-priority" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-surface-elevated); color: var(--text-primary); font-size: 14px; outline: none;">
                  <option value="high" selected>High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Session Goal / Notes</label>
              <input type="text" id="modal-task-goal" placeholder="e.g. Master balance factor equations & 16-mark answer proofs" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-surface-elevated); color: var(--text-primary); font-size: 14px; outline: none;">
            </div>

            <button onclick="PlannerView.submitAddTaskModal()" style="margin-top: 10px; background: #2563eb; color: #fff; border: none; padding: 12px; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer;">
              Add Task to Schedule
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async submitAddTaskModal() {
    const topic = document.getElementById('modal-task-topic').value.trim();
    if (!topic) {
      alert('Please enter a task topic.');
      return;
    }

    const subjectId = document.getElementById('modal-task-subject').value;
    const duration = document.getElementById('modal-task-duration').value;
    const priority = document.getElementById('modal-task-priority').value;
    const goal = document.getElementById('modal-task-goal').value.trim();

    try {
      await api.post('/planner/task', {
        subject_id: subjectId ? Number(subjectId) : null,
        topic,
        start_time: new Date().toISOString(),
        duration_mins: parseInt(duration),
        priority,
        goal: goal || 'Complete theory & practice problems.'
      });

      document.getElementById('add-task-modal-overlay').remove();
      this.loadPlanner();
    } catch (err) {
      alert('Error adding task: ' + err.message);
    }
  }
};
