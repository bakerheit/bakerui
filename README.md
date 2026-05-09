# bakerui

A small, longevity-focused React component library themed entirely with CSS custom properties. No runtime CSS-in-JS, no theme objects, no framework lock-in.

## Repo layout

```
bakerui/
├── packages/
│   └── bakerui/      # the library (publishable)
└── apps/
    └── demo/         # demo site + theming playground
```

## Quickstart

```bash
npm install
npm run demo        # starts the demo at http://localhost:5173
npm run build       # builds the library to packages/bakerui/dist
```

The demo aliases `bakerui` to the package source, so edits to components hot-reload immediately.

## Using the library

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
- **No `forwardRef` gotchas.** Every component forwards refs and passes through `className` / `style`, so you can compose without escape hatches.
- **Minimal dependencies.** Only `react` and `react-dom` as peers.

## Components

`Button`, `Input`, `Textarea`, `Field`, `Switch`, `Badge`, `Card` (+ `CardHeader`, `CardBody`, `CardFooter`), `Stack` / `HStack` / `VStack`, `Text`, `Heading`, `ThemeProvider`.

## License

MIT
