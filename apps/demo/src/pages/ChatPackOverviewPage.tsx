import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  HStack,
  Heading,
  Stack,
  Text,
} from "bakerui";
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
  type ModelPickerValue,
} from "bakeruipro";
import { PageLayout } from "../PageLayout";
import "bakeruipro/chat.css";

export interface ChatPackOverviewPageProps {
  onPlayground: () => void;
  onComponents: () => void;
}

interface ShowcaseItem {
  title: string;
  description: string;
  render: () => JSX.Element;
  fullWidth?: boolean;
}

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

const STEPS: AgentStep[] = [
  {
    id: "1",
    kind: "thinking",
    label: "Plan approach",
    detail: "User asks about Q3 revenue — query the database, summarize.",
    state: "done",
    duration: "0.3s",
  },
  {
    id: "2",
    kind: "tool",
    label: "Call run_sql",
    detail: "SELECT SUM(amount) FROM invoices WHERE quarter = 'Q3'",
    state: "done",
    duration: "1.1s",
  },
  {
    id: "3",
    kind: "reflection",
    label: "Compare with Q2",
    detail: "Q3 is up 18% — worth surfacing the trend.",
    state: "running",
  },
  {
    id: "4",
    kind: "answer",
    label: "Draft response",
    state: "pending",
  },
];

export function ChatPackOverviewPage({
  onPlayground,
  onComponents,
}: ChatPackOverviewPageProps) {
  const [model, setModel] = useState<ModelPickerValue>({
    modelId: "sonnet-46",
    temperature: 0.7,
    maxTokens: 1024,
  });

  const ITEMS: ShowcaseItem[] = [
    {
      title: "Message bubble",
      description: "Role-aware bubble — user, assistant, system, tool.",
      fullWidth: true,
      render: () => (
        <Stack gap="3">
          <MessageBubble role="user" avatar={<span>AB</span>} author="You">
            What was our Q3 revenue?
          </MessageBubble>
          <MessageBubble
            role="assistant"
            avatar={<span>✦</span>}
            author="Claude"
            timestamp="2:14 PM"
          >
            Q3 revenue was <strong>$2.4M</strong>, up <strong>18%</strong> from
            Q2.
          </MessageBubble>
          <MessageBubble role="system">
            Conversation switched to Sonnet 4.6
          </MessageBubble>
        </Stack>
      ),
    },
    {
      title: "Streaming text",
      description: "Progressive character reveal with blinking caret.",
      render: () => (
        <div style={{ maxWidth: 360 }}>
          <StreamingText
            key="overview-stream"
            text="Token-by-token reveal, ready for SSE streams."
            speed={28}
          />
        </div>
      ),
    },
    {
      title: "Tool call card",
      description: "Collapsible card with args, result, and status.",
      fullWidth: true,
      render: () => (
        <div style={{ maxWidth: 480 }}>
          <ToolCallCard
            name="run_sql"
            meta="postgres · 1.1s"
            args={{ query: "SELECT SUM(amount) FROM invoices WHERE q='Q3'" }}
            result={{ rows: [{ sum: 2_400_000 }] }}
            status="success"
            defaultOpen
          />
        </div>
      ),
    },
    {
      title: "Agent steps",
      description: "Vertical timeline with pending / running / done / error.",
      render: () => (
        <div style={{ maxWidth: 320 }}>
          <AgentStepTimeline steps={STEPS} />
        </div>
      ),
    },
    {
      title: "Model picker",
      description: "Model + temperature + max-tokens in one surface.",
      render: () => (
        <div style={{ maxWidth: 320 }}>
          <ModelPicker models={MODELS} value={model} onChange={setModel} />
        </div>
      ),
    },
    {
      title: "Prompt input",
      description: "Auto-grow textarea, @mentions, slash commands, attachments.",
      fullWidth: true,
      render: () => (
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
      ),
    },
    {
      title: "Citation chip",
      description: "Inline numbered chip + click-to-expand card variant.",
      fullWidth: true,
      render: () => (
        <Stack gap="3">
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
          <CitationChip
            variant="card"
            index={1}
            title="Q3 Financial Report"
            source="finance.internal · pdf"
            snippet="Total revenue of $2.4M, up 18% from Q2. Enterprise contributed 64% of growth."
          />
        </Stack>
      ),
    },
    {
      title: "Token meter",
      description: "Context-window bar with input/output split + cost.",
      render: () => (
        <div style={{ width: "100%", maxWidth: 320 }}>
          <TokenUsageMeter
            inputTokens={14_320}
            outputTokens={2_100}
            contextWindow={200_000}
            pricePerMillion={{ input: 3, output: 15 }}
          />
        </div>
      ),
    },
    {
      title: "Thinking indicator",
      description: "Animated dots — bubble or inline variant.",
      render: () => (
        <Stack gap="2">
          <ThinkingIndicator label="Reasoning" />
          <ThinkingIndicator variant="inline" />
        </Stack>
      ),
    },
  ];

  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="4">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Chat / AI Pack</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted" size="lg">
            Primitives for AI chat apps and agents. Role-aware message
            bubbles, streaming token rendering, tool-call cards, agent step
            timelines, model picker with params, prompt input with mentions
            and slash commands, numbered citations, token-usage + cost meter,
            and a thinking-indicator — all themed through bakerui tokens.
          </Text>
          <HStack gap="3" wrap>
            <Button size="lg" onClick={onPlayground}>
              Try the playground
            </Button>
            <Button size="lg" variant="secondary" onClick={onComponents}>
              Browse all components
            </Button>
          </HStack>
          <Alert tone="info">
            Designed to drop into anything that streams tokens — SSE, fetch
            stream readers, or local model output. Use{" "}
            <code>StreamingText</code> with a parent-controlled text buffer
            to render any stream incrementally.
          </Alert>
        </Stack>

        {/* Featured composition — message thread with streaming reply. */}
        <Card padded>
          <Stack gap="4">
            <Stack gap="1">
              <Heading level={2} size="md">
                Live thread
              </Heading>
              <Text tone="muted" size="sm">
                MessageBubble + ToolCallCard + StreamingText + CitationChip.
              </Text>
            </Stack>
            <Stack gap="3">
              <MessageBubble role="user" avatar={<span>AB</span>} author="You">
                What was our Q3 revenue, and how does it compare to Q2?
              </MessageBubble>
              <MessageBubble
                role="assistant"
                avatar={<span>✦</span>}
                author="Claude"
                timestamp="2:14 PM"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <ToolCallCard
                    name="run_sql"
                    meta="postgres · 1.1s"
                    args={{
                      query:
                        "SELECT quarter, SUM(amount) FROM invoices GROUP BY quarter",
                    }}
                    result={{
                      rows: [
                        { quarter: "Q2", sum: 2_030_000 },
                        { quarter: "Q3", sum: 2_400_000 },
                      ],
                    }}
                    status="success"
                  />
                  <span>
                    Q3 revenue came in at <strong>$2.40M</strong>{" "}
                    <CitationChip
                      index={1}
                      title="Q3 Financial Report"
                      source="finance.internal"
                      snippet="Total revenue of $2.4M vs $2.03M in Q2."
                    />
                    , up <strong>18%</strong> from $2.03M in Q2{" "}
                    <CitationChip
                      index={2}
                      title="Q2 Financial Report"
                      source="finance.internal"
                    />
                    . Most of the lift came from enterprise contracts closing
                    in late September.
                  </span>
                </div>
              </MessageBubble>
              <MessageBubble role="assistant" avatar={<span>✦</span>} author="Claude">
                <StreamingText
                  key="overview-feature-stream"
                  text="Want me to break the growth out by segment, or compare YoY against last Q3?"
                  speed={42}
                />
              </MessageBubble>
            </Stack>
          </Stack>
        </Card>

        {/* What's inside */}
        <Stack gap="4">
          <Stack gap="1">
            <Heading level={2} size="md">
              What's inside
            </Heading>
            <Text tone="muted" size="sm">
              Nine components covering the core vocabulary of AI chat
              interfaces.
            </Text>
          </Stack>
          <div className="buipro-audio-grid">
            {ITEMS.map((item) => (
              <Card
                key={item.title}
                padded
                className="buipro-audio-card"
                data-full={item.fullWidth || undefined}
              >
                <Stack gap="3">
                  <Stack gap="1">
                    <Heading level={3} size="sm">
                      {item.title}
                    </Heading>
                    <Text tone="muted" size="xs">
                      {item.description}
                    </Text>
                  </Stack>
                  <div className="buipro-audio-card__preview">{item.render()}</div>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>
      </Stack>
    </PageLayout>
  );
}
