package io.mateu.uidl.data;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * What the visual editor changed about a screen's layout, expressed as a DELTA over the inferred
 * one rather than as a snapshot of the result.
 *
 * <p><b>Why this exists.</b> Today the editor writes a full {@code layout:} tree, and an explicit
 * layout takes a screen out of the inference regime for good — <i>explicit always wins</i>, by
 * design. The consequence is quiet and permanent: the moment someone drags one field, that screen
 * stops re-deriving. Add a field to the record and it does not appear; rename one and the layout
 * points at a ghost. That is the divergence that actually matters now — not stale data, which the
 * bundle already solved, but a layout that stopped following its model.
 *
 * <p><b>The shape of the fix.</b> A delta records the DECISIONS a human made — this field first,
 * that one hidden, this one wider — anchored to <b>stable field ids</b> rather than to positions in
 * a tree. Inference still runs on every request; the delta is re-applied on top. A field the model
 * grows is simply one the delta says nothing about, so it appears in its inferred place. A field
 * the model loses is a delta entry that no longer matches anything, and is ignored rather than
 * breaking the page.
 *
 * <p><b>What it deliberately cannot express.</b> Arbitrary restructuring. A delta says "these
 * fields, in this order, with these tweaks" — not "wrap these two in a card inside a tab".
 * Anchoring to ids is exactly what makes it survive model change, and a delta that could rebuild
 * the tree freely would be a snapshot wearing a different name.
 */
public record LayoutDelta(
    List<String> order, List<String> hidden, Map<String, FieldOverride> overrides) {

  /** Per-field tweaks a human made. Every member is optional; null means "leave as inferred". */
  public record FieldOverride(String label, Integer colspan, String section) {}

  public LayoutDelta {
    order = order == null ? List.of() : List.copyOf(order);
    hidden = hidden == null ? List.of() : List.copyOf(hidden);
    overrides = overrides == null ? Map.of() : Map.copyOf(overrides);
  }

  public static LayoutDelta empty() {
    return new LayoutDelta(List.of(), List.of(), Map.of());
  }

  public boolean isEmpty() {
    return order.isEmpty() && hidden.isEmpty() && overrides.isEmpty();
  }

  /**
   * The field ids to render, in order, given what inference produced.
   *
   * <p>The rule that makes this a delta and not a snapshot: <b>fields the delta does not mention
   * keep their inferred position</b>. Listed ones come first in the order the human chose; the rest
   * follow in the order inference gave them. So a field added to the model later appears — which is
   * precisely what a stored snapshot cannot do.
   */
  public List<String> applyTo(List<String> inferred) {
    var result = new ArrayList<String>();
    for (var id : order) {
      // A delta entry for a field the model no longer has is stale, not fatal: ignore it.
      if (inferred.contains(id) && !hidden.contains(id) && !result.contains(id)) {
        result.add(id);
      }
    }
    for (var id : inferred) {
      if (!hidden.contains(id) && !result.contains(id)) {
        result.add(id);
      }
    }
    return result;
  }

  /** The override for a field, or an empty one — so callers never branch on null. */
  public FieldOverride overrideFor(String fieldId) {
    return overrides.getOrDefault(fieldId, new FieldOverride(null, null, null));
  }

  /**
   * The delta that turns {@code inferred} into {@code desired} — what the editor should SAVE after
   * a human rearranges a screen, instead of the whole tree.
   *
   * <p>It records only what differs: a screen dragged into exactly its inferred order produces an
   * empty delta, and therefore keeps re-deriving. That is the property to preserve — using the
   * editor at all should not, by itself, freeze a screen.
   */
  public static LayoutDelta between(List<String> inferred, List<String> desired) {
    var hidden = new ArrayList<String>();
    for (var id : inferred) {
      if (!desired.contains(id)) {
        hidden.add(id);
      }
    }
    var visibleInferred = new ArrayList<>(inferred);
    visibleInferred.removeAll(hidden);
    // Only record an order when it actually differs from what inference already gives.
    var order = visibleInferred.equals(desired) ? List.<String>of() : List.copyOf(desired);
    return new LayoutDelta(order, hidden, new LinkedHashMap<>());
  }
}
