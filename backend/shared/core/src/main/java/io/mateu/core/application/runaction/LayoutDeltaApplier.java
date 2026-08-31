package io.mateu.core.application.runaction;

import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.LayoutDelta;
import io.mateu.uidl.fluent.Component;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

/**
 * Re-applies a page's {@code layoutDelta:} on top of whatever inference just produced.
 *
 * <p>This is the half that makes the delta worth writing. A {@code layout:} is a snapshot and takes
 * a screen out of inference for good; a delta is meant to be re-applied on <b>every</b> request to
 * the freshly inferred tree, so a field the model grows later still appears, in its inferred place,
 * and a field it loses is a delta entry that simply matches nothing.
 *
 * <p><b>What the three parts mean against a real tree.</b> A delta speaks about fields by id, and
 * an inferred tree may spread those fields over sections, tabs or rows. So:
 *
 * <ul>
 *   <li><b>hidden</b> removes that field wherever it sits.
 *   <li><b>overrides</b> apply to the field wherever it sits.
 *   <li><b>order</b> reorders the fields <i>within each container that holds them</i>, leaving
 *       non-field siblings in their slots. A delta cannot move a field between containers — the
 *       same limit that keeps it a delta rather than a snapshot with extra steps.
 * </ul>
 *
 * <p>The visual editor only records a delta for a flat run of fields, so for everything it writes
 * the three rules collapse to the obvious reading. The rules above are what happens when a delta
 * written by hand meets a richer inferred tree.
 */
@Slf4j
public final class LayoutDeltaApplier {

  private LayoutDeltaApplier() {}

  /**
   * The tree with the delta applied; the same instance when the delta is empty or changes nothing.
   */
  public static Component apply(Component tree, LayoutDelta delta) {
    if (tree == null || delta == null || delta.isEmpty()) {
      return tree;
    }
    try {
      return rewrite(tree, delta);
    } catch (Exception e) {
      // A page that renders its inferred layout beats a page that does not render.
      log.error("Could not apply the layout delta; rendering the inferred layout", e);
      return tree;
    }
  }

  private static Component rewrite(Component component, LayoutDelta delta) {
    var overridden = applyOverride(component, delta);
    return ComponentRecords.rewrite(
        overridden,
        value -> {
          if (value instanceof Component child) {
            var rewritten = rewrite(child, delta);
            return rewritten == child ? value : rewritten;
          }
          if (!ComponentRecords.isComponentList(value)) {
            return value;
          }
          var children = ComponentRecords.componentsOf(value);
          var rewrittenChildren = new ArrayList<Component>(children.size());
          var changed = false;
          for (var child : children) {
            if (child instanceof FormField field && delta.hidden().contains(field.id())) {
              changed = true;
              continue;
            }
            var rewritten = rewrite(child, delta);
            changed |= rewritten != child;
            rewrittenChildren.add(rewritten);
          }
          var ordered = reorderFields(rewrittenChildren, delta.order());
          if (ordered != null) {
            rewrittenChildren = ordered;
            changed = true;
          }
          return changed ? List.copyOf(rewrittenChildren) : value;
        });
  }

  /**
   * The same children with the {@link FormField}s among them rearranged, or null when the order
   * already matches.
   *
   * <p>Only the field slots move: a {@code Text} or a nested layout between two fields stays where
   * the author of the inferred tree put it. Fields the delta does not mention keep their relative
   * inferred position, which is the rule that lets a newly grown field appear at all.
   */
  private static ArrayList<Component> reorderFields(List<Component> children, List<String> order) {
    if (order.isEmpty()) {
      return null;
    }
    var slots = new ArrayList<Integer>();
    var fields = new ArrayList<FormField>();
    for (var i = 0; i < children.size(); i++) {
      if (children.get(i) instanceof FormField field) {
        slots.add(i);
        fields.add(field);
      }
    }
    if (fields.size() < 2) {
      return null;
    }
    var rearranged = new ArrayList<FormField>(fields.size());
    for (var id : order) {
      fields.stream()
          .filter(field -> id != null && id.equals(field.id()))
          .filter(field -> !rearranged.contains(field))
          .findFirst()
          .ifPresent(rearranged::add);
    }
    for (var field : fields) {
      if (!rearranged.contains(field)) {
        rearranged.add(field);
      }
    }
    if (rearranged.equals(fields)) {
      return null;
    }
    var result = new ArrayList<>(children);
    for (var i = 0; i < slots.size(); i++) {
      result.set(slots.get(i), rearranged.get(i));
    }
    return result;
  }

  private static Component applyOverride(Component component, LayoutDelta delta) {
    if (!(component instanceof FormField field) || field.id() == null) {
      return component;
    }
    var override = delta.overrideFor(field.id());
    if (override.label() == null && override.colspan() == null) {
      return component;
    }
    var builder = field.toBuilder();
    if (override.label() != null) {
      builder.label(override.label());
    }
    if (override.colspan() != null) {
      builder.colspan(override.colspan());
    }
    return builder.build();
  }
}
