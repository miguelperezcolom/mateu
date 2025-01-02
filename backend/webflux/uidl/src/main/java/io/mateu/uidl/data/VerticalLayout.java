package io.mateu.uidl.data;

public record VerticalLayout(LayoutDistribution distribution, Object... items) {

  public VerticalLayout(Object... items) {
    this(null, items);
  }
}
