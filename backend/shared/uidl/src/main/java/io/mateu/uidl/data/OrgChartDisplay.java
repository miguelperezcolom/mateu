package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * How an {@link OrgChart} is presented:
 *
 * <ul>
 *   <li>{@code tree} — the whole hierarchy at once, top-down, its nodes connected by lines;
 *   <li>{@code focus} — one node in focus (the chart's {@code focus}, else the root) with its chain
 *       of ancestors above it and its children below; picking an ancestor or a child moves the
 *       focus there, so a large organisation reads one level at a time (Redwood's hierarchy
 *       viewer).
 * </ul>
 *
 * The Redwood renderer always presents the chart in focus: Spectra's org chart is its hierarchy
 * viewer, and it has no tree.
 */
@Experimental("org chart in focus (3.0-beta.38)")
public enum OrgChartDisplay {
  tree,
  focus
}
