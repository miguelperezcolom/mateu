package io.mateu.sample1.app;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Host form that embeds {@link EmbeddedDataView} as an {@code @Inline} mediator field. Used by e2e
 * tests to verify that the {@code _inline=1} marker is appended to the embedded route, the
 * embedded view drops its own page chrome, and the host @Section title row is suppressed.
 */
@UI("/inline-host")
@Title("Inline Host")
public class InlineHostForm {

  // Plain hidden field so FormDetector.isForm() recognises this class as a form. Without at least
  // one non-orchestrator field, isForm() returns false (all orchestrator/ComponentTreeSupplier
  // fields are excluded) and the page renders empty.
  @Hidden String _id;

  @Section("Personal")
  @Label("")
  @Inline
  EmbeddedDataView embedded;

  // Second section forces SectionFormRenderer.renderSections() (multi-section path) — that's where
  // the per-section title row is built, and where hostsInlineEmbeddedMediator hides the "Personal"
  // title row.
  @Section("Notes")
  @Label("Comments")
  String comments;
}
