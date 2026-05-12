import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button } from "bakerui";
import {
  AgentStepTimeline,
  CitationChip,
  MessageBubble,
  ModelPicker,
  PromptInput,
  StreamingText,
  ThinkingIndicator,
  TokenUsageMeter,
  ToolCallCard,
  type AgentStep,
  type ChatModel,
  type MessageRole,
  type ModelPickerValue,
  type ToolCallStatus,
} from "bakeruipro";
import "bakeruipro/chat.css";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text?: string;
  /** Tool calls attached to an assistant message. */
  tools?: {
    id: string;
    name: string;
    meta?: string;
    args?: unknown;
    result?: unknown;
    status: ToolCallStatus;
  }[];
  /** Citations index → metadata. */
  citations?: { index: number; title: string; source?: string; snippet?: string }[];
  /** When `true`, render the body via <StreamingText/>. */
  streaming?: boolean;
  timestamp?: string;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  unread?: boolean;
}

const CONVERSATIONS: Conversation[] = [
  { id: "c1", title: "Q3 revenue analysis", preview: "Q3 revenue came in at $2.40M, up 18%…" },
  { id: "c2", title: "Draft launch email", preview: "Here's a 4-paragraph announcement…", unread: true },
  { id: "c3", title: "Refactor billing service", preview: "I'd start by isolating the invoice…" },
  { id: "c4", title: "Onboarding tour copy", preview: "Step 1: \"Pick your first project\"…" },
];

const MODELS: ChatModel[] = [
  {
    id: "opus-47",
    label: "Claude Opus 4.7",
    provider: "anthropic",
    context: 1_000_000,
    icon: "✦",
    tagline: "Most capable — best for complex reasoning",
  },
  {
    id: "sonnet-46",
    label: "Claude Sonnet 4.6",
    provider: "anthropic",
    context: 200_000,
    icon: "◆",
    tagline: "Fast and strong — great default",
  },
  {
    id: "haiku-45",
    label: "Claude Haiku 4.5",
    provider: "anthropic",
    context: 200_000,
    icon: "◇",
    tagline: "Fastest, lowest cost",
  },
];

const MENTIONS = [
  { id: "p1", label: "project-baker", hint: "Workspace" },
  { id: "p2", label: "design-doc", hint: "File" },
  { id: "p3", label: "q3-report", hint: "Doc" },
];

const SLASH = [
  { id: "image", label: "image", hint: "Generate an image" },
  { id: "code", label: "code", hint: "Write code" },
  { id: "summarize", label: "summarize", hint: "Summarize a doc" },
];

// Scripted assistant reply — we use it to drive the StreamingText buffer and
// a fake agent-steps progression so the playground feels alive without
// actually calling a model.
const SCRIPTED_REPLY =
  "Q3 revenue came in at $2.40M [1], up 18% from $2.03M in Q2 [2]. Most of the lift was enterprise — 14 deals closed vs 9 in Q2. Want a YoY comparison next?";

const SCRIPTED_STEPS: AgentStep[] = [
  { id: "s1", kind: "thinking", label: "Plan approach", detail: "Query invoices DB, summarize Q3 vs Q2." },
  { id: "s2", kind: "tool", label: "Call run_sql", detail: "SUM(amount) GROUP BY quarter" },
  { id: "s3", kind: "reflection", label: "Compare with Q2", detail: "$2.4M vs $2.03M = +18%." },
  { id: "s4", kind: "answer", label: "Draft response" },
];

export function ChatPackPlaygroundPage() {
  const [conversationId, setConversationId] = useState<string>("c1");
  const [model, setModel] = useState<ModelPickerValue>({
    modelId: "sonnet-46",
    temperature: 0.7,
    maxTokens: 1024,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "u1",
      role: "user",
      text: "What was our Q3 revenue, and how does it compare to Q2?",
      timestamp: "2:14 PM",
    },
  ]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [streamText, setStreamText] = useState("");
  const [streamDone, setStreamDone] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, streamText, streamingId]);

  const send = (text: string) => {
    const userId = `u-${Date.now()}`;
    const assistantId = `a-${Date.now() + 1}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userId,
        role: "user",
        text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
      {
        id: assistantId,
        role: "assistant",
        streaming: true,
        text: "",
        tools: [],
        citations: [],
      },
    ]);
    setDraft("");
    setStreamingId(assistantId);
    setStreamText("");
    setStreamDone(false);

    // Reset + start the step progression.
    setSteps(
      SCRIPTED_STEPS.map((s, i) => ({
        ...s,
        state: i === 0 ? "running" : "pending",
      })),
    );

    // Drive scripted progression with timers.
    const stepTimer1 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) =>
          i === 0
            ? { ...s, state: "done", duration: "0.3s" }
            : i === 1
              ? { ...s, state: "running" }
              : s,
        ),
      );
      // Append the tool call to the assistant message.
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                tools: [
                  {
                    id: "t1",
                    name: "run_sql",
                    meta: "postgres · running",
                    args: {
                      query:
                        "SELECT quarter, SUM(amount) FROM invoices GROUP BY quarter",
                    },
                    status: "running",
                  },
                ],
              }
            : m,
        ),
      );
    }, 600);
    const stepTimer2 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) =>
          i === 1
            ? { ...s, state: "done", duration: "1.1s" }
            : i === 2
              ? { ...s, state: "running" }
              : s,
        ),
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                tools: m.tools?.map((t) =>
                  t.id === "t1"
                    ? {
                        ...t,
                        meta: "postgres · 1.1s",
                        status: "success" as const,
                        result: {
                          rows: [
                            { quarter: "Q2", sum: 2_030_000 },
                            { quarter: "Q3", sum: 2_400_000 },
                          ],
                        },
                      }
                    : t,
                ),
              }
            : m,
        ),
      );
    }, 1800);
    const stepTimer3 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) =>
          i === 2
            ? { ...s, state: "done", duration: "0.2s" }
            : i === 3
              ? { ...s, state: "running" }
              : s,
        ),
      );
      // Start streaming the reply.
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                citations: [
                  {
                    index: 1,
                    title: "Q3 Financial Report",
                    source: "finance.internal",
                    snippet: "Total revenue of $2.4M vs $2.03M in Q2.",
                  },
                  {
                    index: 2,
                    title: "Q2 Financial Report",
                    source: "finance.internal",
                  },
                ],
              }
            : m,
        ),
      );
      setStreamText(SCRIPTED_REPLY);
    }, 2400);
    const stepTimer4 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) => (i === 3 ? { ...s, state: "done", duration: "1.6s" } : s)),
      );
    }, 5400);

    return () => {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
    };
  };

  const stop = () => {
    setStreamingId(null);
    setStreamDone(true);
    // Finalize current assistant message.
    if (streamingId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId ? { ...m, text: streamText, streaming: false } : m,
        ),
      );
    }
  };

  const onStreamComplete = () => {
    if (!streamingId) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === streamingId
          ? { ...m, text: streamText, streaming: false }
          : m,
      ),
    );
    setStreamingId(null);
    setStreamDone(true);
  };

  // Render assistant body — supports citations as [n] markers.
  const renderAssistantBody = (m: ChatMessage, source: string) => {
    if (!m.citations || m.citations.length === 0) return source;
    // Inline [n] markers as CitationChip components.
    const parts: (string | JSX.Element)[] = [];
    const regex = /\[(\d+)\]/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(source))) {
      parts.push(source.slice(last, match.index));
      const idx = parseInt(match[1], 10);
      const cite = m.citations.find((c) => c.index === idx);
      if (cite) {
        parts.push(
          <CitationChip
            key={`${m.id}-c-${idx}-${match.index}`}
            index={idx}
            title={cite.title}
            source={cite.source}
            snippet={cite.snippet}
          />,
        );
      } else {
        parts.push(match[0]);
      }
      last = match.index + match[0].length;
    }
    parts.push(source.slice(last));
    return parts;
  };

  // Token usage — driven loosely by message count + scripted reply length.
  const inputTokens = useMemo(
    () =>
      messages.reduce((acc, m) => {
        const t = m.role === "user" ? (m.text ?? "").length : 0;
        return acc + Math.ceil(t / 4) + 80; // ~4 chars/token + system prompt buffer
      }, 0),
    [messages],
  );
  const outputTokens = useMemo(
    () =>
      messages.reduce((acc, m) => {
        const t = m.role === "assistant" ? (m.text ?? streamText).length : 0;
        return acc + Math.ceil(t / 4);
      }, 0),
    [messages, streamText],
  );

  const currentModel = MODELS.find((m) => m.id === model.modelId);

  return (
    <div className="chat-playground">
      <aside className="chat-playground__rail">
        <div className="chat-playground__rail-head">
          <span>Conversations</span>
          <button type="button" className="chat-playground__new">+ New</button>
        </div>
        <ul className="chat-playground__convs">
          {CONVERSATIONS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="chat-playground__conv"
                data-active={conversationId === c.id || undefined}
                onClick={() => setConversationId(c.id)}
              >
                <span className="chat-playground__conv-title">
                  {c.title}
                  {c.unread && <span className="chat-playground__conv-dot" />}
                </span>
                <span className="chat-playground__conv-preview">{c.preview}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="chat-playground__main">
        <header className="chat-playground__head">
          <div>
            <h2 className="chat-playground__title">
              {CONVERSATIONS.find((c) => c.id === conversationId)?.title ?? "New"}
            </h2>
            <span className="chat-playground__sub">
              {currentModel?.label} · {model.temperature.toFixed(2)} temp
            </span>
          </div>
          <Badge tone="accent">Playground</Badge>
        </header>

        <div className="chat-playground__thread" ref={threadRef}>
          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <MessageBubble
                  key={m.id}
                  role="user"
                  avatar={<span>AB</span>}
                  timestamp={m.timestamp}
                >
                  {m.text}
                </MessageBubble>
              );
            }
            const isStreaming = m.id === streamingId;
            return (
              <MessageBubble
                key={m.id}
                role="assistant"
                avatar={<span>✦</span>}
                author={currentModel?.label}
                timestamp={m.timestamp}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {m.tools?.map((t) => (
                    <ToolCallCard
                      key={t.id}
                      name={t.name}
                      meta={t.meta}
                      args={t.args}
                      result={t.result}
                      status={t.status}
                    />
                  ))}
                  {isStreaming && streamText.length === 0 ? (
                    <ThinkingIndicator label="Reasoning" />
                  ) : isStreaming ? (
                    <StreamingText
                      key={m.id}
                      text={streamText}
                      speed={64}
                      done={streamDone}
                      onComplete={onStreamComplete}
                    />
                  ) : m.text ? (
                    <span>{renderAssistantBody(m, m.text)}</span>
                  ) : null}
                </div>
              </MessageBubble>
            );
          })}
        </div>

        <div className="chat-playground__compose">
          <PromptInput
            value={draft}
            onChange={setDraft}
            onSubmit={send}
            onStop={stop}
            isStreaming={!!streamingId}
            mentions={MENTIONS}
            slashCommands={SLASH}
            placeholder="Ask anything… try @ or /"
            trailing={
              <span className="chat-playground__model-chip">
                {currentModel?.icon} {currentModel?.label}
              </span>
            }
          />
          <div className="chat-playground__hint">
            <span>↵ to send · Shift+↵ for newline</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => send("What was our Q3 revenue?")}
              disabled={!!streamingId}
            >
              Run demo prompt
            </Button>
          </div>
        </div>
      </main>

      <aside className="chat-playground__side">
        <section className="chat-playground__panel">
          <h3 className="chat-playground__panel-title">Model</h3>
          <ModelPicker models={MODELS} value={model} onChange={setModel} />
        </section>
        <section className="chat-playground__panel">
          <h3 className="chat-playground__panel-title">Usage</h3>
          <TokenUsageMeter
            inputTokens={inputTokens}
            outputTokens={outputTokens}
            contextWindow={currentModel?.context ?? 200_000}
            pricePerMillion={{ input: 3, output: 15 }}
          />
        </section>
        <section className="chat-playground__panel">
          <h3 className="chat-playground__panel-title">Agent steps</h3>
          {steps.length === 0 ? (
            <p className="chat-playground__panel-empty">
              Send a prompt to see the agent's plan.
            </p>
          ) : (
            <AgentStepTimeline steps={steps} />
          )}
        </section>
      </aside>
    </div>
  );
}
