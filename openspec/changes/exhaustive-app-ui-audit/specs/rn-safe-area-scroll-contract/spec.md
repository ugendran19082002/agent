## ADDED Requirements

### Requirement: Safe area respect
Screens that render under the status bar, notch, or home indicator SHALL use `SafeAreaView`, safe-area context insets, or the app’s approved shell components so tap targets and text do not collide with system UI.

#### Scenario: Screen with bottom primary action
- **WHEN** a button or bar is pinned to the bottom on a device with a home indicator
- **THEN** padding or position SHALL include the bottom inset so the control is fully visible and tappable.

### Requirement: Scroll and list containment
Content taller than the viewport SHALL be placed in `ScrollView`, `FlatList`, `FlashList`, or an equivalent pattern; non-scroll fixed roots SHALL not clip required fields.

#### Scenario: Settings form exceeds viewport
- **WHEN** the user opens a long settings screen
- **THEN** the user SHALL be able to scroll to the last field and submit without hiding inputs behind the keyboard when the OS raises it.

### Requirement: Header overlap avoidance
Sticky headers, banners (e.g. offline), and floating actions SHALL account for top safe area or documented offset tokens so they do not sit under the status bar or conflict with navigation headers.

#### Scenario: Offline or maintenance banner visible
- **WHEN** an offline banner is shown at the top of the stack
- **THEN** it SHALL be positioned using safe-area-aware layout so it does not clip under the notch.
