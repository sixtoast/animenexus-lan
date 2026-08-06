"use client";

import { useEffect, useState } from "react";
import {
  AI_PRESETS,
  defaultSettings,
  isAIConfigured,
  readAISettings,
  writeAISettings,
  type AIProviderId,
  type AISettings,
} from "@/lib/ai-settings";
import { callChatCompletions, testAIConnection } from "@/lib/ai-chat";
import { useToast } from "@/components/ToastProvider";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const QUICK = [
  "What should I watch tonight from a chill mood?",
  "Explain my taste in one paragraph.",
  "Give me a 3-title underwatched shortlist.",
];

export function AIPanel() {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AISettings>(defaultSettings());
  const [configured, setConfigured] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const s = readAISettings();
    setSettings(s);
    setConfigured(isAIConfigured(s));
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
      if (
        (e.key === "a" || e.key === "A") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        const t = e.target as HTMLElement | null;
        if (
          t &&
          (t.tagName === "INPUT" ||
            t.tagName === "TEXTAREA" ||
            t.isContentEditable)
        )
          return;
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function saveSettings() {
    writeAISettings(settings);
    setConfigured(isAIConfigured(settings));
    showToast("AI settings saved", "🤖");
    setSettingsOpen(false);
  }

  function applyPreset(p: AIProviderId) {
    if (p === "custom") {
      setSettings((s) => ({ ...s, provider: "custom" }));
      return;
    }
    const preset = AI_PRESETS[p];
    setSettings((s) => ({
      ...s,
      provider: p,
      baseUrl: preset.baseUrl,
      model: preset.model,
    }));
  }

  async function test() {
    writeAISettings(settings);
    setBusy(true);
    try {
      const reply = await testAIConnection();
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      setConfigured(true);
      showToast("AI connected", "✅");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Test failed", "😅");
    } finally {
      setBusy(false);
    }
  }

  async function send(text: string) {
    const v = text.trim();
    if (!v || busy) return;
    if (!isAIConfigured(settings) && !isAIConfigured()) {
      showToast("Add an API key in settings", "🤖");
      setSettingsOpen(true);
      return;
    }
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: v }];
    setMessages(next);
    setBusy(true);
    try {
      const reply = await callChatCompletions(
        [
          {
            role: "system",
            content:
              "You are the AnimeNexus Lantern assistant — concise, warm, anime-literate. No fake ARG codes.",
          },
          ...next.map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          })),
        ],
        { settings: readAISettings() },
      );
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Chat failed", "😅");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="ai-fab"
        aria-label="Open AI panel"
        title="AI panel (A)"
        onClick={() => setOpen(true)}
      >
        🤖
        <span
          className={"ai-status-dot" + (configured ? " on" : "")}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="ai-overlay open" role="dialog" aria-label="AI panel">
          <div className="ai-panel">
            <div className="ai-header">
              <h2>
                AI desk{" "}
                <span
                  className={"ai-status-dot" + (configured ? " on" : "")}
                  title={configured ? "Key present" : "Not configured"}
                />
              </h2>
              <div className="ai-header-actions">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setSettingsOpen((v) => !v)}
                  title="Settings"
                >
                  ⚙
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setMessages([])}
                  title="Clear"
                >
                  ⌫
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setOpen(false)}
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {settingsOpen ? (
              <div className="ai-settings">
                <label className="filter-label">Provider</label>
                <select
                  className="filter-input"
                  value={settings.provider}
                  onChange={(e) =>
                    applyPreset(e.target.value as AIProviderId)
                  }
                >
                  <option value="openrouter">OpenRouter</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                  <option value="groq">Groq</option>
                  <option value="custom">Custom</option>
                </select>
                <label className="filter-label">Base URL</label>
                <input
                  className="filter-input"
                  value={settings.baseUrl}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, baseUrl: e.target.value }))
                  }
                />
                <label className="filter-label">Model</label>
                <input
                  className="filter-input"
                  value={settings.model}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, model: e.target.value }))
                  }
                />
                <label className="filter-label">API key</label>
                <input
                  className="filter-input"
                  type="password"
                  autoComplete="off"
                  value={settings.apiKey}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, apiKey: e.target.value }))
                  }
                  placeholder="sk-…"
                />
                <label className="filter-label">Fallback key (optional)</label>
                <input
                  className="filter-input"
                  type="password"
                  autoComplete="off"
                  value={settings.fallbackKey || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, fallbackKey: e.target.value }))
                  }
                />
                <div className="daily-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn btn-accent btn-sm"
                    onClick={saveSettings}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={test}
                    disabled={busy}
                  >
                    Test
                  </button>
                </div>
                <p className="taste-footnote">
                  Keys stay in this browser (anime_nexus_ai_settings).
                </p>
              </div>
            ) : null}

            <div className="ai-messages">
              {messages.length === 0 ? (
                <p className="taste-footnote">
                  Ask anything anime — or use a quick prompt. Press A anytime.
                </p>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={"ai-msg " + m.role}>
                    {m.content}
                  </div>
                ))
              )}
              {busy ? <p className="taste-footnote">Thinking…</p> : null}
            </div>

            <div className="ai-quick">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => send(q)}
                  disabled={busy}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="ai-compose">
              <textarea
                className="notes-area"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message the desk…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-accent btn-sm"
                disabled={busy}
                onClick={() => send(input)}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
