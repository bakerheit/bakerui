import { useEffect, useState } from "react";
import { Badge, Button, HStack, Heading, Stack, Text } from "bakerui";
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
  type ChatModel,
  type ModelPickerValue,
} from "bakeruipro";
import { PageLayout } from "../PageLayout";
import { DocExample, DocSection } from "../Doc";
import "bakeruipro/chat.css";

const MODELS: ChatModel[] = [
  { id: "opus", label: "Claude Opus 4.7", provider: "anthropic", context: 1_000_000, icon: "✦", tagline: "Most capable" },
  { id: "sonnet", label: "Claude Sonnet 4.6", provider: "anthropic", context: 200_000, icon: "◆", tagline: "Balanced default" },
  { id: "haiku", label: "Claude Haiku 4.5", provider: "anthropic", context: 200_000, icon: "◇", tagline: "Fast + cheap" },
];

export function ChatPackComponentsPage() {
  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="3">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Chat / AI Pack — Components</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted">
            Reference for every component in the Chat / AI Pack. Each section
            lists props, defaults, and a live example.
          </Text>
        </Stack>

        <MessageBubbleSection />
        <StreamingTextSection />
        <ToolCallCardSection />
        <AgentStepTimelineSection />
        <ModelPickerSection />
        <PromptInputSection />
        <CitationChipSection />
        <TokenUsageMeterSection />
        <ThinkingIndicatorSection />
      </Stack>
    </PageLayout>
  );
}

/* ========================================================================== */
function MessageBubbleSection() {
  return (
    <DocSection
      title="MessageBubble"
      description="Role-aware chat bubble. The user bubble flips to the right with an accent fill, the assistant bubble uses the surface color, the tool bubble uses a monospace font, and the system bubble renders as a horizontal divider with text in the middle."
      propsTable={[
        { name: "role", type: "\"user\" | \"assistant\" | \"system\" | \"tool\"", required: true },
        { name: "author", type: "string" },
        { name: "avatar", type: "ReactNode" },
        { name: "timestamp", type: "string" },
        { name: "status", type: "\"sending\" | \"sent\" | \"delivered\" | \"error\"", default: "\"sent\"" },
        { name: "errorMessage", type: "string" },
        { name: "actions", type: "ReactNode" },
        { name: "compact", type: "boolean", description: "Suppress avatar + author chrome." },
      ]}
    >
      <DocExample
        label="Full thread"
        code={`<MessageBubble role="user" avatar={<span>AB</span>}>...</MessageBubble>
<MessageBubble role="assistant" avatar={<span>✦</span>} author="Claude">...</MessageBubble>
<MessageBubble role="system">Switched to Sonnet 4.6</MessageBubble>`}
      >
        <Stack gap="3">
          <MessageBubble role="user" avatar={<span>AB</span>}>
            What was our Q3 revenue?
          </MessageBubble>
          <MessageBubble role="assistant" avatar={<span>✦</span>} author="Claude" timestamp="2:14 PM">
            Q3 revenue was <strong>$2.40M</strong>, up <strong>18%</strong> from Q2.
          </MessageBubble>
          <MessageBubble role="system">Conversation switched to Sonnet 4.6</MessageBubble>
          <MessageBubble role="tool" avatar={<span>⚙</span>} author="run_sql">
            {"{ rows: [{ sum: 2_400_000 }] }"}
          </MessageBubble>
        </Stack>
      </DocExample>
      <DocExample
        label="Error state"
        code={`<MessageBubble role="user" status="error" errorMessage="Rate limit hit">...</MessageBubble>`}
      >
        <MessageBubble role="user" avatar={<span>AB</span>} status="error" errorMessage="Rate limit hit">
          One more question
        </MessageBubble>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function StreamingTextSection() {
  const [text, setText] = useState("");
  const FULL =
    "Streaming text reveals characters progressively. Feed tokens into `text` as they arrive — the component catches up at `speed` cps without dropping.";
  useEffect(() => {
    setText("");
    const id = setTimeout(() => setText(FULL), 100);
    return () => clearTimeout(id);
  }, []);
  return (
    <DocSection
      title="StreamingText"
      description="Progressive text reveal with a blinking caret. Two modes: feed the full text up-front to type it out, or stream tokens by appending to `text` — the component catches up without dropping characters."
      propsTable={[
        { name: "text", type: "string", required: true },
        { name: "speed", type: "number", default: "60", description: "Characters per second." },
        { name: "caret", type: "boolean", default: "true" },
        { name: "done", type: "boolean", description: "Force-complete the reveal." },
        { name: "onComplete", type: "() => void" },
      ]}
    >
      <DocExample
        label="Typewriter"
        code={`<StreamingText text={fullText} speed={50} />`}
      >
        <Stack gap="2">
          <div style={{ minHeight: 60, padding: 10, border: "1px dashed var(--bui-color-border)", borderRadius: 8 }}>
            <StreamingText text={text} speed={50} />
          </div>
          <Button size="sm" variant="secondary" onClick={() => setText("")}>
            Reset
          </Button>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function ToolCallCardSection() {
  return (
    <DocSection
      title="ToolCallCard"
      description="Collapsible card for tool invocations. Status pip on the header (running / success / error), pretty-printed JSON args + result, optional error text. Click anywhere on the header to toggle."
      propsTable={[
        { name: "name", type: "string", required: true },
        { name: "meta", type: "ReactNode", description: "e.g. \"postgres · 1.1s\"" },
        { name: "args", type: "unknown" },
        { name: "result", type: "unknown" },
        { name: "status", type: "\"running\" | \"success\" | \"error\"", default: "\"success\"" },
        { name: "error", type: "string" },
        { name: "open / defaultOpen", type: "boolean" },
        { name: "onOpenChange", type: "(open: boolean) => void" },
      ]}
    >
      <DocExample
        label="Success"
        code={`<ToolCallCard
  name="run_sql"
  meta="postgres · 1.1s"
  args={{ query: "..." }}
  result={{ rows: [...] }}
  defaultOpen
/>`}
      >
        <ToolCallCard
          name="run_sql"
          meta="postgres · 1.1s"
          args={{
            query: "SELECT quarter, SUM(amount) FROM invoices GROUP BY quarter",
          }}
          result={{
            rows: [
              { quarter: "Q2", sum: 2_030_000 },
              { quarter: "Q3", sum: 2_400_000 },
            ],
          }}
          defaultOpen
        />
      </DocExample>
      <DocExample
        label="Running + error"
        code={`<ToolCallCard name="fetch_url" status="running" args={{ url }} />
<ToolCallCard name="fetch_url" status="error" error="Connection refused" args={{ url }} />`}
      >
        <Stack gap="2">
          <ToolCallCard name="fetch_url" status="running" args={{ url: "https://example.com" }} defaultOpen />
          <ToolCallCard
            name="fetch_url"
            status="error"
            error="ECONNREFUSED — no response from upstream"
            args={{ url: "https://example.com" }}
            defaultOpen
          />
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function AgentStepTimelineSection() {
  return (
    <DocSection
      title="AgentStepTimeline"
      description="Vertical timeline of agent steps. Kinds — thinking / tool / search / code / reflection / answer — drive the node icon. States — pending / running / done / error — drive color + a spinner for running."
      propsTable={[
        { name: "steps", type: "AgentStep[]", required: true, description: "{ id, kind, label, detail?, state?, duration? }" },
        { name: "connector", type: "boolean", default: "true", description: "Render the vertical line between nodes." },
        { name: "compact", type: "boolean", description: "Hide the detail row." },
        { name: "onStepClick", type: "(step: AgentStep) => void" },
      ]}
    >
      <DocExample
        label="Mixed states"
        code={`<AgentStepTimeline steps={steps} />`}
      >
        <div style={{ maxWidth: 380 }}>
          <AgentStepTimeline
            steps={[
              { id: "1", kind: "thinking", label: "Plan approach", detail: "Query DB, summarize Q3 vs Q2.", state: "done", duration: "0.3s" },
              { id: "2", kind: "tool", label: "Call run_sql", detail: "SELECT SUM(amount) FROM invoices", state: "done", duration: "1.1s" },
              { id: "3", kind: "reflection", label: "Compare with Q2", state: "running" },
              { id: "4", kind: "answer", label: "Draft response", state: "pending" },
            ]}
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function ModelPickerSection() {
  const [value, setValue] = useState<ModelPickerValue>({
    modelId: "sonnet",
    temperature: 0.7,
    maxTokens: 1024,
  });
  return (
    <DocSection
      title="ModelPicker"
      description="Model selection + sampling params in one surface. Each model row shows label, provider chip, context window, and a tagline. Temperature + max-tokens sliders are below; pass hideParams to drop them."
      propsTable={[
        { name: "models", type: "ChatModel[]", required: true, description: "{ id, label, provider?, context?, icon?, tagline? }" },
        { name: "value / defaultValue", type: "{ modelId, temperature, maxTokens }" },
        { name: "onChange", type: "(value: ModelPickerValue) => void" },
        { name: "hideParams", type: "boolean", default: "false" },
        { name: "temperatureMin / Max", type: "number", default: "0..1" },
        { name: "maxTokensMin / Max", type: "number", default: "64..8192" },
      ]}
    >
      <DocExample
        label="Three Claude models"
        code={`<ModelPicker models={MODELS} value={value} onChange={setValue} />`}
      >
        <div style={{ maxWidth: 360 }}>
          <ModelPicker models={MODELS} value={value} onChange={setValue} />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function PromptInputSection() {
  const [streaming, setStreaming] = useState(false);
  return (
    <DocSection
      title="PromptInput"
      description="Auto-grow textarea with @mention and slash-command pickers (arrow/Enter/Tab to navigate, Escape to dismiss), attachment chips with per-file progress, and a send/stop button. Submits on Enter, newline on Shift+Enter."
      propsTable={[
        { name: "value / defaultValue", type: "string" },
        { name: "onChange", type: "(value: string) => void" },
        { name: "onSubmit", type: "(text: string) => void" },
        { name: "onStop", type: "() => void" },
        { name: "isStreaming", type: "boolean", description: "Swap send for stop." },
        { name: "placeholder", type: "string", default: "\"Send a message…\"" },
        { name: "minRows / maxRows", type: "number", default: "1..8" },
        { name: "mentions", type: "PromptMention[]" },
        { name: "slashCommands", type: "PromptSlashCommand[]" },
        { name: "attachments", type: "PromptAttachment[]" },
        { name: "onAttachmentRemove", type: "(id: string) => void" },
        { name: "leading / trailing", type: "ReactNode" },
        { name: "disabled", type: "boolean" },
      ]}
    >
      <DocExample
        label="@ mentions + /commands"
        code={`<PromptInput
  mentions={[{ id: "p1", label: "project-baker", hint: "Workspace" }]}
  slashCommands={[{ id: "image", label: "image", hint: "Generate an image" }]}
  attachments={[{ id: "a1", name: "Q3-report.pdf", size: "2.3 MB", progress: 0.62 }]}
  onSubmit={(text) => console.log(text)}
/>`}
      >
        <PromptInput
          mentions={[
            { id: "p1", label: "project-baker", hint: "Workspace" },
            { id: "p2", label: "design-doc", hint: "File" },
          ]}
          slashCommands={[
            { id: "image", label: "image", hint: "Generate an image" },
            { id: "code", label: "code", hint: "Write code" },
          ]}
          attachments={[
            { id: "a1", name: "Q3-report.pdf", size: "2.3 MB", progress: 0.62 },
          ]}
          placeholder="Type @ for mentions or / for commands…"
        />
      </DocExample>
      <DocExample
        label="Streaming state"
        description="Toggle to see send → stop swap."
        code={`<PromptInput isStreaming={true} onStop={() => stop()} />`}
      >
        <Stack gap="2">
          <PromptInput
            isStreaming={streaming}
            onStop={() => setStreaming(false)}
            onSubmit={() => setStreaming(true)}
          />
          <Button size="sm" variant="secondary" onClick={() => setStreaming((s) => !s)}>
            Toggle streaming
          </Button>
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function CitationChipSection() {
  return (
    <DocSection
      title="CitationChip"
      description="Inline numbered chip — hover or focus shows a popover with title, source, snippet. Optional card variant for a sources sidebar."
      propsTable={[
        { name: "index", type: "number | string", required: true },
        { name: "title", type: "ReactNode" },
        { name: "url", type: "string", description: "When set, the chip opens in a new tab." },
        { name: "source", type: "string" },
        { name: "snippet", type: "ReactNode" },
        { name: "variant", type: "\"inline\" | \"card\"", default: "\"inline\"" },
        { name: "onClick", type: "() => void" },
      ]}
    >
      <DocExample
        label="Inline in prose"
        code={`<Text>Sales grew 18% in Q3 <CitationChip index={1} title="Q3 Report" snippet="..." />.</Text>`}
      >
        <Text>
          Sales grew 18% in Q3{" "}
          <CitationChip
            index={1}
            title="Q3 Financial Report"
            source="finance.internal"
            snippet="Total revenue of $2.4M vs $2.03M in Q2."
          />{" "}
          led by enterprise deals{" "}
          <CitationChip
            index={2}
            title="Enterprise pipeline"
            source="salesforce"
            snippet="14 deals closed Q3 vs 9 in Q2."
          />
          .
        </Text>
      </DocExample>
      <DocExample
        label="Card variant"
        code={`<CitationChip variant="card" index={1} title="Q3 Financial Report" source="finance.internal · pdf" snippet="..." />`}
      >
        <Stack gap="2">
          <CitationChip
            variant="card"
            index={1}
            title="Q3 Financial Report"
            source="finance.internal · pdf"
            snippet="Total revenue of $2.4M, up 18% from Q2. Enterprise contributed 64% of growth."
          />
          <CitationChip
            variant="card"
            index={2}
            title="Enterprise pipeline"
            source="salesforce"
            snippet="14 deals closed Q3 vs 9 in Q2. Avg deal size $171k."
          />
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function TokenUsageMeterSection() {
  return (
    <DocSection
      title="TokenUsageMeter"
      description="Context-window bar with an input/output split. Tone shifts from accent (ok) → warning (≥75%) → danger (≥92%). Pass pricePerMillion for an automatic cost estimate."
      propsTable={[
        { name: "inputTokens", type: "number", required: true },
        { name: "outputTokens", type: "number", required: true },
        { name: "contextWindow", type: "number", required: true },
        { name: "pricePerMillion", type: "number | { input, output }", description: "USD per million tokens." },
        { name: "currency", type: "string", default: "\"USD\"" },
        { name: "compact", type: "boolean" },
        { name: "label", type: "string", default: "\"Context\"" },
      ]}
    >
      <DocExample
        label="Tones"
        code={`<TokenUsageMeter inputTokens={14_320} outputTokens={2_100} contextWindow={200_000} pricePerMillion={{ input: 3, output: 15 }} />`}
      >
        <Stack gap="4">
          <TokenUsageMeter
            inputTokens={14_320}
            outputTokens={2_100}
            contextWindow={200_000}
            pricePerMillion={{ input: 3, output: 15 }}
          />
          <TokenUsageMeter
            inputTokens={120_000}
            outputTokens={42_000}
            contextWindow={200_000}
            pricePerMillion={{ input: 3, output: 15 }}
          />
          <TokenUsageMeter
            inputTokens={170_000}
            outputTokens={20_000}
            contextWindow={200_000}
            pricePerMillion={{ input: 3, output: 15 }}
          />
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function ThinkingIndicatorSection() {
  return (
    <DocSection
      title="ThinkingIndicator"
      description="Animated bouncing dots. Bubble variant matches the assistant message shell; inline variant drops the chrome."
      propsTable={[
        { name: "label", type: "string", description: "Optional text next to the dots." },
        { name: "variant", type: "\"bubble\" | \"inline\"", default: "\"bubble\"" },
        { name: "speed", type: "number", default: "1200", description: "Animation duration in ms." },
      ]}
    >
      <DocExample
        label="Variants"
        code={`<ThinkingIndicator label="Reasoning" />
<ThinkingIndicator variant="inline" />`}
      >
        <Stack gap="3">
          <ThinkingIndicator label="Reasoning" />
          <ThinkingIndicator variant="inline" />
        </Stack>
      </DocExample>
    </DocSection>
  );
}
