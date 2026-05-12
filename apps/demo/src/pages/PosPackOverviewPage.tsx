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
import "bakeruipro/pos.css";

export interface PosPackOverviewPageProps {
  onTerminal: () => void;
  onComponents: () => void;
}

interface ShowcaseItem {
  title: string;
  description: string;
  render: () => JSX.Element;
  fullWidth?: boolean;
}

const CATEGORIES: PosCategory[] = [
  { id: "starters", label: "Starters", count: 6, color: "#f59e0b" },
  { id: "mains", label: "Mains", count: 12, color: "#a855f7" },
  { id: "sides", label: "Sides", count: 5, color: "var(--bui-color-success)" },
  { id: "drinks", label: "Drinks", count: 18, color: "var(--bui-color-accent)" },
  { id: "desserts", label: "Desserts", count: 4, color: "#ef4444" },
];

const SAMPLE_ORDER: OrderLine[] = [
  {
    id: "l1",
    name: "Caesar salad",
    quantity: 1,
    unitPrice: 14,
    modifiers: ["No anchovy", "Add chicken (+$6)"],
    seat: 1,
    status: "fired",
  },
  {
    id: "l2",
    name: "Ribeye",
    quantity: 1,
    unitPrice: 48,
    modifiers: ["Medium rare", "Side: fries"],
    seat: 2,
    status: "new",
    note: "Allergy: gluten",
  },
  {
    id: "l3",
    name: "Pinot Noir",
    quantity: 2,
    unitPrice: 14,
    seat: 1,
    status: "ready",
  },
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
      { id: "swiss", label: "Swiss", priceDelta: 1 },
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
      { id: "egg", label: "Fried egg", priceDelta: 1.5 },
      { id: "avocado", label: "Avocado", priceDelta: 2 },
      { id: "jalapeno", label: "Jalapeño", priceDelta: 0.75 },
    ],
  },
];

const TABLES: PosTable[] = [
  { id: "t1", label: "1", capacity: 2, covers: 2, status: "seated", ticketMinutes: 12, server: "JR", x: 1, y: 1 },
  { id: "t2", label: "2", capacity: 4, covers: 4, status: "ordered", ticketMinutes: 24, server: "JR", x: 2, y: 1 },
  { id: "t3", label: "3", capacity: 4, status: "open", x: 3, y: 1 },
  { id: "t4", label: "4", capacity: 6, covers: 6, status: "served", ticketMinutes: 38, server: "MK", x: 4, y: 1, w: 2 },
  { id: "t5", label: "5", capacity: 4, covers: 3, status: "check", ticketMinutes: 52, server: "MK", x: 1, y: 2 },
  { id: "t6", label: "6", capacity: 2, status: "dirty", x: 2, y: 2 },
  { id: "t7", label: "7", capacity: 2, status: "reserved", x: 3, y: 2 },
  { id: "t8", label: "B1", capacity: 1, status: "open", x: 4, y: 2, shape: "round" },
  { id: "t9", label: "B2", capacity: 1, status: "seated", covers: 1, server: "TL", x: 5, y: 2, shape: "round" },
];

export function PosPackOverviewPage({
  onTerminal,
  onComponents,
}: PosPackOverviewPageProps) {
  const [category, setCategory] = useState<string>("mains");
  const [covers, setCovers] = useState(2);

  const ITEMS: ShowcaseItem[] = [
    {
      title: "Menu item card",
      description: "Big tappable tile with modifier dot + quick-add affordance.",
      render: () => (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, maxWidth: 320 }}>
          <MenuItemCard name="Wagyu burger" price={22} color="#a855f7" hasModifiers />
          <MenuItemCard name="Caesar salad" price={14} color="#10b981" />
          <MenuItemCard name="Pinot Noir" price={14} color="#a85d3a" />
          <MenuItemCard name="Bone marrow" price={18} color="#f59e0b" unavailable />
        </div>
      ),
    },
    {
      title: "Category rail",
      description: "Vertical category list with item counts and accent stripes.",
      render: () => (
        <div style={{ width: 240 }}>
          <CategoryRail
            categories={CATEGORIES}
            current={category}
            onChange={setCategory}
          />
        </div>
      ),
    },
    {
      title: "Order ticket",
      description: "Per-seat lines, modifiers, allergen note, totals row.",
      fullWidth: true,
      render: () => (
        <div style={{ maxWidth: 380 }}>
          <OrderTicket
            title="Table 5"
            subtitle="3 covers · JR"
            lines={SAMPLE_ORDER}
            totals={{
              subtotal: 90,
              tax: 8.1,
              total: 98.1,
            }}
            footer={<Button size="lg">Pay $98.10</Button>}
          />
        </div>
      ),
    },
    {
      title: "Modifier sheet",
      description: "Required + optional + multi-select groups with surcharges.",
      fullWidth: true,
      render: () => (
        <div style={{ maxWidth: 520 }}>
          <ModifierSheet
            itemName="Wagyu burger"
            basePrice={22}
            groups={BURGER_MODS}
          />
        </div>
      ),
    },
    {
      title: "Number pad",
      description: "Calculator keypad with submit column — for tender + lookup.",
      render: () => (
        <div style={{ maxWidth: 260 }}>
          <NumberPad defaultValue="42" prefix="$" submitLabel="Tender" />
        </div>
      ),
    },
    {
      title: "Cover counter",
      description: "Party-size selector with presets.",
      render: () => (
        <div style={{ maxWidth: 280 }}>
          <CoverCounter value={covers} onChange={setCovers} />
        </div>
      ),
    },
    {
      title: "Tender panel",
      description: "Cash / card / split with change calculator + presets.",
      fullWidth: true,
      render: () => (
        <div style={{ maxWidth: 420 }}>
          <TenderPanel amountDue={98.1} />
        </div>
      ),
    },
    {
      title: "Table map",
      description: "Floor plan grid with status colors and ticket times.",
      fullWidth: true,
      render: () => (
        <TableMap tables={TABLES} columns={6} rows={2} cellSize={84} />
      ),
    },
    {
      title: "Receipt preview",
      description: "Thermal-roll customer receipt with totals + footer.",
      fullWidth: true,
      render: () => (
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
      ),
    },
  ];

  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="4">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Restaurant POS Pack</Heading>
            <Badge tone="accent">Early access</Badge>
            <Badge tone="neutral">Touch-first</Badge>
          </HStack>
          <Text tone="muted" size="lg">
            Touch-screen-friendly primitives for restaurant terminals, KDS
            screens, and self-serve kiosks. Big hit targets, no hover-only
            states, clear status colors. Menu tiles, order ticket, modifier
            sheet, number pad, table map, cover counter, tender panel, and a
            thermal-roll receipt preview — themed through the same CSS
            variables as bakerui.
          </Text>
          <HStack gap="3" wrap>
            <Button size="lg" onClick={onTerminal}>
              Try the terminal demo
            </Button>
            <Button size="lg" variant="secondary" onClick={onComponents}>
              Browse all components
            </Button>
          </HStack>
          <Alert tone="info">
            Designed for ≥44px hit targets and high-contrast status colors.
            Use <code>bakeruipro/pos.css</code> alongside your bakerui theme
            of choice.
          </Alert>
        </Stack>

        {/* Featured composition — quick-order strip. */}
        <Card padded>
          <Stack gap="4">
            <Stack gap="1">
              <Heading level={2} size="md">
                Quick order
              </Heading>
              <Text tone="muted" size="sm">
                CategoryRail + MenuItemCard grid + OrderTicket in one strip.
              </Text>
            </Stack>
            <div className="pos-quick-order">
              <div className="pos-quick-order__rail">
                <CategoryRail
                  categories={CATEGORIES}
                  current={category}
                  onChange={setCategory}
                />
              </div>
              <div className="pos-quick-order__grid">
                <MenuItemCard name="Wagyu burger" price={22} color="#a855f7" hasModifiers />
                <MenuItemCard name="Truffle pasta" price={26} color="#f59e0b" hasModifiers />
                <MenuItemCard name="Ribeye 12oz" price={48} color="#ef4444" hasModifiers />
                <MenuItemCard name="Caesar salad" price={14} color="#10b981" />
                <MenuItemCard name="Salmon" price={32} color="#3b82f6" hasModifiers />
                <MenuItemCard name="Bone marrow" price={18} color="#a85d3a" unavailable />
              </div>
              <div className="pos-quick-order__ticket">
                <OrderTicket
                  title="Table 5"
                  subtitle="3 covers · JR"
                  lines={SAMPLE_ORDER}
                  totals={{ subtotal: 90, tax: 8.1, total: 98.1 }}
                />
              </div>
            </div>
          </Stack>
        </Card>

        {/* What's inside */}
        <Stack gap="4">
          <Stack gap="1">
            <Heading level={2} size="md">
              What's inside
            </Heading>
            <Text tone="muted" size="sm">
              Nine components covering the front-of-house terminal vocabulary.
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
