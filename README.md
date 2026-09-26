# Membersflow — Landing Page

A single-page marketing site for Membersflow, a managed membership portal for
organizations and institutions. The design language follows the
[Nikka Webflow template](https://nikka-template.webflow.io/): deep-teal
palette, General Sans headings, Inter body text, Roboto Mono eyebrow labels,
split-screen hero, sticky section rails, and full-bleed photo sections.

## Structure

```
index.html        — the whole page (nav + 10 sections + footer)
css/style.css     — design system + section styles + responsive rules
js/main.js        — nav scroll state, mobile menu, scroll-reveal,
                    active-link tracking, FAQ accordion
assets/img/       — photos (Unsplash, free to use)
```

## Sections (in page order)

1. Hero — split layout, dark left panel with CTAs and trust strip
2. The problem
3. What Membersflow can do (8 feature cards)
4. How it works (sticky photo panel + 4 steps)
5. Who it's for (audience chips)
6. Payments deep-dive (3 cards)
7. Trust, security & ownership (dark, 6 blocks)
8. Testimonials — **placeholder quotes**, replace with real ones
9. FAQ (accordion)
10. Final CTA + footer

## Run locally

Any static server works:

```bash
python -m http.server 8093
# then open http://localhost:8093/
```

## Notes

- Fonts load from Google Fonts (Inter, Roboto Mono) and Fontshare
  (General Sans); system fallbacks are defined.
- All CTAs lead to the final CTA section or `hello@membersflow.com`.
- Testimonials use generic role attributions until real quotes exist.
