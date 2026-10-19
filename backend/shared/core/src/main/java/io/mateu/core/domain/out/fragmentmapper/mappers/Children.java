package io.mateu.core.domain.out.fragmentmapper.mappers;

import java.util.List;

/**
 * A component's child list as the mappers read it: an absent list ({@code type: VerticalLayout}
 * with no {@code content:} in YAML, or a fluent record built with null) is an EMPTY one — an empty
 * container renders as an empty container, never a NullPointerException; likewise an absent single
 * child is an empty slot.
 */
public final class Children {

  private Children() {}

  public static <T> List<T> orEmpty(List<T> children) {
    return children == null ? List.of() : children;
  }

  /** A single-child slot: an absent child is an empty one (an empty {@code Div}). */
  public static io.mateu.uidl.fluent.Component orEmptySlot(io.mateu.uidl.fluent.Component child) {
    return child == null ? new io.mateu.uidl.data.Div(List.of()) : child;
  }
}
