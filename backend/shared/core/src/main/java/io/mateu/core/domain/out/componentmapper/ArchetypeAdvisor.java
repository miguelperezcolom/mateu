package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.core.infra.reflection.read.HolderFieldChecker;
import io.mateu.uidl.annotations.OnRowSelected;
import io.mateu.uidl.data.MetricCard;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Fase 0 of page-level inference (see {@code design/page-level-inference-plan.md}): when a plain
 * reflected form structurally resembles an archetype, log a one-time hint naming the archetype —
 * advice only, never a behavior change. The signals are deliberately conservative so the hint is
 * trustworthy; an explicit {@code @PageTemplate} silences it upstream ({@link PageTypeResolver}
 * returns before consulting this class), and archetype subclasses never reach the shape fallback.
 */
@Slf4j
public final class ArchetypeAdvisor {

  /** One hint per class per JVM: scaffolding advice, not a per-request event. */
  private static final Set<String> ADVISED = ConcurrentHashMap.newKeySet();

  /**
   * Inspect a plain form class and log the archetype hint when a signal matches. Called from {@link
   * PageTypeResolver#resolve} on the shape-fallback branches only.
   */
  public static void advise(Class<?> type) {
    if (PageInference.composes(type)) {
      // Inference already composes the archetype for this class — nothing to advise.
      return;
    }
    adviceFor(type)
        .ifPresent(
            advice -> {
              if (ADVISED.add(type.getName())) {
                log.info(
                    "Archetype advice: {} {} Extending the archetype gives you the full page "
                        + "template; @PageTemplate(...) on the class silences this hint.",
                    type.getName(),
                    advice);
              }
            });
  }

  /** The matching hint, if any — package-visible for tests. */
  static Optional<String> adviceFor(Class<?> type) {
    var fields = getAllFields(type);
    long metricCards =
        fields.stream().filter(field -> MetricCard.class.equals(field.getType())).count();
    if (metricCards >= 1) {
      return Optional.of(
          "declares "
              + metricCards
              + " MetricCard field(s) but renders as a plain form — it looks like a Dashboard "
              + "(KPI band + panel grid, see /ux-patterns/dashboard).");
    }
    boolean selectableList =
        fields.stream()
            .anyMatch(
                field ->
                    List.class.isAssignableFrom(field.getType())
                        && MetaAnnotations.isPresent(field, OnRowSelected.class));
    boolean holderPane = fields.stream().anyMatch(HolderFieldChecker::isNonDataHolder);
    if (selectableList && holderPane) {
      return Optional.of(
          "declares a selectable list (@OnRowSelected) next to a component pane — it looks like "
              + "a CollectionDetail (list + detail with selection wired, "
              + "see /ux-patterns/collection-detail).");
    }
    return Optional.empty();
  }

  private ArchetypeAdvisor() {}
}
