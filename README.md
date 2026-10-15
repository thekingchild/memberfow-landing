# Membersflow — Landing Page

Single-page marketing site for Membersflow, a fully managed membership portal
for professional associations and institutions. Static: one HTML file, one
stylesheet, one script, no build step.

## Design

Brand color is the coral from the logo, `#E86C4C`, on black ink and a warm
off-white canvas (the portal's teal theme is per-organization and not the
brand). Inter Tight for headlines, Inter for body. Headlines mix regular and
bold weights with one coral-emphasized phrase. There is no stock imagery.
Product panels (the admin desk, member phone, member record, invoice,
membership card) are rebuilt in HTML so they can be interactive and
stay on-brand.

Every number and feature claim on the page comes from the product:
renewal stages from `App\Enums\RenewalReminderStage`, permission keys from
`App\Support\PermissionCatalogue`, directory dimensions from
`config/directory.php`, reminder late-window and import limits from
`config/membership.php`. Copy follows `docs/marketing/landing-page-content.md`.

Positioning is managed-service only. Do not add self-hosting or install
language; that is operator-side.

## Structure

```
index.html        — nav + 10 sections + footer
css/style.css     — tokens, base, components, responsive rules
js/main.js        — nav, vocabulary switcher, renewal slider, payment tabs,
                    card flip, roles picker, scroll reveal
assets/           — favicon.png (cropped logo mark); img/logo-dark.png,
                    img/logo-light.png
```

## Sections (in page order)

1. Hero — headline, two stat blocks, Member/Staff/Public rail, then the
   rebuilt staff desk with a member-area phone
2. Black statement band — what you are buying, 4 columns
3. Already built — 8 numbered items
4. How it fits together — member area / core / public diagram + staff desk
5. Your structure, your words — interactive vocabulary switcher + audiences
6. Renewals — scrubbable reminder timeline (6 real stages)
7. Payments — Paystack / Flutterwave / Bank transfer tabs
8. Membership cards — flip card with QR verification
9. Access with boundaries — role picker over real permission keys
10. From demo to live — 4 steps
11. FAQ, final CTA, footer

No testimonials section: add one only when real quotes exist.

## Run locally

```bash
python3 -m http.server 5500
```

Then open http://localhost:5500/. `.claude/launch.json` has the same config
for the Claude desktop preview.

## Notes

- Fonts load from Google Fonts (Inter, Fraunces); system fallbacks are set.
- All CTAs go to the final CTA section or `hello@membersflow.com`.
- Interactions are keyboard accessible and honor `prefers-reduced-motion`.
