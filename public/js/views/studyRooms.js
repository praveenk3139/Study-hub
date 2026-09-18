// Collaborative Study Rooms View Controller
const StudyRoomsView = {
  currentRoomId: null,

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
        <div class="pulse-indicator" style="width: 24px; height: 24px;"></div>
      </div>
    `;

    try {
      const data = await api.get('/study-rooms');
      const rooms = data.rooms || [];

      container.innerHTML = `
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                👥 Collaborative Study Rooms
              </h2>
              <p style="font-size: 14px; color: var(--text-secondary);">
                Join virtual study rooms with friends, share timers, and discuss topics together.
              </p>
            </div>
            <button onclick="StudyRoomsView.createRoom()" style="background: #2563eb; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              + Create Room
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            ${rooms.map(r => `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; box-shadow: var(--shadow-subtle);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <h3 style="font-size: 16.5px; font-weight: 700; color: var(--text-primary); margin: 0;">
                    ${r.name}
                  </h3>
                  <span style="background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px;">
                    Active
                  </span>
                </div>
                <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
                  Topic: <strong>${r.topic || 'General Study'}</strong> • Code: <code>${r.code}</code>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">⏱️ ${r.timer_mins} min sprint</span>
                  <button onclick="StudyRoomsView.enterRoom(${r.id}, '${r.name}')" style="background: #4f46e5; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;">
                    Join Room
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Study rooms render error:', err);
    }
  },

  async createRoom() {
    const name = prompt('Enter Study Room Name:');
    if (!name) return;
    const topic = prompt('Enter Topic (e.g. Trees & Graphs):') || 'General Study';

    try {
      await api.post('/study-rooms', { name, topic, timer_mins: 25 });
      this.render();
    } catch (err) {
      alert('Error creating room: ' + err.message);
    }
  },

  async enterRoom(id, name) {
    this.currentRoomId = id;
    const container = document.getElementById('view-content');

    const res = await api.get(`/study-rooms/${id}/messages`);
    const messages = res.messages || [];

    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 24px; box-shadow: var(--shadow-subtle);">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">
              ${name}
            </h2>
            <span style="font-size: 12px; color: #10b981; font-weight: 600;">🟢 Live Study Session Active</span>
          </div>

          <button onclick="StudyRoomsView.render()" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer;">
            Leave Room
          </button>
        </div>

        <!-- Messages Chat Box -->
        <div id="room-chat-box" style="height: 300px; overflow-y: auto; background: var(--bg-surface-elevated); border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px;">
          ${messages.map(m => `
            <div style="background: var(--bg-surface); padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border-subtle);">
              <div style="font-size: 12px; font-weight: 700; color: #2563eb; margin-bottom: 2px;">${m.user_name}</div>
              <div style="font-size: 13.5px; color: var(--text-primary);">${m.content}</div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 10px;">
          <input type="text" id="room-msg-input" placeholder="Type a message or share study note..." style="flex: 1; border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; font-size: 14px; background: var(--bg-surface-elevated); color: var(--text-primary); outline: none;">
          <button onclick="StudyRoomsView.sendMessage()" style="background: #2563eb; color: #fff; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer;">
            Send
          </button>
        </div>

      </div>
    `;
  },

  async sendMessage() {
    const input = document.getElementById('room-msg-input');
    const content = input.value.trim();
    if (!content || !this.currentRoomId) return;

    try {
      await api.post(`/study-rooms/${this.currentRoomId}/messages`, { content });
      input.value = '';
      const name = document.querySelector('h2').innerText;
      this.enterRoom(this.currentRoomId, name);
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  }
};
