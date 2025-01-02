package io.mateu.uidl.data;

public record TabLayout(TabTitles titles, Object... items) {

  public TabLayout(Object... items) {
    this(null, items);
  }
}
