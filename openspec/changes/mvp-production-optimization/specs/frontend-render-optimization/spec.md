## ADDED Requirements

### Requirement: FlatList Performance Tuning on High-Traffic Screens
The five highest-frequency list screens SHALL have `getItemLayout` defined on their `FlatList` components where item height is fixed, and SHALL have `React.memo` applied to their list-item sub-components. The affected screens and their fixed item heights are: Customer Home shop list (120 dp card), Order History row (88 dp), Delivery Dashboard pending list (72 dp), Admin Shop List row (64 dp), and Delivery History row (72 dp).

#### Scenario: FlatList renders with getItemLayout
- **WHEN** the Customer Home screen renders a list of nearby shops
- **THEN** the `FlatList` component has a `getItemLayout` prop that returns `{ length: 120, offset: 120 * index, index }` for each item

#### Scenario: List item component is memoized
- **WHEN** the parent screen's state updates for a reason unrelated to the list data (e.g., a search bar input)
- **THEN** already-rendered list-item components do not re-render because they are wrapped in `React.memo`

### Requirement: Image Caching via expo-image
All `<Image>` components from `react-native` that display remote URLs in list views and product cards SHALL be replaced with `<Image>` from `expo-image`, which provides automatic disk and memory caching. The `contentFit` prop SHALL be set appropriately per usage.

#### Scenario: Remote image is displayed in a list
- **WHEN** a list screen renders a product or shop image from a Hetzner CDN URL
- **THEN** the image component is `expo-image`'s `Image` and the OS-level image is cached to disk after the first load

#### Scenario: Image replacement does not break layout
- **WHEN** an `expo-image` `Image` replaces a `react-native` `Image` in a list card
- **THEN** the visible layout, dimensions, and border radius are unchanged

### Requirement: Pagination-Aware List Fetching
All screens that display list data from the newly paginated endpoints SHALL implement `onEndReached` with a load-more pattern instead of fetching all records upfront. The initial fetch SHALL request `page=1&limit=20`. Subsequent pages SHALL append to the existing list in Zustand state.

#### Scenario: End of list triggers next-page fetch
- **WHEN** the user scrolls to within 20% of the bottom of an order history or admin list
- **THEN** the screen calls the API with `page + 1` and appends the new results to the existing list

#### Scenario: All pages loaded
- **WHEN** `data.length >= total` (all records loaded)
- **THEN** no further `onEndReached` API calls are made and a "No more items" indicator is shown if the total is greater than the initial page size
