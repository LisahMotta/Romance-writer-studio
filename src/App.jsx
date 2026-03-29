import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "romance-writer-studio";

// — Persistence —
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// — Data Templates —
const CHARACTER_TEMPLATE = {
  id: "", name: "", role: "protagonist", age: "", appearance: "",
  personality: "", backstory: "", motivation: "", conflict: "", arc: "",
  relationships: "", quirks: "", voice: ""
};

const SCENE_TEMPLATE = {
  id: "", title: "", chapter: "", pov: "", location: "", time: "",
  goal: "", conflict: "", outcome: "", emotionalBeat: "", notes: "", content: "", wordCount: 0
};

const BOOK_TEMPLATE = {
  id: "", title: "", subtitle: "", genre: "Romance Contemporâneo", trope: "",
  logline: "", synopsis: "", targetWordCount: 60000, characters: [],
  chapters: [], scenes: [], notes: "", createdAt: "", updatedAt: ""
};

const GENRES = [
  "Romance Contemporâneo", "Romance Histórico", "Romance Paranormal",
  "Romantic Suspense", "Dark Romance", "Comédia Romântica", "Romance Erótico",
  "Romance de Época", "Romance Fantasia", "Romance Sci-Fi", "New Adult", "Young Adult Romance"
];

const TROPES = [
  "Enemies to Lovers", "Friends to Lovers", "Fake Dating", "Second Chance",
  "Forbidden Love", "Grumpy x Sunshine", "Forced Proximity", "Secret Identity",
  "Love Triangle", "Slow Burn", "Opposites Attract", "Marriage of Convenience",
  "Boss x Employee", "Brother's Best Friend", "Roommates", "Amnésia",
  "Bodyguard Romance", "Age Gap", "Childhood Sweethearts", "Matchmaker"
];

const BEAT_SHEET = [
  { beat: "Gancho", desc: "Cena de abertura que prende o leitor", pct: "0-1%" },
  { beat: "Mundo Comum", desc: "Vida do protagonista antes da mudança", pct: "1-10%" },
  { beat: "Incidente Incitante", desc: "O encontro / evento que muda tudo", pct: "10-12%" },
  { beat: "Debate / Recusa", desc: "Hesitação, resistência à atração", pct: "12-20%" },
  { beat: "Virada 1", desc: "Decisão de se envolver / aceitar o desafio", pct: "20-25%" },
  { beat: "Diversão & Jogos", desc: "A relação se desenvolve, tensão sexual, momentos fofinhos", pct: "25-50%" },
  { beat: "Ponto Médio", desc: "Falso triunfo ou falsa derrota, stakes aumentam", pct: "50%" },
  { beat: "O Vilão se Aproxima", desc: "Conflitos externos e internos se intensificam", pct: "50-75%" },
  { beat: "Tudo Está Perdido", desc: "O black moment — separação, traição, revelação", pct: "75%" },
  { beat: "Noite Escura da Alma", desc: "Dor, reflexão, crescimento interior", pct: "75-80%" },
  { beat: "Virada 2", desc: "Epifania, decisão de lutar pelo amor", pct: "80%" },
  { beat: "Grand Gesture / Clímax", desc: "A grande declaração ou ação final", pct: "80-95%" },
  { beat: "HEA / HFN", desc: "Happily Ever After ou Happy For Now", pct: "95-100%" }
];

const WRITING_PROMPTS = [
  "Eles se reencontram depois de 10 anos em um lugar inesperado...",
  "Ela encontra uma carta de amor que nunca deveria ter lido...",
  "O acordo era simples: fingir ser namorados por um mês. Mas...",
  "A tempestade os forçou a dividir o último quarto do hotel...",
  "Ele era exatamente o tipo de homem que ela prometeu evitar...",
  "O beijo foi um acidente. Pelo menos era o que ela dizia a si mesma...",
  "Quando ela viu o nome dele na lista de convidados, quase desistiu...",
  "A única regra: não se apaixonar. Durou exatamente três dias...",
  "Ela herdou uma livraria. Ele queria demolir o prédio...",
  "O bilhete dizia apenas: 'Me encontre onde tudo começou'...",
  "Ela reconheceu o perfume dele antes mesmo de virar...",
  "A aposta era inocente. As consequências, nem tanto...",
  "Ele leu o diário dela por engano. E descobriu o que ela sentia...",
  "A playlist dele tinha uma música que contava toda a história deles...",
  "Eles se odiavam. Até ficarem presos no elevador por 4 horas...",
  "Ela mandou a mensagem para a pessoa errada. Ou será que era a certa?",
  "O primeiro encontro foi um desastre. O segundo... ela não esperava.",
  "Ele tinha um segredo. E ela era a última pessoa que deveria descobrir.",
  "A chuva começou quando ele disse 'eu te amo' pela primeira vez...",
  "Ela voltou para a cidade pequena. E ele ainda morava na casa ao lado."
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// — Icons as components —
const Icon = ({ d, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const BookIcon = (p) => <Icon {...p} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/>;
const PenIcon = (p) => <Icon {...p} d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>;
const UserIcon = (p) => <Icon {...p} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>;
const MapIcon = (p) => <Icon {...p} d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/>;
const SparkleIcon = (p) => <Icon {...p} d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4 5.6 21.2 8 14 2 9.2h7.6z"/>;
const ClockIcon = (p) => <Icon {...p} d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2"/>;
const PlusIcon = (p) => <Icon {...p} d="M12 5v14 M5 12h14"/>;
const TrashIcon = (p) => <Icon {...p} d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>;
const ChevronIcon = (p) => <Icon {...p} d="M9 18l6-6-6-6"/>;
const SaveIcon = (p) => <Icon {...p} d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8"/>;
const TargetIcon = (p) => <Icon {...p} d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>;
const LightbulbIcon = (p) => <Icon {...p} d="M9 18h6 M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>;
const HeartIcon = (p) => <Icon {...p} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>;
const MenuIcon = (p) => <Icon {...p} d="M3 12h18 M3 6h18 M3 18h18"/>;
const XIcon = (p) => <Icon {...p} d="M18 6L6 18 M6 6l12 12"/>;
const DownloadIcon = (p) => <Icon {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3"/>;
const CopyIcon = (p) => <Icon {...p} d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2 M16 4h2a2 2 0 0 1 2 2v6 M8 2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>;

// ─── Main App ───
export default function RomanceWriterStudio() {
  const saved = loadState();
  const [books, setBooks] = useState(saved?.books || []);
  const [activeBookId, setActiveBookId] = useState(saved?.activeBookId || null);
  const [activeTab, setActiveTab] = useState(saved?.activeTab || "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [writingTimer, setWritingTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerGoal, setTimerGoal] = useState(15);
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [editingScene, setEditingScene] = useState(null);
  const [editingChar, setEditingChar] = useState(null);
  const [freeWriteText, setFreeWriteText] = useState("");

  const timerRef = useRef(null);
  const chatEndRef = useRef(null);

  const activeBook = books.find(b => b.id === activeBookId) || null;

  // Persist
  useEffect(() => {
    saveState({ books, activeBookId, activeTab });
  }, [books, activeBookId, activeTab]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setWritingTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChat]);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const updateBook = useCallback((bookId, updater) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...updater(b), updatedAt: new Date().toISOString() } : b));
  }, []);

  // — Book CRUD —
  const createBook = () => {
    const book = { ...BOOK_TEMPLATE, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), title: "Novo Romance" };
    setBooks(prev => [...prev, book]);
    setActiveBookId(book.id);
    setActiveTab("overview");
    notify("Novo livro criado!");
  };

  const deleteBook = (id) => {
    if (!confirm("Excluir este livro permanentemente?")) return;
    setBooks(prev => prev.filter(b => b.id !== id));
    if (activeBookId === id) { setActiveBookId(null); setActiveTab("dashboard"); }
    notify("Livro excluído");
  };

  // — Character CRUD —
  const addCharacter = () => {
    const char = { ...CHARACTER_TEMPLATE, id: uid(), name: "Novo Personagem" };
    updateBook(activeBookId, b => ({ ...b, characters: [...b.characters, char] }));
    setEditingChar(char.id);
  };
  const updateCharacter = (charId, field, value) => {
    updateBook(activeBookId, b => ({
      ...b, characters: b.characters.map(c => c.id === charId ? { ...c, [field]: value } : c)
    }));
  };
  const deleteCharacter = (charId) => {
    updateBook(activeBookId, b => ({ ...b, characters: b.characters.filter(c => c.id !== charId) }));
    setEditingChar(null);
  };

  // — Scene CRUD —
  const addScene = () => {
    const scene = { ...SCENE_TEMPLATE, id: uid(), title: "Nova Cena" };
    updateBook(activeBookId, b => ({ ...b, scenes: [...b.scenes, scene] }));
    setEditingScene(scene.id);
  };
  const updateScene = (sceneId, field, value) => {
    updateBook(activeBookId, b => ({
      ...b, scenes: b.scenes.map(s => {
        if (s.id !== sceneId) return s;
        const updated = { ...s, [field]: value };
        if (field === "content") updated.wordCount = value.trim().split(/\s+/).filter(Boolean).length;
        return updated;
      })
    }));
  };
  const deleteScene = (sceneId) => {
    updateBook(activeBookId, b => ({ ...b, scenes: b.scenes.filter(s => s.id !== sceneId) }));
    setEditingScene(null);
  };

  // — Writing Prompt —
  const newPrompt = () => {
    setCurrentPrompt(WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)]);
    setShowPrompt(true);
  };

  // — Total word count —
  const totalWords = activeBook ? activeBook.scenes.reduce((sum, s) => sum + (s.wordCount || 0), 0) + freeWriteText.trim().split(/\s+/).filter(Boolean).length : 0;
  const progress = activeBook ? Math.min(100, Math.round((totalWords / activeBook.targetWordCount) * 100)) : 0;

  // — AI Chat —
  const sendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    setAiChat(prev => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);

    const systemPrompt = `Você é uma mentora de escrita criativa especializada em romances comerciais para Amazon KDP. Seu nome é Musa.
Você ajuda escritoras a desenvolver tramas envolventes, personagens carismáticos e cenas emocionantes.
Responda sempre em português brasileiro, de forma acolhedora mas objetiva.
${activeBook ? `
Contexto do livro atual:
- Título: ${activeBook.title}
- Gênero: ${activeBook.genre}
- Trope: ${activeBook.trope}
- Logline: ${activeBook.logline}
- Personagens: ${activeBook.characters.map(c => `${c.name} (${c.role})`).join(", ")}
- Cenas: ${activeBook.scenes.length}
- Palavras escritas: ${totalWords}
- Meta: ${activeBook.targetWordCount} palavras` : "Nenhum livro selecionado."}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...aiChat.slice(-10), { role: "user", content: userMsg }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(i => i.text || "").join("\n") || "Desculpe, não consegui responder.";
      setAiChat(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setAiChat(prev => [...prev, { role: "assistant", content: "Erro ao conectar com a IA. Verifique sua conexão." }]);
    }
    setAiLoading(false);
  };

  // — Export —
  const exportBook = () => {
    if (!activeBook) return;
    const text = activeBook.scenes.map((s, i) => `--- Cena ${i + 1}: ${s.title} ---\n${s.content || "(vazio)"}\n`).join("\n\n");
    const blob = new Blob([`${activeBook.title}\n${activeBook.subtitle || ""}\n\n${activeBook.synopsis || ""}\n\n${"=".repeat(40)}\n\n${text}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${activeBook.title.replace(/\s+/g, "_")}.txt`;
    a.click(); URL.revokeObjectURL(url);
    notify("Manuscrito exportado!");
  };

  // — Timer format —
  const fmtTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const timerPct = Math.min(100, (writingTimer / (timerGoal * 60)) * 100);

  // — Tabs config —
  const tabs = activeBook
    ? [
        { id: "dashboard", label: "Início", icon: BookIcon },
        { id: "overview", label: "Livro", icon: HeartIcon },
        { id: "characters", label: "Personagens", icon: UserIcon },
        { id: "scenes", label: "Cenas", icon: MapIcon },
        { id: "beats", label: "Estrutura", icon: TargetIcon },
        { id: "write", label: "Escrever", icon: PenIcon },
        { id: "muse", label: "Musa IA", icon: SparkleIcon },
      ]
    : [{ id: "dashboard", label: "Início", icon: BookIcon }];

  // ─── Styles ───
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600&display=swap');

    :root {
      --bg: #0f0d0e;
      --bg2: #1a1718;
      --bg3: #252122;
      --surface: #2d2829;
      --border: #3d3536;
      --text: #f5e6e8;
      --text2: #c4a8ac;
      --text3: #8a6d72;
      --accent: #e85d75;
      --accent2: #f0a0b0;
      --accent3: #c94060;
      --gold: #d4a853;
      --gold2: #f0d090;
      --success: #6ec87a;
      --serif: 'Playfair Display', Georgia, serif;
      --sans: 'Source Sans 3', system-ui, sans-serif;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--sans);
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
    }

    .app {
      display: flex;
      height: 100dvh;
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: 240px;
      background: var(--bg2);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: transform 0.3s ease;
      z-index: 100;
    }

    .sidebar-header {
      padding: 20px 16px;
      border-bottom: 1px solid var(--border);
    }

    .sidebar-header h1 {
      font-family: var(--serif);
      font-size: 18px;
      font-weight: 600;
      color: var(--accent);
      letter-spacing: 0.5px;
    }

    .sidebar-header p {
      font-size: 11px;
      color: var(--text3);
      margin-top: 4px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .sidebar-nav {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      color: var(--text2);
      transition: all 0.2s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: var(--sans);
    }

    .nav-item:hover { background: var(--bg3); color: var(--text); }
    .nav-item.active { background: var(--accent3); color: white; }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid var(--border);
    }

    /* Timer widget */
    .timer-widget {
      background: var(--bg3);
      border-radius: 10px;
      padding: 12px;
    }

    .timer-display {
      font-family: var(--serif);
      font-size: 28px;
      text-align: center;
      color: var(--gold);
      letter-spacing: 2px;
    }

    .timer-bar {
      height: 3px;
      background: var(--border);
      border-radius: 2px;
      margin: 8px 0;
      overflow: hidden;
    }

    .timer-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--gold));
      border-radius: 2px;
      transition: width 1s linear;
    }

    .timer-controls {
      display: flex;
      gap: 6px;
      justify-content: center;
    }

    .timer-btn {
      padding: 5px 14px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text2);
      cursor: pointer;
      font-size: 12px;
      font-family: var(--sans);
      transition: all 0.2s;
    }

    .timer-btn:hover { border-color: var(--accent); color: var(--accent); }
    .timer-btn.active { background: var(--accent3); border-color: var(--accent); color: white; }

    /* Main content */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .topbar {
      display: none;
      padding: 12px 16px;
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      align-items: center;
      gap: 12px;
    }

    .menu-btn {
      background: none;
      border: none;
      color: var(--text);
      cursor: pointer;
      padding: 4px;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .content::-webkit-scrollbar { width: 6px; }
    .content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    /* Cards & sections */
    .section-title {
      font-family: var(--serif);
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--text);
    }

    .section-subtitle {
      font-size: 14px;
      color: var(--text3);
      margin-bottom: 20px;
    }

    .card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }

    .card:hover { border-color: var(--text3); }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .card-title {
      font-family: var(--serif);
      font-size: 16px;
      font-weight: 600;
    }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

    /* Forms */
    .field { margin-bottom: 14px; }
    .field label {
      display: block;
      font-size: 12px;
      color: var(--text3);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .field input, .field select, .field textarea {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 14px;
      font-family: var(--sans);
      outline: none;
      transition: border-color 0.2s;
      resize: vertical;
    }

    .field input:focus, .field select:focus, .field textarea:focus {
      border-color: var(--accent);
    }

    .field textarea { min-height: 80px; line-height: 1.6; }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      font-family: var(--sans);
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--accent);
      color: white;
    }
    .btn-primary:hover { background: var(--accent3); }

    .btn-secondary {
      background: var(--surface);
      color: var(--text2);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { border-color: var(--text3); color: var(--text); }

    .btn-ghost {
      background: none;
      color: var(--text3);
    }
    .btn-ghost:hover { color: var(--accent); }

    .btn-danger { background: none; color: var(--text3); }
    .btn-danger:hover { color: #e54; }

    .btn-gold {
      background: linear-gradient(135deg, var(--gold), #c08830);
      color: #1a1110;
      font-weight: 600;
    }
    .btn-gold:hover { filter: brightness(1.1); }

    /* Progress bar */
    .progress-container {
      background: var(--bg3);
      border-radius: 10px;
      overflow: hidden;
      height: 20px;
      position: relative;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--gold));
      border-radius: 10px;
      transition: width 0.5s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .progress-text {
      font-size: 11px;
      font-weight: 600;
      color: white;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }

    /* Beat sheet */
    .beat-row {
      display: flex;
      align-items: stretch;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }

    .beat-pct {
      width: 60px;
      font-size: 11px;
      color: var(--gold);
      font-weight: 500;
      padding-top: 2px;
      flex-shrink: 0;
    }

    .beat-name {
      width: 160px;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .beat-desc {
      flex: 1;
      font-size: 13px;
      color: var(--text2);
    }

    /* Writing area */
    .writing-area {
      width: 100%;
      min-height: 400px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      color: var(--text);
      font-family: var(--serif);
      font-size: 17px;
      line-height: 1.8;
      outline: none;
      resize: vertical;
    }

    .writing-area:focus { border-color: var(--accent); }
    .writing-area::placeholder { color: var(--text3); font-style: italic; }

    /* Chat */
    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 0;
    }

    .chat-msg {
      margin-bottom: 14px;
      display: flex;
      flex-direction: column;
    }

    .chat-msg.user .chat-bubble {
      background: var(--accent3);
      color: white;
      align-self: flex-end;
      border-radius: 16px 16px 4px 16px;
    }

    .chat-msg.assistant .chat-bubble {
      background: var(--bg3);
      color: var(--text);
      align-self: flex-start;
      border-radius: 16px 16px 16px 4px;
    }

    .chat-bubble {
      padding: 10px 14px;
      max-width: 85%;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .chat-label {
      font-size: 10px;
      color: var(--text3);
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .chat-msg.user .chat-label { text-align: right; }

    .chat-input-row {
      display: flex;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }

    .chat-input {
      flex: 1;
      padding: 10px 14px;
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text);
      font-size: 14px;
      font-family: var(--sans);
      outline: none;
    }

    .chat-input:focus { border-color: var(--accent); }

    /* Stat box */
    .stat-box {
      text-align: center;
      padding: 16px;
      background: var(--bg3);
      border-radius: 10px;
    }

    .stat-value {
      font-family: var(--serif);
      font-size: 28px;
      font-weight: 700;
      color: var(--gold);
    }

    .stat-label {
      font-size: 11px;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    /* Prompt modal */
    .prompt-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      backdrop-filter: blur(4px);
    }

    .prompt-modal {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 90%;
      text-align: center;
    }

    .prompt-text {
      font-family: var(--serif);
      font-size: 20px;
      font-style: italic;
      color: var(--accent2);
      line-height: 1.6;
      margin: 20px 0;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--success);
      color: #111;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      z-index: 300;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Book card on dashboard */
    .book-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .book-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(232,93,117,0.1);
    }

    .book-card h3 {
      font-family: var(--serif);
      font-size: 18px;
      margin-bottom: 4px;
    }

    .book-card .meta {
      font-size: 12px;
      color: var(--text3);
    }

    .book-card .delete-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      color: var(--text3);
      cursor: pointer;
      padding: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .book-card:hover .delete-btn { opacity: 1; }
    .book-card .delete-btn:hover { color: #e54; }

    /* Scene list item */
    .scene-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg3);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 8px;
    }

    .scene-item:hover { background: var(--surface); }
    .scene-item.active { border-left: 3px solid var(--accent); }

    .scene-num {
      width: 28px;
      height: 28px;
      background: var(--accent3);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text3);
    }

    .empty-state h3 {
      font-family: var(--serif);
      font-size: 20px;
      color: var(--text2);
      margin-bottom: 8px;
    }

    /* Character card */
    .char-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .char-card:hover { border-color: var(--accent); }
    .char-card.active { border-color: var(--gold); }

    .char-role {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--gold);
      margin-bottom: 4px;
    }

    .char-name {
      font-family: var(--serif);
      font-size: 16px;
      font-weight: 600;
    }

    /* Quick actions */
    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .quick-action {
      padding: 6px 12px;
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 20px;
      color: var(--text2);
      font-size: 12px;
      cursor: pointer;
      font-family: var(--sans);
      transition: all 0.2s;
    }

    .quick-action:hover { border-color: var(--accent); color: var(--accent); }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100%;
        transform: translateX(-100%);
      }
      .sidebar.open { transform: translateX(0); }
      .topbar { display: flex; }
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .content { padding: 16px; }
      .beat-row { flex-direction: column; gap: 4px; }
      .beat-pct { width: auto; }
      .beat-name { width: auto; }

      .sidebar-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 99;
      }
    }
  `;

  // ─── Render Functions ───

  const renderDashboard = () => (
    <div>
      <h2 className="section-title">Seus Romances</h2>
      <p className="section-subtitle">Gerencie seus projetos de escrita</p>

      <button className="btn btn-gold" onClick={createBook} style={{ marginBottom: 20 }}>
        <PlusIcon size={16}/> Novo Romance
      </button>

      {books.length === 0 ? (
        <div className="empty-state">
          <HeartIcon size={48} color="var(--accent3)"/>
          <h3>Nenhum romance ainda</h3>
          <p>Comece sua jornada criando seu primeiro livro</p>
        </div>
      ) : (
        <div className="grid-2">
          {books.map(book => {
            const wc = book.scenes.reduce((s, sc) => s + (sc.wordCount || 0), 0);
            const pct = Math.min(100, Math.round((wc / book.targetWordCount) * 100));
            return (
              <div key={book.id} className="book-card" onClick={() => { setActiveBookId(book.id); setActiveTab("overview"); }}>
                <button className="delete-btn" onClick={e => { e.stopPropagation(); deleteBook(book.id); }}><TrashIcon size={16}/></button>
                <h3>{book.title}</h3>
                <div className="meta">{book.genre} • {book.trope || "Sem trope"}</div>
                <div className="meta" style={{ marginTop: 6 }}>{wc.toLocaleString()} / {book.targetWordCount.toLocaleString()} palavras</div>
                <div className="progress-container" style={{ marginTop: 8 }}>
                  <div className="progress-bar" style={{ width: `${pct}%` }}/>
                  <span className="progress-text">{pct}%</span>
                </div>
                <div className="meta" style={{ marginTop: 6 }}>{book.characters.length} personagens • {book.scenes.length} cenas</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h2 className="section-title">Inspiração Rápida</h2>
        <p className="section-subtitle">Precisa de um empurrão criativo?</p>
        <button className="btn btn-primary" onClick={newPrompt}><LightbulbIcon size={16}/> Gerar Prompt</button>
      </div>
    </div>
  );

  const renderOverview = () => {
    if (!activeBook) return null;
    return (
      <div>
        <h2 className="section-title">Visão Geral</h2>
        <p className="section-subtitle">Detalhes do seu romance</p>

        <div className="card">
          <div className="grid-2">
            <div className="field">
              <label>Título</label>
              <input value={activeBook.title} onChange={e => updateBook(activeBookId, b => ({ ...b, title: e.target.value }))}/>
            </div>
            <div className="field">
              <label>Subtítulo</label>
              <input value={activeBook.subtitle} onChange={e => updateBook(activeBookId, b => ({ ...b, subtitle: e.target.value }))}/>
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Gênero</label>
              <select value={activeBook.genre} onChange={e => updateBook(activeBookId, b => ({ ...b, genre: e.target.value }))}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Trope Principal</label>
              <select value={activeBook.trope} onChange={e => updateBook(activeBookId, b => ({ ...b, trope: e.target.value }))}>
                <option value="">Selecione...</option>
                {TROPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Logline (1-2 frases que vendem o livro)</label>
            <textarea value={activeBook.logline} onChange={e => updateBook(activeBookId, b => ({ ...b, logline: e.target.value }))} rows={2} placeholder="Ex: Quando uma chef teimosa é forçada a dividir a cozinha com seu rival, faíscas voam — e não são só do fogão."/>
          </div>
          <div className="field">
            <label>Sinopse</label>
            <textarea value={activeBook.synopsis} onChange={e => updateBook(activeBookId, b => ({ ...b, synopsis: e.target.value }))} rows={5} placeholder="Resuma a trama principal..."/>
          </div>
          <div className="field">
            <label>Meta de Palavras</label>
            <input type="number" value={activeBook.targetWordCount} onChange={e => updateBook(activeBookId, b => ({ ...b, targetWordCount: parseInt(e.target.value) || 50000 }))}/>
          </div>
          <div className="field">
            <label>Notas Gerais</label>
            <textarea value={activeBook.notes} onChange={e => updateBook(activeBookId, b => ({ ...b, notes: e.target.value }))} rows={3} placeholder="Referências, pesquisa, ideias soltas..."/>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: 16 }}>
          <div className="stat-box">
            <div className="stat-value">{totalWords.toLocaleString()}</div>
            <div className="stat-label">Palavras Escritas</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{activeBook.scenes.length}</div>
            <div className="stat-label">Cenas</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{activeBook.characters.length}</div>
            <div className="stat-label">Personagens</div>
          </div>
        </div>

        <div className="progress-container" style={{ marginTop: 16 }}>
          <div className="progress-bar" style={{ width: `${progress}%` }}/>
          <span className="progress-text">{progress}% — {totalWords.toLocaleString()} / {activeBook.targetWordCount.toLocaleString()}</span>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={exportBook}><DownloadIcon size={14}/> Exportar .txt</button>
        </div>
      </div>
    );
  };

  const renderCharacters = () => {
    if (!activeBook) return null;
    const editChar = activeBook.characters.find(c => c.id === editingChar);
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 className="section-title">Personagens</h2>
            <p className="section-subtitle">Dê vida aos seus personagens</p>
          </div>
          <button className="btn btn-primary" onClick={addCharacter}><PlusIcon size={14}/> Novo</button>
        </div>

        {activeBook.characters.length === 0 ? (
          <div className="empty-state"><UserIcon size={40} color="var(--text3)"/><h3>Nenhum personagem</h3><p>Crie seu primeiro personagem</p></div>
        ) : (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 200, flexShrink: 0 }}>
              {activeBook.characters.map(c => (
                <div key={c.id} className={`char-card ${editingChar === c.id ? "active" : ""}`} onClick={() => setEditingChar(c.id)} style={{ marginBottom: 8 }}>
                  <div className="char-role">{c.role}</div>
                  <div className="char-name">{c.name}</div>
                </div>
              ))}
            </div>
            {editChar && (
              <div style={{ flex: 1, minWidth: 300 }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">{editChar.name}</span>
                    <button className="btn btn-danger" onClick={() => deleteCharacter(editChar.id)}><TrashIcon size={14}/> Excluir</button>
                  </div>
                  <div className="grid-2">
                    <div className="field"><label>Nome</label><input value={editChar.name} onChange={e => updateCharacter(editChar.id, "name", e.target.value)}/></div>
                    <div className="field"><label>Papel</label>
                      <select value={editChar.role} onChange={e => updateCharacter(editChar.id, "role", e.target.value)}>
                        <option value="protagonist">Protagonista</option>
                        <option value="love_interest">Par Romântico</option>
                        <option value="antagonist">Antagonista</option>
                        <option value="secondary">Secundário</option>
                        <option value="mentor">Mentor</option>
                        <option value="comic_relief">Alívio Cômico</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="field"><label>Idade</label><input value={editChar.age} onChange={e => updateCharacter(editChar.id, "age", e.target.value)}/></div>
                    <div className="field"><label>Voz / Forma de Falar</label><input value={editChar.voice} onChange={e => updateCharacter(editChar.id, "voice", e.target.value)} placeholder="Ex: sarcástica, formal..."/></div>
                  </div>
                  <div className="field"><label>Aparência</label><textarea value={editChar.appearance} onChange={e => updateCharacter(editChar.id, "appearance", e.target.value)} rows={2}/></div>
                  <div className="field"><label>Personalidade</label><textarea value={editChar.personality} onChange={e => updateCharacter(editChar.id, "personality", e.target.value)} rows={2}/></div>
                  <div className="field"><label>História / Backstory</label><textarea value={editChar.backstory} onChange={e => updateCharacter(editChar.id, "backstory", e.target.value)} rows={3}/></div>
                  <div className="field"><label>Motivação</label><textarea value={editChar.motivation} onChange={e => updateCharacter(editChar.id, "motivation", e.target.value)} rows={2}/></div>
                  <div className="field"><label>Conflito Interno</label><textarea value={editChar.conflict} onChange={e => updateCharacter(editChar.id, "conflict", e.target.value)} rows={2}/></div>
                  <div className="field"><label>Arco de Transformação</label><textarea value={editChar.arc} onChange={e => updateCharacter(editChar.id, "arc", e.target.value)} rows={2} placeholder="Como esse personagem muda ao longo da história?"/></div>
                  <div className="field"><label>Relacionamentos</label><textarea value={editChar.relationships} onChange={e => updateCharacter(editChar.id, "relationships", e.target.value)} rows={2}/></div>
                  <div className="field"><label>Manias / Detalhes Únicos</label><textarea value={editChar.quirks} onChange={e => updateCharacter(editChar.id, "quirks", e.target.value)} rows={2}/></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderScenes = () => {
    if (!activeBook) return null;
    const editSc = activeBook.scenes.find(s => s.id === editingScene);
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 className="section-title">Cenas</h2>
            <p className="section-subtitle">Construa sua história cena por cena</p>
          </div>
          <button className="btn btn-primary" onClick={addScene}><PlusIcon size={14}/> Nova Cena</button>
        </div>

        {activeBook.scenes.length === 0 ? (
          <div className="empty-state"><MapIcon size={40} color="var(--text3)"/><h3>Nenhuma cena</h3><p>Comece a planejar suas cenas</p></div>
        ) : (
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ width: 260, flexShrink: 0 }}>
              {activeBook.scenes.map((s, i) => (
                <div key={s.id} className={`scene-item ${editingScene === s.id ? "active" : ""}`} onClick={() => setEditingScene(s.id)}>
                  <div className="scene-num">{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{s.wordCount || 0} palavras</div>
                  </div>
                  <ChevronIcon size={14} color="var(--text3)"/>
                </div>
              ))}
            </div>
            {editSc && (
              <div style={{ flex: 1, minWidth: 300 }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Cena: {editSc.title}</span>
                    <button className="btn btn-danger" onClick={() => deleteScene(editSc.id)}><TrashIcon size={14}/> Excluir</button>
                  </div>
                  <div className="grid-2">
                    <div className="field"><label>Título</label><input value={editSc.title} onChange={e => updateScene(editSc.id, "title", e.target.value)}/></div>
                    <div className="field"><label>Capítulo</label><input value={editSc.chapter} onChange={e => updateScene(editSc.id, "chapter", e.target.value)} placeholder="Ex: Cap 1"/></div>
                  </div>
                  <div className="grid-2">
                    <div className="field"><label>POV (ponto de vista)</label>
                      <select value={editSc.pov} onChange={e => updateScene(editSc.id, "pov", e.target.value)}>
                        <option value="">Selecione...</option>
                        {activeBook.characters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="field"><label>Local</label><input value={editSc.location} onChange={e => updateScene(editSc.id, "location", e.target.value)}/></div>
                  </div>
                  <div className="grid-2">
                    <div className="field"><label>Quando</label><input value={editSc.time} onChange={e => updateScene(editSc.id, "time", e.target.value)} placeholder="Ex: Manhã de segunda"/></div>
                    <div className="field"><label>Batida Emocional</label><input value={editSc.emotionalBeat} onChange={e => updateScene(editSc.id, "emotionalBeat", e.target.value)} placeholder="Ex: tensão, desejo, alívio"/></div>
                  </div>
                  <div className="field"><label>Objetivo da Cena</label><textarea value={editSc.goal} onChange={e => updateScene(editSc.id, "goal", e.target.value)} rows={2} placeholder="O que precisa acontecer nesta cena?"/></div>
                  <div className="field"><label>Conflito</label><textarea value={editSc.conflict} onChange={e => updateScene(editSc.id, "conflict", e.target.value)} rows={2}/></div>
                  <div className="field"><label>Desfecho</label><textarea value={editSc.outcome} onChange={e => updateScene(editSc.id, "outcome", e.target.value)} rows={2}/></div>
                  <div className="field"><label>Notas</label><textarea value={editSc.notes} onChange={e => updateScene(editSc.id, "notes", e.target.value)} rows={2}/></div>
                  <div className="field">
                    <label>Texto da Cena ({editSc.wordCount || 0} palavras)</label>
                    <textarea className="writing-area" value={editSc.content} onChange={e => updateScene(editSc.id, "content", e.target.value)} placeholder="Comece a escrever sua cena aqui..." style={{ fontFamily: "var(--serif)", minHeight: 250 }}/>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBeats = () => (
    <div>
      <h2 className="section-title">Estrutura do Romance</h2>
      <p className="section-subtitle">Beat Sheet adaptado para romance — guia de ritmo narrativo</p>
      <div className="card">
        {BEAT_SHEET.map((b, i) => (
          <div key={i} className="beat-row">
            <div className="beat-pct">{b.pct}</div>
            <div className="beat-name">{b.beat}</div>
            <div className="beat-desc">{b.desc}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Dica KDP</div>
        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
          Romances na Amazon costumam ter entre 50.000 e 80.000 palavras. Romances mais curtos (40k–50k) funcionam bem em séries. Dark Romance e Romance Erótico podem ser mais curtos (30k–50k). Romantic Suspense tende a ser mais longo (70k–90k).
        </p>
      </div>
    </div>
  );

  const renderWrite = () => {
    const wc = freeWriteText.trim().split(/\s+/).filter(Boolean).length;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 className="section-title">Escrita Livre</h2>
            <p className="section-subtitle">Escreva sem julgamento — fluidez antes de perfeição</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary" onClick={newPrompt}><LightbulbIcon size={14}/> Prompt</button>
            <button className="btn btn-secondary" onClick={() => {
              if (freeWriteText.trim()) {
                const scene = { ...SCENE_TEMPLATE, id: uid(), title: `Escrita Livre ${new Date().toLocaleDateString("pt-BR")}`, content: freeWriteText, wordCount: wc };
                updateBook(activeBookId, b => ({ ...b, scenes: [...b.scenes, scene] }));
                notify("Texto salvo como cena!");
              }
            }}><SaveIcon size={14}/> Salvar como Cena</button>
          </div>
        </div>

        <textarea
          className="writing-area"
          value={freeWriteText}
          onChange={e => setFreeWriteText(e.target.value)}
          placeholder="Comece a escrever... Não se preocupe com perfeição. Deixe as palavras fluírem."
          style={{ minHeight: 500 }}
        />
        <div style={{ marginTop: 8, fontSize: 13, color: "var(--text3)" }}>
          {wc} palavras • {freeWriteText.length} caracteres
        </div>
      </div>
    );
  };

  const renderMuse = () => (
    <div className="chat-container" style={{ height: "calc(100dvh - 140px)" }}>
      <div style={{ marginBottom: 12 }}>
        <h2 className="section-title">Musa — Sua Mentora IA</h2>
        <p className="section-subtitle">Peça ajuda com trama, personagens, cenas, bloqueios...</p>
        <div className="quick-actions">
          {[
            "Me ajude a desenvolver o conflito principal",
            "Crie tensão sexual entre os protagonistas",
            "Sugira uma cena de virada",
            "Como faço o black moment impactante?",
            "Me dê ideias para o primeiro encontro",
            "Como inicio o capítulo 1 com gancho?"
          ].map(q => (
            <button key={q} className="quick-action" onClick={() => { setAiInput(q); }}>{q}</button>
          ))}
        </div>
      </div>

      <div className="chat-messages">
        {aiChat.length === 0 && (
          <div className="empty-state" style={{ padding: 40 }}>
            <SparkleIcon size={40} color="var(--gold)"/>
            <h3>Olá, escritora!</h3>
            <p>Sou a Musa, sua mentora criativa. Pergunte qualquer coisa sobre seu romance.</p>
          </div>
        )}
        {aiChat.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <span className="chat-label">{msg.role === "user" ? "Você" : "Musa"}</span>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
        {aiLoading && (
          <div className="chat-msg assistant">
            <span className="chat-label">Musa</span>
            <div className="chat-bubble" style={{ color: "var(--text3)", fontStyle: "italic" }}>Pensando...</div>
          </div>
        )}
        <div ref={chatEndRef}/>
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendAiMessage()}
          placeholder="Pergunte à Musa..."
        />
        <button className="btn btn-primary" onClick={sendAiMessage} disabled={aiLoading}>
          {aiLoading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "overview": return renderOverview();
      case "characters": return renderCharacters();
      case "scenes": return renderScenes();
      case "beats": return renderBeats();
      case "write": return renderWrite();
      case "muse": return renderMuse();
      default: return renderDashboard();
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}/>}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h1>Romance Studio</h1>
            <p>Escrita Criativa</p>
          </div>
          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              >
                <tab.icon size={18}/> {tab.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="timer-widget">
              <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginBottom: 4 }}>TIMER DE ESCRITA</div>
              <div className="timer-display">{fmtTime(writingTimer)}</div>
              <div className="timer-bar"><div className="timer-fill" style={{ width: `${timerPct}%` }}/></div>
              <div style={{ fontSize: 10, color: "var(--text3)", textAlign: "center", marginBottom: 6 }}>Meta: {timerGoal} min</div>
              <div className="timer-controls">
                <button className={`timer-btn ${timerRunning ? "active" : ""}`} onClick={() => setTimerRunning(!timerRunning)}>
                  {timerRunning ? "Pausar" : "Iniciar"}
                </button>
                <button className="timer-btn" onClick={() => { setWritingTimer(0); setTimerRunning(false); }}>Reset</button>
              </div>
              <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 6 }}>
                {[10, 15, 25, 45].map(m => (
                  <button key={m} className="timer-btn" style={{ padding: "2px 8px", fontSize: 10 }} onClick={() => setTimerGoal(m)}>{m}m</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}><MenuIcon size={22}/></button>
            <span style={{ fontFamily: "var(--serif)", fontSize: 16 }}>Romance Studio</span>
          </div>
          <div className="content">{renderContent()}</div>
        </main>

        {showPrompt && (
          <div className="prompt-overlay" onClick={() => setShowPrompt(false)}>
            <div className="prompt-modal" onClick={e => e.stopPropagation()}>
              <LightbulbIcon size={32} color="var(--gold)"/>
              <div className="prompt-text">{currentPrompt}</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn btn-primary" onClick={newPrompt}>Outro Prompt</button>
                <button className="btn btn-secondary" onClick={() => {
                  setFreeWriteText(prev => prev + (prev ? "\n\n" : "") + currentPrompt + "\n\n");
                  setShowPrompt(false);
                  setActiveTab("write");
                  notify("Prompt adicionado!");
                }}>Usar na Escrita</button>
                <button className="btn btn-ghost" onClick={() => setShowPrompt(false)}><XIcon size={14}/></button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
