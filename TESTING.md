# Testing and Validation

## Automated checks run for this update

- `node --check` passed for every file in `js/` and for inline scripts extracted from all HTML pages.
- Parsed all eight HTML pages; checked that local CSS/JS/link targets exist.
- Checked for duplicate element IDs and form controls missing a label or accessible name; none were found.
- Validated all 10 demonstration records have the required card/detail fields, an update date, and no live or placeholder application URL.
- Checked stylesheet block braces are balanced.
- Searched for stale verification-date fields, `#` application links, and unsupported claims that all listings are verified; none remain.
- Headless Chromium interaction test passed for saving and filtering listings, theme persistence, wider-web query construction, alert mock-up feedback, checklist persistence, recent-view tracking, and homepage saved/recent sections.
- Captured desktop and mobile Explore views and checked the dark-mode rendering.
- Career checker browser tests passed with TXT CV/cover-letter samples, a selectable-text PDF, and a DOCX; verified CV-specific vs. letter-specific tips, optional job-description terms, clear/reset, unsupported-format feedback, and the 10 MB limit.
- Confirmed the PDF.js and Mammoth.js scripts and PDF worker load from the portal’s own `js/vendor/` directory; document text is handled locally.
- Browser-tested the full cover-letter sample, interview guide, and CV outline download; confirmed no horizontal overflow at phone width and high-contrast checker text in dark mode.
- Headless Chromium profile test passed for loading stored user data, trusted-pointer Edit clicks and visible editor state, native file-picker launch from the full avatar, picture compression/save/removal, reload persistence, and phone-width overflow.

These checks confirm the tested browser and static structure; they are not a full cross-browser or assistive-technology audit.

## Manual browser checklist

1. Open the homepage at a narrow mobile width; check that navigation, search, category shortcuts, featured listings, upcoming deadlines, and the resources call to action fit the viewport.
2. Submit homepage searches by keyword, category, and typed location; confirm the result filters are prefilled and applied.
3. On Explore Opportunities, combine keyword, category, location, experience level, and closing-date filters; reset them and confirm the result count updates.
4. Search for a term with no match; confirm the empty-results message appears.
5. Open a sample listing and confirm it shows its sample warning, requirements, documents, organisation note, update date, and no apply link.
6. Open an unknown opportunity ID; confirm the not-found message appears instead of a different listing.
7. Try the career-resource modal and download action using keyboard and pointer.
8. Submit the contact form with missing/invalid fields, then valid sample data; confirm the browser validates required fields and the page clearly says nothing was transmitted.
9. Check keyboard focus visibility and responsive behavior at desktop and mobile widths.
10. Save an opportunity, switch to the saved-only filter, then return home and check the Saved section.
11. Open an opportunity, tick its application checklist, return home to check Recently Viewed, and revisit the detail page to check persistence.
12. Toggle dark mode and navigate between pages; the theme should persist.
13. Submit a wider-web search and confirm it opens a search-engine tab; verify promising listings directly on official organisation sites.
14. Try the deadline-alert mock-up and confirm the status explains that no address is stored and no email is sent.
15. Use a card or detail-page share control; when the deadline is within seven days, confirm the countdown is marked as closing soon.
16. On Career Resources, review the CV and cover-letter guidance on desktop/mobile and check the template/sample buttons.
17. Review a sample TXT CV and cover letter; confirm the suggestions change by document type and any pasted role description is used for keyword comparison.
18. Repeat with a text-based PDF and DOCX; verify that an image-only PDF, unsupported extension, and file over 10 MB show a useful error.
19. Confirm the checker reports that files are processed locally and never stored, while the archive records only the filename, type, date and checklist counts; verify “Clear document and review” clears the selected file and results.
20. On My Profile, verify that saved details appear, Edit Profile opens the form and changes to Close editor, Cancel discards field edits, Save persists them, and clicking the avatar or Change Picture opens the picker to update/remove a small photo.
21. Review a document and successfully share or copy an opportunity link; confirm both appear in Archive after navigation/reload, then use Clear Archive and confirm both lists are empty.
