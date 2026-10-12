package io.mateu.core.domain.out.componentmapper;

/**
 * A view whose page type is DECLARED by data rather than by a class annotation — a YAML-authored
 * page's {@code pageType:}. {@link PageTypeResolver} honours it with the same precedence as
 * {@code @PageTemplate}: a declared value wins over the shape inference; {@code null} leaves
 * inference alone.
 */
public interface DeclaredPageType {

  /** The declared wire name ({@code landing}|{@code collection}|…), or {@code null} for none. */
  String declaredPageType();
}
