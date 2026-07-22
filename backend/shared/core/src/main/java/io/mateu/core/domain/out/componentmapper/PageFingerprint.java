package io.mateu.core.domain.out.componentmapper;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Stable, one-line fingerprint of the page-level decisions Mateu takes for a view class — the CI
 * primitive of the layout-diff tooling (fase 2 of {@code design/page-level-inference-plan.md}). Pin
 * the fingerprints of your screens in a golden test; when a model change flips an inferred decision
 * (a form crossing into a composed archetype, a page-type change), the test fails and the flip
 * becomes a reviewed decision instead of a surprise. Complements the runtime proximity warnings of
 * {@code LayoutInference}.
 */
public final class PageFingerprint {

  /** E.g. {@code "pageType=dashboard composes=dashboard"}. Deterministic per class. */
  public static String of(Class<?> type) {
    String composes =
        PageInference.composesDashboard(type)
            ? "dashboard"
            : PageInference.composesWelcome(type) ? "welcome" : "none";
    return "pageType=" + PageTypeResolver.wirePageType(type) + " composes=" + composes;
  }

  /** Fingerprints for a set of classes, keyed by class name — ready to snapshot as one string. */
  public static Map<String, String> of(Collection<Class<?>> types) {
    var fingerprints = new LinkedHashMap<String, String>();
    types.stream()
        .sorted((a, b) -> a.getName().compareTo(b.getName()))
        .forEach(type -> fingerprints.put(type.getName(), of(type)));
    return fingerprints;
  }

  private PageFingerprint() {}
}
