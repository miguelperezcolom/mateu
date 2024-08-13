package io.mateu.core.domain.uidefinition.core.app;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.uidefinition.shared.interfaces.JourneyRunner;

@SuppressFBWarnings("EI_EXPOSE_REP2")
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
