---
name: Nocturne Editorial
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#dcc66e'
  on-secondary: '#3a3000'
  secondary-container: '#615200'
  on-secondary-container: '#dbc66d'
  tertiary: '#bfcde6'
  on-tertiary: '#233144'
  tertiary-container: '#a3b2ca'
  on-tertiary-container: '#374559'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#f9e287'
  secondary-fixed-dim: '#dcc66e'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#534600'
  tertiary-fixed: '#d5e3fd'
  tertiary-fixed-dim: '#b9c7e0'
  on-tertiary-fixed: '#0d1c2f'
  on-tertiary-fixed-variant: '#3a485c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system centers on an atmosphere of intellectual prestige and quiet luxury. It evokes the feeling of a private library at midnight—sophisticated, focused, and exclusive. The target audience is the discerning bibliophile who values curation over volume.

The style combines **Minimalism** with **Glassmorphism**. It utilizes expansive negative space to allow book cover art to breathe, while employing translucent layers to create a sense of physical depth. High-contrast accents provide clear wayfinding within the dark environment, ensuring the premium aesthetic never compromises functional clarity.

## Colors
The palette is rooted in deep, nocturnal tones to reduce eye strain and highlight literary content. The base layer uses a rich navy-charcoal, while elevated surfaces transition into a lighter charcoal to signify hierarchy. 

Primary actions utilize a warm Amber (#F59E0B) that mimics the glow of a reading lamp. This is supported by a softer Gold (#FDE68A) for secondary highlights and metadata. A subtle, low-opacity amber glow is applied to interactive states to simulate light reflecting off high-quality paper or gold-leafed book edges.

## Typography
The typographic system relies on a high-contrast pairing of a literary serif and a utilitarian sans-serif. **Newsreader** is used for headlines to evoke the timeless authority of printed media, with slightly tighter letter-spacing for a modern editorial feel. 

**Inter** handles all functional and body text, ensuring maximum legibility on dark backgrounds. Large body text uses a generous line height (1.6) to facilitate long-form reading. Labels and metadata utilize uppercase Inter with increased letter-spacing to provide a structural, modern counterpoint to the organic curves of the serif headings.

## Layout & Spacing
The design system employs a **Fixed Grid** model for desktop, centered on a 1280px container with a 12-column structure. Spacing follows a 4px base unit, with a preference for larger increments (XL and LG) to maintain an airy, premium feel.

Margins and gutters are kept generous to prevent the dark interface from feeling cramped. Vertical rhythm is strictly enforced to mirror the orderly nature of a well-organized bookshelf. Elements should be aligned to the grid to create a sense of structured intentionality.

## Elevation & Depth
Depth in this design system is communicated through **Tonal Layers** and **Glassmorphism**. Surfaces do not use traditional drop shadows; instead, they use lighter fill colors and subtle inner borders to indicate elevation.

1.  **Base:** #0F172A (The canvas).
2.  **Surface:** #1E293B (Cards, navigation bars).
3.  **Overlay:** A semi-transparent blur (Backdrop-filter: 12px) with a 1px border of #334155.

Interactive elements like primary buttons feature an **Ambient Glow**. This is achieved using a soft, diffused outer glow (drop-shadow) using the primary amber color at 15% opacity, creating a "lit" effect rather than a "floating" effect.

## Shapes
The shape language is defined as **Rounded**, striking a balance between the organic feel of paper and the precision of modern software. Standard UI elements like buttons and input fields use a 0.5rem radius.

Large containers and cards use a 1rem radius to soften the high-contrast transitions between background tones. Book cover imagery should maintain a very slight 2px radius to mimic the natural wear of a hardcover book without losing its rectangular iconicity.

## Components
-   **Buttons:** Primary buttons are solid Amber (#F59E0B) with dark navy text. On hover, they gain a subtle outer glow. Secondary buttons are ghost-style with a Gold border and text.
-   **Cards:** Book cards use the Surface color (#1E293B). They feature no shadow, using a 1px border (#334155) that brightens slightly on hover to indicate interactivity.
-   **Chips/Tags:** Used for genres. These are low-contrast (Surface color background) with Gold text in the `label-sm` style.
-   **Input Fields:** Deep charcoal fill with a subtle 1px border. The border transitions to Amber upon focus, accompanied by a faint internal amber glow.
-   **Lists:** Editorial lists use the Serif font for titles, separated by thin 1px horizontal rules in #334155.
-   **Specialty Component - 'The Curator’s Note':** A glassmorphic callout box with a blurred background and a left-accent border in Gold, used for staff recommendations.