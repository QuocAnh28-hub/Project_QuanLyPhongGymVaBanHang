---
name: Kinetic Obsidian
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#abd600'
  primary: '#ffffff'
  on-primary: '#283500'
  primary-container: '#c3f400'
  on-primary-container: '#556d00'
  inverse-primary: '#506600'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffffff'
  on-tertiary: '#00354a'
  tertiary-container: '#c4e7ff'
  on-tertiary-container: '#006c93'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
  metric-display:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  margin-mobile: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  gutter-mobile: 0.75rem
  gutter-desktop: 1.5rem
---

## Brand & Style

This design system expresses high-performance luxury, athletic precision, and relentless forward momentum. Targeted at dedicated fitness enthusiasts and high-tier gym members, the interface establishes an atmosphere of exclusive, performance-driven training. 

The aesthetic is built on high-contrast technical modernism: deep obsidian and graphite surfaces punctuated by an electric hyper-lime accent that signals energy, metrics, and achievement. Visual motifs merge the precision of biometric monitors with the refined finishes of premium studio equipment. Interfaces feel architectural, crisp, and tactically engineered—prioritizing fast visual scanning, immediate motivational cues, and unambiguous data delivery.

## Colors

The palette operates in a calibrated high-contrast dark environment designed to reduce ocular fatigue in low-light gym environments while maximizing visual punch.

- **Primary (`#CCFF00` - Hyper Lime):** The core electric charge. Reserved for primary calls-to-action, workout milestones, live metric highlights, and interactive states. Must maintain extreme contrast against dark grounds.
- **Secondary (`#10B981` - Kinetic Mint):** Represents recovery, completed targets, vital signs, and positive physiological feedback.
- **Tertiary (`#38BDF8` - Electric Cyan):** Used sparingly for secondary analytics, pacing indicators, heart rate secondary zones, and audio/media player controls.
- **Neutral Surface Palette:**
  - Base Ground: `#0B0D0E` (Obsidian Black)
  - Surface 01: `#121417` (Graphite Core)
  - Surface 02: `#1A1D23` (Elevated Card/Panel)
  - Surface 03: `#242932` (Interactive/Stroke Surface)
  - Text High-Emphasis: `#F8FAFC`
  - Text Muted: `#94A3B8`
  - Subtle Border: `rgba(255, 255, 255, 0.08)`

## Typography

Typography relies on a deliberate duality: `Space Grotesk` introduces a technical, athletic structure for numeric readouts, weights, metrics, and aggressive section headers, while `Plus Jakarta Sans` delivers ergonomic, crystal-clear readability for workout descriptions, exercise notes, and administrative content.

All metrics, durations, and rep counters must be set in `Space Grotesk` with tabular figures enabled (`font-variant-numeric: tabular-nums`) to prevent layout shifting during real-time interval timers. Labels and badges use uppercase transformation paired with generous letter spacing to replicate precision hardware gauges.

## Layout & Spacing

The layout model utilizes a fluid 4-column structure on mobile devices (under 600px), transitioning to an 8-column layout on tablet viewports (601px - 1024px), and a 12-column locked grid system maxing out at 1280px on desktop dashboard displays.

Spacing follows an uncompromising 4px base rhythm. Tight groupings (2xs, xs) bind metrics to their corresponding units (e.g., "120" and "BPM"). Medium steps (sm, md) control internal card padding and stack structures. Large modules, workout summary sections, and full-screen modal sheets employ xl and 2xl tokens to provide breathing room and prevent visual clutter during high-intensity training scenarios.

## Elevation & Depth

This system avoids heavy physical drop shadows, adopting an architectural stacking model composed of tonal depth, subtle surface borders, and luminescent accents:

- **Level 0 (Canvas Base):** `#0B0D0E` with zero elevation.
- **Level 1 (Card & Module Layer):** `#121417` layered with a crisp stroke: `1px solid rgba(255, 255, 255, 0.06)`. No drop shadow.
- **Level 2 (Floating Modals & Interactive Drawers):** `#1A1D23` backed by a multi-tier ambient occlusion: `0 8px 32px -4px rgba(0, 0, 0, 0.65)`, rimmed with `1px solid rgba(255, 255, 255, 0.1)`.
- **Active State / Energy Bloom:** Reserved solely for primary interactive elements and active training states. Employs a low-spread radiant glow: `0 0 24px 0 rgba(204, 255, 0, 0.25)`.

## Shapes

The design uses balanced, athletic curvature (roundedness level 2):
- Standard components (chips, cards, inputs) carry an 8px (`0.5rem`) corner radius.
- Larger structural elements (workout cards, bottom sheets, workout log sections) utilize 16px (`1rem`) to 24px (`1.5rem`) corner radii.
- Micro tags, workout badges, and floating status pills use complete circular caps (`9999px` radius) to contrast structurally against square metric containers.

## Components

### Buttons
- **Primary Athletic CTA:** Full-bleed background in `#CCFF00`, bold `#0B0D0E` typography (`label-lg`), 16px height-padding, rounded to 12px. Active press scales down slightly (`scale(0.98)`). Glow effect activates on hover/focus.
- **Secondary (Ghost Outline):** `1px solid rgba(255, 255, 255, 0.16)`, transparent ground, `#F8FAFC` label. On tap, switches to `rgba(255, 255, 255, 0.08)`.
- **Destructive/Cancel:** Monochromatic `#242932` with `#F87171` text to avoid high-chroma competition with the primary lime accent.

### Chips & Filters
- Compact 32px height, 9999px radius (pill), Space Grotesk text (`label-sm`).
- Inactive: `#121417` ground, `1px solid rgba(255, 255, 255, 0.08)`, `#94A3B8` text.
- Active: `#CCFF00` ground, `#0B0D0E` text, `0 0 12px rgba(204, 255, 0, 0.3)` outer aura.

### Metric & Workout Cards
- Background `#121417`, corner radius 16px, border `1px solid rgba(255, 255, 255, 0.07)`.
- Card layout splits into a metadata header (exercise type, target heart rate zone) and a prominent focal metric area (`metric-display`).
- Top-right corner includes an activity pill badge indicating set progression or completion status.

### Lists & Row Items
- Exercises and set rows use separated island-style row items with `#1A1D23` fill rather than hairline divider rules.
- 12px horizontal padding, 14px vertical padding, 8px border radius.
- Swipe gestures reveal quick actions (re-order, delete set, add weight) rendered with high-contrast icon indicators.

### Inputs & Number Steppers
- Height 48px to support rapid thumb taps in motion.
- Stepper buttons for weight adjustments (+/-) feature large hit targets (48x48px minimum) set in `#242932` with `#CCFF00` iconography.
- Text input utilizes inset background `#0B0D0E` with 1px border shifting to `#CCFF00` on focus.

### Checkboxes & Toggle Controls
- Checkboxes: 20x20px square with 4px border radius. Checked state fills with `#CCFF00` displaying an obsidian SVG checkmark.
- Switch/Toggles: Track size 48x28px, deep graphite track with an energetic spring animation moving the pure white or electric lime thumb knob.

### Specialized Fitness Components
- **Heart Rate Zone Meter:** Segmented horizontal bar consisting of five 4px-thick rounded pill segments, dynamically colored from cool slate up to `#CCFF00` and peak crimson.
- **Live Workout Bar:** Persistent docked bottom sheet displaying elapsed time, active set, and instantaneous pause/play controls using high-contrast typography.