## ADDED Requirements

### Requirement: Flex-first layouts
Screen and major section layouts SHALL use flexbox (`flex`, `flexDirection`, `justifyContent`, `alignItems`, `flexGrow`/`flexShrink`) so content fills available space without hardcoded total widths except for deliberate max-width constraints on tablets.

#### Scenario: Narrow phone viewport
- **WHEN** the app runs on a small-width viewport
- **THEN** primary content SHALL reflow without horizontal clipping; scrollable regions SHALL use `ScrollView`/`FlatList` as appropriate, not fixed-height containers that cut off content.

#### Scenario: Large phone or tablet viewport
- **WHEN** the window width exceeds a documented breakpoint for “wide” layout
- **THEN** multi-column or widened gutters SHALL activate via shared responsive helpers or styles, not per-screen magic width numbers.

### Requirement: Breakpoints and responsive helpers
The codebase SHALL define window-size breakpoints or scaling rules in one module (e.g. `useResponsive`, `useWindowDimensions` wrapper) and screens that need different composition at different sizes SHALL use that module.

#### Scenario: Wide layout toggles secondary column
- **WHEN** a screen shows a primary list and optional secondary detail on wide layouts
- **THEN** the split SHALL be driven by the shared responsive helper and flex percentages, not duplicated screen files per platform size.

### Requirement: Safe areas and notches
Screens SHALL respect safe area insets for top/bottom/horizontal padding on devices with notches and home indicators, using `SafeAreaView` or equivalent patterns consistent with the navigation shell.

#### Scenario: Screen renders on device with bottom inset
- **WHEN** a full-screen screen is shown on a device with a home indicator
- **THEN** interactive elements anchored to the bottom SHALL remain above the inset and tappable.

### Requirement: Avoid brittle fixed dimensions
Fixed `width` and `height` SHALL be avoided for responsive containers; where fixed dimensions are required (thumbnails, icons, minimum touch targets), they SHALL be defined once in tokens or shared style objects.

#### Scenario: List row height
- **WHEN** a list row has a fixed minimum height for touch targets
- **THEN** that minimum SHALL come from a shared constant or primitive style, not a literal repeated in every screen.
