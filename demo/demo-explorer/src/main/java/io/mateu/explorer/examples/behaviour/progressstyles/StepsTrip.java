package io.mateu.explorer.examples.behaviour.progressstyles;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;

/** Connected step bullets: one dot per step, done / current / upcoming. */
@Title("Trip — step bullets")
@WizardProgress(WizardProgressStyle.STEPS)
public class StepsTrip extends TripWizard {}
