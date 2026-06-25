# Dogesh Signal • Visual Design System Specification
**Version:** 2.0.0-Premium • **Status:** Approved for Implementation

This document serves as the absolute visual blueprint for **Dogesh Signal**—the "AI sixth sense for risky messages." Every screen, state transition, and visual element must trace its aesthetic and structural guidelines directly back to this system.

---

## 1. Brand Direction Summary
Dogesh Signal is positioned as a **premium, trustworthy, and calm personal protector**. It is NOT a chaotic "warning machine" or an anxious "cyber-hacker terminal." It is a steady, sophisticated guardian that unmasks subtle conversational coercion, helping users handle boundary-pushing recruiters, clients, and landlords with absolute confidence.

*   **Aesthetic Core:** High-fidelity Glassmorphism, restrained and highly legible. Focused visual hierarchy displaying spacious negative space.
*   **The "6th Sense" Subtext:** Subtle instinctual indicators—pointed alert ear geometry, radial scanning fields, rhythmic alert pulses, and tactical sensor motifs—integrated into professional layouts. It respects the Shiba Inu mascot heritage without reverting to cartoonish memes.

---

## 2. Typography System
A strict font pairing hierarchy ensures high legibility on both desktop and mobile viewports, emphasizing technical precision alongside welcoming readability.

| Category | Font Family | Weight / Tracking | Usage Examples | Tailwind Utility |
| :--- | :--- | :--- | :--- | :--- |
| **Display (Titles)** | `Space Grotesk`, sans-serif | Bold, ExtraBold<br>`tracking-tight` | Screen headers, hero text, risk scores | `font-sans font-extrabold tracking-tight` |
| **Body (Content)** | `Inter`, sans-serif | Regular (`400`), Medium (`500`) | Executive summaries, reply suggestions, cards | `font-sans font-normal leading-relaxed` |
| **Code & Status** | `JetBrains Mono`, monospace | Medium (`500`), Bold (`700`) | Metrics, evidence logs, timestamps, badge labels | `font-mono text-xs tracking-wider` |

---

## 3. Color System
Our brand uses **one clear, high-contrast accent system** centered on warm, protective hues (Signal Orange and Intuition Amber), avoiding aggressive neon greens, purple gradients, and pure black.

### A. Dark Mode Palette (Guardian Slate Night)
*   **Background Base:** Deep Charcoal Gray (`#030712` / `bg-slate-950`)
*   **Card Fill:** Slate Dark-Glass (`rgba(15, 23, 42, 0.6)` / `bg-slate-900/60` with `backdrop-blur-md`)
*   **Borders:** Slate Accent (`rgba(30, 41, 59, 0.8)` / `border-slate-800/80`)
*   **Deep Muted Overlay:** `bg-slate-950/40`

### B. Light Mode Palette (Prisamtic Quartz White)
*   **Background Base:** Soft Clean Off-White (`#F8FAFC` / `bg-slate-50`)
*   **Card Fill:** Pure Glacier White (`#FFFFFF` / `bg-white`)
*   **Borders:** Light Slate Accent (`#E2E8F0` / `border-slate-200`)
*   **Subtle Inner Glow:** `bg-slate-50/50`

### C. System Accents & Intent Signaling
*   **Primary Accent:** Signal Orange (`#F97316` / `text-orange-500` / `bg-orange-500`) — represents instinct, active scanning, and brand core.
*   **Secondary Tone:** Intuition Amber (`#F59E0B` / `text-amber-500`) — represents tactical alerts and general advice.
*   **High Risk (Danger):** Protective Rose (`#EF4444` / `text-rose-500` / `bg-rose-500/10`) — replaces harsh screaming reds with a sophisticated coral/rose warning.
*   **Safe State:** Forest Emerald (`#10B981` / `text-emerald-500`) — represents resolved boundaries and secure, vetted states.
*   **Intel Accent:** Indigo Ray (`#6366F1` / `text-indigo-400`) — used for deep transparency check ratios.

---

## 4. Surface + Glass Rules
Glassmorphic design must remain understated to ensure perfect reading conditions.
1.  **Readability Margin:** Text elements within glass containers must never overlay heavy structural graphics. Use solid background colors adjusted via opacity instead of extreme blurs.
2.  **The Border Standard:** Every card requires a clean, subtle 1px border (`border-slate-200` in Light Mode, `border-slate-800/80` in Dark Mode) to hold structural shape.
3.  **Backdrop Specifications:** `backdrop-blur-md` is the absolute limit for panels. Do not stack blurred layers nested inside other blurred layers.

---

## 5. Component Styling Rules

### A. Cards & Panels
*   **Radius:** Rounded to a generous, modern limit (`rounded-2xl` / `1rem`).
*   **Shadows:** Soft, natural diffuse dark shadows (`shadow-sm` or `shadow-md`). Never use pitch-black, high-opacity shadows.
*   **Padding:** Dynamic rhythm. Content cards use `p-6` or `p-7`, while small utility chips use `p-3` or `p-3.5` to construct visual contrast.

### B. Button Hierarchy
1.  **Primary Action Button:** Solid Signal Orange base in black bold text (`bg-orange-500 text-slate-950 hover:bg-orange-450`). No border, modern monospace tracking.
2.  **Secondary Action Button:** Transparent base with clean border (`border-slate-200` in light, `border-slate-800` in dark) and soft hover feedback (`hover:bg-slate-500/5`).
3.  **Critical Purge Button (Danger zone):** Soft rose tint (`text-rose-500 bg-rose-500/10 hover:bg-rose-500/15`). Keep the visual impact focused only inside the specific card container.

### C. Input Fields
*   **Sizing:** Textareas are sized at a strict height mapping room for extensive email threads (`h-64`).
*   **Transitions:** Smooth border shifts on focus (`transition-all duration-200`). Focus state replaces default rings with a warm, subtle orange border and light glow (`focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500`).

### D. Icon Styles
*   Standardized line-art style utilizing the **Lucide React** package.
*   Avoid filled background boxes unless they represent active badges (`bg-orange-500/10` or `bg-rose-500/10`).

---

## 6. Motion & Animation Rules
All motion should feel soft, organic, premium, and purposeful—not distracting.

*   **Page Transitions:** Smooth cross-fades with light upward movement (`initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }`).
*   **Spring Configuration:** Focus on snappy but gentle springs: `{ type: "spring", stiffness: 150, damping: 20 }`.
*   **Interactive Hover Indicators:** Cards rise on hover by an extremely gentle margin (`hover:scale-[1.005] duration-150`). Buttons scale down subtly on click to provide physical tactile feedback (`active:scale-99`).

---

## 7. Logo & Brand-Mark Direction
The logo combines professional technical geometry with friendly Shiba Inu features:
*   **Pointed Ears:** Direct representation of erect Shiba alert ears—instinctive communication parsing.
*   **Radial Reticle Rings:** Multiple concentric dotted or dashed outer rings mapping signal intelligence and protective boundaries.
*   **Central Eye Node:** LED-style status eye representing an active "D-3 SENSE" digital scanner.

---

## 8. Do / Don't Rules List

### **DO:**
*   **DO** leave ample negative space around panels to let the interface breathe.
*   **DO** use plain human english descriptions in alerts so the application never feels like a stressful antivirus utility.
*   **DO** keep all scanned messages persisted solely in the secure client local memory.
*   **DO** place helpful learning prompts nearby when screens are empty.
*   **DO** ensure clean contrast scores between text and backing fields.

### **DON'T:**
*   **DON'T** use multi-hue purples, harsh cyber-neon blues, or command line green text matrices.
*   **DON'T** flood the user's interface with endless pop-up notifications or redundant toast blocks.
*   **DON'T** add unrequested decoration, network terminal lines, or port coordinates.
*   **DON'T** create childish, cartoonish memes of the Doge mascot.
*   **DON'T** leave any empty screen void of supportive directions.

---

## 9. Implementation Guidance
When modifying or building screens within `src/components/`, strictly inspect this spec's variables and typography:
1.  Verify the active mode theme variables within React elements (`theme === "dark" ? ... : ...`).
2.  Use the styled `bgCardClass` variables globally across all screens to protect overall alignment.
3.  Ensure the `SensingMascot` and `SignalPulseWave` components are positioned in key transition states to maintain the "AI 6th sense" subtext.
