package io.mateu.uidl.data;

import lombok.Builder;

/**
 * The built-in affordances of a {@code Wizard} (the Redwood guided-process {@code displayOptions}):
 *
 * <ul>
 *   <li>{@code saveDraft} — a "Save" button that keeps the wizard where it is (shown only when the
 *       wizard is {@link io.mateu.uidl.interfaces.Draftable});
 *   <li>{@code saveAndClose} — "Save and close": save the draft and leave (also Draftable only);
 *   <li>{@code skip} — a "Skip" button on the steps {@code stepSkippable(...)} allows.
 * </ul>
 *
 * Unset ({@code null}) toggles read as {@code on}: the affordance shows whenever the wizard
 * supports it. Override {@code Wizard.display()} to switch any of them {@code off} or {@code
 * disabled}.
 */
@Builder(toBuilder = true)
public record WizardDisplay(Toggle saveDraft, Toggle saveAndClose, Toggle skip) {

  public static WizardDisplay defaults() {
    return new WizardDisplay(Toggle.on, Toggle.on, Toggle.on);
  }

  @Override
  public Toggle saveDraft() {
    return Toggle.or(saveDraft, Toggle.on);
  }

  @Override
  public Toggle saveAndClose() {
    return Toggle.or(saveAndClose, Toggle.on);
  }

  @Override
  public Toggle skip() {
    return Toggle.or(skip, Toggle.on);
  }
}
