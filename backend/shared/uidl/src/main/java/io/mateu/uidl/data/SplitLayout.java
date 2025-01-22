package io.mateu.uidl.data;

public record SplitLayout(LayoutDistribution distribution, Object... items) {

  public SplitLayout(Object... items) {
    this(null, items);
  }
}
