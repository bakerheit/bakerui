import { createContext, useContext, type ReactNode } from "react";
import {
  Badge,
  DataTable,
  Heading,
  Stack,
  Text,
  type DataTableColumn,
} from "bakerui";
import { CodeBlock } from "./CodeBlock";
import { entryStateAt, useDocVersion, type DocVersion } from "./docVersion";

export function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface SectionContextValue {
  id: string;
}

const SectionContext = createContext<SectionContextValue | null>(null);

export interface PropDef {
  /** Prop name. */
  name: string;
  /** Type expression as a string (e.g. `'"sm" | "md" | "lg"'`). */
  type: string;
  /** Default value, formatted for display. Omit for required/no-default props. */
  default?: string;
  description?: ReactNode;
  /** Show a required indicator next to the name. */
  required?: boolean;
  /**
   * Library version this prop first shipped in (e.g. `"0.4.0"`). When set,
   * the row is hidden if the reader is viewing an earlier version, and a
   * small "since" badge appears in the API table. Omit for props that
   * have always existed.
   */
  since?: DocVersion;
  /**
   * Library version this prop was deprecated in. From that version
   * onward, the row renders struck-through with a tooltip-style note.
   */
  deprecated?: DocVersion;
  /** Short reason / migration hint shown when the prop is deprecated. */
  deprecatedReason?: ReactNode;
}

export interface DocSectionProps {
  title: string;
  /** Anchor id (auto-derived from `title` when omitted). */
  id?: string;
  description?: ReactNode;
  /** Short list of prop names — quick-scan chips above the examples. */
  props?: string[];
  /** Full prop reference rendered as a DataTable below the examples. */
  propsTable?: PropDef[];
  /**
   * Library version this component first shipped in. When the reader is
   * viewing an earlier version, the entire section disappears.
   */
  since?: DocVersion;
  /** Library version this component was deprecated in. */
  deprecated?: DocVersion;
  /** Reason / migration note for the deprecation banner. */
  deprecatedReason?: ReactNode;
  children: ReactNode;
}

export function DocSection({
  title,
  id,
  description,
  props,
  propsTable,
  since,
  deprecated,
  deprecatedReason,
  children,
}: DocSectionProps) {
  const sectionId = id ?? slug(title);
  const versionCtx = useDocVersion();
  const state = versionCtx
    ? entryStateAt({ since, deprecated }, versionCtx.version)
    : "visible";

  if (state === "hidden") return null;

  const isDeprecated = state === "deprecated";
  // Show the version badge whenever this section is gated by a since
  // tag — even if it's the latest. Subtle and gives readers a quick
  // sense of "this is newer than X."
  const showSinceBadge = !!since;

  return (
    <SectionContext.Provider value={{ id: sectionId }}>
      <section
        id={sectionId}
        className="doc-section"
        data-deprecated={isDeprecated || undefined}
        data-toc-section
        data-toc-label={title}
      >
        <Stack gap="4">
          <Stack gap="2">
            <div className="doc-section__heading">
              <Heading level={2}>{title}</Heading>
              {showSinceBadge && (
                <Badge tone="accent" className="doc-section__since">
                  v{since}+
                </Badge>
              )}
              {isDeprecated && (
                <Badge tone="warning" className="doc-section__deprecated-chip">
                  Deprecated
                </Badge>
              )}
            </div>
            {isDeprecated && (
              <div className="doc-section__deprecation" role="status">
                <strong>Deprecated as of v{deprecated}.</strong>{" "}
                {deprecatedReason ??
                  "This component will be removed in a future release."}
              </div>
            )}
            {description && <Text tone="muted">{description}</Text>}
            {props && props.length > 0 && (
              <div className="demo-props">
                <span className="demo-props__label">Props</span>
                {props.map((p) => (
                  <code key={p} className="demo-props__chip">
                    {p}
                  </code>
                ))}
              </div>
            )}
          </Stack>
          <Stack gap="4">{children}</Stack>
          {propsTable && propsTable.length > 0 && (
            <PropsTable rows={propsTable} sectionId={sectionId} />
          )}
        </Stack>
      </section>
    </SectionContext.Provider>
  );
}

function PropsTable({ rows, sectionId }: { rows: PropDef[]; sectionId: string }) {
  const apiId = `${sectionId}-api`;
  const versionCtx = useDocVersion();
  const currentVersion = versionCtx?.version;

  // Annotate each row with its computed visibility state for the
  // current viewing version. Hidden rows drop out entirely; deprecated
  // rows stay visible but render with strike-through styling.
  const visibleRows = rows.reduce<Array<PropDef & { __state: "visible" | "deprecated" }>>(
    (acc, row) => {
      const state = currentVersion
        ? entryStateAt(
            { since: row.since, deprecated: row.deprecated },
            currentVersion,
          )
        : "visible";
      if (state === "hidden") return acc;
      acc.push({ ...row, __state: state });
      return acc;
    },
    [],
  );

  if (visibleRows.length === 0) return null;

  const columns: DataTableColumn<(typeof visibleRows)[number]>[] = [
    {
      key: "name",
      header: "Prop",
      width: 220,
      cell: (p) => (
        <span
          className="doc-prop-name"
          data-deprecated={p.__state === "deprecated" || undefined}
        >
          <code>{p.name}</code>
          {p.required && (
            <span className="doc-prop-required" aria-label="required">
              *
            </span>
          )}
          {p.since && (
            <span className="doc-prop-since" title={`Added in v${p.since}`}>
              v{p.since}+
            </span>
          )}
          {p.__state === "deprecated" && (
            <span
              className="doc-prop-deprecated-chip"
              title={typeof p.deprecatedReason === "string" ? p.deprecatedReason : undefined}
            >
              Deprecated
            </span>
          )}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (p) => <code className="doc-prop-type">{p.type}</code>,
    },
    {
      key: "default",
      header: "Default",
      width: 140,
      cell: (p) =>
        p.default !== undefined ? (
          <code className="doc-prop-default">{p.default}</code>
        ) : (
          <span className="doc-prop-default-empty">—</span>
        ),
    },
    {
      key: "description",
      header: "Description",
      cell: (p) =>
        p.__state === "deprecated" && p.deprecatedReason ? (
          <span className="doc-prop-description">
            <span className="doc-prop-deprecated-reason">
              {p.deprecatedReason}
            </span>
            {p.description && (
              <>
                <br />
                <span style={{ opacity: 0.7 }}>{p.description}</span>
              </>
            )}
          </span>
        ) : p.description ? (
          <span className="doc-prop-description">{p.description}</span>
        ) : null,
    },
  ];

  return (
    <Stack
      gap="3"
      className="doc-props-table"
      id={apiId}
      data-toc-example=""
      data-toc-label="Options"
    >
      <Heading level={3} size="md">
        Options
      </Heading>
      <DataTable
        columns={columns}
        data={visibleRows}
        rowKey={(p) => p.name}
        density="compact"
        zebra
        hoverable={false}
        stickyHeader={false}
      />
    </Stack>
  );
}

export interface DocExampleProps {
  label?: ReactNode;
  description?: ReactNode;
  code?: string;
  filename?: string;
  language?: string;
  children: ReactNode;
}

export function DocExample({
  label,
  description,
  code,
  filename,
  language,
  children,
}: DocExampleProps) {
  const ctx = useContext(SectionContext);
  // Only string labels become navigable anchors; non-string labels (rare)
  // get no id and won't appear in the TOC.
  const labelText = typeof label === "string" ? label : undefined;
  const exampleId =
    ctx && labelText ? `${ctx.id}-${slug(labelText)}` : undefined;

  return (
    <Stack
      gap="3"
      id={exampleId}
      data-toc-example={exampleId ? "" : undefined}
      data-toc-label={labelText}
    >
      {(label || description) && (
        <Stack gap="1">
          {label && (
            <Text size="sm" weight="semibold">
              {label}
            </Text>
          )}
          {description && (
            <Text size="sm" tone="muted">
              {description}
            </Text>
          )}
        </Stack>
      )}
      <div className="demo-example">{children}</div>
      {code && <CodeBlock code={code} filename={filename} language={language} />}
    </Stack>
  );
}
