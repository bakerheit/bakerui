# Changelog

All notable changes to the **bakerui** npm package are documented in this
file. Demo-site and CI changes are intentionally excluded — this list
reflects what library consumers will see when they upgrade. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `Combobox.Trigger` and `MultiCombobox.Trigger`: new `leadingIcon`,
  `trailingIcon`, `leadingAddon`, and `trailingAddon` props — full parity with
  `Input`'s addon API. The trigger is now a wrapper element holding the border
  and focus ring, with addons as siblings of the inner click target.
- `Popover.Title` and `Popover.Description` subcomponents — registering either
  auto-wires `aria-labelledby` / `aria-describedby` on the popover dialog
  (mirrors the `Dialog.Title` / `Dialog.Description` pattern).
- Quietly laid groundwork for a companion package arriving in a future
  release. The public `bakerui` surface is unchanged; certain tokens and
  CSS-variable names were shaped with it in mind. You'll know it when you
  see it.
- A handful of new entries flagged off behind the scenes on the deployed
  demo. They're not gone — just not yet for public consumption.

### Fixed
- `usePosition` (Combobox, MultiCombobox, Popover, DropdownMenu, Tooltip,
  Select, DatePicker, TimePicker): scrolling inside an open overlay's own
  content no longer triggers repositioning. The capture-phase scroll listener
  now filters out scrolls that originate inside the floating content, fixing
  a visible horizontal drift on end-aligned placements.
- `Sidebar`: the root `<aside>` now exposes `id="bui-sidebar"` so that
  `Sidebar.Trigger`'s `aria-controls="bui-sidebar"` resolves to an actual
  element for assistive tech.
- `Combobox.Trigger` and `MultiCombobox.Trigger`: now declare
  `aria-autocomplete="list"`, completing the WAI-ARIA 1.2 contract for
  `role="combobox"`.
- `glassx` theme: Combobox popup no longer flashes its tinted background
  before the blur on open. Skipping the parent's `opacity: 0 → 1` transition
  keeps `backdrop-filter` active from the first frame (Chrome/Safari disable
  the filter on descendants whenever an ancestor has `opacity < 1`).
- `glassx` theme: Combobox trigger label, search input, and list items now
  all render in white with a dark text-shadow halo in light mode, so text
  stays legible against the translucent surface. Hovered and selected items
  keep the same halo as their neighbors (previously the halo dropped on
  hover, washing out the row).
- `glassx` theme: Combobox item labels no longer clip the text-shadow halo
  at their left edge when a leading element (the check column) sits beside
  them. Inline padding gives the halo room inside the label's overflow
  clip; matching negative margin preserves the visible layout.

## [0.5.0] - 2026-05-11

### Added
- `Tree` component — hierarchical disclosure list with single / multi-select,
  tri-state checkbox cascade, and full ARIA keyboard navigation.
- `NumberInput` component — composes `Input` and injects a stepper column with
  press-and-hold repeat, clamp-on-commit, and precision inferred from `step`.
- `OTPInput` component — multi-cell verification code input with strict
  left-to-right fill, paste support, mask, and `one-time-code` autofill.
- `MultiCombobox` component — multi-select sibling of `Combobox` with chip
  trigger and tri-state list.
- `TagInput` component — comma-separated chip input with paste-merge and
  duplicate handling.
- Theme presets: `lcars`, `wabi-sabi`, `glass26`, `ransom-note`.
- `Dialog.Content.alert` — opt into the `alertdialog` role with all
  dismiss-paths (Escape, backdrop click, close-X) disabled so the user
  must pick a footer action. Use for destructive confirmations.

### Changed
- `TagInput` chips now render as `Badge` so theme presets that restyle badges
  (e.g. zine, 94-doors) automatically restyle tags.

### Fixed
- `ThemeProvider`: passing `preset={undefined}` (or `theme={undefined}`) to a
  controlled provider now actually clears the value. The previous
  `controlled ?? internal` fallback grabbed the stale internal state, so
  resets from a parent never propagated.
- `Drawer`: the panel now sizes against `100dvh` (dynamic viewport height)
  instead of `100vh`, so iOS Safari's URL bar no longer pushes the footer
  off-screen and the action buttons stay reachable on mobile.
- `Toast` / `Toaster`: on screens ≤640px the toaster now ignores the chosen
  left/right anchor and centers horizontally (keeping the chosen top/bottom
  edge). Matches Sonner/Radix mobile behavior. Padding also respects
  `env(safe-area-inset-*)` so iOS notches and home indicators don't clip
  the corners.

## [0.4.0] - 2026-05-10

### Added
- `zine` theme — photocopied punk / DIY paste-up aesthetic with stamped badges
  and tilted floating panels.

## [0.3.2] - 2026-05-10

### Added
- `newsprint` theme — broadsheet editorial aesthetic.
- `toy-plastic` theme — Fisher-Price / LeapFrog molded plastic aesthetic.
- `94-doors`, `colored-eink`, `memphis`, `cassette-futurism`, `neon-sprawl`
  theme presets.
- `TimePicker` component.

### Changed
- `94-doors` dark mode reworked as an imagined Win95 dark theme.
- `colored-ebook` renamed to `colored-eink` and redesigned for a color e-ink
  panel aesthetic.

### Fixed
- `glassx` popover legibility improvements.

## [0.3.1] - 2026-05-10

### Fixed
- Mobile scroll and iOS chrome handling across theme presets.
- `glassx` styles refined for improved mobile display.

## [0.3.0] - 2026-05-10

### Added
- Theme presets: `frutiger-aero`, `glassx`, `soft`, `terminal`.

## [0.2.0] - 2026-05-09

### Added
- `DatePicker` and `Drawer` components.

## [0.1.0] - 2026-05-09

### Added
- Initial release with `Button`, `Input`, `Card`, `Stack`, `Sidebar`, `Topbar`,
  `Text`, `Badge`, `Toggle`, `Checkbox`, `Radio`, `Select`, `Combobox`,
  `DataTable`, `Tabs`, `Accordion`, `Breadcrumb`, `Alert`, `Toast`, `Dialog`,
  `Tooltip`, `Popover`, `DropdownMenu`, `Pagination`, `Slider`, `Stepper`,
  `Spinner`, `Skeleton`, `ProgressBar`, `Divider`, `Avatar`.
- Token-based theming with `light` / `dark` modes and the `brutalist` preset.
