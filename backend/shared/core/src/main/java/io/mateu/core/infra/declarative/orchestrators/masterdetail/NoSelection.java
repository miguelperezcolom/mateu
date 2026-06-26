package io.mateu.core.infra.declarative.orchestrators.masterdetail;

/** What a {@link MasterDetailView} shows in the detail pane when no part has been selected yet. */
public enum NoSelection {
  /** Pre-select and show the first declared part. */
  FIRST,
  /** Show nothing but the button bar until the user picks a part. */
  EMPTY
}
