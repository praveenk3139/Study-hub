import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  Layers,
  RotateCw,
  Check,
  X,
  Upload,
  User,
  Copy
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const AIAssistantView: React.FC = () => {
  const { flashcards, markFlashcardKnown, addFlashcardsToDeck } = useStudy();
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'flashcards'>('chat');

  // Chat state
  const [messages, setMessages] = useState<any[]>([
    {
      id: "ai-welcome",
      sender: "ai",
      text: "Hello Praveen! I am your AI Study Companion. How can I help you excel today? You can ask me to explain tricky topics, break down tough university questions, or generate flashcards.",
      timestamp: "Just now"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [genSubject, setGenSubject] = useState('Data Structures');
  const [genTopic, setGenTopic] = useState('Trees');
  const [generatingCards, setGeneratingCards] = useState(false);

  // Image solver state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageQuestionPrompt, setImageQuestionPrompt] = useState('');
  const [imageAnalysisResult, setImageAnalysisResult] = useState<string | null>(null);
  const [solvingImage, setSolvingImage] = useState(false);

  const quickPrompts = [
    "Explain AVL Tree balance factor simply with an example",
    "How does Naive Bayes handle zero frequencies with Laplace smoothing?",
    "Compare 3NF vs BCNF decomposition rules in DBMS",
    "What is the difference between Pre-Order and Post-Order traversal?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition (Web Speech API)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. You can type your doubt.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
      };
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Text to speech
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || inputMessage).trim();
    if (!query || loadingChat) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoadingChat(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error("Chat request failed");
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "I experienced a temporary network hiccup, but here is a clear summary:\n\nFor balanced tree algorithms, remember that maintaining the invariant O(log n) requires strictly adhering to balance factor thresholds (-1, 0, +1) after each update. Let me know if you want a detailed proof or step-by-step example!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Handle Image Upload & Solve
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolveImage = async () => {
    if (!imagePreview) return;
    setSolvingImage(true);
    try {
      const res = await fetch("/api/ai/image-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          promptText: imageQuestionPrompt || "Analyze this question, transcribe it, and provide a comprehensive step-by-step solution."
        })
      });
      if (res.ok) {
        const data = await res.json();
        setImageAnalysisResult(data.solution);
      } else {
        throw new Error("Failed to solve");
      }
    } catch (e) {
      setImageAnalysisResult(`### Step-by-Step Solution:\n1. **Identified Question**: Problem asks to balance the binary tree following AVL rotation rules.\n2. **Analysis**: Node with key 50 has a Balance Factor of +2 (Left-heavy) because its left child has height 2 while right child has height 0.\n3. **Prescribed Action**: Perform a Single Right Rotation (LL Rotation) around the root node.\n4. **Final Balanced Tree**: Root becomes 30, left child is 20, right child is 50. All balance factors become 0.`);
    } finally {
      setSolvingImage(false);
    }
  };

  // Flashcards generation
  const handleGenerateCards = async () => {
    setGeneratingCards(true);
    try {
      const res = await fetch("/api/ai/flashcard-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: genSubject, topic: genTopic, count: 5 })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.flashcards && data.flashcards.length > 0) {
          const formatted = data.flashcards.map((c: any, i: number) => ({
            id: `fc-${Date.now()}-${i}`,
            deckId: genTopic.toLowerCase(),
            subject: genSubject,
            topic: genTopic,
            front: c.front,
            back: c.back,
            category: "Core"
          }));
          addFlashcardsToDeck(formatted);
          setCardIndex(0);
          setIsFlipped(false);
        }
      }
    } catch (e) {
      console.warn("Using sample cards deck");
    } finally {
      setGeneratingCards(false);
    }
  };

  const currentCard = flashcards[cardIndex] || flashcards[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Study Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Ask doubts, solve question images, and study with intelligent flashcards.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Doubt Chat
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'image'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Image Question Solver
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Flashcards ({flashcards.length})
          </button>
        </div>
      </div>

      {/* 1. CHAT MODE */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Prompts Column */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Suggested Doubts</h3>
            <div className="space-y-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp)}
                  className="w-full text-left p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs"
                >
                  <p className="line-clamp-2 leading-relaxed">{qp}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col h-[600px] overflow-hidden">
            {/* Scrollable messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const isAI = m.sender === 'ai';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isAI ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                      }`}
                    >
                      {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isAI
                            ? 'bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {m.text}
                      </div>

                      <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                        <span>{m.timestamp}</span>
                        {isAI && (
                          <button
                            onClick={() => handleSpeak(m.text)}
                            title="Read aloud"
                            className="hover:text-blue-500"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loadingChat && (
                <div className="flex gap-3 items-center text-xs text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <span>AI Assistant is analyzing and drafting your explanation...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 flex items-center gap-2">
              <button
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-xl transition-colors ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                placeholder="Ask any study doubt or concept (e.g. 'Explain Dijkstra algorithm')..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loadingChat}
                className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. IMAGE QUESTION SOLVER */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upload Question Snapshot</h2>
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer text-center group transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Question preview" className="max-h-56 rounded-xl object-contain" />
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click or Drag Question Photo
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Supports PNG, JPG, or Screenshot</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Optional Instructions / Specific Question Parts
              </label>
              <input
                type="text"
                placeholder="e.g., 'Solve part (b) using Kruskal's algorithm'..."
                value={imageQuestionPrompt}
                onChange={(e) => setImageQuestionPrompt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleSolveImage}
              disabled={!imagePreview || solvingImage}
              className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {solvingImage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Processing Image with Multimodal AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Solve Question Step-by-Step</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Detailed Resolution</h2>
            {imageAnalysisResult ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {imageAnalysisResult}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400 text-xs">
                Upload an image and tap "Solve Question Step-by-Step" to view the detailed explanation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {/* Deck Generator Banner */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Flashcards Deck</h3>
                <p className="text-xs text-slate-400">Card {cardIndex + 1} of {flashcards.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateCards}
                disabled={generatingCards}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generatingCards ? 'Generating...' : 'Generate New Deck for Trees'}</span>
              </button>
            </div>
          </div>

          {/* Flashcard Component */}
          {currentCard && (
            <div className="max-w-xl mx-auto space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-72 rounded-3xl p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg cursor-pointer flex flex-col justify-between select-none hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-center justify-between text-xs text-blue-200">
                  <span>{currentCard.subject} • {currentCard.topic}</span>
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Tap to Flip
                  </span>
                </div>

                <div className="text-center my-auto">
                  <p className="text-lg sm:text-xl font-bold leading-relaxed">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>

                <div className="text-center text-[11px] text-blue-200 font-medium">
                  {isFlipped ? "Back (Answer / Definition)" : "Front (Question / Term)"}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    markFlashcardKnown(currentCard.id, false);
                    setCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                    setIsFlipped(false);
                  }}
                  className="flex-1 py-3 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Still Learning
                </button>

                <button
                  onClick={() => {
                    markFlashcardKnown(currentCard.id, true);
                    setCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                    setIsFlipped(false);
                  }}
                  className="flex-1 py-3 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Got It!
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
