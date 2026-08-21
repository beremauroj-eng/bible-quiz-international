# AdSense low-value-content remediation ledger

Updated: 2026-08-21  
Branch: `adsense/content-quality-remediation-2`

## Objective

Increase the amount of useful, original, verifiable learning value available before and after each quiz. The remediation must improve real reader utility; word count alone is not an acceptance criterion.

## Baseline findings

- Book landing pages share substantial template language.
- Most book pages expose only three sample questions.
- Some generated pages contain duplicate or near-duplicate questions.
- Related-book navigation can repeat the same link.
- Some generated meta descriptions end mid-word.
- The English and Spanish homepages claimed “0 ads and trackers” after AdSense verification was added.

## Quality gate for each book pair

An English/Spanish book pair is complete only when it has:

- at least six non-duplicate sample questions tied to precise references;
- a book-specific reading map or structural outline;
- book-specific study guidance rather than the shared generic paragraph;
- a translation or interpretation note where wording can vary;
- unique, useful related-book navigation;
- a complete meta description and correct canonical/breadcrumb URL;
- matching English/Spanish scope and working quiz parameters;
- no unsupported certainty on disputed historical or doctrinal questions.

## Completed in tranche 2

- [x] Corrected the inaccurate “0 ads and trackers” homepage statistic in English and Spanish.
- [x] Expanded Genesis in English and Spanish with seven referenced samples, a four-part reading map and practical study guidance.
- [x] Expanded Obadiah in English and Spanish with six verse-specific samples, a three-part reading map and book-specific context.
- [x] Removed duplicate related-book links from Genesis and Obadiah.
- [x] Replaced the duplicate Obadiah testament question.
- [x] Corrected Genesis meta descriptions and breadcrumb destinations.

## Completed in tranche 3

- [x] Rebuilt Exodus, Leviticus, Numbers and Deuteronomy in English and Spanish.
- [x] Added six precise, non-duplicate referenced questions to each page.
- [x] Added a book-specific reading map and study method to every page.
- [x] Added translation and interpretation cautions appropriate to each book.
- [x] Corrected eight truncated meta descriptions and eight breadcrumb destinations.
- [x] Replaced duplicated related-book navigation with unique contextual routes.

## Remaining rollout

- [ ] Audit the remaining 60 English/Spanish book pairs for duplicate questions and links.
- [ ] Prioritise pages appearing in Search Console impressions, then complete the remaining books by canonical order.
- [ ] Update sitemap `lastmod` only when a page receives a substantive editorial revision.
- [ ] Run HTML, internal-link, hreflang, canonical and structured-data checks before merge.
- [ ] Review indexed topic and article pages for the same quality gate.
- [ ] Request a new AdSense review only after the representative and sitewide defects are remediated.
