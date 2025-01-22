package io.mateu.uidl.data;

public record HorizontalLayout(LayoutDistribution distribution, Object... items) {

  public HorizontalLayout(Object... items) {
    this(null, items);
  }
}
