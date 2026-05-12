import { useState } from "react";
import { Badge, HStack, Heading, Stack, Text } from "bakerui";
import {
  CategoryRail,
  CoverCounter,
  MenuItemCard,
  ModifierSheet,
  NumberPad,
  OrderTicket,
  ReceiptPreview,
  TableMap,
  TenderPanel,
  type ModifierGroup,
  type OrderLine,
  type PosCategory,
  type PosTable,
} from "bakeruipro";
import { PageLayout } from "../PageLayout";
import { DocExample, DocSection } from "../Doc";
import "bakeruipro/pos.css";

const CATEGORIES: PosCategory[] = [
  { id: "starters", label: "Starters", count: 6, color: "#f59e0b" },
  { id: "mains", label: "Mains", count: 12, color: "#a855f7" },
  { id: "sides", label: "Sides", count: 5, color: "var(--bui-color-success)" },
  { id: "drinks", label: "Drinks", count: 18, color: "var(--bui-color-accent)" },
];

const ORDER: OrderLine[] = [
  { id: "l1", name: "Caesar salad", quantity: 1, unitPrice: 14, modifiers: ["No anchovy"], seat: 1, status: "fired" },
  { id: "l2", name: "Ribeye", quantity: 1, unitPrice: 48, modifiers: ["Med rare"], seat: 2, status: "new", note: "Allergy: gluten" },
  { id: "l3", name: "Pinot Noir", quantity: 2, unitPrice: 14, seat: 1, status: "ready" },
];

const BURGER_MODS: ModifierGroup[] = [
  {
    id: "temp",
    label: "Temperature",
    kind: "single",
    required: true,
    options: [
      { id: "rare", label: "Rare" },
      { id: "medrare", label: "Med rare" },
      { id: "med", label: "Medium" },
      { id: "well", label: "Well" },
    ],
  },
  {
    id: "cheese",
    label: "Cheese",
    kind: "single",
    options: [
      { id: "none", label: "None" },
      { id: "cheddar", label: "Cheddar" },
      { id: "blue", label: "Blue", priceDelta: 1.5 },
    ],
  },
  {
    id: "addons",
    label: "Add-ons",
    kind: "multi",
    max: 3,
    options: [
      { id: "bacon", label: "Bacon", priceDelta: 2 },
      { id: "avocado", label: "Avocado", priceDelta: 2 },
      { id: "jalapeno", label: "Jalapeño", priceDelta: 0.75 },
    ],
  },
];

const TABLES: PosTable[] = [
  { id: "t1", label: "1", capacity: 2, covers: 2, status: "seated", ticketMinutes: 12, server: "JR", x: 1, y: 1 },
  { id: "t2", label: "2", capacity: 4, covers: 4, status: "ordered", ticketMinutes: 24, server: "JR", x: 2, y: 1 },
  { id: "t3", label: "3", capacity: 4, status: "open", x: 3, y: 1 },
  { id: "t4", label: "4", capacity: 6, covers: 6, status: "check", ticketMinutes: 48, server: "MK", x: 4, y: 1, w: 2 },
  { id: "t5", label: "B1", capacity: 1, status: "open", x: 1, y: 2, shape: "round" },
  { id: "t6", label: "B2", capacity: 1, status: "seated", covers: 1, x: 2, y: 2, shape: "round" },
];

export function PosPackComponentsPage() {
  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="3">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>POS Pack — Components</Heading>
            <Badge tone="accent">Early access</Badge>
            <Badge tone="neutral">Touch-first</Badge>
          </HStack>
          <Text tone="muted">
            Reference for every component in the Restaurant POS Pack. Each
            section lists props, defaults, and a live example.
          </Text>
        </Stack>

        <MenuItemCardSection />
        <CategoryRailSection />
        <OrderTicketSection />
        <ModifierSheetSection />
        <NumberPadSection />
        <CoverCounterSection />
        <TenderPanelSection />
        <TableMapSection />
        <ReceiptPreviewSection />
      </Stack>
    </PageLayout>
  );
}

/* ========================================================================== */
function MenuItemCardSection() {
  return (
    <DocSection
      title="MenuItemCard"
      description="Touch tile for a menu item. Big quick-add affordance, modifier dot for items with required modifiers, strike-through + dimming when unavailable. Sizes adjust min-height but never drop below ~108px (touch-friendly)."
      propsTable={[
        { name: "name", type: "string", required: true },
        { name: "price", type: "number", required: true },
        { name: "currency", type: "string", default: "\"USD\"" },
        { name: "image", type: "string" },
        { name: "color", type: "string", description: "Accent color for placeholder + selection ring." },
        { name: "category", type: "string" },
        { name: "hasModifiers", type: "boolean", description: "Shows the modifier dot." },
        { name: "unavailable", type: "boolean", description: "Disables the tile and strikes the name." },
        { name: "selected", type: "boolean" },
        { name: "showAdd", type: "boolean", default: "true" },
        { name: "trailing", type: "ReactNode" },
        { name: "size", type: "\"sm\" | \"md\" | \"lg\"", default: "\"md\"" },
        { name: "onPress", type: "() => void" },
      ]}
    >
      <DocExample
        label="States"
        code={`<MenuItemCard name="Wagyu burger" price={22} color="#a855f7" hasModifiers />
<MenuItemCard name="Caesar salad" price={14} color="#10b981" />
<MenuItemCard name="Bone marrow" price={18} color="#a85d3a" unavailable />`}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 540 }}>
          <MenuItemCard name="Wagyu burger" price={22} color="#a855f7" hasModifiers />
          <MenuItemCard name="Caesar salad" price={14} color="#10b981" selected />
          <MenuItemCard name="Bone marrow" price={18} color="#a85d3a" unavailable />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function CategoryRailSection() {
  const [current, setCurrent] = useState("mains");
  return (
    <DocSection
      title="CategoryRail"
      description="Vertical (or horizontal) category list with accent stripe + count chip. Selecting renders a surface bg behind the active row."
      propsTable={[
        { name: "categories", type: "PosCategory[]", required: true, description: "{ id, label, count?, color?, icon? }" },
        { name: "current", type: "string", required: true },
        { name: "onChange", type: "(id: string) => void" },
        { name: "orientation", type: "\"vertical\" | \"horizontal\"", default: "\"vertical\"" },
      ]}
    >
      <DocExample
        label="Vertical with counts"
        code={`<CategoryRail categories={CATEGORIES} current={current} onChange={setCurrent} />`}
      >
        <div style={{ width: 240 }}>
          <CategoryRail
            categories={CATEGORIES}
            current={current}
            onChange={setCurrent}
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function OrderTicketSection() {
  const [selectedId, setSelectedId] = useState<string | undefined>("l2");
  return (
    <DocSection
      title="OrderTicket"
      description="Running order panel. Per-seat chips, modifier sublist, allergy note, status pip. Selecting a line reveals quantity + void actions inline. Totals row is sticky at the bottom; pass a footer slot for a Pay button row."
      propsTable={[
        { name: "lines", type: "OrderLine[]", required: true },
        { name: "title / subtitle", type: "ReactNode" },
        { name: "currency", type: "string", default: "\"USD\"" },
        { name: "selectedId", type: "string" },
        { name: "onSelect", type: "(lineId: string) => void" },
        { name: "onIncrement / onDecrement", type: "(lineId: string) => void" },
        { name: "onVoid", type: "(lineId: string) => void" },
        { name: "totals", type: "{ subtotal?, tax?, tip?, discount?, total }" },
        { name: "footer", type: "ReactNode" },
      ]}
    >
      <DocExample
        label="Selected line with inline actions"
        code={`<OrderTicket
  title="Table 5"
  subtitle="3 covers · JR"
  lines={lines}
  selectedId={selectedId}
  onSelect={setSelectedId}
  totals={{ subtotal: 90, tax: 8.1, total: 98.1 }}
/>`}
      >
        <div style={{ maxWidth: 360, height: 460 }}>
          <OrderTicket
            title="Table 5"
            subtitle="3 covers · JR"
            lines={ORDER}
            selectedId={selectedId}
            onSelect={setSelectedId}
            totals={{ subtotal: 90, tax: 8.1, total: 98.1 }}
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function ModifierSheetSection() {
  return (
    <DocSection
      title="ModifierSheet"
      description="Modifier picker — required radio groups, optional radio groups, capped multi-select groups, surcharge per option, and a free-form notes textarea. Price re-totals at the top as selections change."
      propsTable={[
        { name: "itemName", type: "string", required: true },
        { name: "basePrice", type: "number", required: true },
        { name: "groups", type: "ModifierGroup[]", required: true, description: "{ id, label, kind: 'single' | 'multi', required?, max?, options }" },
        { name: "value / defaultValue", type: "ModifierSelection" },
        { name: "onChange", type: "(value: ModifierSelection) => void" },
        { name: "notes / defaultNotes", type: "string" },
        { name: "onNotesChange", type: "(notes: string) => void" },
        { name: "footer", type: "ReactNode", description: "Submit / cancel buttons row." },
      ]}
    >
      <DocExample
        label="Burger modifiers"
        code={`<ModifierSheet itemName="Wagyu burger" basePrice={22} groups={groups} />`}
      >
        <div style={{ maxWidth: 520 }}>
          <ModifierSheet
            itemName="Wagyu burger"
            basePrice={22}
            groups={BURGER_MODS}
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function NumberPadSection() {
  return (
    <DocSection
      title="NumberPad"
      description="Calculator-style keypad. Bottom-right submit key spans full height for a clear, ergonomic tender flow."
      propsTable={[
        { name: "value / defaultValue", type: "string" },
        { name: "onChange", type: "(next: string) => void" },
        { name: "onSubmit", type: "(value: string) => void" },
        { name: "decimal", type: "boolean", default: "true" },
        { name: "backspace", type: "boolean", default: "true" },
        { name: "clear", type: "boolean", default: "true" },
        { name: "submitLabel", type: "ReactNode", default: "\"Enter\"" },
        { name: "submitDisabled", type: "boolean" },
        { name: "prefix / suffix", type: "ReactNode" },
        { name: "hideDisplay", type: "boolean" },
        { name: "size", type: "\"md\" | \"lg\"", default: "\"md\"" },
      ]}
    >
      <DocExample
        label="Currency entry"
        code={`<NumberPad defaultValue="42" prefix="$" submitLabel="Tender" />`}
      >
        <div style={{ maxWidth: 280 }}>
          <NumberPad defaultValue="42" prefix="$" submitLabel="Tender" />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function CoverCounterSection() {
  return (
    <DocSection
      title="CoverCounter"
      description="Party-size picker — big − / value / + stepper plus a row of preset chips. Designed for the seating screen."
      propsTable={[
        { name: "value / defaultValue", type: "number", default: "1" },
        { name: "min", type: "number", default: "1" },
        { name: "max", type: "number", default: "99" },
        { name: "presets", type: "number[]", default: "[1, 2, 4, 6, 8]" },
        { name: "label", type: "string", default: "\"Covers\"" },
        { name: "onChange", type: "(covers: number) => void" },
      ]}
    >
      <DocExample
        label="Default"
        code={`<CoverCounter defaultValue={2} />`}
      >
        <div style={{ maxWidth: 280 }}>
          <CoverCounter defaultValue={2} />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function TenderPanelSection() {
  return (
    <DocSection
      title="TenderPanel"
      description="Payment surface — method tabs (cash / card / split), quick-cash presets, change calculator, and a 64px primary action. Cash mode embeds the NumberPad."
      propsTable={[
        { name: "amountDue", type: "number", required: true },
        { name: "currency", type: "string", default: "\"USD\"" },
        { name: "method / defaultMethod", type: "TenderMethod", default: "\"card\"" },
        { name: "onMethodChange", type: "(m: TenderMethod) => void" },
        { name: "methods", type: "TenderMethod[]", default: "[\"cash\", \"card\", \"split\"]" },
        { name: "quickCash", type: "boolean", default: "true" },
        { name: "onTender", type: "(amount: number, method: TenderMethod) => void" },
        { name: "submitLabel", type: "string", default: "\"Charge\"" },
      ]}
    >
      <DocExample
        label="Card flow"
        code={`<TenderPanel amountDue={98.10} />`}
      >
        <div style={{ maxWidth: 420 }}>
          <TenderPanel amountDue={98.1} />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function TableMapSection() {
  const [selectedId, setSelectedId] = useState("t2");
  return (
    <DocSection
      title="TableMap"
      description="Floor plan grid. Each table has a status (open / seated / ordered / served / check / dirty / reserved), capacity vs cover count, ticket-time chip, server initials, and supports w/h spans + square/round shapes."
      propsTable={[
        { name: "tables", type: "PosTable[]", required: true },
        { name: "columns", type: "number", default: "8" },
        { name: "rows", type: "number", default: "6" },
        { name: "cellSize", type: "number", default: "88", description: "Cell size in pixels." },
        { name: "selectedId", type: "string" },
        { name: "onSelect", type: "(table: PosTable) => void" },
        { name: "showLegend", type: "boolean", default: "true" },
      ]}
    >
      <DocExample
        label="Compact floor"
        code={`<TableMap tables={TABLES} columns={6} rows={2} cellSize={84} />`}
      >
        <TableMap
          tables={TABLES}
          columns={6}
          rows={2}
          cellSize={84}
          selectedId={selectedId}
          onSelect={(t) => setSelectedId(t.id)}
        />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function ReceiptPreviewSection() {
  return (
    <DocSection
      title="ReceiptPreview"
      description="Thermal-roll-styled customer or kitchen receipt. Composes meta, items (with indented modifiers), totals, and a footer. The paper has an off-white tint, monospace type, perforated tear edge."
      propsTable={[
        { name: "header / subheader", type: "ReactNode" },
        { name: "meta", type: "{ label, value }[]" },
        { name: "lines", type: "ReceiptLine[]", required: true },
        { name: "totals", type: "ReceiptLine[]" },
        { name: "footer", type: "ReactNode" },
        { name: "currency", type: "string", default: "\"USD\"" },
        { name: "width", type: "number", default: "260", description: "Mimics 80mm thermal paper." },
        { name: "tear", type: "boolean", default: "true" },
      ]}
    >
      <DocExample
        label="Customer receipt"
        code={`<ReceiptPreview
  header="Drape & Knot"
  subheader="124 Park Ave · (212) 555-0148"
  meta={[{ label: "Order", value: "#1042" }, { label: "Server", value: "JR" }]}
  lines={[
    { quantity: 1, name: "Caesar salad", amount: 14 },
    { indent: 1, name: "No anchovy" },
    { quantity: 1, name: "Ribeye", amount: 48 },
  ]}
  totals={[
    { name: "Subtotal", amount: 62 },
    { name: "Tax", amount: 5.58 },
    { name: "Total", amount: 67.58, emphasis: true },
  ]}
  footer="Thanks for dining with us!"
/>`}
      >
        <ReceiptPreview
          header="Drape & Knot"
          subheader="124 Park Ave · (212) 555-0148"
          meta={[
            { label: "Order", value: "#1042" },
            { label: "Server", value: "JR" },
            { label: "Table", value: "5" },
          ]}
          lines={[
            { quantity: 1, name: "Caesar salad", amount: 14 },
            { indent: 1, name: "No anchovy" },
            { indent: 1, name: "Add chicken", amount: 6 },
            { quantity: 1, name: "Ribeye", amount: 48 },
            { indent: 1, name: "Med rare" },
            { quantity: 2, name: "Pinot Noir", amount: 28 },
          ]}
          totals={[
            { name: "Subtotal", amount: 96 },
            { name: "Tax", amount: 8.64 },
            { name: "Total", amount: 104.64, emphasis: true },
          ]}
          footer="Thanks for dining with us!"
        />
      </DocExample>
    </DocSection>
  );
}
