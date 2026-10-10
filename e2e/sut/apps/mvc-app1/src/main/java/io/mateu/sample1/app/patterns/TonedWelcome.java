package io.mateu.sample1.app.patterns;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.HeroTone;

/** Pattern gaps showcase: the Welcome hero band's tone. */
@UI("/patterns/welcome")
public class TonedWelcome extends Welcome {

  Button start = Button.builder().label("Start check-in").actionId("start").build();

  @Override
  protected String heroTitle() {
    return "Good morning, front desk";
  }

  @Override
  protected String heroSubtitle() {
    return "12 arrivals and 9 departures today";
  }

  @Override
  protected HeroTone heroTone() {
    return HeroTone.pine;
  }

  public void start() {}
}
