## 1. Project Analysis & Feature Map

- [x] 1.1 Enumerate all confirmed backend services (controllers, services, models) to produce the definitive feature list by role
- [x] 1.2 Enumerate all confirmed frontend screens (app/ directory) per role to validate feature list
- [x] 1.3 Confirm tech stack from backend/package.json and frontend/package.json
- [x] 1.4 Check website/assets/ and website/images/ for any existing screenshots or brand assets to use

## 2. File Setup

- [x] 2.1 Create `website/style.css` with CSS custom properties (color palette, gradients, typography, spacing tokens)
- [x] 2.2 Create `website/script.js` with Intersection Observer animation setup, counter animations, mobile nav toggle, and smooth scroll
- [x] 2.3 Replace `website/index.html` with full semantic HTML structure linking to style.css and script.js

## 3. Design System (style.css)

- [x] 3.1 Define CSS variables: brand colors (primary gradient, accent, neutrals), font families (heading/body), spacing scale, border-radius tokens, shadow tokens
- [x] 3.2 Implement glassmorphism card component (backdrop-filter + semi-transparent background + border + shadow)
- [x] 3.3 Implement gradient hero background with animated gradient shift
- [x] 3.4 Implement responsive grid system (single col mobile, 2-col tablet, 3-col desktop)
- [x] 3.5 Style CTA buttons with hover glow and press states
- [x] 3.6 Style navigation bar with scroll-shrink behavior
- [x] 3.7 Implement mobile hamburger menu overlay

## 4. Hero Section

- [x] 4.1 Write headline and tagline copy based on confirmed platform capabilities
- [x] 4.2 Implement hero layout: headline + tagline + two CTA buttons + app mockup visual (gradient card or screenshot if available)
- [x] 4.3 Add animated floating element or gradient orb background effects

## 5. About & Problems We Solve Sections

- [x] 5.1 Write About ThanniGo copy: problem solved, who benefits, local commerce + delivery positioning
- [x] 5.2 Create Problems We Solve cards (6 cards) based on real gaps addressed by implemented modules: local delivery friction, shop digitalization, manual order management, delivery tracking gaps, communication gaps, cash-heavy operations

## 6. Role-Based Features Section

- [x] 6.1 Build tab/accordion UI for four roles: Customer, Shop Owner, Delivery Partner, Admin
- [x] 6.2 Populate Customer features from confirmed screens and services: OTP & biometric login, shop browsing & search, order scheduling, real-time order tracking, order history, ratings & reviews, loyalty rewards, referral program, push notifications, coupon redemption, can balance management
- [x] 6.3 Populate Shop Owner features: shop onboarding & verification, product & catalog management, inventory management, order management, customer management, delivery fleet management, promotions & coupons, analytics dashboard, staff management, payout settings, schedule & holiday management
- [x] 6.4 Populate Delivery Partner features: task & delivery management, turn-by-turn navigation, earnings tracking, delivery history, complaint submission
- [x] 6.5 Populate Admin features: user management, vendor/shop management, order oversight, coupon management, payout management, refund processing, support ticket management, error log monitoring, platform settings, growth analytics

## 7. How It Works Section

- [x] 7.1 Implement 4-step visual flow: Place Order → Shop Confirms → Delivery Assigned → Order Delivered
- [x] 7.2 Add connecting line or arrow visual between steps
- [x] 7.3 Add icon or illustration per step

## 8. Tech Stack Section

- [x] 8.1 Create tech stack grid with confirmed technologies: React Native, Expo, Node.js, Express, MySQL, Sequelize, Redis, Socket.io, Firebase, Razorpay, Mapbox, MSG91, BullMQ, NativeWind
- [x] 8.2 Style each tech item as a pill/badge card with hover effect

## 9. Why ThanniGo & Stats Section

- [x] 9.1 Write "Why ThanniGo" benefits copy: real-time delivery, smart commerce automation, multi-role platform, scalable architecture
- [x] 9.2 Add animated stat counters (e.g., roles supported, features, tech integrations) that trigger on scroll

## 10. Contact & Footer Sections

- [x] 10.1 Create contact section with platform email placeholder and social link placeholders (WhatsApp, Instagram, LinkedIn)
- [x] 10.2 Build professional footer: logo, navigation links, copyright, tagline

## 11. Scroll Animations & Polish

- [x] 11.1 Implement Intersection Observer in script.js — attach `.animate-in` class to all section cards on viewport entry
- [x] 11.2 Add CSS keyframe animations: fade-in, slide-up, scale-in
- [x] 11.3 Implement animated counter function for stat numbers

## 12. Responsiveness & SEO

- [x] 12.1 Test and fix layouts at 320px, 768px, and 1280px breakpoints — ensure no horizontal overflow
- [x] 12.2 Add all SEO meta tags: title, description, keywords, viewport, canonical
- [x] 12.3 Add OpenGraph tags: og:title, og:description, og:type, og:url, og:image placeholder
- [x] 12.4 Add favicon link tag
- [x] 12.5 Validate that no internal route names, socket events, DB schema, or service names appear in HTML source
