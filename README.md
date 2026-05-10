# bakerui

A small, longevity-focused React component library themed entirely with CSS custom properties. No runtime CSS-in-JS, no theme objects, no framework lock-in.

[![npm version](https://img.shields.io/npm/v/bakerui.svg?color=2563eb&style=flat-square)](https://www.npmjs.com/package/bakerui)
[![bundle size](https://img.shields.io/bundlephobia/minzip/bakerui?style=flat-square&color=22c55e)](https://bundlephobia.com/package/bakerui)
[![types](https://img.shields.io/npm/types/bakerui?style=flat-square&color=3178c6)](https://www.npmjs.com/package/bakerui)
[![license](https://img.shields.io/npm/l/bakerui?style=flat-square&color=d4d4d8)](./LICENSE)
[![React 18+](https://img.shields.io/badge/React-18%2B-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Built with Claude](https://img.shields.io/badge/Built%20with-Claude-D97757?style=flat-square&logo=anthropic&logoColor=white)](https://claude.com)

**Live demo →** [bakerheit.github.io/bakerui](https://bakerheit.github.io/bakerui/)

---

## Install

```bash
npm install bakerui
```

The package lives on npm at **[npmjs.com/package/bakerui](https://www.npmjs.com/package/bakerui)**. Peer-deps: `react` and `react-dom` (>= 18).

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

`ThemeProvider` is optional — bakerui's CSS imports its tokens onto `:root`. The provider just gives you a clean place to flip themes and inject token overrides.

For the full API reference, theming guide, and component list, see [`packages/bakerui/README.md`](./packages/bakerui/README.md).

## Customization model

All theming is plain CSS variables. There are three places you can override tokens:

**1. Globally — in your own stylesheet**

```css
:root {
  --bui-color-accent: #7c3aed;
  --bui-radius-md: 6px;
  --bui-font-family: "Inter", system-ui, sans-serif;
}

[data-theme="dark"] {
  --bui-color-accent: #a78bfa;
}
```

**2. Per scope — wrap a section**

```tsx
<div style={{ "--bui-color-accent": "tomato" } as React.CSSProperties}>
  <Button>Tomato button</Button>
</div>
```

**3. Via the provider**

```tsx
<ThemeProvider tokens={{ "--bui-color-accent": "tomato" }}>
  <Button>Tomato button</Button>
</ThemeProvider>
```

See the **Theming Playground** and **Design Tokens** pages in the demo for the full token list.

## Why these choices

- **Plain CSS, no runtime style engine.** Emotion and styled-components have churned across React majors. CSS custom properties are stable browser primitives.
- **Tokens are the API.** No `theme={...}` JS object means no migrations when the theme shape changes — just rename a variable.
- **Refs and props pass through.** Every component forwards refs and passes through `className` / `style`, so you can compose without escape hatches.
- **Minimal dependencies.** Only `react` and `react-dom` as peers.

## Components

**Inputs & forms** — `Button`, `Input`, `Textarea`, `Field`, `Checkbox`, `RadioGroup`, `Select`, `Combobox`, `DatePicker`, `Slider`, `Toggle`

**Layout** — `Stack`, `HStack`, `VStack`, `Card`, `Divider`

**Navigation** — `Tabs`, `Breadcrumb`, `Stepper`, `Sidebar`, `Topbar`, `Pagination`

**Data** — `DataTable`, `Avatar`, `AvatarGroup`, `Badge`

**Overlays** — `Dialog`, `Drawer`, `Popover`, `Tooltip`, `DropdownMenu`

**Feedback** — `Alert`, `Toast`, `Spinner`, `Skeleton`, `ProgressBar`

**Disclosure** — `Accordion`

---

## Repo layout

```
bakerui/
├── packages/
│   └── bakerui/      # the library (published to npm)
└── apps/
    └── demo/         # demo site + theming playground
```

## Contributing / running locally

```bash
git clone https://github.com/bakerheit/bakerui.git
cd bakerui
npm install
npm run demo        # starts the demo at http://localhost:5173
npm run build       # builds the library to packages/bakerui/dist
```

The demo aliases `bakerui` to the package source, so edits to components hot-reload immediately.

## License

[MIT](./LICENSE) © bakerheit
