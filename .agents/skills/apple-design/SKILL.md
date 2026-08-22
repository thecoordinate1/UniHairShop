---
name: apple-design
description: >-
  Provides guidelines, visual standards, and UI/UX design patterns inspired by Apple Human Interface Guidelines (HIG), SF design system, translucent glassmorphism, refined typography, continuous curves, dynamic spring animations, and premium micro-interactions. Use whenever building or updating user interfaces to look sleek, high-end, clean, and Apple-inspired.
---

# Apple Design System & HIG Guidelines

Use this skill when designing, building, or refactoring web interfaces to follow Apple's Human Interface Guidelines (HIG) aesthetics. Apple design emphasizes **Clarity**, **Deference**, **Depth**, **Translucency**, and **Tactile Responsiveness**.

---

## 1. Core Visual Principles

### Translucency & Glassmorphism
- **Backdrop Blurs**: Use vibrant, translucent dark or light surfaces with `backdrop-filter: blur(20px) saturate(180%)`.
- **Layered Elevation**: Stack cards, modals, and headers over blurred content to establish clear spatial depth.
- **Hairline Borders**: Subtly define edges using high-precision 1px borders with translucency (e.g. `border-white/10` or `rgba(255, 255, 255, 0.12)`). Never use heavy solid borders.

### Color & Contrast
- **Base Canvas**: Dark Mode: Deep Midnight / Space Black (`#0A0A0C`, `#121217`, `#000000`). Light Mode: Clean Pure White / Warm Off-White (`#FAFAFC`, `#F2F2F7`).
- **Accent System**:
  - **System Blue**: `#007AFF` (Primary CTAs, active links, focused states)
  - **Warm Amber/Gold**: `#F5A623` / `#FFB800` (Badges, ratings, highlighted features)
  - **System Emerald**: `#34C759` (Success indicators, status badges)
  - **System Pink/Rose**: `#FF2D55` (Accents, notifications, sale tags)
- **Contrast Hierarchy**: Use primary text (`#FFFFFF` or `#1C1C1E`), secondary text (`rgba(255,255,255,0.6)` or `#8E8E93`), and tertiary text (`rgba(255,255,255,0.4)` or `#C7C7CC`).

### Typography & Layout
- **Font Stack**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif`.
- **Text Scaling & Weights**:
  - Headings: Display bold/medium with negative letter-spacing (`tracking-tight` or `-0.02em`).
  - Body: Regular (`400`) or Medium (`500`) with high legibility line-height (`1.5`).
  - Micro-labels: Uppercase tracking (`tracking-wider`, `text-[10px]` or `text-xs`).

### Continuous Rounded Corners
- Use squircle-inspired continuous corner radii:
  - Small badges/inputs: `rounded-xl` (`12px` to `16px`)
  - Cards & Panels: `rounded-3xl` (`24px` to `28px`)
  - Modals & Sheets: `rounded-[32px]` or `rounded-[40px]`
  - Floating Nav & Pills: `rounded-full`

### Fluid Spring Micro-Interactions
- Use Apple-like spring timing functions for transitions:
  - Transition curve: `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out`.
  - Scale feedback: Buttons and cards scale down smoothly on active press (`active:scale-[0.98]` or `active:scale-95`).
  - Subtle lift on hover: Cards translate upward 2px–4px with ambient glow shadows.

---

## 2. Reusable UI Component Patterns

### Floating Glass Header
```html
<header class="sticky top-4 z-50 mx-auto max-w-[1200px] px-4">
  <div class="bg-black/60 backdrop-blur-2xl border border-white/15 rounded-full px-5 py-3 flex items-center justify-between shadow-2xl shadow-black/50">
    <!-- Brand & Nav items -->
  </div>
</header>
```

### Floating iOS Bottom Dock Navigation
```html
<nav class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/75 backdrop-blur-2xl border border-white/15 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl shadow-black/60">
  <button class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/15 text-white shadow-inner transition-all">
    <span>Home</span>
  </button>
</nav>
```

### Apple Glass Card
```html
<div class="bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60">
  <div class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Category</div>
  <h3 class="text-xl font-bold text-white tracking-tight mb-2">Card Title</h3>
  <p class="text-sm text-white/70">Card description body text with refined spacing.</p>
</div>
```

### Primary & Secondary Apple Buttons
```html
<!-- Primary Apple Button -->
<button class="bg-[#007AFF] hover:bg-[#0066CC] active:scale-[0.97] text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/25 transition-all duration-200 border-0 flex items-center justify-center gap-2">
  <span>Get Started</span>
</button>

<!-- Glass Secondary Button -->
<button class="bg-white/10 hover:bg-white/15 active:scale-[0.97] text-white font-medium text-sm px-5 py-2.5 rounded-full border border-white/10 transition-all duration-200 flex items-center justify-center gap-2">
  <span>Learn More</span>
</button>
```

### iOS Sheet Modal
```html
<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
  <div class="bg-[#121217] border border-white/15 rounded-t-[36px] sm:rounded-[36px] max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-8">
    <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden"></div>
    <!-- Modal content -->
  </div>
</div>
```

---

## 3. Checklist for Apple HIG Compliance
- [ ] Are translucent backgrounds paired with `backdrop-filter: blur(...)`?
- [ ] Are structural elements defined with thin 1px borders (`border-white/10`) instead of heavy lines?
- [ ] Is typography hierarchy clear with appropriate tracking (`tracking-tight` on headings)?
- [ ] Do buttons and interactive elements feature active press scaling (`active:scale-[0.98]`)?
- [ ] Are card corners continuously rounded (`rounded-3xl` or higher)?
- [ ] Is white space clean and breathing space generous around containers?
