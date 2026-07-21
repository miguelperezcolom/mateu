package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.AutoPage;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ListingBackend;

/**
 * Fase 1 of page-level inference (see {@code design/page-level-inference-plan.md}): under the
 * explicit {@link AutoPage} opt-in (or the global {@code mateu.layout.inference} property), the
 * structural signals stop advising ({@code ArchetypeAdvisor}) and start <b>composing</b> — the
 * mapper substitutes the plain instance with the matching archetype bridge at mapping time. Rules
 * are deterministic and structure-based, like {@code LayoutInference}; explicit always wins:
 * archetype subclasses, fluent component trees and listing backends are never rewritten.
 *
 * <p>Only fully-derivable archetypes compose. The dashboard rule is derivable because the {@code
 * Dashboard} archetype's own contract is exactly the declared fields; archetypes that require
 * suppliers the class does not declare (e.g. {@code CollectionDetail}'s id/title functions) stay
 * advisory.
 */
public final class PageInference {

  /**
   * Whether page inference applies to the type: {@code @AutoPage} decides when present (composable,
   * meta-aware), otherwise the {@code mateu.layout.inference} system property enables it globally.
   */
  public static boolean enabled(Class<?> type) {
    if (type == null) {
      return false;
    }
    if (MetaAnnotations.isPresent(type, AutoPage.class)) {
      return MetaAnnotations.find(type, AutoPage.class).value();
    }
    return Boolean.getBoolean("mateu.layout.inference");
  }

  /**
   * Dashboard rule: an enabled plain class (not an archetype, fluent tree, crud or listing)
   * declaring at least one {@link MetricCard} field composes the {@code Dashboard} archetype.
   */
  public static boolean composesDashboard(Class<?> type) {
    if (!enabled(type)) {
      return false;
    }
    if (Component.class.isAssignableFrom(type) // covers ComponentTreeSupplier and fluent trees
        || Crud.class.isAssignableFrom(type)
        || ListingBackend.class.isAssignableFrom(type)) {
      return false;
    }
    return getAllFields(type).stream().anyMatch(field -> MetricCard.class.equals(field.getType()));
  }

  private PageInference() {}
}
