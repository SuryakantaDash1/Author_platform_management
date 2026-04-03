# DESIGN SYSTEM - POVITAL Frontend

Complete design guidelines for consistent UI/UX across the application.

---

## 📐 Color Architecture

### Primary Brand Colors

#### Light Mode
```css
Primary (Blue): #3b82f6
  - Headers/Buttons: #3b82f6
  - Links: #2563eb
  - Hover: #1d4ed8

Secondary (Green): #22c55e
  - Accent elements
  - Success states
  - CTAs
```

#### Dark Mode
```css
Primary: #60a5fa (Lighter blue)
Secondary: #4ade80 (Lighter green)
```

### Status Colors
```css
Success: #059669 (Green)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
Info: #3b82f6 (Blue)
```

### Background Colors

#### Light Mode
```css
Primary Background: #ffffff (white)
Secondary Background: #f9fafb (very light gray)
Tertiary Background: #f3f4f6 (light gray)
Card Background: #ffffff with shadow
```

#### Dark Mode
```css
Primary Background: #0f172a (slate-950)
Secondary Background: #1e293b (slate-800)
Tertiary Background: #334155 (slate-700)
Card Background: #1e293b with shadow
```

### Text Colors

#### Light Mode
```css
Heading (H1-H2): #0f172a (slate-950) - weight: 700-800
Heading (H3-H6): #1e293b (slate-800) - weight: 600-700
Body Text: #475569 (slate-600) - weight: 400
Muted Text: #94a3b8 (slate-400) - weight: 400
Labels: #64748b (slate-500) - weight: 500-600
```

#### Dark Mode
```css
Heading (H1-H2): #f8fafc (slate-50) - weight: 700-800
Heading (H3-H6): #e2e8f0 (slate-200) - weight: 600-700
Body Text: #cbd5e1 (slate-300) - weight: 400
Muted Text: #94a3b8 (slate-400) - weight: 400
Labels: #cbd5e1 (slate-300) - weight: 500-600
```

---

## 🔤 Typography System

### Font Families
```css
Sans-Serif (Body): 'Inter', system-ui, sans-serif
Display (Headings): 'Poppins', 'Inter', sans-serif
Monospace (Code): 'Fira Code', monospace
```

### Font Sizes & Usage

#### Display Headings (Hero Sections)
```css
Display-1: 72px (4.5rem) - weight: 800
  Usage: Landing page hero, major section titles
  Line Height: 1.1

Display-2: 60px (3.75rem) - weight: 800
  Usage: Secondary hero sections
  Line Height: 1.1

Display-3: 48px (3rem) - weight: 700
  Usage: Large section headers
  Line Height: 1.2
```

#### Page Headings
```css
H1: 36px (2.25rem) - weight: 700
  Usage: Page titles, main headings
  Line Height: 1.25
  Color: text-neutral-900 dark:text-dark-900

H2: 30px (1.875rem) - weight: 600
  Usage: Section headings
  Line Height: 1.3
  Color: text-neutral-900 dark:text-dark-900

H3: 24px (1.5rem) - weight: 600
  Usage: Sub-section headings
  Line Height: 1.35
  Color: text-neutral-800 dark:text-dark-800

H4: 20px (1.25rem) - weight: 600
  Usage: Card titles, smaller sections
  Line Height: 1.4
  Color: text-neutral-800 dark:text-dark-800

H5: 18px (1.125rem) - weight: 500
  Usage: Component headings
  Line Height: 1.45
  Color: text-neutral-700 dark:text-dark-700

H6: 16px (1rem) - weight: 500
  Usage: Small headings, labels
  Line Height: 1.5
  Color: text-neutral-700 dark:text-dark-700
```

#### Body Text
```css
Body XL: 20px (1.25rem) - weight: 400
  Usage: Lead paragraphs, intro text
  Line Height: 1.8
  Color: text-neutral-700 dark:text-dark-700

Body LG: 18px (1.125rem) - weight: 400
  Usage: Large body copy
  Line Height: 1.75
  Color: text-neutral-700 dark:text-dark-700

Body (Base): 16px (1rem) - weight: 400
  Usage: Default body text, descriptions
  Line Height: 1.7
  Color: text-neutral-700 dark:text-dark-700

Body SM: 14px (0.875rem) - weight: 400
  Usage: Small text, captions
  Line Height: 1.65
  Color: text-neutral-600 dark:text-dark-600

Body XS: 12px (0.75rem) - weight: 400
  Usage: Tiny text, disclaimers
  Line Height: 1.6
  Color: text-neutral-500 dark:text-dark-500
```

#### Labels & Captions
```css
Label: 14px (0.875rem) - weight: 600
  Usage: Form labels, button text
  Color: text-neutral-700 dark:text-dark-700

Caption: 14px (0.875rem) - weight: 500
  Usage: Image captions, meta info
  Color: text-neutral-600 dark:text-dark-600

Overline: 12px (0.75rem) - weight: 700, uppercase, letter-spacing: 0.05em
  Usage: Eyebrows, categories
  Color: text-neutral-500 dark:text-dark-500
```

---

## 🎨 Component Styles

### Buttons

#### Primary Button
```tsx
className="btn-primary"

// Styles:
- Background: bg-primary-600 (hover: bg-primary-700)
- Text: text-white, weight: 500
- Padding: px-6 py-3
- Border Radius: rounded-lg (12px)
- Font Size: 14px (text-body-sm)
- Shadow: none (focus: ring-2 ring-primary-500)
- Transition: all 300ms

// Usage: Primary CTAs, form submissions
```

#### Secondary Button
```tsx
className="btn-secondary"

// Styles:
- Background: bg-neutral-100 dark:bg-dark-200
- Text: text-neutral-700 dark:text-dark-800, weight: 500
- Hover: bg-neutral-200 dark:bg-dark-300
- Same padding, radius as primary

// Usage: Secondary actions, cancel buttons
```

#### Outline Button
```tsx
className="btn-outline"

// Styles:
- Border: 2px border-primary-600
- Text: text-primary-600
- Background: transparent
- Hover: bg-primary-50 dark:bg-dark-200

// Usage: Less prominent CTAs
```

#### Ghost Button
```tsx
className="btn-ghost"

// Styles:
- Background: transparent
- Hover: bg-neutral-100 dark:bg-dark-200
- No border

// Usage: Tertiary actions, navigation
```

#### Button Sizes
```tsx
// Small
className="btn-primary btn-sm"  // px-4 py-2 text-xs

// Default
className="btn-primary"          // px-6 py-3 text-sm

// Large
className="btn-primary btn-lg"   // px-8 py-4 text-lg
```

### Cards

#### Basic Card
```tsx
className="card"

// Styles:
- Background: bg-white dark:bg-dark-100
- Border: 1px solid border-neutral-200 dark:border-dark-300
- Radius: rounded-xl (16px)
- Shadow: shadow-md
- Padding: p-6 (varies by context)

// Usage: Content containers, info boxes
```

#### Hover Card
```tsx
className="card card-hover"

// Additional:
- Hover: shadow-lg, translate-y-[-4px]
- Transition: all 300ms

// Usage: Clickable cards, links
```

#### Glass Card
```tsx
className="card card-glass"

// Additional:
- Background: rgba with blur
- Backdrop blur: 10px
- Semi-transparent border

// Usage: Overlays, modal contents
```

### Inputs

#### Text Input
```tsx
className="input-primary"

// Styles:
- Width: w-full
- Padding: px-4 py-3
- Border: 1px border-neutral-300 dark:border-dark-300
- Radius: rounded-lg
- Font Size: 16px (text-body)
- Focus: ring-2 ring-primary-500, border-transparent
- Background: bg-white dark:bg-dark-100

// Usage: All text inputs, textareas
```

#### Error State
```tsx
className="input-primary input-error"

// Additional:
- Border: border-error-DEFAULT
- Focus Ring: ring-error-DEFAULT

// Usage: Validation errors
```

### Badges

```tsx
// Primary
className="badge badge-primary"
// bg-primary-100 text-primary-700

// Success
className="badge badge-success"
// bg-green-100 text-green-700

// Warning
className="badge badge-warning"
// bg-yellow-100 text-yellow-700

// Error
className="badge badge-error"
// bg-red-100 text-red-700

// Usage: Status indicators, tags, counts
```

---

## 📏 Spacing System

### Component Spacing
```css
Padding inside cards:
  - Small: p-4 (16px)
  - Medium: p-6 (24px)
  - Large: p-8 (32px)

Gap between elements:
  - Tight: gap-2 (8px)
  - Normal: gap-4 (16px)
  - Loose: gap-6 (24px)

Section padding:
  - Mobile: py-12 (48px)
  - Tablet: py-16 (64px)
  - Desktop: py-20 (80px)
  - Large Desktop: py-24 (96px)
  - 2K Display: py-32 (128px)
```

### Container Widths
```css
Max widths:
  - Default: max-w-7xl (1280px)
  - Full HD: 3xl:max-w-[1920px]
  - 2K Display: 4xl:max-w-[2400px]

Padding:
  - Mobile: px-4
  - Tablet: px-6
  - Desktop: px-8
```

---

## 🎯 Responsive Breakpoints

```css
xs: 475px   - Large phones
sm: 640px   - Small tablets
md: 768px   - Tablets
lg: 1024px  - Small laptops
xl: 1280px  - Laptops
2xl: 1536px - Desktops
3xl: 1920px - Full HD displays
4xl: 2560px - 2K displays
```

### Responsive Text Pattern
```tsx
// Hero Heading
className="text-h3 md:text-h2 lg:text-h1 xl:text-display-3 4xl:text-display-2"

// Body Text
className="text-body-sm md:text-body lg:text-body-lg"

// Container
className="px-4 sm:px-6 lg:px-8 max-w-7xl 3xl:max-w-[1920px] 4xl:max-w-[2400px]"
```

---

## 🖼️ Iconography

### Icon Library
```tsx
import { Icon } from 'lucide-react';

// Sizes
- Small: w-4 h-4 (16px)
- Default: w-5 h-5 (20px)
- Medium: w-6 h-6 (24px)
- Large: w-8 h-8 (32px)

// Colors match text color
className="text-neutral-600 dark:text-dark-600"
```

### Common Icons Usage
```tsx
// Navigation
<Menu /> <X /> <ChevronDown /> <ChevronRight />

// Actions
<Plus /> <Edit /> <Trash2 /> <Save /> <Download />

// Status
<CheckCircle /> <XCircle /> <AlertCircle /> <Info />

// UI
<Search /> <Bell /> <User /> <Settings /> <LogOut />

// Books
<Book /> <BookOpen /> <FileText />
```

---

## 🌓 Dark Mode Guidelines

### Automatic Detection
- System preference detected on first visit
- Manual toggle overrides system preference
- Preference saved in localStorage

### Color Adjustments
```css
Light Mode → Dark Mode:
- White (#fff) → Slate-950 (#0f172a)
- Light gray → Slate-800
- Text black → Text white
- Shadows softer → Shadows darker
- Borders lighter → Borders darker
```

### Component Adaptation
```tsx
// Always use dark: prefix for dark mode styles
className="bg-white dark:bg-dark-100
           text-neutral-900 dark:text-dark-900
           border-neutral-200 dark:border-dark-300"
```

---

## ✨ Animation Guidelines

### Timing Functions
```css
Fast: 150ms - Hover states, toggles
Normal: 300ms - Transitions, reveals
Slow: 500ms - Page transitions, modals
```

### Common Animations
```tsx
// Fade In
className="animate-fadeIn"

// Slide In Up
className="animate-slideInUp"

// Hover Scale
className="hover:scale-105 transition-transform duration-300"

// Hover Lift
className="hover:-translate-y-1 transition-transform duration-300"
```

---

## 📱 Mobile-First Approach

### Always Start Mobile
```tsx
// ❌ Wrong
className="text-xl md:text-lg" // Bigger on mobile

// ✅ Correct
className="text-lg md:text-xl" // Smaller on mobile, bigger on desktop
```

### Touch Targets
```css
Minimum touch target: 44px × 44px
Button padding: at least py-3 px-6
Icon button size: at least w-10 h-10
```

---

## 🎨 Sample Component Markup

### Hero Section
```tsx
<section className="section-padding bg-gradient-to-br from-primary-50 to-white dark:from-dark-50 dark:to-dark-100">
  <div className="container-custom">
    <h1 className="text-responsive-xl font-display font-bold text-neutral-900 dark:text-dark-900 mb-6">
      Your Hero Title
    </h1>
    <p className="text-body-lg md:text-body-xl text-neutral-600 dark:text-dark-600 mb-8 max-w-2xl">
      Your hero description
    </p>
    <button className="btn-primary btn-lg">
      Get Started
    </button>
  </div>
</section>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div className="card card-hover p-6">
    <h3 className="text-h4 font-semibold mb-2">Card Title</h3>
    <p className="text-body-sm text-muted">Card description</p>
  </div>
</div>
```

---

## 📋 Checklist for New Components

- [ ] Responsive on all breakpoints (mobile to 4K)
- [ ] Dark mode styles implemented
- [ ] Proper typography hierarchy
- [ ] Consistent spacing
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Hover/focus states
- [ ] Loading/error states
- [ ] Animations smooth (300ms default)
- [ ] Touch targets ≥ 44px
- [ ] Colors from theme system

---

**Last Updated:** March 2026
**Version:** 1.0.0
