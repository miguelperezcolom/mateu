package io.mateu.sample1.app;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Host form that embeds {@link EmbeddedDataView} as a mediator field <strong>without</strong>
 * {@code @Inline}. Counterpart of {@link InlineHostForm} for e2e tests — confirms the absence of
 * the {@code _inline} marker and the default chrome behavior.
 */
@UI("/non-inline-host")
@Title("Non Inline Host")
public class NonInlineHostForm {

  // See InlineHostForm — needed so FormDetector.isForm() returns true.
  @Hidden String _id;

  @Section("Personal")
  @Label("")
  EmbeddedDataView embedded;

  @Section("Notes")
  @Label("Comments")
  String comments;
}
