package io.mateu.uidl.core.app;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.uidl.core.interfaces.JourneyRunner;

@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
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
