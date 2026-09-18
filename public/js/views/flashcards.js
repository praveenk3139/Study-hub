// Flashcards View Controller
const FlashcardsView = {
  currentDeck: null,
  currentCardIndex: 0,
  isFlipped: false,

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
        <div class="pulse-indicator" style="width: 24px; height: 24px;"></div>
      </div>
    `;

    try {
      const data = await api.get('/flashcards/decks');
      const decks = data.decks || [];

      if (decks.length > 0 && !this.currentDeck) {
        const fullDeck = await api.get(`/flashcards/decks/${decks[0].id}`);
        this.currentDeck = fullDeck;
      }

      const cards = (this.currentDeck && this.currentDeck.cards) || [];
      const card = cards[this.currentCardIndex] || { question: 'What is a Binary Search Tree?', answer: 'A node-based binary tree data structure where left child < node < right child.', hint: 'Order invariant' };

      container.innerHTML = `
        <div style="max-width: 700px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                🗂️ AI Flashcards
              </h2>
              <p style="font-size: 14px; color: var(--text-secondary);">
                Active recall & spaced repetition flashcard review.
              </p>
            </div>
            <button onclick="FlashcardsView.generateNewDeck()" style="background: #2563eb; color: #fff; border: none; padding: 10px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              + Generate Deck
            </button>
          </div>

          <!-- Flip Card Container -->
          <div style="perspective: 1000px; margin-bottom: 24px;">
            <div id="flashcard-element" onclick="FlashcardsView.toggleFlip()" style="min-height: 260px; background: var(--bg-surface); border: 2px solid var(--border-subtle); border-radius: 20px; padding: 36px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--shadow-elevated);">
              <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;" id="flashcard-side-label">
                ${this.isFlipped ? '💡 Answer (Click to see Question)' : '❓ Question (Click to Reveal Answer)'}
              </div>
              <div style="font-size: 20px; font-weight: 700; color: var(--text-primary); line-height: 1.5;" id="flashcard-text">
                ${this.isFlipped ? card.answer : card.question}
              </div>
              ${!this.isFlipped && card.hint ? `<div style="font-size: 13px; color: #2563eb; margin-top: 16px;">Hint: ${card.hint}</div>` : ''}
            </div>
          </div>

          <!-- Control Buttons & Counter -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button onclick="FlashcardsView.prevCard()" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              ← Previous
            </button>

            <span style="font-size: 14px; font-weight: 700; color: var(--text-secondary);">
              Card ${this.currentCardIndex + 1} of ${cards.length || 1}
            </span>

            <button onclick="FlashcardsView.nextCard()" style="background: #2563eb; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              Next →
            </button>
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Flashcards render error:', err);
    }
  },

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
    this.render();
  },

  nextCard() {
    const cards = (this.currentDeck && this.currentDeck.cards) || [];
    if (this.currentCardIndex < cards.length - 1) {
      this.currentCardIndex++;
      this.isFlipped = false;
      this.render();
    }
  },

  prevCard() {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.isFlipped = false;
      this.render();
    }
  },

  async generateNewDeck() {
    const topic = prompt('Enter topic for AI Flashcard generation (e.g. Graphs):');
    if (!topic) return;
    try {
      const res = await api.post('/flashcards/generate', { topic });
      this.currentDeck = { cards: res.cards };
      this.currentCardIndex = 0;
      this.isFlipped = false;
      this.render();
    } catch (err) {
      alert('Error generating flashcards: ' + err.message);
    }
  }
};
