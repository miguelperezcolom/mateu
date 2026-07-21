package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.AutoLayout;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Toc;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Deterministic layout inference: picks the UX pattern (flat form, folded optionals, tabs…) from
 * the amount and structure of the declared information, so a class annotated {@link AutoLayout}
 * only has to declare its data. Explicit layout annotations always win — inference only fills the
 * gaps the developer left open.
 *
 * <p>All decisions are based on the declared structure (never on runtime data), so the same class
 * always renders the same way. They are threshold-based, though: adding or removing a field CAN
 * flip the inferred layout when the class crosses a threshold. To make that evolution visible
 * instead of surprising, a class sitting within {@link #THRESHOLD_PROXIMITY_MARGIN} weight units
 * (or one section) of a threshold logs a one-time warning suggesting the developer pin the layout
 * with explicit annotations if stability matters. This class is the reference decision table: the
 * C# and Python backends port these exact rules and thresholds so the wire JSON stays identical
 * across server implementations (the proximity warning is a log, not wire-visible, so it does not
 * affect parity).
 */
@Slf4j
public final class LayoutInference {

  /** Enums with up to this many constants render as radio buttons instead of a dropdown. */
  public static final int RADIO_MAX_OPTIONS = 4;

  /** Estimated weight (in standard field-row units) a form must exceed to fold its optionals. */
  public static final int FOLD_WEIGHT_THRESHOLD = 16;

  /** Minimum number of optional fields worth folding into a "More options" panel. */
  public static final int FOLD_MIN_OPTIONAL = 4;

  /** Minimum number of sections before a read-only view is presented as tabs. */
  public static final int TABS_MIN_SECTIONS = 5;

  /** Estimated total weight the sections must exceed before switching to tabs. */
  public static final int TABS_WEIGHT_THRESHOLD = 30;

  /** Label of the collapsed panel hosting the folded optional fields. */
  public static final String MORE_OPTIONS_LABEL = "More options";

  /**
   * Distance (in weight units) to a weight threshold below which a one-time warning is logged: the
   * class is close enough that adding or removing a single field could flip the inferred layout.
   */
  public static final int THRESHOLD_PROXIMITY_MARGIN = 2;

  /** One warning per (class, rule): layout stability advice, not a per-request event. */
  private static final Set<String> PROXIMITY_WARNED = ConcurrentHashMap.newKeySet();

  /**
   * Whether inference applies to the type: {@code @AutoLayout} decides when present (composable,
   * meta-aware), otherwise the {@code mateu.layout.inference} system property enables it globally.
   */
  public static boolean enabled(Class<?> type) {
    if (type == null) {
      return false;
    }
    if (MetaAnnotations.isPresent(type, AutoLayout.class)) {
      return MetaAnnotations.find(type, AutoLayout.class).value();
    }
    return Boolean.getBoolean("mateu.layout.inference");
  }

  /**
   * Estimated visual weight of a field in standard field-row units (1 = one regular input). The
   * unit every threshold is measured in: a textarea or a nested grid "costs" several regular
   * inputs, so thresholds hold across very different field mixes.
   */
  public static int estimatedWeight(Field field) {
    var stereotype = FieldTypeMapper.getStereotype(field);
    var dataType = FieldTypeMapper.getDataType(field);
    return switch (stereotype) {
      case textarea, richText, html, markdown, image, uploadableImage -> 4;
      case grid -> 6;
      case radio, checkbox -> 2;
      default -> {
        if (dataType == FieldDataType.array || dataType == FieldDataType.component) {
          yield 6;
        }
        yield 1;
      }
    };
  }

  /** Sum of the estimated weights of a group of fields. */
  public static int estimatedWeight(List<Field> fields) {
    return fields.stream().mapToInt(LayoutInference::estimatedWeight).sum();
  }

  /** The split the fold-optionals rule produces: required stays visible, optional folds away. */
  public record FoldPlan(List<Field> main, List<Field> folded) {}

  /**
   * Fold-optionals rule: on an editable form where the developer declared no grouping at all (one
   * synthetic section, no tabs) and the estimated weight exceeds one screen, keep the required
   * fields visible and fold the optional ones into a collapsed "More options" panel. Empty when the
   * rule does not apply.
   */
  static Optional<FoldPlan> foldPlan(
      Class<?> type,
      io.mateu.uidl.annotations.Section section,
      List<Field> fields,
      Object instance,
      HttpRequest httpRequest,
      boolean readOnly,
      boolean forCreationForm) {
    if (!enabled(type) || readOnly) {
      return Optional.empty();
    }
    // Only when the developer declared no grouping: a single synthetic (unnamed) section...
    if (section.value() != null && !section.value().isEmpty()) {
      return Optional.empty();
    }
    // ...and no tabs, embedded views or compositions (their layout is not ours to rearrange).
    if (fields.stream()
        .anyMatch(
            field ->
                MetaAnnotations.isPresent(field, Tab.class)
                    || MetaAnnotations.isPresent(field, Inline.class)
                    || MetaAnnotations.isPresent(field, Composition.class)
                    || FieldTypeMapper.getDataType(field) == FieldDataType.component)) {
      return Optional.empty();
    }
    int weight = estimatedWeight(fields);
    warnIfNearThreshold(type, "fold-optionals", "weight", weight, FOLD_WEIGHT_THRESHOLD);
    if (weight <= FOLD_WEIGHT_THRESHOLD) {
      return Optional.empty();
    }
    var main = new ArrayList<Field>();
    var folded = new ArrayList<Field>();
    for (Field field : fields) {
      if (FieldMetadataExtractor.isRequired(field, instance, httpRequest)) {
        main.add(field);
      } else {
        folded.add(field);
      }
    }
    if (main.isEmpty() || folded.size() < FOLD_MIN_OPTIONAL) {
      return Optional.empty();
    }
    return Optional.of(new FoldPlan(main, folded));
  }

  /**
   * Sections-to-tabs rule: a read-only view with many substantial sections reads better with random
   * access (tabs) than as a long vertical stack — and unlike an editable form, hiding groups cannot
   * hide invalid required fields. Sticky sections or an explicit {@code @Toc} mean the developer
   * chose the scroll layout, so they disable the rule ({@code @Zones} and {@code @FoldedLayout} are
   * checked by the caller before this).
   */
  static boolean preferTabs(
      Class<?> type,
      List<io.mateu.uidl.annotations.Section> sections,
      Map<io.mateu.uidl.annotations.Section, PageFormBuilder.SectionFields> fieldsPerSection,
      boolean readOnly) {
    if (!enabled(type)) {
      return false;
    }
    if (!readOnly && !MetaAnnotations.isPresent(type, ReadOnly.class)) {
      return false;
    }
    if (sections.stream().anyMatch(io.mateu.uidl.annotations.Section::sticky)) {
      return false;
    }
    if (MetaAnnotations.isPresent(type, Toc.class)) {
      return false;
    }
    int totalWeight =
        fieldsPerSection.values().stream()
            .mapToInt(sectionFields -> estimatedWeight(sectionFields.fields()))
            .sum();
    if (sections.size() < TABS_MIN_SECTIONS) {
      // One section short of the tabs rule while heavy enough: the next @Section flips the layout.
      if (sections.size() == TABS_MIN_SECTIONS - 1 && totalWeight >= TABS_WEIGHT_THRESHOLD) {
        warnOnce(
            type,
            "sections-to-tabs",
            "one @Section short of the "
                + TABS_MIN_SECTIONS
                + "-section threshold — adding a section will turn this view into tabs");
      }
      return false;
    }
    warnIfNearThreshold(type, "sections-to-tabs", "weight", totalWeight, TABS_WEIGHT_THRESHOLD);
    return totalWeight >= TABS_WEIGHT_THRESHOLD;
  }

  /**
   * Layout-stability advice: when an {@code @AutoLayout} class sits within {@link
   * #THRESHOLD_PROXIMITY_MARGIN} units of a rule threshold (either side), adding or removing a
   * single field could flip the inferred layout on the next release. Logged once per (class, rule)
   * so teams that care about layout stability can pin the layout with explicit annotations.
   */
  static boolean warnIfNearThreshold(
      Class<?> type, String rule, String metric, int value, int threshold) {
    if (Math.abs(value - threshold) > THRESHOLD_PROXIMITY_MARGIN) {
      return false;
    }
    return warnOnce(
        type,
        rule,
        metric
            + " "
            + value
            + " is within "
            + THRESHOLD_PROXIMITY_MARGIN
            + " units of the threshold ("
            + threshold
            + ") — adding or removing a field may flip the inferred layout");
  }

  private static boolean warnOnce(Class<?> type, String rule, String detail) {
    if (!PROXIMITY_WARNED.add(type.getName() + "|" + rule)) {
      return false;
    }
    log.warn(
        "@AutoLayout stability: {} is close to the '{}' threshold: {}. "
            + "Pin the layout with explicit annotations (@Section, @Tab, @FoldedLayout…) "
            + "if it must not change as the model evolves.",
        type.getName(),
        rule,
        detail);
    return true;
  }

  /**
   * Small-enum rule: with up to {@link #RADIO_MAX_OPTIONS} constants, radio buttons expose every
   * option at a glance for the cost of one extra row; beyond that a dropdown is denser.
   */
  static boolean preferRadio(Field field) {
    return enabled(field.getDeclaringClass())
        && field.getType().isEnum()
        && field.getType().getEnumConstants().length <= RADIO_MAX_OPTIONS;
  }

  private LayoutInference() {}
}
