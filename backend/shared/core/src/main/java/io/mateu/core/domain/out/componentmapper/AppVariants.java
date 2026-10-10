package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.Actionable;
import java.util.Collection;
import java.util.List;

/**
 * Resolves {@link AppVariant#AUTO} for a shell that did not come from an annotated class — a {@code
 * type: AppShell} definition or a fluent {@code AppShell} — with the same rule an {@code
 * App}-annotated class gets ({@link AppMetadataExtractor#getVariant}). AUTO must never reach the
 * wire: no renderer draws it, so such a shell rendered as a blank page.
 */
public final class AppVariants {

  private AppVariants() {}

  public static AppVariant resolve(AppVariant declared, Collection<? extends Actionable> menu) {
    if (declared != null && declared != AppVariant.AUTO) {
      return declared;
    }
    return AppMetadataExtractor.getVariant(null, menu != null ? menu : List.of());
  }
}
