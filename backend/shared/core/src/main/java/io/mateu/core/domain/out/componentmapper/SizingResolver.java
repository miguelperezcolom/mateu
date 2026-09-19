package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Size;

/**
 * Resolves an explicit {@code @Size} (coherence-plan #8) to its wire sizing string — "hug" | "fill"
 * | "fixed:&lt;len&gt;". {@code null} means "no explicit opinion" (the mapper keeps whatever it
 * inferred, e.g. a listing's "fill"). Read through {@code MetaAnnotations} so a composed (semantic)
 * annotation carrying {@code @Size} is honored too.
 */
public final class SizingResolver {

  private SizingResolver() {}

  /** The wire sizing string for the element's {@code @Size}, or {@code null} when absent. */
  public static String wireSizing(java.lang.reflect.AnnotatedElement element) {
    var size = MetaAnnotations.find(element, Size.class);
    if (size == null) {
      return null;
    }
    return toWire(size);
  }

  private static String toWire(Size size) {
    return switch (size.value()) {
      case hug -> "hug";
      case fill -> "fill";
      case fixed -> "fixed:" + size.length();
    };
  }
}
