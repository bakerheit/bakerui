# Changelog

All notable changes to the **bakerui** npm package are documented in this
file. Demo-site and CI changes are intentionally excluded — this list
reflects what library consumers will see when they upgrade. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
