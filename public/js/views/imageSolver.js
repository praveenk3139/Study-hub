// Image Question Solver View Controller
const ImageSolverView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
            📸 Image Question Solver
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Upload a photo or diagram of a textbook question, handwritten problem, or exam question to get instant step-by-step solutions powered by Gemini Vision.
          </p>
        </div>

        <!-- Upload Box -->
        <div style="background: var(--bg-surface); border: 2px dashed #3b82f6; border-radius: 20px; padding: 36px; text-align: center; margin-bottom: 24px; box-shadow: var(--shadow-subtle);">
          <div style="font-size: 48px; margin-bottom: 12px;">📷</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
            Drag & drop question photo or click to browse
          </h3>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
            Supports JPG, PNG, WEBP (Max 10MB)
          </p>

          <input type="file" id="image-solver-file-input" accept="image/*" style="display: none;" onchange="ImageSolverView.onFileSelected(event)">
          <button onclick="document.getElementById('image-solver-file-input').click()" style="background: #2563eb; color: #fff; border: none; padding: 10px 22px; border-radius: 10px; font-weight: 700; cursor: pointer;">
            Select Photo
          </button>
          
          <div id="image-solver-file-name" style="margin-top: 12px; font-size: 13px; font-weight: 600; color: #10b981;"></div>
        </div>

        <!-- Context Input -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
          <label style="display: block; font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            Additional Question Context / Notes (Optional)
          </label>
          <textarea id="image-solver-context" rows="3" placeholder="e.g. Find the balance factor of node A and check if AVL tree rotations are required." style="width: 100%; border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; font-family: inherit; font-size: 13.5px; color: var(--text-primary); background: var(--bg-surface-elevated); outline: none;"></textarea>

          <button onclick="ImageSolverView.solveImage()" style="margin-top: 16px; width: 100%; background: #10b981; color: #fff; border: none; padding: 12px; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer;">
            ⚡ Solve Question with AI
          </button>
        </div>

        <!-- Solution Result Panel -->
        <div id="image-solver-result" style="display: none; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 28px; box-shadow: var(--shadow-subtle);">
        </div>

      </div>
    `;
  },

  selectedFile: null,

  onFileSelected(e) {
    if (e.target.files && e.target.files[0]) {
      this.selectedFile = e.target.files[0];
      document.getElementById('image-solver-file-name').innerText = `Selected: ${this.selectedFile.name}`;
    }
  },

  async solveImage() {
    const resultDiv = document.getElementById('image-solver-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div class="pulse-indicator" style="width: 24px; height: 24px; margin: 0 auto 12px auto;"></div>
        <p style="font-weight: 600; color: var(--text-secondary);">Analyzing question image with Gemini Vision...</p>
      </div>
    `;

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    const context = document.getElementById('image-solver-context').value;
    formData.append('questionContext', context);

    try {
      const res = await fetch('/api/image-solver/solve', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${api.token}` },
        body: formData
      });
      const data = await res.json();

      resultDiv.innerHTML = `
        <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
          🎯 AI Solution Analysis
        </h3>
        <div style="font-size: 14px; line-height: 1.7; color: var(--text-primary); white-space: pre-wrap;">
          ${data.solution}
        </div>
      `;
    } catch (err) {
      resultDiv.innerHTML = `<div style="color: #ef4444; font-weight: 700;">Error solving image: ${err.message}</div>`;
    }
  }
};
