# Design Skill Registry & Antigravity Compatibility Audit

**Project:** Light For Volunteer (`d:\Amaanitvam Volunteer\light-for-volunteer`)  
**Environment:** Google Antigravity IDE (Windows)  
**Configuration Directory:** `C:\Users\Anish\.gemini\config\skills\`  
**Date:** November 11, 2026  
**Audit Type:** Activation, Discovery & Capability Inspection  

---

## 1. Skill Inventory & Activation Status (All 14 Installed Skills)

| Skill | Local Path | Installed | Discovered | Available | Loaded | Applied | Category | Primary Scope |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **`design-taste-frontend`** | `~/.gemini/config/skills/design-taste-frontend` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Primary Creative Authority:** Anti-slop bar (figma/x.ai), one section per screen, equal margins, authentic product UI, `shoot.mjs` CDP capture engine. |
| **`impeccable`** | `~/.gemini/config/skills/impeccable` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Design System Governance:** Token consistency, 8px spatial grid, architectural elevation, visual hierarchy redlining. |
| **`better-interface`** | `~/.gemini/config/skills/better-interface` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Interface Coordination:** Ranked visual hierarchy across accessibility, layout, writing, typography, color, and polish. |
| **`better-accessibility`** | `~/.gemini/config/skills/better-accessibility` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Accessibility Engineering:** WCAG 2.2 AA contrast ($\ge 4.5:1$ text, $\ge 3:1$ controls), `:focus-visible` indicators, $\ge 44\text{px}$ touch targets, ARIA semantics. |
| **`better-layout`** | `~/.gemini/config/skills/better-layout` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Layout Architecture:** Spatial grouping, sticky sidebar navigation, responsive breakpoints, horizontal overflow encapsulation. |
| **`better-writing`** | `~/.gemini/config/skills/better-writing` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **UX Microcopy:** Authentic civic tone, clear validation feedback, meaningful empty/error recovery states. Zero fabricated claims. |
| **`better-typography`** | `~/.gemini/config/skills/better-typography` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Typography Governance:** Tabular numerals (`.tabular-nums`) for counts/dates/IDs, tight display tracking, 16px form controls preventing mobile zoom. |
| **`better-colors`** | `~/.gemini/config/skills/better-colors` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Color System:** Monochromatic White × Blue ramp; strict semantic isolation (Emerald for verified/applied, Amber for review, Rose for deadline/error). |
| **`better-ui`** | `~/.gemini/config/skills/better-ui` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Surface & Component Quality:** 1px hairline sky borders (`border-[#bae6fd]`), optical SVG alignments via `lucide-react`, tactile hover micro-steps without `transition: all`. |
| **`apple-design`** | `~/.gemini/config/skills/apple-design` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Human Interface Guidelines:** Inset grouped table patterns, design restraint, clear affordances, native mobile touch ergonomics. |
| **`fluid-interface-design`** | `~/.gemini/config/skills/fluid-interface-design` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Interaction Dynamics:** Tactile button responses, smooth drawer slide transitions, layout stability preventing CLS, instant reduced-motion fallbacks. |
| **`design-review`** | `~/.gemini/config/skills/design-review` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Independent QA Critique:** Multi-viewport visual reviews (`1440×900`, `1280×800`, `768×1024`, `390×844`, `320×800`), defect classification (Blocking, Craft, Polish). |
| **`unslop`** | `~/.gemini/config/skills/unslop` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Anti-Slop Gatekeeper:** Eradication of purple gradients, glowing borders, floating shapes, emoji markers, and generic SaaS card soup. |
| **`hallmark`** | `~/.gemini/config/skills/hallmark` | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **A** | **Editorial Integrity & The Floor:** Non-negotiable floor rules (tokens declared at `:root`, `overflow-x: clip`, zero `transition: all`, above-the-fold visibility). |

---

## 2. Non-Installed Repository Status

| Repository | Local Status | Antigravity Accessible | Note on Specialized Coverage |
| :--- | :---: | :---: | :--- |
| **`vercel-labs/agent-skills`** | **Not Installed** | **No** | Specialized React Server Component performance, Turbopack bundle tuning, and Next.js internal patterns from this repository are **not installed** and are not replaced by other skills. |
| **`anthropics/skills`** | **Not Installed** | **No** | Specialized Claude Code web-app evaluation runbooks and prompt evaluation harnesses from this repository are **not installed** and are not replaced by other skills. |

---

## 3. Antigravity Activation & Discovery Evidence

1. **Discovery Mechanism:** Antigravity discovers installed skills by traversing the machine-global configuration root `$env:USERPROFILE\.gemini\config\skills\`.
2. **Runtime Context Verification:** All 14 design skills are registered and listed verbatim under the `<skills>` block in Antigravity's active runtime session prompt.
3. **Project Binding:** The project configuration at `C:\Users\Anish\.gemini\config\projects\0495ff0b-9dc0-4d91-b222-c3aa309eeeec.json` binds `file:///d:/Amaanitvam%20Volunteer/light-for-volunteer` without restricting machine-global skill access.
4. **Encoding Audit:** `fluid-interface-design/SKILL.md` contains a UTF-8 Byte Order Mark (`\uFEFF`), which Antigravity's parser strips cleanly upon discovery.
5. **Reference Integrity:** Automated audit confirmed zero broken internal markdown links or missing relative assets across all 14 skills.
