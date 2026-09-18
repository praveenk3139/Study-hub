// Focus Shield & Distraction Protection View
const FocusShieldView = {
  activeSession: null,
  timerInterval: null,
  remainingSeconds: 0,
  isPaused: false,
  blockedSites: [],
  visibilityListenerAttached: false,

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h2 style="font-size: 22px; font-weight: 800;">🛡️ Focus & Distraction Shield</h2>
            <span class="badge badge-low" id="shield-status-badge">ACTIVE SHIELDING</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 13px;">
            Filters social distractions, enforces study YouTube mode, and monitors focus continuity while keeping communication channels open.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <a class="btn btn-secondary" href="/extension/manifest.json" download="manifest.json">
            🧩 Download Browser Extension
          </a>
        </div>
      </div>

      <div id="focus-shield-content">
        <div style="text-align: center; padding: 60px;"><div class="pulse-indicator"></div> Loading Focus Shield state...</div>
      </div>
    `;

    this.attachVisibilityListener();
    this.loadFocusData();
  },

  async loadFocusData() {
    const container = document.getElementById('focus-shield-content');
    try {
      const data = await api.get('/focus');
      this.activeSession = data.active_session || null;
      this.blockedSites = data.blocked_sites || [];
      const allowed = data.allowed_sites || [];
      const yt = data.youtube_settings;
      const wa = data.whatsapp_settings;
      const activeMode = data.active_mode || 'deep_study';

      container.innerHTML = `
        <!-- Live Focus Session Workspace Banner -->
        <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(16, 185, 129, 0.12)); border: 1px solid var(--accent-purple); padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                <span class="badge badge-high" style="text-transform: uppercase;">Mode: ${activeMode.replace('_', ' ')}</span>
                <span id="distraction-attempts-count" class="badge badge-medium">${data.today_distraction_attempts || 0} Distractions Logged</span>
              </div>
              <h3 style="font-size: 18px; font-weight: 800;">
                ${this.activeSession ? '⚡ Focus Shield Active & Guarding Study Session' : '🎯 Start a Dedicated Focus Session'}
              </h3>
              <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">
                ${this.activeSession ? 'Background tab switches and social media links will be automatically blocked.' : 'Select a focus mode below to start live timer and block distractions.'}
              </p>
            </div>

            <!-- Big Pomodoro Timer Widget -->
            <div style="text-align: center; background: var(--bg-surface-elevated); padding: 16px 28px; border-radius: var(--radius-lg); border: 2px solid var(--accent-cyan); min-width: 220px;">
              <div id="focus-timer-clock" style="font-size: 36px; font-weight: 900; font-family: monospace; color: var(--accent-cyan); letter-spacing: 2px;">
                ${this.activeSession ? '45:00' : '45:00'}
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-top: 2px;">
                ${this.activeSession ? (this.isPaused ? 'SESSION PAUSED' : 'FOCUS TIME REMAINING') : 'READY TO START'}
              </div>
            </div>
          </div>

          <!-- Active Timer Controls -->
          <div style="display: flex; gap: 12px; margin-top: 18px; flex-wrap: wrap;">
            ${this.activeSession ? `
              <button class="btn btn-primary" onclick="FocusShieldView.togglePause()">
                ${this.isPaused ? '▶️ Resume Focus' : '⏸️ Pause Timer'}
              </button>
              <button class="btn btn-secondary" onclick="FocusShieldView.completeSession()">
                🏁 Complete Session (+50 XP)
              </button>
              <button class="btn btn-secondary" style="border-color: var(--accent-rose); color: var(--accent-rose);" onclick="FocusShieldView.abandonSession()">
                🛑 End Session
              </button>
            ` : `
              <button class="btn btn-primary" onclick="FocusShieldView.setMode('${activeMode}')">
                ▶️ Start 45-Min ${activeMode.replace('_', ' ').toUpperCase()} Session
              </button>
            `}
          </div>
        </div>

        <!-- Chrome Extension Setup Banner for Address Bar Blocking -->
        <div class="card" style="margin-bottom: 24px; border-left: 4px solid var(--accent-cyan); background: var(--bg-surface-elevated);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="font-size: 20px;">🧩</span>
                <strong style="font-size: 15px; color: var(--accent-cyan);">Enable System Address Bar Blocking in Chrome</strong>
              </div>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
                Web security rules prevent web apps from hijacking Chrome's top address bar directly. To block <code>instagram.com</code>, <code>facebook.com</code>, etc. when typed into Chrome:
              </p>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px;">
                <div style="background: var(--bg-base); padding: 12px; border-radius: var(--radius-md); font-size: 12px;">
                  <strong style="color: var(--accent-purple);">Step 1:</strong> Open <code>chrome://extensions</code> in a new tab
                </div>
                <div style="background: var(--bg-base); padding: 12px; border-radius: var(--radius-md); font-size: 12px;">
                  <strong style="color: var(--accent-cyan);">Step 2:</strong> Turn ON <strong>Developer mode</strong> (top right toggle)
                </div>
                <div style="background: var(--bg-base); padding: 12px; border-radius: var(--radius-md); font-size: 12px;">
                  <strong style="color: var(--accent-emerald);">Step 3:</strong> Click <strong>Load unpacked</strong> & select folder:<br />
                  <code style="font-size: 11px; color: var(--text-primary); border: 1px solid var(--border-subtle); padding: 2px 4px; border-radius: 4px; display: inline-block; margin-top: 4px;">public/extension</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- URL Shield Browser Sandbox & Live Web Navigation Tester -->
        <div class="card" style="margin-bottom: 24px; border-top: 3px solid var(--accent-rose);">
          <div class="card-header">
            <div class="card-title">🌐 Focus Shield Safe Browser Sandbox</div>
            <span class="badge badge-high">REAL-TIME BLOCKER ACTIVE</span>
          </div>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
            Test link navigation or type any website below to verify instant Focus Shield interception:
          </p>

          <div style="display: flex; gap: 10px; margin-bottom: 16px;">
            <input type="text" id="url-test-input" class="input" placeholder="Enter website domain or link (e.g. instagram.com or wikipedia.org)..." onkeydown="if (event.key === 'Enter') FocusShieldView.testUrlShield()" />
            <button class="btn btn-primary" onclick="FocusShieldView.testUrlShield()">🛡️ Go / Test Link</button>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 14px;">
            <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Quick Test Websites:</span>
            <button class="btn btn-secondary btn-sm" onclick="FocusShieldView.testUrlShield('instagram.com')">📸 instagram.com</button>
            <button class="btn btn-secondary btn-sm" onclick="FocusShieldView.testUrlShield('facebook.com')">👥 facebook.com</button>
            <button class="btn btn-secondary btn-sm" onclick="FocusShieldView.testUrlShield('tiktok.com')">🎵 tiktok.com</button>
            <button class="btn btn-secondary btn-sm" onclick="FocusShieldView.testUrlShield('twitter.com')">🐦 twitter.com</button>
            <button class="btn btn-secondary btn-sm" onclick="FocusShieldView.testUrlShield('netflix.com')">🍿 netflix.com</button>
            <button class="btn btn-secondary btn-sm" style="border-color: var(--accent-emerald); color: var(--accent-emerald);" onclick="FocusShieldView.testUrlShield('wikipedia.org')">📚 wikipedia.org (Allowed)</button>
          </div>

          <div id="url-test-result" style="display: none;"></div>
        </div>

        <!-- Focus Modes Selection -->
        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header">
            <div class="card-title">🎯 Focus Modes</div>
            <span class="badge badge-high">Current: ${activeMode.replace('_', ' ').toUpperCase()}</span>
          </div>

          <div class="grid-4">
            <div style="background: var(--bg-base); padding: 16px; border-radius: var(--radius-md); border: ${activeMode === 'deep_study' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'}; cursor: pointer;" onclick="FocusShieldView.setMode('deep_study')">
              <div style="font-size: 24px; margin-bottom: 6px;">🧠</div>
              <strong style="font-size: 14px; color: var(--accent-cyan);">Deep Study Mode</strong>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                Maximum distraction protection. Blocks social sites, enables YouTube study mode.
              </p>
            </div>

            <div style="background: var(--bg-base); padding: 16px; border-radius: var(--radius-md); border: ${activeMode === 'exam_mode' ? '2px solid var(--accent-rose)' : '1px solid var(--border-subtle)'}; cursor: pointer;" onclick="FocusShieldView.setMode('exam_mode')">
              <div style="font-size: 24px; margin-bottom: 6px;">⚡</div>
              <strong style="font-size: 14px; color: var(--accent-rose);">Exam Mode</strong>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                Strictest focus settings. Only active curriculum, notes, and academic portals permitted.
              </p>
            </div>

            <div style="background: var(--bg-base); padding: 16px; border-radius: var(--radius-md); border: ${activeMode === 'light_study' ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)'}; cursor: pointer;" onclick="FocusShieldView.setMode('light_study')">
              <div style="font-size: 24px; margin-bottom: 6px;">📖</div>
              <strong style="font-size: 14px; color: var(--accent-purple);">Light Study</strong>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                Gentle audio reminders when straying from study materials.
              </p>
            </div>

            <div style="background: var(--bg-base); padding: 16px; border-radius: var(--radius-md); border: ${activeMode === 'break_mode' ? '2px solid var(--accent-emerald)' : '1px solid var(--border-subtle)'}; cursor: pointer;" onclick="FocusShieldView.setMode('break_mode')">
              <div style="font-size: 24px; margin-bottom: 6px;">☕</div>
              <strong style="font-size: 14px; color: var(--accent-emerald);">Break Mode</strong>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                Temporarily relax restrictions during scheduled breaks and meals.
              </p>
            </div>
          </div>
        </div>

        <!-- YouTube & WhatsApp Section -->
        <div class="grid-2" style="margin-bottom: 24px;">
          <!-- YouTube Study Mode Card -->
          <div class="card" style="border-top: 3px solid #ef4444;">
            <div class="card-header">
              <div class="card-title">
                <span style="color: #ef4444;">▶</span> YouTube Study Mode
              </div>
              <span class="badge badge-low">ALLOWED BY DEFAULT</span>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
              Educational YouTube lectures remain accessible. StudyFlow AI suppresses addictive recommendation feeds and Shorts.
            </p>

            <div style="display: flex; flex-direction: column; gap: 14px; background: var(--bg-base); padding: 16px; border-radius: var(--radius-md);">
              <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; cursor: pointer;">
                <span>Strict Shorts Restriction:</span>
                <input type="checkbox" ${yt.shorts_restricted ? 'checked' : ''} onchange="FocusShieldView.updateYt(this.checked, ${yt.daily_limit_mins})" />
              </label>
              <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; cursor: pointer;">
                <span>Reduce Distracting Recommendations:</span>
                <input type="checkbox" checked />
              </label>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                <span>Daily YouTube Study Limit:</span>
                <strong>${yt.daily_limit_mins} Mins</strong>
              </div>
            </div>
          </div>

          <!-- WhatsApp Student Communication Card -->
          <div class="card" style="border-top: 3px solid #10b981;">
            <div class="card-header">
              <div class="card-title">
                <span style="color: #10b981;">💬</span> WhatsApp Access & Privacy
              </div>
              <span class="badge badge-low">ALLOWED</span>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
              Students can coordinate with peer groups and college classmates during study sessions.
            </p>

            <div style="background: var(--bg-base); padding: 16px; border-radius: var(--radius-md);">
              <div style="font-size: 13px; font-weight: 600; color: var(--accent-emerald); margin-bottom: 6px;">
                🔒 Zero Message Snooping
              </div>
              <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px;">
                ${wa.privacy_notice}
              </p>
            </div>
          </div>
        </div>

        <!-- Blocked & Allowed Domain Matrices -->
        <div class="grid-2">
          <!-- Blocked Sites List -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">🚫 Default Distraction Blocklist</div>
              <button class="btn btn-secondary btn-sm" onclick="FocusShieldView.addBlockedModal()">+ Add Site</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto;">
              ${this.blockedSites.map(b => `
                <div style="background: var(--bg-base); padding: 10px 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-size: 13.5px; font-weight: 600;">${b.domain}</span>
                    <span style="font-size: 11px; color: var(--text-muted); margin-left: 8px;">${b.category}</span>
                  </div>
                  <button style="background: none; border: none; color: var(--accent-rose); cursor: pointer;" onclick="FocusShieldView.removeBlocked(${b.id})">✕</button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Allowed Sites List -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">✓ Permitted Educational Websites</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto;">
              ${allowed.map(a => `
                <div style="background: var(--bg-base); padding: 10px 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-size: 13.5px; font-weight: 600; color: var(--accent-cyan);">${a.domain}</span>
                    <span style="font-size: 11px; color: var(--text-muted); margin-left: 8px;">${a.category}</span>
                  </div>
                  <span class="badge badge-low">Permitted</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      if (this.activeSession) {
        const plannedSecs = (this.activeSession.planned_mins || 45) * 60;
        const createdMs = new Date(this.activeSession.created_at).getTime();
        const elapsedSecs = Math.floor((Date.now() - createdMs) / 1000);
        this.remainingSeconds = Math.max(0, plannedSecs - elapsedSecs);
        this.startTimer();
      }
    } catch (e) {
      container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px; text-align: center;">Could not load Focus Shield settings</div>`;
    }
  },

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.isPaused) return;

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.completeSession();
        return;
      }

      this.remainingSeconds--;
      const mins = Math.floor(this.remainingSeconds / 60);
      const secs = this.remainingSeconds % 60;
      const clockEl = document.getElementById('focus-timer-clock');
      if (clockEl) {
        clockEl.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }, 1000);
  },

  togglePause() {
    this.isPaused = !this.isPaused;
    showToast(this.isPaused ? 'Focus timer paused' : 'Focus timer resumed', 'info');
    this.loadFocusData();
  },

  async setMode(mode) {
    try {
      const res = await api.post('/focus/mode', { mode, planned_mins: 45 });
      this.isPaused = false;
      showToast(res.message, 'success');
      if (typeof playAudioChime === 'function') playAudioChime('chime');
      this.loadFocusData();
    } catch (e) {}
  },

  async completeSession() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (!this.activeSession) return;

    try {
      const res = await api.post('/focus/session/complete', {
        session_id: this.activeSession.id,
        duration_mins: this.activeSession.planned_mins || 45
      });
      showToast(res.message || 'Focus Session completed! +50 XP gained.', 'success');
      if (typeof playAudioChime === 'function') playAudioChime('success');
      this.activeSession = null;
      this.loadFocusData();
    } catch (e) {}
  },

  async abandonSession() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (!this.activeSession) return;

    try {
      await api.post('/focus/session/abandon', { session_id: this.activeSession.id });
      showToast('Focus session ended.', 'info');
      this.activeSession = null;
      this.loadFocusData();
    } catch (e) {}
  },

  testUrlShield(overrideUrl) {
    const input = document.getElementById('url-test-input');
    const resultEl = document.getElementById('url-test-result');
    if (!input || !resultEl) return;

    if (overrideUrl) {
      input.value = overrideUrl;
    }

    const url = input.value.trim().toLowerCase();
    if (!url) return;

    resultEl.style.display = 'block';

    const blockedDomains = (this.blockedSites && this.blockedSites.length > 0)
      ? this.blockedSites.map(b => b.domain.toLowerCase())
      : ['instagram.com', 'facebook.com', 'tiktok.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com', 'twitch.tv'];

    const isBlocked = blockedDomains.some(domain => url.includes(domain));

    if (isBlocked) {
      resultEl.innerHTML = `
        <div style="background: rgba(244, 63, 94, 0.15); border: 1px solid var(--accent-rose); padding: 16px; border-radius: var(--radius-md); color: var(--accent-rose); font-size: 13.5px; line-height: 1.6;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong>🚫 ACCESS BLOCKED BY FOCUS SHIELD!</strong>
            <span class="badge badge-high">Distraction Intercepted</span>
          </div>
          "${url}" matches your active distraction blocklist. Study session focus is preserved.
        </div>
      `;
      if (typeof playAudioChime === 'function') playAudioChime('chime');
      
      if (typeof App !== 'undefined' && App.showFocusBlockerModal) {
        App.showFocusBlockerModal(url, 'https://' + url);
      }

      api.post('/focus/distraction-event', {
        attempted_target: url,
        reason: `Attempted navigation to ${url} during active focus session`
      }).then(() => {
        const countBadge = document.getElementById('distraction-attempts-count');
        if (countBadge) {
          const currentCount = parseInt(countBadge.innerText) || 0;
          countBadge.innerText = `${currentCount + 1} Distractions Logged`;
        }
      }).catch(() => {});
    } else {
      resultEl.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; padding: 16px; border-radius: var(--radius-md); color: #10b981; font-size: 13.5px; line-height: 1.6;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong>✓ PERMITTED EDUCATIONAL SITE!</strong>
            <span class="badge badge-low">Safe Link</span>
          </div>
          "${url}" is allowed for learning and academic study research.
        </div>
      `;
    }
  },

  attachVisibilityListener() {
    if (this.visibilityListenerAttached) return;
    this.visibilityListenerAttached = true;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.activeSession && !this.isPaused) {
        api.post('/focus/distraction-event', {
          attempted_target: 'Tab Switching / Window Unfocus',
          reason: 'Student switched away from StudyFlow AI during active focus session'
        }).then(() => {
          showToast('⚠️ Focus Shield Notice: Tab switch detected during Focus Session!', 'warning');
          if (typeof playAudioChime === 'function') playAudioChime('chime');
        }).catch(() => {});
      }
    });
  },

  async updateYt(shortsRestricted, dailyLimit) {
    try {
      await api.put('/focus/youtube-settings', {
        youtube_study_mode: true,
        shorts_restricted: shortsRestricted,
        daily_youtube_limit_mins: dailyLimit
      });
      showToast('YouTube Study Mode settings saved', 'success');
    } catch (e) {}
  },

  addBlockedModal() {
    const domain = prompt('Enter domain to block during Deep Study (e.g. netflix.com, discord.com):');
    if (!domain) return;

    api.post('/focus/blocked-sites', { domain, category: 'Entertainment' }).then(res => {
      showToast(res.message, 'success');
      this.loadFocusData();
    });
  },

  async removeBlocked(id) {
    await api.delete(`/focus/blocked-sites/${id}`);
    showToast('Site unblocked', 'info');
    this.loadFocusData();
  }
};
