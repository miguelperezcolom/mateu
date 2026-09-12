package io.mateu.demo.starwars3;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.UseRadioButtons;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.FieldStereotype;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

enum Species {
  human,
  wookiee,
  droid,
  twilek,
  unknown
}

enum Side {
  Rebellion,
  Empire,
  Neutral
}

/**
 * Step 1 — a two-column ZONED step: identity on the left, origin on the right. The zones lay the
 * sections side by side; each is a plain group of fields.
 */
@Zones({@Zone(name = "left", width = "55%"), @Zone(name = "right", width = "45%")})
record IdentityStep(
    @Section(value = "Identity", zone = "left") @NotEmpty String name,
    Species species,
    @Section(value = "Origin", zone = "right") String homeworld,
    @Stereotype(FieldStereotype.textarea) String notes)
    implements WizardStep {}

/** Step 2 — field types: a radio for the small enum, a star rating, a toggle, a date and money. */
record TrainingStep(
    @UseRadioButtons @NotNull Side side,
    @Stereotype(FieldStereotype.stars) int rating,
    @Stereotype(FieldStereotype.toggle) boolean forceSensitive,
    LocalDate enlisted,
    @Stereotype(FieldStereotype.money) double signingBonus)
    implements WizardStep {}

/** Last step — the read-only result shown after the completion action runs. */
@PlainText
class RecruitResult implements WizardStep {
  public String summary;
}

/**
 * A three-step wizard: Identity → Training → (Recruit) → Result. The penultimate step (Training)
 * shows the {@code @WizardCompletionAction} button; the last step is the read-only result. STEPS
 * progress renders connected bullets.
 */
@UI("recruit")
@Title("Recruit a character")
@WizardProgress(WizardProgressStyle.STEPS)
public class RecruitWizard extends Wizard {

  IdentityStep identity;

  TrainingStep training;

  RecruitResult result;

  @WizardCompletionAction
  void recruit() {
    result = new RecruitResult();
    result.summary =
        "Recruited "
            + identity.name()
            + " ("
            + identity.species()
            + ") to the "
            + training.side()
            + " — "
            + training.rating()
            + "★"
            + (training.forceSensitive() ? ", force-sensitive" : "");
  }
}
