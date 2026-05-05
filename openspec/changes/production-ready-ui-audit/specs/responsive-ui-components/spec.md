## ADDED Requirements

### Requirement: Responsive Scale Hook
The app SHALL provide a `useResponsive` hook at `hooks/use-responsive.ts` that derives a device size class and scaling multipliers from `Dimensions`.

#### Scenario: Small phone viewport
- **WHEN** `useResponsive()` is called on a device with screen width < 380px
- **THEN** it returns `{ size: 'sm', scale: 0.9, isTablet: false }` and font/spacing multipliers are reduced accordingly

#### Scenario: Standard phone viewport
- **WHEN** `useResponsive()` is called on a device with screen width 380–600px
- **THEN** it returns `{ size: 'md', scale: 1.0, isTablet: false }` (baseline)

#### Scenario: Tablet viewport
- **WHEN** `useResponsive()` is called on a device with screen width > 600px
- **THEN** it returns `{ size: 'lg', scale: 1.15, isTablet: true }` and layouts expand to use wider content columns

#### Scenario: Orientation change
- **WHEN** the device orientation changes
- **THEN** `useResponsive()` re-evaluates `Dimensions` and returns updated values, causing dependent components to re-render with the correct layout

### Requirement: Minimum Touch Target Size
Every interactive element (Button, TouchableOpacity, Pressable) in `components/ui/` SHALL have a minimum touch area of 44×44dp.

#### Scenario: Button press area
- **WHEN** a `Button` component is rendered with `size="sm"`
- **THEN** its touchable area is at least 44dp tall regardless of content height

#### Scenario: Icon-only button
- **WHEN** a back button, close icon, or action icon is rendered
- **THEN** it has `hitSlop` set to expand the touch area to at least 44×44dp if the visual size is smaller

### Requirement: Audited Reusable Component Library
Every component in `components/ui/` SHALL meet the following standards:
- Uses theme tokens exclusively (no hardcoded colors or sizes)
- Renders correctly in both light and dark mode
- Accepts and applies optional `style` override props
- Handles disabled, loading, and error states where applicable

#### Scenario: Button in dark mode
- **WHEN** a `Button` with `variant="primary"` is rendered in dark mode
- **THEN** the background color comes from the dark palette token and text remains legible (contrast ≥ 4.5:1)

#### Scenario: Card component elevation
- **WHEN** a `Card` component is rendered
- **THEN** it uses `Shadow.sm` (or theme shadow token) instead of a hardcoded `elevation` number

#### Scenario: EmptyState component
- **WHEN** an `EmptyState` component is rendered
- **THEN** it displays an icon, a title, a subtitle, and an optional action button, all using theme tokens

#### Scenario: Skeleton loader
- **WHEN** a `Skeleton` component is rendered
- **THEN** it animates between `Colors.light.border` and `Colors.light.inputBg` (or dark equivalents) and adapts to the given width/height props

### Requirement: ScreenContainer Responsive Padding
The `ScreenContainer` component SHALL apply responsive horizontal padding based on device size class from `useResponsive`.

#### Scenario: Small device padding
- **WHEN** `ScreenContainer` renders on a small phone
- **THEN** horizontal padding is `Spacing.md` (16dp)

#### Scenario: Tablet padding
- **WHEN** `ScreenContainer` renders on a tablet
- **THEN** horizontal padding increases to `Spacing.xl` (24dp) or content is center-constrained to a max width of 600dp

### Requirement: No Hardcoded Pixel Widths for Full-Width Elements
Screen layouts SHALL NOT use `width: 375` or similar device-specific pixel values. Full-width elements SHALL use `width: '100%'` or Flexbox `flex: 1`.

#### Scenario: Full-width input
- **WHEN** a text input or button is intended to span the screen width
- **THEN** it uses `flex: 1` or `width: '100%'` rather than a hardcoded numeric width

#### Scenario: Multi-column grid on tablet
- **WHEN** a list or card grid is rendered on a tablet
- **THEN** the layout switches from single-column to two-column using Flexbox `flexWrap` and percentage-based widths
