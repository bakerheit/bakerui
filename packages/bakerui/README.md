# bakerui

A small, longevity-focused React component library themed with plain CSS variables. No theme objects, no providers required, no CSS-in-JS runtime.

[![npm version](https://img.shields.io/npm/v/bakerui.svg?color=2563eb&style=flat-square)](https://www.npmjs.com/package/bakerui)
[![bundle size](https://img.shields.io/bundlephobia/minzip/bakerui?style=flat-square&color=22c55e)](https://bundlephobia.com/package/bakerui)
[![types](https://img.shields.io/npm/types/bakerui?style=flat-square&color=3178c6)](https://www.npmjs.com/package/bakerui)
[![license](https://img.shields.io/npm/l/bakerui?style=flat-square&color=d4d4d8)](./LICENSE)
[![React 18+](https://img.shields.io/badge/React-18%2B-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Built with Claude](https://img.shields.io/badge/Built%20with-Claude-D97757?style=flat-square&logo=anthropic&logoColor=white)](https://claude.com)

---

## Why

- **Tokens, not theme objects.** Override `--bui-color-accent` on `:root` (or any element) and every component picks it up.
- **No runtime style engine.** Plain CSS — no Emotion, no styled-components, no Tailwind config. Fewer moving parts to break across React majors.
- **Composable primitives.** Components forward refs, accept `className`, and never trap you in a styling scheme.
- **Light + dark out of the box.** Toggle via `[data-theme]`. Any token can be scoped per element.
- **Zero runtime dependencies.** Just React.

## Install

```bash
npm install bakerui
```

Peer-deps: `react` and `react-dom` (>= 18).

## Usage

```tsx
import { Button, ThemeProvider } from "bakerui";
import "bakerui/styles.css";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Button>Hello world</Button>
    </ThemeProvider>
  );
}
```

That's it. The `styles.css` import wires up the design tokens and component styles.

## Theming

Override any token at any scope — global, per-section, or per-element:

```css
:root {
  --bui-color-accent: #ff5722;
  --bui-radius-md: 12px;
}
```

Or pass tokens into `ThemeProvider`:

```tsx
<ThemeProvider tokens={{ "--bui-color-accent": "#ff5722" }}>
  {/* ... */}
</ThemeProvider>
```

Switch between light and dark by setting `data-theme` on any element:

```tsx
<ThemeProvider defaultTheme="dark">{/* ... */}</ThemeProvider>
```

You can also expose just the design tokens (without the component CSS) via:

```ts
import "bakerui/tokens.css";
```

## Components

### Inputs & forms
`Button` · `Input` · `Textarea` · `Field` · `Checkbox` · `RadioGroup` · `Select` · `Combobox` · `DatePicker` · `Slider` · `Toggle`

### Layout
`Stack` · `HStack` · `VStack` · `Card` · `Divider`

### Navigation
`Tabs` · `Breadcrumb` · `Stepper` · `Sidebar` · `Topbar` · `Pagination`

### Data
`DataTable` · `Avatar` · `AvatarGroup` · `Badge`

### Overlays
`Dialog` · `Drawer` · `Popover` · `Tooltip` · `DropdownMenu`

### Feedback
`Alert` · `Toast` · `Spinner` · `Skeleton` · `ProgressBar`

### Disclosure
`Accordion`

## Tokens

Every visual aspect of every component maps to a CSS custom property prefixed with `--bui-`:

| Group        | Examples                                                    |
| ------------ | ----------------------------------------------------------- |
| Color        | `--bui-color-accent`, `--bui-color-text`, `--bui-color-bg`  |
| Spacing      | `--bui-space-1` through `--bui-space-16`                    |
| Radius       | `--bui-radius-sm`, `--bui-radius-md`, `--bui-radius-lg`     |
| Typography   | `--bui-font-family`, `--bui-font-size-sm`, `--bui-font-weight-medium` |
| Motion       | `--bui-duration-fast`, `--bui-easing-standard`              |
| Layering     | `--bui-z-modal`, `--bui-z-popover`, `--bui-z-tooltip`       |
| Shadows      | `--bui-shadow-sm`, `--bui-shadow-md`, `--bui-shadow-lg`     |

The full list lives in [`src/styles/tokens.css`](./src/styles/tokens.css).

## Browser support

Modern evergreen browsers (last 2 versions of Chrome, Edge, Firefox, Safari). The library uses `color-mix()` and CSS custom properties — anything that supports those works.

## Development

```bash
git clone https://github.com/bakerheit/bakerui.git
cd bakerui
npm install
npm run build       # builds the library
npm run demo        # runs the demo site at localhost:5173
```

## License

[MIT](./LICENSE) © bakerheit
