import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Drawer,
  HStack,
  Heading,
  Stack,
  Text,
} from "bakerui";
import {
  CheckoutStepper,
  CouponInput,
  MiniCart,
  OrderSummary,
  PriceTag,
  ProductCard,
  QuantityStepper,
  RatingStars,
  VariantPicker,
  type CartLine,
  type VariantOptionGroup,
} from "bakeruipro";
import { PageLayout } from "../PageLayout";
import "bakeruipro/commerce.css";

type CheckoutStepId = "cart" | "shipping" | "payment" | "review";

interface CatalogItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  compareAt?: number;
  badge?: string;
  badgeTone?: "neutral" | "accent" | "success" | "warning" | "danger";
  rating: number;
  ratingCount: number;
}

const CATALOG: CatalogItem[] = [
  {
    id: "p1",
    title: "Linen overshirt",
    brand: "Drape & Knot",
    price: 128,
    compareAt: 160,
    badge: "Sale",
    badgeTone: "danger",
    rating: 4.5,
    ratingCount: 248,
  },
  {
    id: "p2",
    title: "Cropped trench",
    brand: "Drape & Knot",
    price: 245,
    rating: 4.8,
    ratingCount: 92,
  },
  {
    id: "p3",
    title: "Wide-leg trouser",
    brand: "Drape & Knot",
    price: 96,
    badge: "New",
    badgeTone: "accent",
    rating: 4.2,
    ratingCount: 134,
  },
  {
    id: "p4",
    title: "Cotton roll-neck",
    brand: "Atelier Hum",
    price: 78,
    rating: 4.4,
    ratingCount: 311,
  },
  {
    id: "p5",
    title: "Heavy crew sweat",
    brand: "Atelier Hum",
    price: 110,
    compareAt: 130,
    badge: "Sale",
    badgeTone: "danger",
    rating: 4.6,
    ratingCount: 412,
  },
  {
    id: "p6",
    title: "Soft trainer",
    brand: "Field Studio",
    price: 165,
    rating: 4.3,
    ratingCount: 88,
  },
];

const VARIANT_OPTIONS: VariantOptionGroup[] = [
  {
    id: "color",
    label: "Color",
    kind: "color",
    values: [
      { id: "midnight", label: "Midnight", color: "#0f172a" },
      { id: "cream", label: "Cream", color: "#f5e9d3" },
      { id: "rust", label: "Rust", color: "#a85d3a" },
      { id: "sage", label: "Sage", color: "#9caf88" },
    ],
  },
  {
    id: "size",
    label: "Size",
    kind: "size",
    values: [
      { id: "xs", label: "XS" },
      { id: "s", label: "S" },
      { id: "m", label: "M" },
      { id: "l", label: "L" },
      { id: "xl", label: "XL", disabled: true },
    ],
  },
];

interface CartState {
  lines: CartLine[];
  coupon: { code: string; discount: number } | null;
}

const STEPS: { id: CheckoutStepId; label: string; hint?: string }[] = [
  { id: "cart", label: "Cart" },
  { id: "shipping", label: "Shipping", hint: "Free over $150" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export function CommercePackStorefrontPage() {
  const [cart, setCart] = useState<CartState>({
    lines: [
      {
        id: "p1-default",
        title: "Linen overshirt",
        variant: "Cream · M",
        unitPrice: 128,
        quantity: 1,
      },
    ],
    coupon: null,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState<CheckoutStepId>("cart");
  const [completed, setCompleted] = useState<CheckoutStepId[]>([]);
  const [selected, setSelected] = useState<CatalogItem>(CATALOG[0]);
  const [variant, setVariant] = useState<Record<string, string>>({
    color: "midnight",
    size: "m",
  });
  const [pdpQty, setPdpQty] = useState(1);

  const subtotal = useMemo(
    () => cart.lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0),
    [cart.lines],
  );
  const shipping = subtotal >= 150 || cart.lines.length === 0 ? 0 : 9;
  const tax = Math.round(subtotal * 0.09 * 100) / 100;
  const discount = cart.coupon?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping + tax - discount);
  const cartCount = cart.lines.reduce((acc, l) => acc + l.quantity, 0);

  const addToCart = (item: CatalogItem) => {
    const colorLabel = VARIANT_OPTIONS[0].values.find((v) => v.id === variant.color)
      ?.label ?? "";
    const sizeLabel = VARIANT_OPTIONS[1].values.find((v) => v.id === variant.size)
      ?.label ?? "";
    const variantKey = `${item.id}-${variant.color}-${variant.size}`;
    setCart((prev) => {
      const existing = prev.lines.find((l) => l.id === variantKey);
      if (existing) {
        return {
          ...prev,
          lines: prev.lines.map((l) =>
            l.id === variantKey ? { ...l, quantity: l.quantity + pdpQty } : l,
          ),
        };
      }
      return {
        ...prev,
        lines: [
          ...prev.lines,
          {
            id: variantKey,
            title: item.title,
            variant: `${colorLabel} · ${sizeLabel}`,
            unitPrice: item.price,
            quantity: pdpQty,
          },
        ],
      };
    });
    setDrawerOpen(true);
  };

  const updateQty = (lineId: string, q: number) =>
    setCart((prev) => ({
      ...prev,
      lines: prev.lines.map((l) =>
        l.id === lineId ? { ...l, quantity: q } : l,
      ),
    }));

  const removeLine = (lineId: string) =>
    setCart((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => l.id !== lineId),
    }));

  const applyCoupon = async (code: string) => {
    const upper = code.toUpperCase();
    if (upper === "BAKER10") {
      setCart((prev) => ({
        ...prev,
        coupon: { code: upper, discount: Math.round(subtotal * 0.1 * 100) / 100 },
      }));
      return { ok: true as const, code: upper };
    }
    return { ok: false as const, error: "Code not recognized. Try BAKER10." };
  };

  const removeCoupon = () =>
    setCart((prev) => ({ ...prev, coupon: null }));

  const advance = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx >= 0 && idx < STEPS.length - 1) {
      setCompleted((prev) =>
        prev.includes(step) ? prev : [...prev, step],
      );
      setStep(STEPS[idx + 1].id);
    }
  };

  const summaryLines = [
    { label: "Subtotal", amount: subtotal },
    {
      label: "Shipping",
      hint: shipping === 0 ? "Free" : "Standard · 3-5 days",
      amount: shipping,
      variant: "muted" as const,
    },
    { label: "Tax", amount: tax, variant: "muted" as const },
    ...(cart.coupon
      ? [
          {
            label: cart.coupon.code,
            amount: cart.coupon.discount,
            variant: "discount" as const,
          },
        ]
      : []),
    { label: "Total", amount: total, variant: "total" as const },
  ];

  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="3">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Tiny Storefront</Heading>
            <Badge tone="accent">Commerce Pack demo</Badge>
          </HStack>
          <Text tone="muted">
            A fully wired product page + drawer-based checkout. Pick a variant,
            add to cart, then drive the four-step checkout. Try coupon{" "}
            <code>BAKER10</code> for 10% off.
          </Text>
        </Stack>

        {/* Product detail */}
        <Card padded>
          <div className="commerce-pdp">
            <div className="commerce-pdp__gallery">
              <div className="commerce-pdp__hero" aria-hidden />
              <div className="commerce-pdp__thumbs">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="commerce-pdp__thumb" aria-hidden />
                ))}
              </div>
            </div>
            <Stack gap="4" className="commerce-pdp__details">
              <Stack gap="1">
                <Text size="xs" tone="muted">
                  {selected.brand}
                </Text>
                <Heading level={2} size="lg">
                  {selected.title}
                </Heading>
                <RatingStars
                  value={selected.rating}
                  precision={0.5}
                  readOnly
                  showValue
                  count={selected.ratingCount}
                />
              </Stack>
              <PriceTag
                value={selected.price}
                compareAt={selected.compareAt}
                size="lg"
              />
              <VariantPicker
                options={VARIANT_OPTIONS}
                value={variant}
                onChange={setVariant}
              />
              <HStack gap="3" align="center" wrap>
                <QuantityStepper
                  value={pdpQty}
                  onChange={setPdpQty}
                  min={1}
                  max={6}
                />
                <Button size="lg" onClick={() => addToCart(selected)}>
                  Add to cart
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setDrawerOpen(true)}
                >
                  Cart ({cartCount})
                </Button>
              </HStack>
            </Stack>
          </div>
        </Card>

        {/* Catalog grid */}
        <Stack gap="3">
          <Heading level={2} size="md">
            More like this
          </Heading>
          <div className="commerce-catalog">
            {CATALOG.map((item) => (
              <ProductCard
                key={item.id}
                title={item.title}
                subtitle={item.brand}
                price={item.price}
                compareAt={item.compareAt}
                badge={item.badge}
                badgeTone={item.badgeTone}
                rating={item.rating}
                ratingCount={item.ratingCount}
                onClick={() => {
                  setSelected(item);
                  setPdpQty(1);
                }}
              />
            ))}
          </div>
        </Stack>
      </Stack>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content side="right" size="lg">
          <Drawer.Header>
            <Drawer.Title>Checkout</Drawer.Title>
            <Drawer.Description>
              {cartCount} item{cartCount === 1 ? "" : "s"} · pack demo
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body>
            <Stack gap="5">
              <CheckoutStepper
                steps={STEPS}
                current={step}
                completed={completed}
                onStepClick={(id) => setStep(id as CheckoutStepId)}
              />

              {step === "cart" && (
                <MiniCart
                  lines={cart.lines}
                  subtotal={subtotal}
                  onQuantityChange={updateQty}
                  onRemove={removeLine}
                />
              )}

              {step === "shipping" && (
                <Stack gap="3">
                  <Heading level={3} size="sm">
                    Where should we send it?
                  </Heading>
                  <Text tone="muted" size="sm">
                    Address inputs would go here. For the demo, pretend the
                    shipping form is valid.
                  </Text>
                  <div className="commerce-faux-form" aria-hidden>
                    <div />
                    <div />
                    <div />
                    <div />
                  </div>
                </Stack>
              )}

              {step === "payment" && (
                <Stack gap="3">
                  <Heading level={3} size="sm">
                    Payment
                  </Heading>
                  <Text tone="muted" size="sm">
                    Payment method picker would go here.
                  </Text>
                  <CouponInput
                    appliedCode={cart.coupon?.code}
                    onApply={applyCoupon}
                    onRemove={removeCoupon}
                  />
                </Stack>
              )}

              {step === "review" && (
                <Stack gap="3">
                  <Heading level={3} size="sm">
                    Review your order
                  </Heading>
                  <MiniCart lines={cart.lines} subtotal={subtotal} editable={false} />
                </Stack>
              )}

              <OrderSummary
                lines={summaryLines}
                footer={
                  step === "review" ? (
                    <Button size="lg" onClick={() => setDrawerOpen(false)}>
                      Place order
                    </Button>
                  ) : (
                    <Button size="lg" onClick={advance}>
                      Continue
                    </Button>
                  )
                }
              />
            </Stack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </PageLayout>
  );
}
