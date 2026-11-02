package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * How much of its own page chrome a {@link MicroFrontend} keeps when it is a block inside another
 * page. Any value makes it EMBEDDED: it never names the window, touches the address bar or the
 * favicon (the remote is not even asked to: its requests say so), and draws no breadcrumb of its
 * own. Not set (null) = a top-level micro frontend, as it always was.
 *
 * <ul>
 *   <li>{@link #NONE} — no page header either: no title, no header actions; only the content.
 *   <li>{@link #COMPACT} — the header keeps only its actions (the toolbar), without the title.
 *   <li>{@link #PAGE} — the header as it is (title, actions), without a breadcrumb.
 * </ul>
 */
@Experimental
public enum EmbeddedChrome {
  NONE,
  COMPACT,
  PAGE
}
