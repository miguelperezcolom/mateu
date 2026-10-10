package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * What the client does with a {@link Document}: show it ({@code inline} — a PDF opens in a new tab
 * with the browser's viewer) or save it ({@code attachment} — the browser downloads it).
 */
@Experimental("documents API, 2026-10")
public enum DocumentDisposition {
  inline,
  attachment
}
