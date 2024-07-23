package io.mateu.core.domain.uidefinition.core.app;

import io.mateu.core.domain.uidefinition.shared.interfaces.JourneyRunner;

public class MDDOpenUserJourneyAction extends AbstractAction {

  private final JourneyRunner userJourney;

  public MDDOpenUserJourneyAction(String caption, JourneyRunner userJourney) {
    super(caption);
    this.userJourney = userJourney;
  }

  public JourneyRunner getUserJourney() {
    return userJourney;
  }
}
