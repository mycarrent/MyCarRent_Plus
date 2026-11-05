# MCR Pricing Calculator - Design Brainstorm

## Chosen Design Philosophy: Modern Orange Minimalism

**Design Movement:** Contemporary Flat Design with Warm Accents
**Core Principles:**
1. **Clarity First** - Every element serves a purpose; no decorative clutter
2. **Warm & Approachable** - Orange (#FF7A00) as primary accent conveys energy and trust
3. **Mobile-Centric** - Touch-friendly spacing, large tap targets, vertical flow
4. **Progressive Disclosure** - Show only relevant fields; hide unchecked sections

**Color Philosophy:**
- Primary Orange (#FF7A00) - Energetic, trustworthy, matches MCR brand
- Clean White/Light Gray - Maximizes readability and focus
- Dark Text (#1F2937) - High contrast for accessibility
- Subtle Shadows - Depth without heaviness
- Green (#10B981) for success states (copy confirmation)

**Layout Paradigm:**
- Single-column card-based layout (mobile-first)
- Input section → Live preview section (sticky)
- Sticky copy button at bottom
- Generous vertical spacing for touch interaction

**Signature Elements:**
1. **Orange accent line** - Subtle divider between sections
2. **Card elevation** - Soft shadows for depth hierarchy
3. **Emoji indicators** - Visual anchors for each section (🚗, 💰, ⏰, etc.)

**Interaction Philosophy:**
- Instant live preview as user types
- Smooth fade-in/out for toast notifications
- Haptic feedback on copy (toast message)
- Clear visual feedback on checkbox toggle

**Animation:**
- Toast fade in (200ms ease-out) → stay 1.5s → fade out (200ms ease-in)
- Checkbox toggle: smooth color transition (150ms)
- Input focus: subtle border color change
- Copy button: scale-down micro-interaction on click

**Typography System:**
- **Display:** Poppins Bold (titles, app name)
- **Body:** Inter Regular (input labels, descriptions)
- **Mono:** JetBrains Mono (numbers, prices - for precision feel)
- Hierarchy: 24px (title) → 16px (labels) → 14px (preview text)

---

## Implementation Notes
- Use Tailwind for responsive utilities
- Orange (#FF7A00) maps to custom CSS variable
- Service Worker for offline support
- Manifest.json for PWA installation
- Thai locale formatting (toLocaleString('th-TH'))
