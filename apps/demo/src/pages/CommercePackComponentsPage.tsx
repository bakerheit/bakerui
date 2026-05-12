import { useState } from "react";
import { Badge, HStack, Heading, Stack, Text } from "bakerui";
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
import { DocExample, DocSection } from "../Doc";
import "bakeruipro/commerce.css";

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

const CART_LINES: CartLine[] = [
  {
    id: "1",
    title: "Linen overshirt",
    variant: "Cream · M",
    unitPrice: 128,
    quantity: 1,
  },
  {
    id: "2",
    title: "Wide-leg trouser",
    variant: "Midnight · 32",
    unitPrice: 96,
    quantity: 2,
  },
];

export function CommercePackComponentsPage() {
  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="3">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Commerce Pack — Components</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted">
            Reference for every component in the Commerce Pack. Each section
            lists props, defaults, and a live example.
          </Text>
        </Stack>

        <PriceTagSection />
        <RatingStarsSection />
        <QuantityStepperSection />
        <VariantPickerSection />
        <ProductCardSection />
        <MiniCartSection />
        <CheckoutStepperSection />
        <CouponInputSection />
        <OrderSummarySection />
      </Stack>
    </PageLayout>
  );
}

/* ========================================================================== */
function PriceTagSection() {
  return (
    <DocSection
      title="PriceTag"
      description="Formatted price with optional strike-through compare-at and a percent-off chip."
      propsTable={[
        { name: "value", type: "number", required: true, description: "Current price." },
        { name: "compareAt", type: "number", description: "Original price for the strike-through." },
        { name: "currency", type: "string", default: "\"USD\"", description: "ISO 4217 currency code." },
        { name: "locale", type: "string", description: "Intl locale (defaults to browser)." },
        { name: "size", type: "\"sm\" | \"md\" | \"lg\"", default: "\"md\"" },
        { name: "showDiscount", type: "boolean", default: "true", description: "Show the % off chip when on sale." },
      ]}
    >
      <DocExample
        label="On sale"
        code={`<PriceTag value={96} compareAt={128} size="lg" />`}
      >
        <Stack gap="2">
          <PriceTag value={42} size="md" />
          <PriceTag value={96} compareAt={128} size="md" />
          <PriceTag value={1299} compareAt={1499} size="lg" currency="EUR" />
        </Stack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function RatingStarsSection() {
  return (
    <DocSection
      title="RatingStars"
      description="Star rating display + slider. Supports half-stars and keyboard control (arrows, Home/End)."
      propsTable={[
        { name: "value / defaultValue", type: "number" },
        { name: "max", type: "number", default: "5" },
        { name: "precision", type: "0.5 | 1", default: "1" },
        { name: "size", type: "number", default: "16", description: "Star size in pixels." },
        { name: "readOnly", type: "boolean", default: "false" },
        { name: "showValue", type: "boolean", default: "false" },
        { name: "count", type: "number", description: "Review count rendered after the value." },
        { name: "onChange", type: "(value: number) => void" },
      ]}
    >
      <DocExample
        label="Read-only with count"
        code={`<RatingStars value={4.5} precision={0.5} readOnly showValue count={248} />`}
      >
        <RatingStars value={4.5} precision={0.5} readOnly showValue count={248} />
      </DocExample>
      <DocExample
        label="Interactive (half-star)"
        code={`<RatingStars defaultValue={3} precision={0.5} />`}
      >
        <RatingStars defaultValue={3} precision={0.5} size={22} />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function QuantityStepperSection() {
  return (
    <DocSection
      title="QuantityStepper"
      description="Decrement / number / increment trio with min, max, and step. Disables buttons at the bounds."
      propsTable={[
        { name: "value / defaultValue", type: "number", default: "1" },
        { name: "min", type: "number", default: "1" },
        { name: "max", type: "number", default: "99" },
        { name: "step", type: "number", default: "1" },
        { name: "size", type: "\"sm\" | \"md\" | \"lg\"", default: "\"md\"" },
        { name: "onChange", type: "(value: number) => void" },
      ]}
    >
      <DocExample
        label="Sizes"
        code={`<QuantityStepper size="sm" />
<QuantityStepper />
<QuantityStepper size="lg" max={10} />`}
      >
        <HStack gap="3" align="center" wrap>
          <QuantityStepper size="sm" defaultValue={1} />
          <QuantityStepper defaultValue={3} />
          <QuantityStepper size="lg" defaultValue={5} max={10} />
        </HStack>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function VariantPickerSection() {
  const [value, setValue] = useState<Record<string, string>>({
    color: "midnight",
    size: "m",
  });
  return (
    <DocSection
      title="VariantPicker"
      description="Grouped option selector. Each group renders as color swatches, size buttons, or generic text buttons. Out-of-stock values render disabled with a strike-through."
      propsTable={[
        { name: "options", type: "VariantOptionGroup[]", required: true },
        { name: "value", type: "Record<string, string>" },
        { name: "defaultValue", type: "Record<string, string>" },
        { name: "onChange", type: "(value: Record<string, string>) => void" },
      ]}
    >
      <DocExample
        label="Color + size"
        code={`<VariantPicker options={options} value={value} onChange={setValue} />`}
      >
        <VariantPicker
          options={VARIANT_OPTIONS}
          value={value}
          onChange={setValue}
        />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function ProductCardSection() {
  return (
    <DocSection
      title="ProductCard"
      description="Standard storefront card — image area + body. Composes PriceTag and RatingStars. Hovering reveals the action slot in the top-right."
      propsTable={[
        { name: "title", type: "string", required: true },
        { name: "subtitle", type: "string", description: "Brand / category line above the title." },
        { name: "image", type: "string", description: "Image URL. Falls back to a gradient placeholder." },
        { name: "aspectRatio", type: "number", default: "1" },
        { name: "price", type: "number", required: true },
        { name: "compareAt", type: "number" },
        { name: "currency", type: "string", default: "\"USD\"" },
        { name: "badge", type: "ReactNode" },
        { name: "badgeTone", type: "\"neutral\" | \"accent\" | \"success\" | \"warning\" | \"danger\"" },
        { name: "rating", type: "number" },
        { name: "ratingCount", type: "number" },
        { name: "action", type: "ReactNode", description: "Top-right slot — wishlist heart, quick-add, etc." },
        { name: "onClick", type: "() => void" },
      ]}
    >
      <DocExample
        label="Sale + rating"
        code={`<ProductCard
  title="Linen overshirt"
  subtitle="Drape & Knot"
  price={128}
  compareAt={160}
  badge="Sale"
  badgeTone="danger"
  rating={4.5}
  ratingCount={248}
/>`}
      >
        <div style={{ maxWidth: 260 }}>
          <ProductCard
            title="Linen overshirt"
            subtitle="Drape & Knot"
            price={128}
            compareAt={160}
            badge="Sale"
            badgeTone="danger"
            rating={4.5}
            ratingCount={248}
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function MiniCartSection() {
  const [lines, setLines] = useState<CartLine[]>(CART_LINES);
  return (
    <DocSection
      title="MiniCart"
      description="Scrollable line-item list with quantity controls + subtotal. Pass a footer slot for the primary CTA."
      propsTable={[
        { name: "lines", type: "CartLine[]", required: true },
        { name: "currency", type: "string", default: "\"USD\"" },
        { name: "editable", type: "boolean", default: "true" },
        { name: "onQuantityChange", type: "(lineId: string, quantity: number) => void" },
        { name: "onRemove", type: "(lineId: string) => void" },
        { name: "subtotal", type: "number", description: "Override the computed subtotal." },
        { name: "subtotalLabel", type: "string", default: "\"Subtotal\"" },
        { name: "footer", type: "ReactNode" },
        { name: "maxHeight", type: "number", default: "360", description: "Scroll region max height in px." },
      ]}
    >
      <DocExample
        label="Editable"
        code={`<MiniCart
  lines={lines}
  onQuantityChange={updateQty}
  onRemove={remove}
/>`}
      >
        <div style={{ maxWidth: 380 }}>
          <MiniCart
            lines={lines}
            onQuantityChange={(id, q) =>
              setLines((prev) =>
                prev.map((l) => (l.id === id ? { ...l, quantity: q } : l)),
              )
            }
            onRemove={(id) =>
              setLines((prev) => prev.filter((l) => l.id !== id))
            }
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function CheckoutStepperSection() {
  return (
    <DocSection
      title="CheckoutStepper"
      description="Horizontal or vertical step indicator with current / complete / upcoming states. Completed steps are reactivatable when an onStepClick handler is provided."
      propsTable={[
        { name: "steps", type: "CheckoutStep[]", required: true, description: "{ id, label, hint? }" },
        { name: "current", type: "string", required: true },
        { name: "completed", type: "string[]", description: "Defaults to every step before `current`." },
        { name: "onStepClick", type: "(id: string) => void" },
        { name: "orientation", type: "\"horizontal\" | \"vertical\"", default: "\"horizontal\"" },
      ]}
    >
      <DocExample
        label="Four-step horizontal"
        code={`<CheckoutStepper
  current="payment"
  steps={[
    { id: "cart", label: "Cart" },
    { id: "shipping", label: "Shipping", hint: "Free over $50" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
  ]}
/>`}
      >
        <CheckoutStepper
          current="payment"
          steps={[
            { id: "cart", label: "Cart" },
            { id: "shipping", label: "Shipping", hint: "Free over $50" },
            { id: "payment", label: "Payment" },
            { id: "review", label: "Review" },
          ]}
        />
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function CouponInputSection() {
  return (
    <DocSection
      title="CouponInput"
      description="Promo code field. Submitting calls onApply, which returns a discriminated union — success applies the code and shows the applied chip; error surfaces the message under the input."
      propsTable={[
        { name: "appliedCode / defaultAppliedCode", type: "string" },
        {
          name: "onApply",
          type: "(code: string) => Promise<{ ok: true, code } | { ok: false, error }>",
          required: true,
        },
        { name: "onRemove", type: "() => void" },
        { name: "placeholder", type: "string", default: "\"Promo code\"" },
        { name: "applyLabel", type: "string", default: "\"Apply\"" },
        { name: "removeLabel", type: "string", default: "\"Remove\"" },
      ]}
    >
      <DocExample
        label="Try BAKER10"
        code={`<CouponInput
  onApply={async (code) =>
    code.toUpperCase() === "BAKER10"
      ? { ok: true, code: code.toUpperCase() }
      : { ok: false, error: "Code not recognized." }
  }
/>`}
      >
        <div style={{ maxWidth: 360 }}>
          <CouponInput
            onApply={async (code) =>
              code.toUpperCase() === "BAKER10"
                ? { ok: true, code: code.toUpperCase() }
                : { ok: false, error: "Code not recognized." }
            }
          />
        </div>
      </DocExample>
    </DocSection>
  );
}

/* ========================================================================== */
function OrderSummarySection() {
  return (
    <DocSection
      title="OrderSummary"
      description="Subtotal / shipping / tax / discount / total breakdown. Lines support default, muted, discount (auto-negated, green), and total (emphasized, bordered top) variants."
      propsTable={[
        { name: "lines", type: "OrderSummaryLine[]", required: true },
        { name: "currency", type: "string", default: "\"USD\"" },
        { name: "title", type: "ReactNode", default: "\"Order summary\"" },
        { name: "footer", type: "ReactNode", description: "Trailing slot — e.g. a checkout button." },
        { name: "sticky", type: "boolean", default: "false" },
      ]}
    >
      <DocExample
        label="With discount + total"
        code={`<OrderSummary
  lines={[
    { label: "Subtotal", amount: 320 },
    { label: "Shipping", hint: "Standard · 3-5 days", amount: 0, variant: "muted" },
    { label: "Tax", amount: 28.8, variant: "muted" },
    { label: "BAKER10", amount: 32, variant: "discount" },
    { label: "Total", amount: 316.8, variant: "total" },
  ]}
/>`}
      >
        <div style={{ maxWidth: 380 }}>
          <OrderSummary
            lines={[
              { label: "Subtotal", amount: 320 },
              { label: "Shipping", hint: "Standard · 3-5 days", amount: 0, variant: "muted" },
              { label: "Tax", amount: 28.8, variant: "muted" },
              { label: "BAKER10", amount: 32, variant: "discount" },
              { label: "Total", amount: 316.8, variant: "total" },
            ]}
          />
        </div>
      </DocExample>
    </DocSection>
  );
}
