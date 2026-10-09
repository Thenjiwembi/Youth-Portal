# Youth Opportunities Portal

A mobile-first, static HTML/CSS/JavaScript prototype for discovering youth jobs, learnerships, internships, bursaries, and skills programmes.

The custom peach-and-coral theme uses the supplied palette: `#FBCEB1`, `#FFBB99`, `#FDA785`, `#F89A78`, and `#FF916B`. Deep warm-brown text and dark espresso surfaces keep contrast readable; the compass-arrow wordmark and responsive layout remain consistent across the listings, details, resources, contact, and account pages. The palette is defined in `css/brand-theme.css`. The homepage photo is bundled locally at `assets/youth-career-collaboration.jpg` (Pexels), so it does not rely on a third-party hotlink.

> **Demonstration data:** Every opportunity in `js/data.js` is sample content, not a live or verified vacancy. No application links are provided. Do not use these records to make real applications.

## Run locally

From this directory, serve the files over HTTP (recommended because browsers can restrict local-file behavior):

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Implemented

- Homepage introduction, keyword/category/location search, category shortcuts, featured listings, upcoming deadlines, and a career-resources call to action.
- Search results with keyword, category, location, experience-level, and closing-date filters; reset controls and an empty-results message.
- Dynamic opportunity cards that show organisation, category, location, experience level, closing date, summary, and sample-data update date.
- Opportunity detail pages with description, eligibility/qualification requirements, documents, organisation information, safe application instructions, and a clear sample-data notice.
- Automatic hiding of listings whose closing dates have passed, using the visitor's device date.
- Saved opportunities, recently viewed listings, an archive of checked-document metadata and successfully shared opportunities, per-listing document checklists, share/copy links, deadline countdowns, and closing-soon labels.
- Persistent light/dark mode; a saved-only filter; and an external web-search action for finding opportunities beyond the local sample dataset.
- A deadline-email sign-up mock-up that does not save the entered address or send email.
- Practical CV and cover-letter writing guides, a sample letter, a downloadable CV outline, interview guidance, and scam-awareness tips.
- A private in-browser CV/cover-letter text checker for PDF, DOCX, and TXT with actionable structure, contact-detail, impact, length, placeholder, and optional job-description keyword suggestions.
- A data-driven profile overview for saved name, email, location, phone, qualification, bio, skills, and career interests, with an explicit edit/save/cancel flow and profile-picture upload/removal.
- Responsive layouts, semantic HTML, labelled form controls, alternative text for retained imagery, and visible keyboard focus styles.

## Data and safety

The structured demonstration records are maintained in `js/data.js`. Each record includes a closing date and `updatedDate`. The interface labels records as samples and explains that expired records are hidden. Application links are intentionally blank to avoid sending users to unrelated or misleading destinations. The wider-web search opens a Google results page using the current search/filter terms; it is not a live feed and results must be checked on official organisation sites.

## Known limitations

- The contact form validates in the browser but does not send or save messages. Its on-page message explicitly says so.
- Saved listings, recent views, checklist ticks, and theme choice use this browser's `localStorage` and do not sync between devices.
- Deadline email alerts are a UI mock-up only; no email address is stored and no notifications are sent.
- The document checker extracts PDF/DOCX/TXT text locally in the browser and does not upload or store files. The archive stores only checked filenames, document types, dates, checklist counts, and successfully shared opportunity details in local storage. This data does not sync between devices; clear it on shared devices. The checker is a rules-based checklist, not an AI editor, proofreader, layout reviewer, or hiring prediction. Scanned image-only PDFs and files over 10 MB are not supported; use an OCR/text PDF or DOCX/TXT instead.
- Login, signup, and profile behavior is a browser-local prototype using `localStorage`; profile pictures are resized in the browser before saving. Nothing syncs to a server, it is not secure authentication, and it must not be used for real accounts or sensitive data.
- There is no server, database, moderation workflow, live opportunity feed, or verified-organisation directory.
- The included records, requirements, and dates are for interface demonstration only. Replace them with sourced, verified listings before public use.
- Deployment, repository creation, screenshots, and wireframes are not included in this code-only project update.

The local document parsers are bundled on demand in `js/vendor/` (PDF.js 3.11.174 and Mammoth.js 1.8.0); their license texts are included alongside the files. Upstream assets: [PDF.js library](https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js), [PDF.js worker](https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js), and [Mammoth browser bundle](https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js). License texts were retrieved from [PDF.js on jsDelivr](https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/LICENSE) and [Mammoth on jsDelivr](https://cdn.jsdelivr.net/npm/mammoth@1.8.0/LICENSE).

## Recommended next steps before public launch

1. Add a backend or trusted form provider for enquiries and account operations.
2. Create a moderation and expiry workflow for real listings, with a verifiable source and audit trail.
3. Add organisation-approved application URLs and confirm each URL and deadline before publishing.
4. Run accessibility and mobile-browser checks, and capture project screenshots and wireframes.
5. Publish through GitHub Pages, Netlify, or Vercel after replacing all sample records.
