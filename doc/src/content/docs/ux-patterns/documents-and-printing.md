---
title: Documents and printing
description: Return an invoice, a registration card or a report from an action — shown in a new tab, downloaded or printed — render it from HTML to PDF, and print the current page without the app chrome.
---

**Status:** 🧪 Experimental (`@Experimental`, documents API 2026-10)

## Intent

Business apps produce *documents*: the folio a guest signs, an invoice, a registration card, a
monthly report. Not "export this listing" — a document the screen builds, that the user previews,
prints or keeps. Mateu gives you three small pieces for it:

1. an action returns a **`Document`** and the client shows it, downloads it or prints it;
2. **`UICommand.print()`** prints the current page, without menus, toolbars or buttons;
3. an optional **`DocumentRenderer`** (module `mateu-documents`) turns HTML into a PDF.

## Returning a document from an action

```java
@UI("/folio/:id")
public class FolioPage {

  // the DocumentRenderer bean (mateu-documents registers one)
  DocumentRenderer renderer = MateuBeanProvider.getBean(DocumentRenderer.class);

  @Toolbar @Label("View invoice")
  Document invoice() {
    return Document.pdf("invoice-" + id + ".pdf", renderer.render(html()));   // opens in a new tab
  }

  @Toolbar @Label("Download")
  Document download() {
    return Document.attachment("bookings.csv", "text/csv", csvBytes());       // the browser saves it
  }

  @Toolbar @Label("Print folio")
  Document print() {
    return Document.pdf("folio.pdf", renderer.render(html())).printed();     // straight to the print dialog
  }
}
```

| Factory / wither | What the user gets |
|---|---|
| `Document.pdf(name, bytes)` / `Document.inline(name, type, bytes)` | A new tab with the browser's viewer (a PDF previews inline). |
| `Document.attachment(name, type, bytes)` / `.downloaded()` | A download, saved under `name`. |
| `.printed()` | The document is loaded in a hidden frame and the print dialog opens for it — no tab. |
| `Document.lazy(name, type, () -> bytes)` | The bytes are produced **when the browser fetches them**, not while the action runs. Downloaded by default; `.showInline()` to preview. |

A `Document` can also travel in a list with other results — `List.of(new Message("Invoice ready"), document)`.

`DocumentRenderer`, `Document` and `PageSetup` are in `io.mateu:uidl`, so a framework-agnostic UI
module can declare them; only the implementation (`mateu-documents`) is optional.

## How the bytes travel

| Document | Transport |
|---|---|
| up to **256 KB** (JVM system property `mateu.documents.inline-max-bytes`; `DocumentStore.InlineMaxBytes` in C#, `documents.inline_max_bytes` in Python) | Inline, base64, inside the action response — one round trip, nothing kept on the server. |
| larger, or **lazy** | Parked on the server; the response carries a URL, `<baseUrl>/mateu/v3/documents/<token>`, that the browser fetches **once**. |

Why both: base64 inflates the bytes by a third and the whole response is held in memory on both
sides, which is fine for a 40 KB invoice and wrong for a 30 MB report. A URL also lets the browser
stream the file into its PDF viewer or its download manager.

The download URL is a **capability**, not a session endpoint: a new tab or an `<a download>` cannot
carry the bearer token the API calls carry. So the token is 256 random bits, minted only inside the
response to an action the user was allowed to run, **single-use**, and valid for **5 minutes**
(system property `mateu.documents.ttl-seconds`). An unknown, spent or expired token answers `404`. The response is
`Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and an HTML/SVG/XML document shown
inline is served with `Content-Security-Policy: sandbox`, so a document built from user data cannot
run script on your origin. The file name reaches `Content-Disposition` sanitised (no CR/LF, quotes
or path; the exact name as RFC 5987 `filename*`).

The endpoint exists on every adapter — Spring MVC, WebFlux, Micronaut, Quarkus, Helidon MP — and on
the ASP.NET Core and FastAPI ports. On Spring it is a filter ordered **before** Spring Security, for
the reason above; if a gateway in front of the app requires authentication on every path, let
`/**/mateu/v3/documents/*` through.

:::caution[Several instances]
Parked documents live in memory, per JVM / process. Behind a load balancer use sticky sessions, or
install a shared store with `DocumentStore.useShared(...)` (Java). Documents that fit inline are
unaffected.
:::

## Printing the current page

```java
@Toolbar @Label("Print")
UICommand print() {
  return UICommand.print();
}
```

The client opens the browser's print dialog with a print stylesheet that leaves out the app
chrome: navigation, header, menus, buttons, floating buttons, overlays, notifications. The same
stylesheet applies to the browser's own **Ctrl+P**. Long scrolling areas print in full.

- Mark anything else to leave out with the class `mateu-no-print` or `data-mateu-print="hide"`.
- Keep a button on paper with `data-mateu-print="show"`.

For a printout with its own layout (letterhead, totals, page numbers), return a `Document.printed()`
instead — the page and the paper rarely want the same layout.

## Rendering a PDF from HTML (`mateu-documents`)

```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>mateu-documents</artifactId>
</dependency>
```

It registers a `DocumentRenderer` bean (`PdfBoxDocumentRenderer`). It is **engine-agnostic on the
way in**: render your template with whatever the app already uses — Thymeleaf, FreeMarker, Mustache,
a Java text block — and hand over the HTML string.

```java
byte[] pdf = renderer.render(html,
    PageSetup.a4()                          // or PageSetup.letter()
        .withLandscape(false)
        .withMarginMm(18)
        .withTitle("Invoice 2026-0042")
        .withHeader("ACME Hotels||{title}")   // left | centre | right
        .withFooter("||{page} / {pages}"));   // the default footer
```

It is **not a browser**. It lays out the subset business documents use:

- headings `h1`–`h6`, paragraphs, `div`/`section`, `br`, `b`/`strong`, `i`/`em`, `blockquote`, `pre`;
- `ul`/`ol` lists;
- tables — column widths in `%` (`width="60%"` or `style="width: 60%"`), `colspan`, header rows
  (`thead` or rows of `th`) **repeated on every page**, `align`/`text-align` per cell;
- `hr`, page breaks (`style="page-break-before: always"`);
- images embedded as `data:` URIs (PNG/JPEG). Remote URLs are **never fetched** (a renderer that
  fetched them would let a template reach your internal network).

Other CSS is ignored. The font is **embedded**: Liberation Sans (it ships inside PDFBox, SIL OFL),
with a synthesised bold; pass your own TTFs for a brand font or a real bold face —
`new PdfBoxDocumentRenderer(() -> open("Brand-Regular.ttf"), () -> open("Brand-Bold.ttf"))`. A
character the font has no glyph for prints as `?`.

### Plugging in another engine

Register your own `DocumentRenderer` bean and every screen uses it unchanged. Candidates, with
their licences — Mateu bundles only permissive ones:

| Engine | Licence | Notes |
|---|---|---|
| Apache PDFBox + jsoup (the built-in) | Apache-2.0 / MIT | The subset above. |
| A headless Chromium (Playwright for Java, Apache-2.0) | Apache-2.0 (+ the browser) | Full CSS; heavy: a browser per server. |
| openhtmltopdf | LGPL-2.1 | Good CSS 2.1 + paged media. Not bundled: LGPL. |
| OpenPDF | LGPL-2.1 / MPL-2.0 | A PDF library, not an HTML engine. Not bundled. |
| iText 7 | AGPL-3.0 / commercial | Not suitable for an Apache-2.0 app without a commercial licence. |

## On every renderer

| Renderer | Inline document | Attachment | `printed()` | `UICommand.print()` |
|---|---|---|---|---|
| Vaadin (web) | New tab (if a popup blocker refuses it: downloaded instead) | Download | Hidden frame + print dialog | Print stylesheet + dialog |
| Redwood (VB) | New tab (same fallback) | Download | Hidden frame + print dialog | Print stylesheet + dialog |
| React Native | URL: system browser sheet (preview, share, print). Bytes: share sheet (iOS) / the app that opens the type (Android) | Same | Same as inline — print from the sheet | Not available on mobile: announced to the user |
| IntelliJ | Temp file opened with the OS viewer | Save dialog | The OS print service for the type, else opened | The rendered panel through the system print dialog |

The ports: return a `Document` from an action in **C#** (`Document.Pdf(...)`, `Document.Lazy(...)`,
`.Printed()`, `UICommandDto.Print()`) and **Python** (`Document.pdf(...)`, `Document.lazy(...)`,
`.printed()`, `UICommand.print()`). The same wire, the same endpoint (`app.MapMateu(...)` /
`add_mateu(...)` add it); neither ships an HTML-to-PDF renderer — use any library and return the
bytes.

## Demo

`demo/demo-admin-panel` → `/documents-demo`: an invoice previewed, downloaded and printed, a large
report fetched by URL, and the page printed without chrome.
