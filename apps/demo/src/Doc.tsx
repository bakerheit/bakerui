import { createContext, useContext, type ReactNode } from "react";
import {
  DataTable,
  Heading,
  Stack,
  Text,
  type DataTableColumn,
} from "bakerui";
import { CodeBlock } from "./CodeBlock";

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
  children: ReactNode;
}

export function DocSection({
  title,
  id,
  description,
  props,
  propsTable,
  children,
}: DocSectionProps) {
  const sectionId = id ?? slug(title);
  return (
    <SectionContext.Provider value={{ id: sectionId }}>
      <section
        id={sectionId}
        className="doc-section"
        data-toc-section
        data-toc-label={title}
      >
        <Stack gap="4">
          <Stack gap="2">
            <Heading level={2}>{title}</Heading>
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
  const columns: DataTableColumn<PropDef>[] = [
    {
      key: "name",
      header: "Prop",
      width: 200,
      cell: (p) => (
        <span className="doc-prop-name">
          <code>{p.name}</code>
          {p.required && (
            <span className="doc-prop-required" aria-label="required">
              *
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
        p.description ? (
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
        data={rows}
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
