# Blog agent instructions (MathScienceDojo)

Runs every Monday and Thursday. Each run publishes ONE new post to mathsciencedojo.com via a direct commit to `main` (GitHub Pages deploys automatically).

## Steps
1. `git pull`. Read `blog.html` to see published posts. Pick the first unchecked topic in `blog-roadmap.md` (skip any whose slug already exists in `/blog/`).
2. Copy `blog/_template.html` to `blog/<slug>.html` and fill every placeholder. Keep the exact page chrome (nav, footer, WhatsApp float, `/style.css?v=9`, `/main.js?v=5`).
3. Content rules:
   - 600–900 words. Header text states the point (specific headers), then the story/explanation. Answer the parent's search question in the first two sentences.
   - Voice: Mr Yeo, practical, plain English, Singapore context, no hype, no invented statistics, no invented student names or results. Only use results already on the site (see `programmes.html`).
   - Syllabus/marking facts must be conservative and correct for MOE/SEAB PSLE. If unsure, leave the claim out. For Science, use official PSLE keywords (e.g. conduction, good/poor conductor, evaporation, condensation).
   - Include one worked example in a `.free-check` block, 3–4 FAQ items (visible `<details>` AND matching FAQPage JSON-LD), one link to a related existing page/post, a link to `/study-buddy.html`, and the trial/WhatsApp CTA block from the template.
   - Valid JSON-LD (Article + FAQPage), `datePublished` = today (Asia/Singapore).
4. Add a card at the TOP of the list in `blog.html` (between the POSTS:START / POSTS:END comments), newest first.
5. Add the URL to `sitemap.xml` and a one-line entry to `llms.txt`.
6. Tick the topic in `blog-roadmap.md`.
7. Verify: JSON-LD parses, all internal links resolve to real files, no leftover placeholders (`grep -n "SLUG\|TITLE\|YYYY"`).
8. `git add -A && git commit -m "Blog: <title>" && git push origin main`.
9. If the roadmap has fewer than 3 unchecked topics left, append 10 new problem-search topics (parent-intent queries) before finishing.
