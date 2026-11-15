---
version: alpha
name: Volunteer Yatra
description: A warm, impact-driven travel platform with friendly energy, bold calls to action, and immersive photography.
colors:
  primary: "#26505c"
  secondary: "#ffe970"
  tertiary: "#f3b61f"
  neutral: "#ffffff"
  surface: "#ffffff"
  on-surface: "#1f2d35"
  muted-surface: "#edf3f4"
  border: "#e5e7eb"
  overlay: "#2b2d2f80"
  error: "#d64545"
typography:
  headline-display:
    fontFamily: Poppins
    fontSize: 79px
    fontWeight: 700
    lineHeight: 93.2656px
    letterSpacing: -2.38125px
  headline-lg:
    fontFamily: Poppins
    fontSize: 59px
    fontWeight: 700
    lineHeight: 59.5312px
    letterSpacing: -1.42875px
  headline-md:
    fontFamily: Poppins
    fontSize: 43px
    fontWeight: 500
    lineHeight: 52px
    letterSpacing: -0.714375px
  headline-sm:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: 500
    lineHeight: 38px
    letterSpacing: -0.714375px
  title-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.24px
  body-xl:
    fontFamily: Poppins
    fontSize: 23.8125px
    fontWeight: 400
    lineHeight: 36px
    letterSpacing: 0px
  body-lg:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: 0px
  body-md:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label-lg:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0px
  label-md:
    fontFamily: Poppins
    fontSize: 17.8594px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0px
  label-sm:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0px
  caption:
    fontFamily: Poppins
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 15.875px
  xl: 24px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 32px
  lg: 72px
  xl: 100px
  gutter: 30px
components:
  button-primary:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    rounded: "{rounded.lg}"
    padding: "18px 30px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.lg}"
    padding: "18px 30px"
    height: "54px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "14px 24px"
    height: "54px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "12px 18px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "48px"
  chip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
  cookie-banner:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: "16px 24px"
  stat-badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    padding: "10px 14px"
---

# Volunteer Yatra

## Overview
Volunteer Yatra feels optimistic, social, and purpose-led, with a friendly nonprofit-meets-modern-travel tone. The visual language is spacious and image-first, but the typography and buttons are bold enough to keep the experience energetic and conversion-oriented. It targets people looking for meaningful travel and volunteering opportunities, so trust, warmth, and clarity matter as much as excitement.

## Colors
- **Primary (#26505C):** A deep teal used for navigation, body contrast, footer and cookie-bar backgrounds, and the overall trust-building brand anchor. It reads as grounded, outdoorsy, and dependable.
- **Secondary (#FFE970):** A bright sunflower yellow used for the strongest CTAs, key numbers, and highlighted text on dark surfaces. It gives the interface its sunny, optimistic feel.
- **Tertiary (#F3B61F):** A warmer amber accent that can support the yellow system when a slightly richer callout or emphasis is needed.
- **Surface (#FFFFFF):** The main page canvas and card surface, keeping the UI clean and letting the photography lead.
- **On-surface (#1F2D35):** A dark readable text color for headings and supporting copy on light backgrounds.
- **Muted Surface (#EDF3F4):** A soft cool tint for subtle sections, placeholders, and low-emphasis panels.
- **Border (#E5E7EB):** A light neutral border for cards, inputs, and secondary UI separation.
- **Overlay (#2B2D2F80):** A translucent dark overlay for image treatment and layered emphasis where needed.
- **Error (#D64545):** Reserved for validation and destructive messaging; it is not dominant in the observed UI.

## Typography
Poppins is the defining voice of the system: rounded, modern, and approachable, with strong geometric forms that suit the youthful, public-facing brand. Headlines are heavy and tight, with negative letter-spacing that creates a compact, confident display style. Body text stays in the same family for consistency, using regular weight and generous line-height for easy reading over imagery.

- `headline-display` and `headline-lg` are used for hero statements and major section titles.
- `headline-md` and `headline-sm` support secondary page headers and emphasized section intros.
- `title-md` is appropriate for cards, promo blocks, and featured section labels.
- `body-xl` and `body-lg` carry the large marketing copy seen in the hero, while `body-md` and `body-sm` support standard interface text.
- `label-lg`, `label-md`, and `label-sm` are used for buttons, nav links, stats, and microcopy.
- Uppercase treatment is minimal; the system relies more on weight and size than on all-caps styling.
- Numerals and badges are visually important, so keep them bold and highly legible.

## Layout
The layout is broad and editorial, with a full-bleed hero that uses photography edge-to-edge and text anchored to the left. Content sections below the fold feel centered and likely constrained to a comfortable max width, while the nav bar remains compact and horizontal. Spacing follows a clear rhythm from `xs` and `sm` for fine separation to `lg` and `xl` for major section breaks.

Use generous side padding around text blocks so the copy feels breathable against the image. Buttons and stat items have enough horizontal space to prevent crowding, and cards should use moderate internal padding rather than dense layouts. The overall rhythm favors open, scenic composition over packed information density.

## Elevation & Depth
Depth is handled mostly through color layering, overlays, and soft shadows rather than heavy 3D effects. The hero image receives a dark greenish overlay to protect text contrast and create a cinematic mood. Buttons use subtle shadows and strong border treatment, while cards are generally flat with a light border instead of deep elevation.

The interface should feel tactile but restrained: a small shadow for interactive elements, clean separation for content blocks, and high contrast for CTAs. Avoid glossy effects, floating surfaces, or dramatic blur-heavy depth.

## Shapes
The shape language is soft and friendly, with rounded corners that feel approachable rather than playful or cartoonish. Buttons use the largest visible radius in the system (`rounded.lg`) to feel pill-adjacent without becoming fully circular. Cards and inputs use smaller radii (`rounded.md`) for structure and readability, while chips and badges can use `rounded.full` for a clean capsule silhouette.

Overall, the system balances organic softness with practical geometry, echoing the outdoor, human-centered nature of the brand.

## Components
**Buttons**
- Primary CTAs should use `button-secondary` for filled yellow actions like “Become a Volunteer.” These are the highest-visibility actions and should be reserved for conversion.
- Outline-style actions such as “List your space” should use `button-primary`, with transparent fill, yellow text, and a yellow border.
- Buttons should keep the 54px height and generous horizontal padding so they remain easy to tap and visually prominent.
- Hover states may deepen the background or strengthen contrast, but should not lose the warm yellow identity.
- Button labels should use `label-md` or a close equivalent in Poppins Semibold.

**Navigation**
- Top navigation links are simple text-first controls with low visual weight.
- Keep the login link understated compared with the two primary actions.
- Active or hover states should rely on color emphasis rather than underlines or heavy backgrounds.

**Cards**
- Cards should follow the `card` token: white background, light border, `rounded.md`, and modest padding.
- Use cards for content modules, feature previews, and any supporting information below the hero.
- Avoid deep shadows; the border is the main boundary cue.

**Inputs**
- Inputs should feel calm and accessible, with `rounded.md`, a white background, and a subtle border.
- Use `body-md` or `body-sm` text inside fields.
- Focus states should rely on border color changes and possibly a subtle shadow, not large glow effects.

**Chips and Badges**
- Use `chip` and `stat-badge` for compact highlights, counts, and tag-like metadata.
- Keep the pill shape and strong color contrast so numeric callouts remain easy to scan.
- Numbers and short labels should stay bold and compact.

**Cookie Banner**
- The cookie banner should use the dark primary background with white text and yellow action buttons.
- Keep it low enough in the hierarchy that it doesn’t compete with the hero, but visible enough to support consent actions.

## Do's and Don'ts
- Do keep hero messages short, bold, and left-aligned over imagery.
- Do use the yellow secondary color for the most important actions and highlights.
- Do preserve spacious padding around major sections so the site feels open and welcoming.
- Do use Poppins consistently across headings, body copy, and controls for brand unity.
- Don't introduce heavy drop shadows or dark, boxed UI that fights the airy travel aesthetic.
- Don't swap the yellow CTA system for generic blue or gray buttons.
- Don't crowd sections with too many equal-weight elements; hierarchy should remain obvious.
- Don't use sharp corners or industrial styling that undermines the friendly, human tone.