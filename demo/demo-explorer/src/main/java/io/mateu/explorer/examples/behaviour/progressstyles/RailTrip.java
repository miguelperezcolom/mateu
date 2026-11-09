package io.mateu.explorer.examples.behaviour.progressstyles;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;

/**
 * The Redwood "Guided Process": a right-hand rail with a big {@code current | total} counter over
 * the vertical list of steps (in the Redwood renderer, Spectra's own guided-process template).
 */
@Title("Trip — guided-process rail")
@WizardProgress(WizardProgressStyle.RAIL)
public class RailTrip extends TripWizard {}
