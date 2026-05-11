import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  HStack,
  Heading,
  Pagination,
  Stack,
  Text,
  Tree,
  type DataTableColumn,
  type FilterState,
  type SortState,
  type TreeNode,
} from "bakerui";
import { DocExample, DocSection } from "../Doc";
import { PageLayout } from "../PageLayout";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "active" | "invited" | "suspended";
  signupCount: number;
  joinedAt: string;
}

const USERS: User[] = [
  { id: "u1", name: "Ada Baker", email: "ada@example.com", role: "Owner", status: "active", signupCount: 142, joinedAt: "2023-01-12" },
  { id: "u2", name: "Ben Carson", email: "ben@example.com", role: "Admin", status: "active", signupCount: 87, joinedAt: "2023-04-03" },
  { id: "u3", name: "Cara Lee", email: "cara@example.com", role: "Member", status: "active", signupCount: 33, joinedAt: "2024-02-19" },
  { id: "u4", name: "Dave Yi", email: "dave@example.com", role: "Member", status: "invited", signupCount: 0, joinedAt: "2025-09-01" },
  { id: "u5", name: "Esme Rho", email: "esme@example.com", role: "Viewer", status: "active", signupCount: 5, joinedAt: "2024-08-22" },
  { id: "u6", name: "Felix Park", email: "felix@example.com", role: "Member", status: "suspended", signupCount: 12, joinedAt: "2024-11-04" },
  { id: "u7", name: "Gabi Tan", email: "gabi@example.com", role: "Admin", status: "active", signupCount: 68, joinedAt: "2023-07-15" },
];

export function DataPage() {
  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Data display</Heading>
          <Text tone="muted">Tabular components for showing structured data.</Text>
        </Stack>
        <DataTableSection />
        <PaginationSection />
        <TreeSection />
      </Stack>
    </PageLayout>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M1.5 3.5a1 1 0 0 1 1-1h3l1 1h5a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V3.5z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden
    >
      <path d="M3.5 1.5h5l3 3V12a.5.5 0 0 1-.5.5h-7.5a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z" />
      <path d="M8.5 1.5V4.5h3" />
    </svg>
  );
}

const FILE_TREE: TreeNode[] = [
  {
    value: "src",
    label: "src",
    icon: <FolderIcon />,
    children: [
      {
        value: "components",
        label: "components",
        icon: <FolderIcon />,
        children: [
          { value: "Button.tsx", label: "Button.tsx", icon: <FileIcon /> },
          { value: "Tree.tsx", label: "Tree.tsx", icon: <FileIcon /> },
          { value: "Card.tsx", label: "Card.tsx", icon: <FileIcon /> },
        ],
      },
      {
        value: "utils",
        label: "utils",
        icon: <FolderIcon />,
        children: [
          { value: "cx.ts", label: "cx.ts", icon: <FileIcon /> },
          { value: "portal.tsx", label: "portal.tsx", icon: <FileIcon /> },
        ],
      },
      { value: "index.ts", label: "index.ts", icon: <FileIcon /> },
    ],
  },
  {
    value: "docs",
    label: "docs",
    icon: <FolderIcon />,
    children: [
      { value: "README.md", label: "README.md", icon: <FileIcon /> },
      {
        value: "guides",
        label: "guides",
        icon: <FolderIcon />,
        children: [
          { value: "intro.md", label: "intro.md", icon: <FileIcon /> },
          { value: "theming.md", label: "theming.md", icon: <FileIcon /> },
        ],
      },
    ],
  },
  { value: "package.json", label: "package.json", icon: <FileIcon />, disabled: true },
];

export function TreeSection() {
  const [selectedFile, setSelectedFile] = useState<string | null>("Tree.tsx");
  const [permissions, setPermissions] = useState<string[]>([
    "read.posts",
    "write.posts",
  ]);

  return (
    <DocSection
      title="Tree"
      description="Hierarchical disclosure list with keyboard navigation (Arrow keys, Home/End, Enter/Space) and roving tabindex. Single-select acts like a file browser; multi-select shows tri-state checkboxes that cascade through descendants."
      propsTable={[
        {
          name: "data",
          type: "TreeNode[]",
          description: "Render tree from a data array. Each node has { value, label, icon?, disabled?, children? }. Mutually exclusive with children.",
        },
        {
          name: "selectionMode",
          type: '"single" | "multiple"',
          default: '"single"',
          description: "Multiple mode renders a tri-state checkbox on each row and cascades selection to descendants.",
        },
        {
          name: "selected",
          type: "string | string[] | null",
          description: "Controlled selection. Pass a single value or an array depending on selectionMode.",
        },
        {
          name: "defaultSelected",
          type: "string | string[] | null",
          description: "Initial selection when uncontrolled.",
        },
        {
          name: "onSelectedChange",
          type: "(selected: string | string[] | null) => void",
          description: "Fires whenever the selection changes.",
        },
        {
          name: "expanded",
          type: "string[]",
          description: "Controlled expansion set. Items not in the set render collapsed.",
        },
        {
          name: "defaultExpanded",
          type: "string[]",
          description: "Initial expansion when uncontrolled.",
        },
        {
          name: "onExpandedChange",
          type: "(expanded: string[]) => void",
          description: "Fires whenever the expansion set changes.",
        },
        {
          name: "Tree.Item.value",
          type: "string",
          required: true,
          description: "Stable identifier used for selection and expansion state.",
        },
        {
          name: "Tree.Item.label",
          type: "ReactNode",
          required: true,
          description: "Rendered row content. Nest <Tree.Item> as children to declare a subtree.",
        },
        {
          name: "Tree.Item.icon",
          type: "ReactNode",
          description: "Optional leading icon rendered between the checkbox and label.",
        },
        {
          name: "Tree.Item.disabled",
          type: "boolean",
          description: "Skipped during keyboard navigation; not selectable.",
        },
      ]}
    >
      <DocExample
        label="File browser (single-select, data-driven)"
        description="Pass `data` to render the tree from a TreeNode array. Use the chevron or ArrowRight/Left to expand; click a row (or press Enter) to select."
        code={`const tree: TreeNode[] = [
  { value: "src", label: "src", children: [
    { value: "components", label: "components", children: [
      { value: "Button.tsx", label: "Button.tsx" },
    ]},
  ]},
];

<Tree
  data={tree}
  defaultExpanded={["src", "components"]}
  selected={selected}
  onSelectedChange={setSelected as (v: string | string[] | null) => void}
/>`}
      >
        <Stack gap="2" style={{ maxWidth: 360 }}>
          <Tree
            data={FILE_TREE}
            defaultExpanded={["src", "components"]}
            selected={selectedFile}
            onSelectedChange={(next) => setSelectedFile(next as string | null)}
            aria-label="Project files"
          />
          {selectedFile && (
            <Text size="sm" tone="muted">
              Selected: <code>{selectedFile}</code>
            </Text>
          )}
        </Stack>
      </DocExample>

      <DocExample
        label="Multi-select with cascading checkboxes (compositional)"
        description='Set selectionMode="multiple" to enable tri-state checkboxes. Checking a parent selects every descendant; unchecking any descendant flips the parent to a mixed state.'
        code={`<Tree
  selectionMode="multiple"
  selected={perms}
  onSelectedChange={setPerms as (v: string | string[] | null) => void}
  defaultExpanded={["posts", "users"]}
>
  <Tree.Item value="posts" label="Posts">
    <Tree.Item value="read.posts" label="Read" />
    <Tree.Item value="write.posts" label="Write" />
    <Tree.Item value="delete.posts" label="Delete" />
  </Tree.Item>
  <Tree.Item value="users" label="Users">
    <Tree.Item value="read.users" label="Read" />
    <Tree.Item value="write.users" label="Write" />
  </Tree.Item>
</Tree>`}
      >
        <Stack gap="3" style={{ maxWidth: 360 }}>
          <Tree
            selectionMode="multiple"
            selected={permissions}
            onSelectedChange={(next) => setPermissions(next as string[])}
            defaultExpanded={["posts", "users"]}
            aria-label="Permissions"
          >
            <Tree.Item value="posts" label="Posts">
              <Tree.Item value="read.posts" label="Read" />
              <Tree.Item value="write.posts" label="Write" />
              <Tree.Item value="delete.posts" label="Delete" />
            </Tree.Item>
            <Tree.Item value="users" label="Users">
              <Tree.Item value="read.users" label="Read" />
              <Tree.Item value="write.users" label="Write" />
              <Tree.Item value="admin.users" label="Admin" disabled />
            </Tree.Item>
            <Tree.Item value="billing" label="Billing">
              <Tree.Item value="read.billing" label="Read" />
              <Tree.Item value="write.billing" label="Write" />
            </Tree.Item>
          </Tree>
          {permissions.length > 0 && (
            <Text size="sm" tone="muted">
              Granted: <code>{permissions.join(", ")}</code>
            </Text>
          )}
        </Stack>
      </DocExample>
    </DocSection>
  );
}

function statusTone(s: User["status"]): "success" | "accent" | "danger" {
  if (s === "active") return "success";
  if (s === "invited") return "accent";
  return "danger";
}

export function DataTableSection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortState | null>({ key: "name", direction: "asc" });
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(false);

  const columns: DataTableColumn<User>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        sortable: true,
        filter: { type: "text", placeholder: "Filter by name or email…" },
        // Custom filterFn so the text filter searches both name AND email.
        filterFn: (row, value) => {
          const q = String(value).toLowerCase();
          return (
            row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q)
          );
        },
        cell: (row) => (
          <Stack gap="0">
            <Text size="sm" weight="semibold">
              {row.name}
            </Text>
            <Text size="xs" tone="muted">
              {row.email}
            </Text>
          </Stack>
        ),
      },
      {
        key: "role",
        header: "Role",
        sortable: true,
        hideBelow: "sm",
        filter: {
          type: "multi-select",
          options: [
            { value: "Owner", label: "Owner" },
            { value: "Admin", label: "Admin" },
            { value: "Member", label: "Member" },
            { value: "Viewer", label: "Viewer" },
          ],
        },
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        filter: {
          type: "select",
          options: [
            { value: "active", label: "Active" },
            { value: "invited", label: "Invited" },
            { value: "suspended", label: "Suspended" },
          ],
        },
        cell: (row) => (
          <Badge tone={statusTone(row.status)}>
            {row.status[0].toUpperCase() + row.status.slice(1)}
          </Badge>
        ),
      },
      {
        key: "signupCount",
        header: "Signups",
        sortable: true,
        align: "right",
        hideBelow: "md",
        cell: (row) => row.signupCount.toLocaleString(),
      },
      {
        key: "joinedAt",
        header: "Joined",
        sortable: true,
        hideBelow: "md",
        cell: (row) =>
          new Date(row.joinedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
      },
    ],
    [],
  );

  const activeFilterCount = Object.keys(filters).length;

  return (
    <DocSection
      title="DataTable"
      description="Sortable columns (click headers; third click clears), per-column filters (text / select / multi-select), sticky header, optional row selection with select-all + indeterminate, zebra rows, hover highlight, empty + loading states. Internally sorted and filtered by default — pass manualSort / manualFilter for server-side."
      propsTable={[
        {
          name: "columns",
          type: "DataTableColumn<T>[]",
          required: true,
          description: "Column definitions — header, optional cell renderer, sort/filter config, alignment, width, hide-below breakpoint.",
        },
        {
          name: "data",
          type: "T[]",
          required: true,
          description: "Row data. Sorted/filtered internally unless manualSort/manualFilter is set.",
        },
        {
          name: "rowKey",
          type: "(row: T) => string",
          required: true,
          description: "Stable id per row — used for keys, selection, and React reconciliation.",
        },
        {
          name: "sortBy",
          type: '{ key: string; direction: "asc" | "desc" } | null',
          description: "Controlled sort state. Click cycle: asc → desc → null.",
        },
        {
          name: "defaultSortBy",
          type: "SortState | null",
          default: "null",
          description: "Initial sort when uncontrolled.",
        },
        {
          name: "onSortChange",
          type: "(sort: SortState | null) => void",
          description: "Fires whenever the sort cycles.",
        },
        {
          name: "manualSort",
          type: "boolean",
          default: "false",
          description: "Disable internal sorting — provide pre-sorted data (e.g., from a server).",
        },
        {
          name: "filters",
          type: "Record<string, string | string[] | undefined>",
          description: "Controlled filter values, keyed by column key.",
        },
        {
          name: "onFiltersChange",
          type: "(filters: FilterState) => void",
          description: "Fires whenever a column's filter changes.",
        },
        {
          name: "manualFilter",
          type: "boolean",
          default: "false",
          description: "Disable internal filtering.",
        },
        {
          name: "selectable",
          type: "boolean",
          default: "false",
          description: "Add a leading checkbox column with select-all (indeterminate when partial).",
        },
        {
          name: "selectedKeys",
          type: "Set<string>",
          description: "Controlled set of selected row keys.",
        },
        {
          name: "onSelectionChange",
          type: "(keys: Set<string>) => void",
          description: "Fires whenever selection changes.",
        },
        {
          name: "zebra",
          type: "boolean",
          default: "false",
          description: "Alternate row background.",
        },
        {
          name: "stickyHeader",
          type: "boolean",
          default: "true",
          description: "Pin the header row to the top of the scroll container.",
        },
        {
          name: "hoverable",
          type: "boolean",
          default: "true",
          description: "Highlight rows on hover.",
        },
        {
          name: "density",
          type: '"default" | "compact"',
          default: '"default"',
          description: "Compact reduces vertical padding for dense lists.",
        },
        {
          name: "loading",
          type: "boolean",
          default: "false",
          description: "Replace body rows with skeleton placeholders.",
        },
        {
          name: "loadingRows",
          type: "number",
          default: "5",
          description: "Number of skeleton rows to render while loading.",
        },
        {
          name: "emptyState",
          type: "ReactNode",
          description: 'Rendered when there are no rows. Defaults to "No data."',
        },
        {
          name: "onRowClick",
          type: "(row: T) => void",
          description: "Fires when a row is clicked. Skips clicks originating from interactive cell content (input, button, a).",
        },
        {
          name: "rowClassName",
          type: "(row: T) => string | undefined",
          description: "Per-row className — useful for status-tinted rows.",
        },
        {
          name: "caption",
          type: "ReactNode",
          description: "Caption shown above the header (also exposed to screen readers).",
        },
      ]}
    >
      <DocExample
        label="Sorting + filtering + selection"
        description="Click any sortable header to cycle asc → desc → unsorted. Click the funnel icon next to a header to filter — text on Name (auto-searches name + email via custom filterFn), single-select on Status, multi-select on Role. The leading checkbox row supports select-all + indeterminate; selection state survives across filter changes."
        code={`const columns: DataTableColumn<User>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    filter: { type: "text", placeholder: "Filter by name or email…" },
    filterFn: (row, value) =>
      row.name.toLowerCase().includes(String(value).toLowerCase()) ||
      row.email.toLowerCase().includes(String(value).toLowerCase()),
    cell: (row) => <Stack>...</Stack>,
  },
  {
    key: "role",
    header: "Role",
    sortable: true,
    filter: {
      type: "multi-select",
      options: [
        { value: "Owner", label: "Owner" },
        { value: "Admin", label: "Admin" },
        { value: "Member", label: "Member" },
        { value: "Viewer", label: "Viewer" },
      ],
    },
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    filter: {
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "invited", label: "Invited" },
        { value: "suspended", label: "Suspended" },
      ],
    },
    cell: (row) => <Badge tone={...}>{row.status}</Badge>,
  },
];

<DataTable
  columns={columns}
  data={users}
  rowKey={(u) => u.id}
  sortBy={sort}
  onSortChange={setSort}
  filters={filters}
  onFiltersChange={setFilters}
  selectable
  selectedKeys={selected}
  onSelectionChange={setSelected}
  zebra
  stickyHeader
/>`}
      >
        <Stack gap="3">
          <HStack gap="2" align="center" wrap>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setLoading(true);
                window.setTimeout(() => setLoading(false), 1500);
              }}
            >
              Simulate loading
            </Button>
            {activeFilterCount > 0 && (
              <>
                <Badge tone="accent">
                  {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => setFilters({})}>
                  Clear filters
                </Button>
              </>
            )}
            {selected.size > 0 && (
              <>
                <Badge tone="accent">{selected.size} selected</Badge>
                <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                  Clear selection
                </Button>
              </>
            )}
          </HStack>
          <DataTable
            columns={columns}
            data={USERS}
            rowKey={(u) => u.id}
            sortBy={sort}
            onSortChange={setSort}
            filters={filters}
            onFiltersChange={setFilters}
            selectable
            selectedKeys={selected}
            onSelectionChange={setSelected}
            zebra
            stickyHeader
            loading={loading}
            caption="Workspace members"
            aria-label="Workspace members"
          />
        </Stack>
      </DocExample>

      <DocExample
        label="Compact, no selection"
        description={
          <>
            Set <code>density="compact"</code> for denser rows, drop{" "}
            <code>selectable</code> when there's no batch action.
          </>
        }
        code={`<DataTable
  columns={columns}
  data={data}
  rowKey={(r) => r.id}
  density="compact"
  hoverable={false}
/>`}
      >
        <DataTable
          columns={[
            { key: "name", header: "Member", sortable: true },
            { key: "role", header: "Role", sortable: true },
            { key: "status", header: "Status" },
          ]}
          data={USERS.slice(0, 4)}
          rowKey={(u) => u.id}
          density="compact"
          hoverable={false}
        />
      </DocExample>

      <DocExample
        label="Empty state"
        code={`<DataTable
  columns={columns}
  data={[]}
  rowKey={(u) => u.id}
  emptyState={
    <Stack gap="2" align="center">
      <Text>No members yet</Text>
      <Button size="sm">Invite teammates</Button>
    </Stack>
  }
/>`}
      >
        <DataTable
          columns={columns}
          data={[]}
          rowKey={(u) => u.id}
          emptyState={
            <Stack gap="2" align="center">
              <Text weight="medium">No members yet</Text>
              <Text size="sm" tone="muted">
                Invite teammates to start collaborating.
              </Text>
              <Button size="sm">Invite teammates</Button>
            </Stack>
          }
        />
      </DocExample>
    </DocSection>
  );
}

export function PaginationSection() {
  const [page, setPage] = useState(3);
  const [longPage, setLongPage] = useState(7);
  const [smallPage, setSmallPage] = useState(2);

  return (
    <DocSection
      title="Pagination"
      description="Page-number navigation with configurable boundary and sibling counts. Truncates with ellipsis when ranges get long. Pairs naturally with DataTable for paged result sets."
      propsTable={[
        {
          name: "page",
          type: "number",
          required: true,
          description: "The active page (1-indexed). Controlled.",
        },
        {
          name: "pageCount",
          type: "number",
          required: true,
          description: "Total number of pages.",
        },
        {
          name: "onPageChange",
          type: "(page: number) => void",
          required: true,
          description: "Fires when the user picks a different page.",
        },
        {
          name: "siblingCount",
          type: "number",
          default: "1",
          description: "Pages to keep visible on each side of the active page.",
        },
        {
          name: "boundaryCount",
          type: "number",
          default: "1",
          description: "Pages to always show at the start and end.",
        },
        {
          name: "size",
          type: '"sm" | "md"',
          default: '"md"',
          description: "Visual size.",
        },
        {
          name: "showFirstLast",
          type: "boolean",
          default: "false",
          description: "Show jump-to-first / jump-to-last buttons in addition to prev/next.",
        },
        {
          name: "hideNavigation",
          type: "boolean",
          default: "false",
          description: "Hide the prev/next buttons (e.g., compact contexts).",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Disable all controls.",
        },
        {
          name: "labels",
          type: "Partial<{ previous, next, first, last, page }>",
          description: "Override aria-labels for the navigation buttons.",
        },
      ]}
    >
      <DocExample
        label="Default"
        description="A typical paged list. Truncation kicks in when the range can't fit the full set without ellipses."
        code={`const [page, setPage] = useState(3);

<Pagination page={page} pageCount={20} onPageChange={setPage} />`}
      >
        <Stack gap="3">
          <Pagination page={page} pageCount={20} onPageChange={setPage} />
          <Text size="sm" tone="muted">
            Current page: {page}
          </Text>
        </Stack>
      </DocExample>

      <DocExample
        label="With first / last and larger range"
        description="Add jump-to-first and jump-to-last buttons for big sets."
        code={`<Pagination
  page={page}
  pageCount={120}
  onPageChange={setPage}
  showFirstLast
/>`}
      >
        <Stack gap="3">
          <Pagination
            page={longPage}
            pageCount={120}
            onPageChange={setLongPage}
            showFirstLast
          />
          <Text size="sm" tone="muted">
            Current page: {longPage}
          </Text>
        </Stack>
      </DocExample>

      <DocExample
        label="Compact size"
        description="Smaller hit-area for table footers and dense layouts."
        code={`<Pagination
  page={page}
  pageCount={6}
  onPageChange={setPage}
  size="sm"
/>`}
      >
        <Stack gap="3">
          <Pagination
            page={smallPage}
            pageCount={6}
            onPageChange={setSmallPage}
            size="sm"
          />
        </Stack>
      </DocExample>

      <DocExample
        label="Disabled"
        description="Disable the entire control while data is loading."
        code={`<Pagination page={1} pageCount={10} onPageChange={() => {}} disabled />`}
      >
        <Pagination page={1} pageCount={10} onPageChange={() => {}} disabled />
      </DocExample>
    </DocSection>
  );
}
