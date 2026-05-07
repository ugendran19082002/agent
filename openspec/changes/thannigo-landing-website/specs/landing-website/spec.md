## ADDED Requirements

### Requirement: Website file structure
The website SHALL consist of `website/index.html`, `website/style.css`, and `website/script.js` as separate files, with `website/assets/` and `website/images/` retained for media assets.

#### Scenario: All required files present
- **WHEN** the change is applied
- **THEN** `website/index.html`, `website/style.css`, and `website/script.js` SHALL all exist and be non-empty

### Requirement: Hero section
The landing page SHALL have a hero section with a headline, tagline, and two CTA buttons (e.g., "Get Started" and "Learn More"), displayed over a gradient background with a mobile app mockup visual treatment.

#### Scenario: Hero renders on mobile
- **WHEN** viewport width is below 768px
- **THEN** the hero section SHALL stack vertically with full-width CTA buttons and readable font sizes

### Requirement: Role-based features section
The landing page SHALL display a features section divided into four tabs or groups — Customer, Shop Owner, Delivery Partner, and Admin — each listing only features confirmed in the source code.

#### Scenario: Customer features listed
- **WHEN** user views the Customer features group
- **THEN** the following SHALL appear: OTP & biometric login, shop browsing, order scheduling, real-time order tracking, order history, ratings & reviews, loyalty rewards, referral program, push notifications, coupon redemption, can balance management

#### Scenario: Shop Owner features listed
- **WHEN** user views the Shop Owner features group
- **THEN** the following SHALL appear: shop onboarding & verification, product & catalog management, inventory management, order management, customer management, delivery fleet management, promotions & coupons, analytics dashboard, staff management, payout settings, schedule & holiday management

#### Scenario: Delivery Partner features listed
- **WHEN** user views the Delivery Partner features group
- **THEN** the following SHALL appear: task & delivery management, turn-by-turn navigation, earnings tracking, delivery history, complaint submission

#### Scenario: Admin features listed
- **WHEN** user views the Admin features group
- **THEN** the following SHALL appear: user management, vendor/shop management, order oversight, coupon management, payout management, refund processing, support ticket management, error log monitoring, platform settings, growth analytics

### Requirement: How It Works section
The landing page SHALL include a visual step-by-step flow showing the customer-to-delivery journey in four stages.

#### Scenario: Steps render in sequence
- **WHEN** the How It Works section is visible
- **THEN** four numbered steps SHALL appear in order: Place Order → Shop Confirms → Delivery Assigned → Order Delivered

### Requirement: Tech stack section
The landing page SHALL include a technology section listing the confirmed tech stack derived from `package.json` files.

#### Scenario: Tech stack items shown
- **WHEN** the tech stack section is visible
- **THEN** the following technologies SHALL be listed: React Native, Expo, Node.js, Express, MySQL, Sequelize, Redis, Socket.io, Firebase, Razorpay, Mapbox, MSG91, BullMQ, NativeWind

### Requirement: Scroll animations
The landing page SHALL use the Intersection Observer API to trigger fade-in and slide-up animations on section entry.

#### Scenario: Section animates into view
- **WHEN** a section enters the viewport during scroll
- **THEN** the section SHALL animate from opacity 0 to 1 with a vertical translate, completing within 600ms

### Requirement: Full responsiveness
The landing page SHALL render correctly and readably at 320px, 768px, and 1280px viewport widths without horizontal overflow.

#### Scenario: Mobile layout
- **WHEN** viewport width is 320px–767px
- **THEN** all grid layouts SHALL collapse to a single column, navigation SHALL collapse to a hamburger menu, and no element SHALL overflow horizontally

#### Scenario: Tablet layout
- **WHEN** viewport width is 768px–1279px
- **THEN** grid layouts SHALL use two columns where appropriate

### Requirement: SEO and OpenGraph meta tags
The landing page SHALL include standard SEO meta tags (title, description, keywords, viewport) and OpenGraph tags (og:title, og:description, og:type) in the `<head>`.

#### Scenario: Meta tags present
- **WHEN** the HTML source of index.html is inspected
- **THEN** `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, and `<link rel="canonical">` SHALL all be present

### Requirement: Security — no internal architecture exposure
The landing page content SHALL describe features at the user-benefit level only. Internal route names, socket event names, database schema details, queue configurations, middleware chains, and API sequences SHALL NOT appear anywhere in the HTML.

#### Scenario: No internal implementation detail in page source
- **WHEN** the rendered HTML is inspected
- **THEN** no endpoint paths, socket event names, database table/column names, or internal service class names SHALL appear in any visible text, meta tag, or HTML comment
