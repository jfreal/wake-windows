// @doc:static-content-pages
//
// Renders the cluster-1 pages to static HTML at build time (see the
// wakeWindowsContentPages plugin in vite.config.ts). Plain strings rather than
// Vue SSR on purpose: these pages are documents, not app screens, and shipping
// them as inert HTML means a crawler with no JS — GPTBot, ClaudeBot, Bingbot's
// non-JS path — sees the whole page, which is the entire reason they exist.
//
// Styling is a small inline sheet using the app's paper tokens rather than the
// Tailwind bundle: a content page that pulls the app's CSS would also pull its
// JS entry through the same HTML shell, and these pages must render before a
// single byte of the app loads. Keep the palette in sync with src/style.css.

import type { AgePageModel, HubBracketRow } from './agePages'
import { CLUSTER_BASE, SITE_ORIGIN } from './agePages'

/** Last content review. Surfaced on the page and in `dateModified`. */
export const CONTENT_REVIEWED = '2026-08-21'

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

const STYLES = `
:root {
  --paper: #f6f0e6; --surface: #fffdf8; --hairline: #e5dbcc;
  --ink: #3d352f; --ink-strong: #2a2320; --ink-quiet: #6e635c;
  --accent: #a9502f; --accent-hover: #8e4a2e;
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--paper); color: var(--ink);
  font: 400 17px/1.65 "Hanken Grotesk", system-ui, -apple-system, sans-serif;
  -webkit-text-size-adjust: 100%;
}
h1, h2, h3 { font-family: Faustina, Georgia, serif; color: var(--ink-strong); line-height: 1.2; }
h1 { font-size: clamp(1.9rem, 5vw, 2.6rem); margin: 0 0 .75rem; }
h2 { font-size: clamp(1.35rem, 3.5vw, 1.7rem); margin: 2.5rem 0 .75rem; }
h3 { font-size: 1.1rem; margin: 1.5rem 0 .35rem; }
a { color: var(--accent); }
a:hover { color: var(--accent-hover); }
a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
.crumbs { font-size: .9rem; color: var(--ink-quiet); margin-bottom: 1.5rem; }
.lede { font-size: 1.1rem; }
.card {
  background: var(--surface); border: 1px solid var(--hairline);
  border-radius: 12px; padding: 1.1rem 1.25rem; margin: 1.25rem 0;
}
table { width: 100%; border-collapse: collapse; margin: .5rem 0 0; }
.scroll { overflow-x: auto; }
th, td { text-align: left; padding: .55rem .5rem; border-bottom: 1px solid var(--hairline); }
th { font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; color: var(--ink-quiet); font-weight: 600; }
td.time { font-variant-numeric: tabular-nums; white-space: nowrap; }
td .detail { display: block; font-size: .85rem; color: var(--ink-quiet); }
.cta {
  display: inline-block; background: var(--accent); color: #fff; text-decoration: none;
  font-weight: 600; padding: .8rem 1.4rem; border-radius: 999px; min-height: 44px; line-height: 1.6;
}
.cta:hover { background: var(--accent-hover); color: #fff; }
.stats { display: flex; flex-wrap: wrap; gap: 1.5rem; margin: 0; padding: 0; list-style: none; }
.stats div { min-width: 8rem; }
.stats dt { font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; color: var(--ink-quiet); }
.stats dd { margin: .15rem 0 0; font-size: 1.25rem; font-family: Faustina, Georgia, serif; color: var(--ink-strong); }
.nav-pair { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; margin-top: 2rem; }
.tier {
  display: inline-block; font-size: .75rem; font-weight: 600; letter-spacing: .03em;
  color: #35594a; background: rgba(78,122,99,.15); border-radius: 999px; padding: .15rem .6rem;
}
footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--hairline); font-size: .9rem; color: var(--ink-quiet); }
`.trim()

interface PageShell {
    title: string
    description: string
    path: string
    body: string
    jsonLd: unknown
}

function shell({ title, description, path, body, jsonLd }: PageShell): string {
    const url = `${SITE_ORIGIN}${path}`
    return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f6f0e6" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/png" href="/pwa-192x192.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Wake Windows" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE_ORIGIN}/pwa-512x512.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${SITE_ORIGIN}/pwa-512x512.png" />
  <style>${STYLES}</style>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>

<body>
  <div class="wrap">
${body}
    <footer>
      <p>Informational only, not medical advice. Infant sleep needs vary widely — talk to your
        pediatrician about your baby. Guidance last reviewed ${CONTENT_REVIEWED}.</p>
      <p><a href="/">Wake Windows</a> is a free, local-first nap planner. No account, no AI,
        nothing about your baby leaves your device.</p>
    </footer>
  </div>
</body>

</html>
`
}

/** Shared publisher/author nodes, matching the graph in index.html. */
function publisherNodes() {
    return [
        {
            '@type': 'Organization',
            '@id': `${SITE_ORIGIN}/#organization`,
            name: 'Wake Windows',
            url: `${SITE_ORIGIN}/`,
            logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/pwa-512x512.png` },
        },
        {
            '@type': 'Person',
            '@id': `${SITE_ORIGIN}/#author`,
            name: 'John',
            description:
                'Parent of twins who built Wake Windows after reading every infant-sleep book they could find.',
        },
    ]
}

function breadcrumbs(path: string, name: string) {
    const items = [
        { '@type': 'ListItem', position: 1, name: 'Wake Windows', item: `${SITE_ORIGIN}/` },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Sleep schedules by age',
            item: `${SITE_ORIGIN}${CLUSTER_BASE}/`,
        },
    ]
    if (path !== `${CLUSTER_BASE}/`) {
        items.push({ '@type': 'ListItem', position: 3, name, item: `${SITE_ORIGIN}${path}` })
    }
    return { '@type': 'BreadcrumbList', itemListElement: items }
}

const SOURCES = [
    {
        label: 'American Academy of Sleep Medicine — consensus on recommended sleep amounts',
        url: 'https://jcsm.aasm.org/doi/full/10.5664/jcsm.5866',
    },
    {
        label: 'National Sleep Foundation — sleep duration recommendations',
        url: 'https://www.sleephealthjournal.org/article/S2352-7218(15)00015-7/fulltext',
    },
    {
        label: 'American Academy of Pediatrics — healthy sleep habits by age',
        url: 'https://www.healthychildren.org/English/healthy-living/sleep/Pages/healthy-sleep-habits-how-many-hours-does-your-child-need.aspx',
    },
    {
        label: 'AAP — 2022 safe-sleep recommendations (SIDS)',
        url: 'https://publications.aap.org/pediatrics/article/150/1/e2022057990/188304/',
    },
]

function sourcesBlock(): string {
    return `    <h2>Where these numbers come from</h2>
    <p><span class="tier">Tier 1 — evidence-based</span> The ranges on this page are the
      consensus sleep totals and nap counts below. The phrase "wake window" itself is a
      <strong>Tier 2 practice-based heuristic</strong>: it does not appear in the pediatric
      sleep-medicine literature, so treat the window lengths as a starting estimate and let
      your baby's sleepy cues override them.</p>
    <ul>
${SOURCES.map((s) => `      <li><a href="${s.url}" rel="nofollow">${escapeHtml(s.label)}</a></li>`).join('\n')}
    </ul>`
}

function faqBlock(faqs: { question: string; answer: string }[]): string {
    return `    <h2>Common questions</h2>
${faqs
        .map(
            (f) => `    <h3>${escapeHtml(f.question)}</h3>
    <p>${escapeHtml(f.answer)}</p>`,
        )
        .join('\n')}`
}

export function renderAgePage(page: AgePageModel): string {
    const rows = page.rows
        .map(
            (row) => `        <tr><th scope="row">${escapeHtml(row.label)}</th><td class="time">${escapeHtml(row.time)}</td>`
                + `<td>${row.detail ? `<span class="detail">${escapeHtml(row.detail)}</span>` : ''}</td></tr>`,
        )
        .join('\n')

    const body = `    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Wake Windows</a> › <a href="${CLUSTER_BASE}/">Sleep schedules by age</a> › ${escapeHtml(page.heading)}
    </nav>
    <h1>${escapeHtml(page.heading)}</h1>
    <p class="lede">${escapeHtml(page.intro)}</p>

    <h2>A sample ${escapeHtml(String(page.months))}-month-old day</h2>
    <p>Wake at ${escapeHtml(page.rows[0].time)}, ${page.napCount} nap${page.napCount === 1 ? '' : 's'} of about
      ${escapeHtml(page.napLength)} each, bedtime at ${escapeHtml(page.rows[page.rows.length - 1].time)}. Nap times are
      windows, not deadlines — anywhere inside one counts.</p>
    <div class="card scroll">
      <table>
        <thead><tr><th scope="col">Part of the day</th><th scope="col">Clock time</th><th scope="col">Notes</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>
    <p><a class="cta" href="${page.plannerHref}">Open this day in the planner</a></p>
    <p>The planner adjusts it to your baby's own wake time, bedtime, and birthday — including
      corrected age if your baby was born early.</p>

    <h2>How much sleep a ${escapeHtml(String(page.months))} month old needs</h2>
    <div class="card">
      <dl class="stats">
        <div><dt>Wake windows</dt><dd>${page.wakeWindowRange[0]}–${page.wakeWindowRange[1]} min</dd></div>
        <div><dt>Naps</dt><dd>${page.napRange[0]}–${page.napRange[1]}</dd></div>
        <div><dt>Daytime sleep</dt><dd>${page.daySleepRange[0]}–${page.daySleepRange[1]} h</dd></div>
        <div><dt>Night sleep</dt><dd>${page.nightSleepRange[0]}–${page.nightSleepRange[1]} h</dd></div>
      </dl>
    </div>
    <p>The sample day above lands at ${page.totalNapHours} h of daytime sleep and
      ${page.totalNightHours} h overnight — ${page.totalSleepHours} h in 24. A baby at the bottom of
      the range who wakes up happy is not short on sleep; the range is wide because babies are.</p>

    <h2>What changes next</h2>
    <p>${escapeHtml(page.whatChangesNext)}</p>

${faqBlock(page.faqs)}

${sourcesBlock()}

    <nav class="nav-pair" aria-label="Nearby ages">
      <span>${page.previous ? `← <a href="${CLUSTER_BASE}/${page.previous.slug}/">${escapeHtml(page.previous.label)} sleep schedule</a>` : `<a href="${CLUSTER_BASE}/">All ages</a>`}</span>
      <span>${page.next ? `<a href="${CLUSTER_BASE}/${page.next.slug}/">${escapeHtml(page.next.label)} sleep schedule</a> →` : `<a href="${CLUSTER_BASE}/">All ages</a>`}</span>
    </nav>`

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            ...publisherNodes(),
            {
                '@type': 'Article',
                '@id': `${page.url}#article`,
                headline: page.heading,
                description: page.description,
                inLanguage: 'en',
                mainEntityOfPage: page.url,
                author: { '@id': `${SITE_ORIGIN}/#author` },
                publisher: { '@id': `${SITE_ORIGIN}/#organization` },
                dateModified: CONTENT_REVIEWED,
                isAccessibleForFree: true,
            },
            {
                '@type': 'FAQPage',
                '@id': `${page.url}#faq`,
                mainEntity: page.faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer },
                })),
            },
            breadcrumbs(page.path, page.heading),
        ],
    }

    return shell({ title: page.title, description: page.description, path: page.path, body, jsonLd })
}

export function renderHubPage(pages: AgePageModel[], bracketRows: HubBracketRow[]): string {
    const path = `${CLUSTER_BASE}/`
    const title = 'Baby sleep schedules by age — wake windows, naps & total sleep'
    const description =
        'Sample sleep schedules by age with clock times, wake window lengths, nap counts, and total '
        + 'sleep from cited guidance — then build your own in the free planner.'

    const bracketTable = bracketRows
        .map(
            (row) => `        <tr><th scope="row">${row.href ? `<a href="${row.href}">${escapeHtml(row.ageLabel)}</a>` : escapeHtml(row.ageLabel)}</th>`
                + `<td>${escapeHtml(row.wakeWindows)}</td><td>${escapeHtml(row.naps)}</td>`
                + `<td>${escapeHtml(row.daySleep)}</td><td>${escapeHtml(row.nightSleep)}</td></tr>`,
        )
        .join('\n')

    const spokeList = pages
        .map(
            (page) => `      <li><a href="${page.path}">${escapeHtml(page.heading)}</a> — ${page.napCount} naps,
        ${escapeHtml(page.napLength)} each, bedtime ${escapeHtml(page.rows[page.rows.length - 1].time)}</li>`,
        )
        .join('\n')

    const body = `    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Wake Windows</a> › Sleep schedules by age</nav>
    <h1>Baby sleep schedules by age</h1>
    <p class="lede">A sample day for each age, built from the same generator the planner uses and
      checked against published guidance. Every schedule is a shape to aim at, not a timetable —
      under about six months (corrected age) sleepy cues beat clock times every time.</p>

    <h2>Sample days</h2>
    <ul>
${spokeList}
    </ul>
    <p><a class="cta" href="/">Build your baby's schedule</a></p>

    <h2>Wake windows and sleep needs by age</h2>
    <div class="card scroll">
      <table>
        <thead><tr><th scope="col">Age</th><th scope="col">Wake windows</th><th scope="col">Naps</th>
          <th scope="col">Daytime sleep</th><th scope="col">Night sleep</th></tr></thead>
        <tbody>
${bracketTable}
        </tbody>
      </table>
    </div>
    <p>Ages without a linked page above are still covered by the planner: it matches your baby's
      corrected age to the bracket it falls in and checks your schedule against it.</p>

${sourcesBlock()}`

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            ...publisherNodes(),
            {
                '@type': 'CollectionPage',
                '@id': `${SITE_ORIGIN}${path}#webpage`,
                url: `${SITE_ORIGIN}${path}`,
                name: title,
                description,
                inLanguage: 'en',
                publisher: { '@id': `${SITE_ORIGIN}/#organization` },
                dateModified: CONTENT_REVIEWED,
                isAccessibleForFree: true,
                hasPart: pages.map((p) => ({ '@type': 'Article', '@id': `${p.url}#article`, url: p.url, headline: p.heading })),
            },
            breadcrumbs(path, 'Sleep schedules by age'),
        ],
    }

    return shell({ title, description, path, body, jsonLd })
}

export interface EmittedPage {
    /** Path relative to the build output root, e.g. 'sleep-schedule/4-month-old/index.html'. */
    fileName: string
    html: string
    /** Canonical path, for the sitemap. */
    path: string
}

/** Every static page this build emits, hub first. */
export function renderContentPages(pages: AgePageModel[], bracketRows: HubBracketRow[]): EmittedPage[] {
    return [
        {
            fileName: `${CLUSTER_BASE.replace(/^\//, '')}/index.html`,
            path: `${CLUSTER_BASE}/`,
            html: renderHubPage(pages, bracketRows),
        },
        ...pages.map((page) => ({
            fileName: `${CLUSTER_BASE.replace(/^\//, '')}/${page.slug}/index.html`,
            path: page.path,
            html: renderAgePage(page),
        })),
    ]
}

/** The sitemap, generated from the routes that actually exist (the old
 * public/sitemap.xml listed only `/` and had to be edited by hand). */
export function renderSitemap(paths: string[], lastmod: string = CONTENT_REVIEWED): string {
    const urls = ['/', ...paths]
        .map(
            (path) => `  <url>
    <loc>${SITE_ORIGIN}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
        )
        .join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}
