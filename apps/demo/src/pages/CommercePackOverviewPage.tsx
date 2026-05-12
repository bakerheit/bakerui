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

export interface CommercePackOverviewPageProps {
  onStorefront: () => void;
  onComponents: () => void;
}

interface ShowcaseItem {
  title: string;
  description: string;
  render: () => JSX.Element;
  fullWidth?: boolean;
}

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
    title: "Wide leg trouser",
    variant: "Midnight · 32",
    unitPrice: 96,
    quantity: 2,
  },
];

const ITEMS: ShowcaseItem[] = [
  {
    title: "Product card",
    description: "Image, title, price, optional badge + rating.",
    render: () => (
      <ProductCard
        title="Linen overshirt"
        subtitle="Drape & Knot"
        price={128}
        compareAt={160}
        badge="Sale"
        badgeTone="danger"
        rating={4.5}
        ratingCount={248}
        aspectRatio={1}
      />
    ),
  },
  {
    title: "Price tag",
    description: "Current + strike-through + percent-off chip.",
    render: () => (
      <Stack gap="2">
        <PriceTag value={42} size="md" />
        <PriceTag value={96} compareAt={128} size="md" />
        <PriceTag value={1299} compareAt={1499} size="lg" currency="EUR" />
      </Stack>
    ),
  },
  {
    title: "Rating stars",
    description: "Half-star precision, keyboard-accessible.",
    render: () => (
      <Stack gap="2">
        <RatingStars value={4.5} precision={0.5} readOnly showValue count={248} />
        <RatingStars defaultValue={3} precision={0.5} />
      </Stack>
    ),
  },
  {
    title: "Variant picker",
    description: "Color swatches + size buttons with out-of-stock states.",
    render: () => <VariantPicker options={VARIANT_OPTIONS} />,
    fullWidth: true,
  },
  {
    title: "Quantity stepper",
    description: "− [n] + with min/max clamping.",
    render: () => (
      <HStack gap="3">
        <QuantityStepper size="sm" defaultValue={1} />
        <QuantityStepper defaultValue={3} />
        <QuantityStepper size="lg" defaultValue={5} max={10} />
      </HStack>
    ),
  },
  {
    title: "Coupon input",
    description: "Apply state, error feedback, applied chip.",
    render: () => (
      <CouponInput
        onApply={async (code) =>
          code.toUpperCase() === "BAKER10"
            ? { ok: true, code: code.toUpperCase() }
            : { ok: false, error: "Code not recognized." }
        }
      />
    ),
  },
  {
    title: "Checkout stepper",
    description: "Cart → Shipping → Payment → Review.",
    fullWidth: true,
    render: () => (
      <CheckoutStepper
        current="payment"
        steps={[
          { id: "cart", label: "Cart" },
          { id: "shipping", label: "Shipping", hint: "Free over $50" },
          { id: "payment", label: "Payment" },
          { id: "review", label: "Review" },
        ]}
      />
    ),
  },
  {
    title: "Mini cart",
    description: "Line items with quantity controls + subtotal.",
    fullWidth: true,
    render: () => <MiniCart lines={CART_LINES} editable={false} />,
  },
  {
    title: "Order summary",
    description: "Subtotal, shipping, tax, discount, total.",
    fullWidth: true,
    render: () => (
      <OrderSummary
        lines={[
          { label: "Subtotal", amount: 320 },
          { label: "Shipping", hint: "Standard · 3-5 days", amount: 0, variant: "muted" },
          { label: "Tax", amount: 28.8, variant: "muted" },
          { label: "BAKER10", amount: 32, variant: "discount" },
          { label: "Total", amount: 316.8, variant: "total" },
        ]}
      />
    ),
  },
];

export function CommercePackOverviewPage({
  onStorefront,
  onComponents,
}: CommercePackOverviewPageProps) {
  const [variant, setVariant] = useState<Record<string, string>>({
    color: "midnight",
    size: "m",
  });

  return (
    <PageLayout>
      <Stack gap="10" className="demo-section">
        <Stack gap="4">
          <HStack gap="3" align="center" wrap>
            <Heading level={1}>Commerce Pack</Heading>
            <Badge tone="accent">Early access</Badge>
          </HStack>
          <Text tone="muted" size="lg">
            Storefront primitives for e-commerce sites, product pages, and
            checkout flows. Product cards, price tags, rating stars, variant
            pickers, quantity steppers, mini-carts, checkout steppers, coupon
            inputs, and order summaries — themed through the same CSS
            variables as bakerui.
          </Text>
          <HStack gap="3" wrap>
            <Button size="lg" onClick={onStorefront}>
              Try the storefront demo
            </Button>
            <Button size="lg" variant="secondary" onClick={onComponents}>
              Browse all components
            </Button>
          </HStack>
          <Alert tone="info">
            Free during early access. Components live in{" "}
            <code>bakeruipro/src/commerce/</code>; the pack uses the same
            license gate as the others via <code>setLicense()</code>.
          </Alert>
        </Stack>

        {/* Featured composition — a tight product detail row. */}
        <Card padded>
          <Stack gap="4">
            <Stack gap="1">
              <Heading level={2} size="md">
                Product detail
              </Heading>
              <Text tone="muted" size="sm">
                ProductCard + VariantPicker + QuantityStepper composed as a
                mini buy-box.
              </Text>
            </Stack>
            <div className="commerce-feature-row">
              <div className="commerce-feature-row__image">
                <div className="commerce-feature-row__image-fill" aria-hidden />
              </div>
              <Stack gap="4" className="commerce-feature-row__details">
                <Stack gap="1">
                  <Text size="xs" tone="muted">
                    Drape & Knot
                  </Text>
                  <Heading level={3} size="md">
                    Linen overshirt
                  </Heading>
                  <RatingStars
                    value={4.5}
                    precision={0.5}
                    readOnly
                    showValue
                    count={248}
                  />
                </Stack>
                <PriceTag value={128} compareAt={160} size="lg" />
                <VariantPicker
                  options={VARIANT_OPTIONS}
                  value={variant}
                  onChange={setVariant}
                />
                <HStack gap="3" align="center" wrap>
                  <QuantityStepper defaultValue={1} max={6} />
                  <Button size="lg">Add to cart</Button>
                </HStack>
              </Stack>
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
              Nine components covering the core storefront and checkout
              vocabulary.
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
