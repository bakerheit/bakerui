import { useMemo, useState } from "react";
import { Badge, Dialog } from "bakerui";
import {
  CategoryRail,
  MenuItemCard,
  ModifierSheet,
  OrderTicket,
  TableMap,
  TenderPanel,
  type ModifierGroup,
  type ModifierSelection,
  type OrderLine,
  type PosCategory,
  type PosTable,
} from "bakeruipro";
import "bakeruipro/pos.css";

type View = "menu" | "tables";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  color?: string;
  hasModifiers?: boolean;
  modifiers?: ModifierGroup[];
}

const CATEGORIES: PosCategory[] = [
  { id: "starters", label: "Starters", count: 4, color: "#f59e0b" },
  { id: "mains", label: "Mains", count: 6, color: "#a855f7" },
  { id: "sides", label: "Sides", count: 4, color: "var(--bui-color-success)" },
  { id: "drinks", label: "Drinks", count: 6, color: "var(--bui-color-accent)" },
  { id: "desserts", label: "Desserts", count: 3, color: "#ef4444" },
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
      { id: "medwell", label: "Med well" },
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

const SALAD_MODS: ModifierGroup[] = [
  {
    id: "protein",
    label: "Add protein",
    kind: "single",
    options: [
      { id: "none", label: "None" },
      { id: "chicken", label: "Chicken", priceDelta: 6 },
      { id: "shrimp", label: "Shrimp", priceDelta: 8 },
      { id: "tofu", label: "Tofu", priceDelta: 4 },
    ],
  },
  {
    id: "dietary",
    label: "Dietary",
    kind: "multi",
    options: [
      { id: "noanchovy", label: "No anchovy" },
      { id: "nodairy", label: "No dairy" },
      { id: "noegg", label: "No egg" },
    ],
  },
];

const MENU: MenuItem[] = [
  // Starters
  { id: "s1", name: "Bone marrow", price: 18, category: "starters", color: "#a85d3a", hasModifiers: false },
  { id: "s2", name: "Caesar salad", price: 14, category: "starters", color: "#10b981", hasModifiers: true, modifiers: SALAD_MODS },
  { id: "s3", name: "Tuna crudo", price: 19, category: "starters", color: "#3b82f6", hasModifiers: false },
  { id: "s4", name: "Charcuterie", price: 24, category: "starters", color: "#f59e0b", hasModifiers: false },
  // Mains
  { id: "m1", name: "Wagyu burger", price: 22, category: "mains", color: "#a855f7", hasModifiers: true, modifiers: BURGER_MODS },
  { id: "m2", name: "Ribeye 12oz", price: 48, category: "mains", color: "#ef4444", hasModifiers: true, modifiers: BURGER_MODS },
  { id: "m3", name: "Truffle pasta", price: 26, category: "mains", color: "#f59e0b", hasModifiers: false },
  { id: "m4", name: "Roasted salmon", price: 32, category: "mains", color: "#3b82f6", hasModifiers: false },
  { id: "m5", name: "Mushroom risotto", price: 24, category: "mains", color: "#84cc16", hasModifiers: false },
  { id: "m6", name: "Half chicken", price: 28, category: "mains", color: "#d97706", hasModifiers: false },
  // Sides
  { id: "si1", name: "Fries", price: 8, category: "sides", color: "#fbbf24" },
  { id: "si2", name: "Brussels", price: 10, category: "sides", color: "#10b981" },
  { id: "si3", name: "Mash", price: 9, category: "sides", color: "#a85d3a" },
  { id: "si4", name: "Greens", price: 9, category: "sides", color: "#22c55e" },
  // Drinks
  { id: "d1", name: "Pinot Noir", price: 14, category: "drinks", color: "#7f1d1d" },
  { id: "d2", name: "Sauvignon Blanc", price: 13, category: "drinks", color: "#d4d4aa" },
  { id: "d3", name: "Old Fashioned", price: 16, category: "drinks", color: "#a85d3a" },
  { id: "d4", name: "Negroni", price: 16, category: "drinks", color: "#dc2626" },
  { id: "d5", name: "Pilsner", price: 8, category: "drinks", color: "#fbbf24" },
  { id: "d6", name: "Espresso", price: 4, category: "drinks", color: "#451a03" },
  // Desserts
  { id: "ds1", name: "Crème brûlée", price: 12, category: "desserts", color: "#fde68a" },
  { id: "ds2", name: "Chocolate cake", price: 11, category: "desserts", color: "#451a03" },
  { id: "ds3", name: "Sorbet", price: 9, category: "desserts", color: "#fb7185" },
];

const TABLES: PosTable[] = [
  { id: "t1", label: "1", capacity: 2, covers: 2, status: "seated", ticketMinutes: 12, server: "JR", x: 1, y: 1 },
  { id: "t2", label: "2", capacity: 4, covers: 4, status: "ordered", ticketMinutes: 24, server: "JR", x: 2, y: 1 },
  { id: "t3", label: "3", capacity: 4, status: "open", x: 3, y: 1 },
  { id: "t4", label: "4", capacity: 6, covers: 6, status: "served", ticketMinutes: 38, server: "MK", x: 4, y: 1, w: 2 },
  { id: "t5", label: "5", capacity: 4, covers: 3, status: "check", ticketMinutes: 52, server: "MK", x: 6, y: 1 },
  { id: "t6", label: "6", capacity: 2, status: "dirty", x: 1, y: 2 },
  { id: "t7", label: "7", capacity: 2, status: "reserved", x: 2, y: 2 },
  { id: "t8", label: "8", capacity: 4, covers: 4, status: "seated", ticketMinutes: 6, server: "TL", x: 3, y: 2 },
  { id: "t9", label: "9", capacity: 4, status: "open", x: 4, y: 2 },
  { id: "t10", label: "10", capacity: 6, covers: 5, status: "ordered", ticketMinutes: 18, server: "TL", x: 5, y: 2, w: 2 },
  { id: "b1", label: "B1", capacity: 1, status: "seated", covers: 1, server: "JR", x: 1, y: 3, shape: "round" },
  { id: "b2", label: "B2", capacity: 1, status: "open", x: 2, y: 3, shape: "round" },
  { id: "b3", label: "B3", capacity: 1, status: "open", x: 3, y: 3, shape: "round" },
  { id: "p1", label: "P1", capacity: 4, status: "reserved", x: 5, y: 3, shape: "round", w: 2 },
];

export function PosPackTerminalPage() {
  const [view, setView] = useState<View>("menu");
  const [category, setCategory] = useState<string>("mains");
  const [order, setOrder] = useState<OrderLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>();
  const [modItem, setModItem] = useState<MenuItem | null>(null);
  const [modSelection, setModSelection] = useState<ModifierSelection>({});
  const [modNotes, setModNotes] = useState("");
  const [tenderOpen, setTenderOpen] = useState(false);
  const [activeTable, setActiveTable] = useState<string>("t5");

  const visibleItems = useMemo(
    () => MENU.filter((m) => m.category === category),
    [category],
  );

  const subtotal = order.reduce(
    (acc, l) => (l.status === "voided" ? acc : acc + l.unitPrice * l.quantity),
    0,
  );
  const tax = Math.round(subtotal * 0.09 * 100) / 100;
  const total = subtotal + tax;

  const addItem = (item: MenuItem) => {
    if (item.hasModifiers && item.modifiers) {
      setModItem(item);
      setModSelection({});
      setModNotes("");
      return;
    }
    setOrder((prev) => [
      ...prev,
      {
        id: `${item.id}-${Date.now()}`,
        name: item.name,
        quantity: 1,
        unitPrice: item.price,
        status: "new",
      },
    ]);
  };

  const confirmMods = () => {
    if (!modItem) return;
    const summarize = (sel: ModifierSelection): string[] => {
      const out: string[] = [];
      for (const g of modItem.modifiers ?? []) {
        const v = sel[g.id];
        const ids = Array.isArray(v) ? v : v ? [v] : [];
        for (const id of ids) {
          const opt = g.options.find((o) => o.id === id);
          if (!opt || opt.id === "none") continue;
          out.push(
            opt.priceDelta
              ? `${opt.label} (+$${opt.priceDelta})`
              : opt.label,
          );
        }
      }
      return out;
    };
    const delta = (modItem.modifiers ?? []).reduce((acc, g) => {
      const v = modSelection[g.id];
      const ids = Array.isArray(v) ? v : v ? [v] : [];
      return (
        acc +
        g.options
          .filter((o) => ids.includes(o.id))
          .reduce((s, o) => s + (o.priceDelta ?? 0), 0)
      );
    }, 0);
    setOrder((prev) => [
      ...prev,
      {
        id: `${modItem.id}-${Date.now()}`,
        name: modItem.name,
        quantity: 1,
        unitPrice: modItem.price + delta,
        modifiers: summarize(modSelection),
        note: modNotes || undefined,
        status: "new",
      },
    ]);
    setModItem(null);
  };

  const inc = (id: string) =>
    setOrder((prev) =>
      prev.map((l) => (l.id === id ? { ...l, quantity: l.quantity + 1 } : l)),
    );
  const dec = (id: string) =>
    setOrder((prev) =>
      prev.flatMap((l) =>
        l.id === id
          ? l.quantity > 1
            ? [{ ...l, quantity: l.quantity - 1 }]
            : []
          : [l],
      ),
    );
  const voidLine = (id: string) =>
    setOrder((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "voided" } : l)),
    );

  const sendToKitchen = () =>
    setOrder((prev) =>
      prev.map((l) => (l.status === "new" ? { ...l, status: "fired" } : l)),
    );

  return (
    <div className="pos-terminal">
      <header className="pos-terminal__bar">
        <div className="pos-terminal__brand">
          <span className="pos-terminal__brand-name">Drape & Knot</span>
          <Badge tone="accent">Terminal</Badge>
        </div>
        <div className="pos-terminal__viewswitch" role="tablist">
          <button
            type="button"
            className="pos-terminal__viewbtn"
            role="tab"
            aria-selected={view === "menu"}
            data-active={view === "menu" || undefined}
            onClick={() => setView("menu")}
          >
            Menu
          </button>
          <button
            type="button"
            className="pos-terminal__viewbtn"
            role="tab"
            aria-selected={view === "tables"}
            data-active={view === "tables" || undefined}
            onClick={() => setView("tables")}
          >
            Tables
          </button>
        </div>
        <div className="pos-terminal__server">
          <span>JR · Table {TABLES.find((t) => t.id === activeTable)?.label}</span>
        </div>
      </header>

      <div className="pos-terminal__body">
        {view === "menu" && (
          <>
            <aside className="pos-terminal__rail">
              <CategoryRail
                categories={CATEGORIES}
                current={category}
                onChange={setCategory}
              />
            </aside>
            <main className="pos-terminal__grid">
              {visibleItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  name={item.name}
                  price={item.price}
                  color={item.color}
                  hasModifiers={item.hasModifiers}
                  size="md"
                  onPress={() => addItem(item)}
                />
              ))}
            </main>
          </>
        )}
        {view === "tables" && (
          <main className="pos-terminal__floor">
            <TableMap
              tables={TABLES}
              columns={7}
              rows={3}
              cellSize={96}
              selectedId={activeTable}
              onSelect={(t) => setActiveTable(t.id)}
            />
          </main>
        )}

        <aside className="pos-terminal__ticket">
          <OrderTicket
            title={`Table ${TABLES.find((t) => t.id === activeTable)?.label ?? "—"}`}
            subtitle="3 covers · JR"
            lines={order}
            selectedId={selectedLineId}
            onSelect={setSelectedLineId}
            onIncrement={inc}
            onDecrement={dec}
            onVoid={voidLine}
            totals={{ subtotal, tax, total }}
            footer={
              <div className="pos-terminal__ticket-actions">
                <button
                  type="button"
                  className="pos-terminal__btn pos-terminal__btn--secondary"
                  onClick={sendToKitchen}
                  disabled={order.every((l) => l.status !== "new")}
                >
                  Send
                </button>
                <button
                  type="button"
                  className="pos-terminal__btn pos-terminal__btn--primary"
                  onClick={() => setTenderOpen(true)}
                  disabled={total <= 0}
                >
                  Pay
                </button>
              </div>
            }
          />
        </aside>
      </div>

      {/* Modifier dialog */}
      <Dialog open={!!modItem} onOpenChange={(o) => !o && setModItem(null)}>
        <Dialog.Content size="lg">
          {modItem && (
            <>
              <Dialog.Title>{modItem.name}</Dialog.Title>
              <Dialog.Description>Configure modifiers</Dialog.Description>
              <div className="pos-terminal__modwrap">
                <ModifierSheet
                  itemName={modItem.name}
                  basePrice={modItem.price}
                  groups={modItem.modifiers ?? []}
                  value={modSelection}
                  onChange={setModSelection}
                  notes={modNotes}
                  onNotesChange={setModNotes}
                  footer={
                    <>
                      <button
                        type="button"
                        className="pos-terminal__btn pos-terminal__btn--secondary"
                        style={{ flex: 1 }}
                        onClick={() => setModItem(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="pos-terminal__btn pos-terminal__btn--primary"
                        style={{ flex: 1 }}
                        onClick={confirmMods}
                      >
                        Add to order
                      </button>
                    </>
                  }
                />
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog>

      {/* Tender dialog */}
      <Dialog open={tenderOpen} onOpenChange={setTenderOpen}>
        <Dialog.Content size="lg">
          <Dialog.Title>Payment</Dialog.Title>
          <Dialog.Description>Choose tender and finalize</Dialog.Description>
          <div className="pos-terminal__tenderwrap">
            <TenderPanel
              amountDue={total}
              onTender={() => {
                setOrder([]);
                setTenderOpen(false);
              }}
            />
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
