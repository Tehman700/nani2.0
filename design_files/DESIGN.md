---
name: Atmospheric Minimalist
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-xl:
    fontFamily: Hanken Grotesk
    fontSize: 96px
    fontWeight: '700'
    lineHeight: 100%
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 110%
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 120%
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 160%
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 140%
    letterSpacing: 0.05em
  label-xs:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 120%
    letterSpacing: 0.1em
spacing:
  margin-desktop: 80px
  margin-mobile: 24px
  gutter: 24px
  section-gap: 160px
  stack-sm: 8px
  stack-md: 16px
---

## Brand & Style

This design system is built upon the principles of **Architectural Minimalism**. It targets a high-end, discerning audience where the product is not just a service, but a statement of stature and momentum. The emotional response is one of clarity, breathability, and "the momentum to rise higher."

The style leverages heavy whitespace to create a "panoramic" feel, even on smaller viewports. It treats the screen as a gallery space where high-resolution architectural photography is the hero, and the UI is a precise, functional overlay. The aesthetic is stark, confident, and intentionally void of unnecessary decoration, favoring structural integrity over visual embellishment.

## Colors

The palette is strictly high-contrast monochrome to maintain an ultra-premium, authoritative tone. 

- **Primary Black (#000000):** Used for all primary headings, body text, and heavy functional elements like active buttons or navigation bars.
- **Pure White (#FFFFFF):** The primary canvas color. It is used to create vast "air" around elements, ensuring the UI never feels cluttered.
- **Stone Grey (#F2F2F2):** A functional secondary color used for subtle backgrounds in utility components (like cookie notices or hover states) to provide a soft distinction without breaking the monochrome harmony.

Color should only enter the experience through photography. The UI itself remains a transparent, structural framework.

## Typography

Typography is the primary vehicle for the brand’s voice. We use a dual-sans-serif approach:

- **Headlines:** Use **Hanken Grotesk**. It is sharp, contemporary, and architectural. For large display sizes, letter spacing must be tightened significantly to create a dense, "block-like" impact that mirrors modern building facades.
- **Body & Labels:** Use **Inter**. Its utilitarian nature provides a clean, neutral contrast to the aggressive headlines. Body text should have generous line height (160%) to maintain the "airy" feel.
- **Hierarchy:** Use All-Caps for labels and auxiliary text to give them a navigational, "blue-print" quality.

## Layout & Spacing

The layout utilizes a **Fixed Grid** with massive horizontal margins to simulate a widescreen cinematic experience.

- **Desktop:** A 12-column grid with a maximum content width of 1440px. Section gaps are intentionally large (160px+) to force the user to focus on one idea or image at a time.
- **Mobile:** A 4-column grid with 24px margins. The "panoramic" feel is maintained by using edge-to-edge photography and reducing vertical padding only slightly.
- **Alignment:** Elements often favor extreme left or extreme right alignments, leaving the center of the screen open. This "void" is a core characteristic of the design system.

## Elevation & Depth

This system avoids traditional shadows. Depth is communicated through **Tonal Layers** and **Strict Outlines**:

- **Flat Surfaces:** Components like cards and menus do not use shadows. They are separated from the background via thin (1px) borders in black or light grey.
- **Z-Index Overlays:** High-priority elements (like the "Choose an Office" button) appear as stark black blocks floating over white or photographic backgrounds. 
- **Transparency:** Minimal use of semi-transparent overlays (0.8 opacity) may be used for navigation bars to allow photography to "bleed" through the UI without sacrificing legibility.

## Shapes

The shape language is strictly **Sharp (0)**. 

To maintain the architectural, precision-engineered feel, there are no rounded corners in this design system. Buttons, input fields, image containers, and floating panels all utilize 90-degree angles. This geometric rigidity reinforces the brand's association with structure and permanence.

## Components

- **Buttons:** Primary buttons are solid black rectangles with white, uppercase text. Hover states invert the colors (white background, black border, black text). Secondary buttons use a 1px black border with no fill.
- **Navigation:** A minimalist top-bar. Links are small, uppercase, and widely spaced. The "Menu" toggle is represented by two horizontal lines of unequal length, emphasizing a modern, asymmetrical aesthetic.
- **Input Fields:** Bottom-border only. No background fill. Labels sit above the line in a small, uppercase font.
- **Cookie/Utility Banners:** Positioned at the bottom center. A soft grey (#F2F2F2) background with a sharp-edged "Accept" button. The text is centered and uses the `label-xs` style.
- **Dividers:** Use 1px solid lines. Horizontal dividers should span the full width of their container, while vertical dividers are used sparingly to separate navigation items or data points.
- **Image Containers:** Always 0px radius. Usually spanning at least 6 columns or full-width to emphasize the "panoramic" architectural photography.