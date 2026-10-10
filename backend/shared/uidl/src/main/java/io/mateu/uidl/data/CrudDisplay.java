package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * The built-in affordances of a {@code Crud} (the Redwood collection-container and
 * create-edit-drawer {@code displayOptions}), on top of the capability gates ({@code canCreate} /
 * {@code canDelete} and the {@code @Not*} annotations, which still decide whether an affordance
 * EXISTS):
 *
 * <ul>
 *   <li>{@code create} — the New button; {@code disabled} shows it inert (e.g. no permission);
 *   <li>{@code delete} — the Delete button of the selection;
 *   <li>{@code saveAndNext} — in {@code editInDrawer()} mode, a "Save and next" button that saves
 *       the record and moves the drawer on to the next row of the listing (default {@code off});
 *   <li>{@code errorBanner} — in drawer mode a failed save shows its message as a banner inside the
 *       drawer instead of only a toast (default {@code on}).
 * </ul>
 */
@Builder(toBuilder = true)
@Experimental("archetype display options (3.0-alpha.409)")
public record CrudDisplay(Toggle create, Toggle delete, Toggle saveAndNext, Toggle errorBanner) {

  public static CrudDisplay defaults() {
    return new CrudDisplay(Toggle.on, Toggle.on, Toggle.off, Toggle.on);
  }

  @Override
  public Toggle create() {
    return Toggle.or(create, Toggle.on);
  }

  @Override
  public Toggle delete() {
    return Toggle.or(delete, Toggle.on);
  }

  @Override
  public Toggle saveAndNext() {
    return Toggle.or(saveAndNext, Toggle.off);
  }

  @Override
  public Toggle errorBanner() {
    return Toggle.or(errorBanner, Toggle.on);
  }
}
