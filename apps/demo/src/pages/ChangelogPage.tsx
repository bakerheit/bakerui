import { Badge, Heading, Stack, Text } from "bakerui";
import { PageLayout } from "../PageLayout";
import { CHANGELOG, type EntryGroup, type EntryKind, type InlineNode, type Release } from "../changelog";
import { VERSION } from "../version";

const KIND_LABEL: Record<EntryKind, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  security: "Security",
  deprecated: "Deprecated",
};

const KIND_TONE: Record<EntryKind, "accent" | "success" | "warning" | "danger" | "neutral"> = {
  added: "success",
  changed: "accent",
  fixed: "warning",
  removed: "danger",
  security: "danger",
  deprecated: "neutral",
};

export function ChangelogPage() {
  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Changelog</Heading>
          <Text tone="muted">
            Release history for the <code>bakerui</code> npm package. Currently
            installed: <code>v{VERSION}</code>. Source of truth lives at{" "}
            <a
              href="https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noreferrer"
            >
              CHANGELOG.md
            </a>{" "}
            in the repo root.
          </Text>
        </Stack>

        {CHANGELOG.length === 0 ? (
          <Text tone="muted">No releases recorded yet.</Text>
        ) : (
          CHANGELOG.map((release) => (
            <ReleaseBlock
              key={release.id}
              release={release}
              isCurrent={release.version === VERSION}
            />
          ))
        )}
      </Stack>
    </PageLayout>
  );
}

function ReleaseBlock({ release, isCurrent }: { release: Release; isCurrent: boolean }) {
  const isUnreleased = /^unreleased$/i.test(release.version);
  return (
    <section id={release.id} className="demo-changelog-release">
      <Stack gap="4">
        <Stack gap="2">
          <div className="demo-changelog-header">
            <Heading level={2} className="demo-changelog-version">
              {isUnreleased ? "Unreleased" : `v${release.version}`}
            </Heading>
            {isCurrent && <Badge tone="accent">Current</Badge>}
            {isUnreleased && <Badge tone="warning">In progress</Badge>}
            {release.date && (
              <Text tone="muted" size="sm">
                {release.date}
              </Text>
            )}
          </div>
          {release.groups.length === 0 && (
            <Text tone="muted" size="sm">
              No changes recorded.
            </Text>
          )}
        </Stack>

        {release.groups.map((group, idx) => (
          <Group key={`${release.id}-${group.kind}-${idx}`} group={group} />
        ))}
      </Stack>
    </section>
  );
}

function Group({ group }: { group: EntryGroup }) {
  return (
    <Stack gap="2" className="demo-changelog-group">
      <div className="demo-changelog-group-header">
        <Badge tone={KIND_TONE[group.kind]}>{KIND_LABEL[group.kind]}</Badge>
      </div>
      <ul className="demo-changelog-list">
        {group.entries.map((entry, i) => (
          <li key={i}>
            {entry.content.map((node, j) => (
              <Inline key={j} node={node} />
            ))}
          </li>
        ))}
      </ul>
    </Stack>
  );
}

function Inline({ node }: { node: InlineNode }) {
  switch (node.kind) {
    case "text":
      return <>{node.value}</>;
    case "code":
      return <code>{node.value}</code>;
    case "strong":
      return <strong>{node.value}</strong>;
    case "link":
      return (
        <a href={node.href} target="_blank" rel="noreferrer">
          {node.text}
        </a>
      );
  }
}
