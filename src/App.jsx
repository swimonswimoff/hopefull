import { useState, useRef, useEffect } from "react";

const TAGS = ["アイデア", "課題", "気づき", "やりたい", "メモ"];

const TAG_COLORS = {
  "アイデア": { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
  "課題":    { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  "気づき":  { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
  "やりたい":{ bg: "#F3E5F5", text: "#6A1B9A", border: "#CE93D8" },
  "メモ":    { bg: "#FFF8E1", text: "#F57F17", border: "#FFE082" },
};

const STATUSES = [
  { key: "open",       label: "検討中", color: "#FF9F43", bg: "#FFF8F0" },
  { key: "inprogress", label: "進行中", color: "#4C9BE8", bg: "#F0F7FF" },
  { key: "done",       label: "完了",   color: "#AAB8A0", bg: "#F5F7F4" },
];

const FIELDS = [
  { key: "title",   label: "タイトル",      placeholder: "何についてのアイデア？",       multiline: false },
  { key: "purpose", label: "目的",          placeholder: "なぜやる？誰のため？",         multiline: true },
  { key: "problem", label: "課題・背景",    placeholder: "今どんな問題がある？",         multiline: true },
  { key: "action",  label: "次のアクション", placeholder: "明日できる最初の一歩は？",    multiline: true },
  { key: "memo",    label: "メモ",          placeholder: "思いついたこと、参考、なんでも", multiline: true },
];

function formatDate(d) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(d);
}

function TagBadge({ tag }) {
  const c = TAG_COLORS[tag] || { bg: "#F5F5F5", text: "#555", border: "#DDD" };
  return (
    <span style={{
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: 20, padding: "2px 10px",
      fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
    }}>{tag}</span>
  );
}

function StatusPill({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const current = STATUSES.find(s => s.key === status) || STATUSES[0];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: current.bg,
          color: current.color,
          border: `1.5px solid ${current.color}44`,
          borderRadius: 20,
          padding: "3px 10px 3px 8px",
          fontSize: 11, fontWeight: 700,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4,
          transition: "all 0.15s",
        }}
      >
        <span style={{ fontSize: 9 }}>●</span>
        {current.label}
        <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0,
          background: "#FFF",
          border: "1.5px solid #F0E6D0",
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          zIndex: 10,
          overflow: "hidden",
          minWidth: 100,
        }}>
          {STATUSES.map(s => (
            <button
              key={s.key}
              onClick={() => { onChange(s.key); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                width: "100%", border: "none",
                background: s.key === status ? s.bg : "transparent",
                color: s.color,
                padding: "8px 12px",
                fontSize: 12, fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 8 }}>●</span>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  const isEmpty = !value.trim();
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
        color: isEmpty ? "#D4C4A8" : "#C8820A",
        marginBottom: 4, textTransform: "uppercase",
        transition: "color 0.2s",
      }}>
        {field.label}
      </div>
      {field.multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          style={{
            width: "100%", border: "none",
            borderBottom: `1.5px solid ${isEmpty ? "#F0E6D0" : "#FFCC80"}`,
            fontSize: 13.5, color: "#3D2B0D",
            background: "transparent",
            resize: "none", lineHeight: 1.8,
            padding: "2px 0 6px",
            transition: "border-color 0.2s",
          }}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={{
            width: "100%", border: "none",
            borderBottom: `1.5px solid ${isEmpty ? "#F0E6D0" : "#FFCC80"}`,
            fontSize: 15, fontWeight: 700,
            color: "#3D2B0D", background: "transparent",
            padding: "2px 0 6px",
            transition: "border-color 0.2s",
          }}
        />
      )}
    </div>
  );
}

function IdeaCard({ idea, onAsk, onStatusChange }) {
  const [hover, setHover] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isDone = idea.status === "done";
  const filledFields = FIELDS.filter(f => idea[f.key]?.trim());

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: isDone ? "#F8F6F2" : "#FFFDF8",
        border: `1.5px solid ${isDone ? "#E8E0D4" : "#F0E6D0"}`,
        borderRadius: 16,
        padding: "16px 18px",
        marginBottom: 12,
        opacity: isDone ? 0.6 : 1,
        boxShadow: hover && !isDone
          ? "0 6px 24px rgba(230,130,0,0.13)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hover && !isDone ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.25s ease",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <StatusPill status={idea.status || "open"} onChange={s => onStatusChange(idea.id, s)} />
          {idea.tags.map(t => <TagBadge key={t} tag={t} />)}
        </div>
        <span style={{ fontSize: 11, color: "#BBAA90", whiteSpace: "nowrap", marginLeft: 8 }}>
          {formatDate(idea.createdAt)}
        </span>
      </div>

      {/* Title */}
      {idea.title && (
        <div style={{
          fontWeight: 700, fontSize: 15,
          color: isDone ? "#8A8078" : "#3D2B0D",
          marginBottom: 8,
          textDecoration: isDone ? "line-through" : "none",
        }}>
          {idea.title}
        </div>
      )}

      {/* Fields */}
      {!isDone && filledFields.filter(f => f.key !== "title").length > 0 && (
        <div>
          {(expanded
            ? filledFields.filter(f => f.key !== "title")
            : filledFields.filter(f => f.key !== "title").slice(0, 2)
          ).map(f => (
            <div key={f.key} style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#C8820A", letterSpacing: 1, textTransform: "uppercase", marginRight: 6 }}>
                {f.label}
              </span>
              <span style={{ fontSize: 13, color: "#6B5440", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {idea[f.key]}
              </span>
            </div>
          ))}
          {filledFields.filter(f => f.key !== "title").length > 2 && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 11, color: "#C8820A", fontWeight: 600,
                padding: "2px 0", marginTop: 2,
              }}
            >
              {expanded ? "▲ 閉じる" : `▼ さらに${filledFields.filter(f => f.key !== "title").length - 2}項目`}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      {!isDone && (
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => onAsk(idea)}
            style={{
              background: "linear-gradient(135deg, #FF9F43, #FF6B6B)",
              color: "#fff", border: "none", borderRadius: 20,
              padding: "6px 16px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              boxShadow: "0 2px 8px rgba(255,120,50,0.25)", letterSpacing: 0.3,
            }}
          >
            ✦ AIに相談する
          </button>
        </div>
      )}
    </div>
  );
}

function AskModal({ idea, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(userText) {
    const newMsgs = [...messages, { role: "user", content: userText }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    const fieldSummary = FIELDS
      .filter(f => idea[f.key]?.trim())
      .map(f => `${f.label}: ${idea[f.key]}`)
      .join("\n");

    const systemPrompt = `あなたはアイデアの壁打ちパートナーです。ユーザーが書き留めたアイデアについて、現実的かつ建設的なフィードバックをしてください。
以下のアイデアについて相談を受けています：

${fieldSummary || "（内容なし）"}
タグ: ${idea.tags.join(", ")}
ステータス: ${STATUSES.find(s => s.key === idea.status)?.label || "検討中"}

返答は簡潔に、でも具体的に。日本語で答えてください。`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMsgs,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "エラーが発生しました。";
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "通信エラーが発生しました。" }]);
    }
    setLoading(false);
  }

  function handleStart() {
    setStarted(true);
    sendMessage(`このアイデアについて壁打ちしてほしいです。まず率直な感想と、次のステップのヒントをください。`);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(30,18,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 16,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#FFFDF8", borderRadius: 24,
        width: "100%", maxWidth: 560, maxHeight: "85vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid #F0E6D0",
          background: "linear-gradient(135deg, #FFF8F0, #FFF3E0)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#3D2B0D" }}>✦ AIに相談する</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#BBAA90" }}>×</button>
          </div>
          <div style={{ marginTop: 8, padding: "8px 12px", background: "#FFF", borderRadius: 10, border: "1px solid #F0E6D0" }}>
            {idea.title && <div style={{ fontWeight: 700, fontSize: 13, color: "#3D2B0D" }}>{idea.title}</div>}
            {FIELDS.filter(f => f.key !== "title" && idea[f.key]?.trim()).slice(0, 2).map(f => (
              <div key={f.key} style={{ fontSize: 11, color: "#8A7060", marginTop: 3 }}>
                <span style={{ fontWeight: 700, color: "#C8820A" }}>{f.label}：</span>{idea[f.key]}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {!started && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <p style={{ color: "#8A7060", fontSize: 13, marginBottom: 16 }}>AIがアイデアの壁打ち相手になります</p>
              <button onClick={handleStart} style={{
                background: "linear-gradient(135deg, #FF9F43, #FF6B6B)",
                color: "#fff", border: "none", borderRadius: 20,
                padding: "10px 24px", fontWeight: 700, fontSize: 14,
                cursor: "pointer", boxShadow: "0 4px 12px rgba(255,120,50,0.3)",
              }}>壁打ちスタート ✦</button>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "82%",
                background: m.role === "user" ? "linear-gradient(135deg, #FF9F43, #FF6B6B)" : "#FFF",
                color: m.role === "user" ? "#fff" : "#3D2B0D",
                border: m.role === "assistant" ? "1.5px solid #F0E6D0" : "none",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "10px 14px", fontSize: 13.5, lineHeight: 1.7,
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)", whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 6, paddingLeft: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%", background: "#FF9F43",
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {started && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid #F0E6D0", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && input.trim() && sendMessage(input.trim())}
              placeholder="さらに質問する..."
              disabled={loading}
              style={{
                flex: 1, border: "1.5px solid #F0E6D0", borderRadius: 20,
                padding: "8px 14px", fontSize: 13, background: "#FFF", outline: "none", color: "#3D2B0D",
              }}
            />
            <button
              onClick={() => input.trim() && sendMessage(input.trim())}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() ? "linear-gradient(135deg, #FF9F43, #FF6B6B)" : "#EEE",
                color: input.trim() ? "#fff" : "#BBB",
                border: "none", borderRadius: 20, width: 40, height: 40,
                cursor: input.trim() ? "pointer" : "default", fontSize: 16, transition: "all 0.2s",
              }}
            >↑</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Hopeful() {
  const [ideas, setIdeas] = useState([]);
  const [fields, setFields] = useState({ title: "", purpose: "", problem: "", action: "", memo: "" });
  const [selectedTags, setSelectedTags] = useState([]);
  const [askTarget, setAskTarget] = useState(null);
  const [filter, setFilter] = useState("すべて");
  const [statusFilter, setStatusFilter] = useState("active"); // "active" | "done"
  const [justSaved, setJustSaved] = useState(false);

  function setField(key, val) {
    setFields(prev => ({ ...prev, [key]: val }));
  }

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function updateStatus(id, status) {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  const hasContent = Object.values(fields).some(v => v.trim());

  function saveIdea() {
    if (!hasContent) return;
    const idea = {
      id: Date.now(),
      ...fields,
      tags: selectedTags.length ? selectedTags : ["メモ"],
      status: "open",
      createdAt: new Date(),
    };
    setIdeas(prev => [idea, ...prev]);
    setFields({ title: "", purpose: "", problem: "", action: "", memo: "" });
    setSelectedTags([]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }

  // split active vs done
  const activeIdeas = ideas.filter(i => i.status !== "done");
  const doneIdeas   = ideas.filter(i => i.status === "done");

  const filterByTag = (list) =>
    filter === "すべて" ? list : list.filter(i => i.tags.includes(filter));

  const visibleIdeas = filterByTag(statusFilter === "done" ? doneIdeas : activeIdeas);
  const allFilters = ["すべて", ...TAGS];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #FFF8F0 0%, #FFF3E0 60%, #FFEFD5 100%)",
      fontFamily: "'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #F0D8B8; border-radius: 2px; }
        textarea:focus, input:focus { outline: none; }
        textarea::placeholder, input::placeholder { color: #D4C4A8; }
      `}</style>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 8 }}>
          <span style={{
            fontSize: 28, fontWeight: 900,
            background: "linear-gradient(135deg, #FF9F43, #FF6B6B)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: -0.5,
          }}>ホープフル</span>
        </div>

        {/* Input Card */}
        <div style={{
          background: "#FFFFFF", border: "2px solid #F0E6D0", borderRadius: 20,
          padding: "20px 20px 16px", marginBottom: 20,
          boxShadow: "0 4px 20px rgba(230,160,60,0.08)",
          animation: "slideUp 0.3s ease",
        }}>
          {FIELDS.map(f => (
            <FieldInput key={f.key} field={f} value={fields[f.key]} onChange={val => setField(f.key, val)} />
          ))}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, marginBottom: 14 }}>
            {TAGS.map(tag => {
              const active = selectedTags.includes(tag);
              const c = TAG_COLORS[tag];
              return (
                <button key={tag} onClick={() => toggleTag(tag)} style={{
                  background: active ? c.bg : "transparent",
                  color: active ? c.text : "#BBAA90",
                  border: `1.5px solid ${active ? c.border : "#E8D8C0"}`,
                  borderRadius: 20, padding: "3px 12px",
                  fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}>{tag}</button>
              );
            })}
          </div>

          <button onClick={saveIdea} style={{
            width: "100%",
            background: hasContent ? "linear-gradient(135deg, #FF9F43, #FF6B6B)" : "#F0E6D0",
            color: hasContent ? "#fff" : "#C8B090",
            border: "none", borderRadius: 14, padding: "12px",
            fontSize: 14, fontWeight: 700,
            cursor: hasContent ? "pointer" : "default",
            transition: "all 0.2s", letterSpacing: 0.5,
          }}>
            {justSaved ? "✓ 保存しました" : "✦ 書き留める"}
          </button>
        </div>

        {/* Status tabs + tag filter */}
        {ideas.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {/* Active / Done tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {[
                { key: "active", label: `検討中・進行中`, count: activeIdeas.length },
                { key: "done",   label: `完了`,          count: doneIdeas.length },
              ].map(t => (
                <button key={t.key} onClick={() => setStatusFilter(t.key)} style={{
                  background: statusFilter === t.key ? "#3D2B0D" : "transparent",
                  color: statusFilter === t.key ? "#fff" : "#8A7060",
                  border: `1.5px solid ${statusFilter === t.key ? "#3D2B0D" : "#E8D8C0"}`,
                  borderRadius: 20, padding: "5px 16px",
                  fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                }}>
                  {t.label} {t.count > 0 && <span style={{ opacity: 0.6, fontSize: 10 }}>({t.count})</span>}
                </button>
              ))}
            </div>

            {/* Tag filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {allFilters.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  background: filter === f ? "#8A7060" : "transparent",
                  color: filter === f ? "#fff" : "#8A7060",
                  border: `1.5px solid ${filter === f ? "#8A7060" : "#E8D8C0"}`,
                  borderRadius: 20, padding: "3px 12px",
                  fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}>{f}</button>
              ))}
            </div>
          </div>
        )}

        {/* Ideas */}
        {visibleIdeas.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#BBAA90" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✦</div>
            <div style={{ fontSize: 13 }}>
              {ideas.length === 0
                ? "最初のアイデアを書き留めよう"
                : statusFilter === "done" ? "完了したアイデアはまだありません" : "該当するアイデアがありません"}
            </div>
          </div>
        )}
        {visibleIdeas.map(idea => (
          <div key={idea.id} style={{ animation: "slideUp 0.25s ease" }}>
            <IdeaCard idea={idea} onAsk={setAskTarget} onStatusChange={updateStatus} />
          </div>
        ))}
      </div>

      {askTarget && (
        <AskModal idea={askTarget} onClose={() => setAskTarget(null)} />
      )}
    </div>
  );
}
