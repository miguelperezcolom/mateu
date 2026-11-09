package io.mateu.explorer.examples.archetypes.welcome;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.HeroTone;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Message;

/**
 * The {@code Welcome} archetype: {@link Button} fields become the calls to action of a centred hero
 * (the first primary one leads), {@code @Panel} component fields become highlight tiles under it.
 * The hero's texts and tone are hooks.
 */
public class MuseumWelcome extends Welcome {

  Button visit =
      Button.builder()
          .label("Plan your visit")
          .actionId("planVisit")
          .buttonStyle(ButtonStyle.primary)
          .build();

  Button collection = Button.builder().label("Browse the collection").actionId("browse").build();

  @Panel(title = "Open today")
  Markdown hours = new Markdown("10:00 – 18:00 · late opening on Fridays until 21:00", null, null);

  @Panel(title = "On view")
  Markdown onView =
      new Markdown("**Impressions of light** — 64 paintings, until 12 January", null, null);

  @Panel(title = "Members")
  Markdown members = new Markdown("Free entry, previews and 10% in the shop.", null, null);

  @Override
  protected String heroOverline() {
    return "Good morning";
  }

  @Override
  protected String heroTitle() {
    return "Welcome to the City Museum";
  }

  @Override
  protected String heroSubtitle() {
    return "Five thousand years of art, three floors, one afternoon";
  }

  @Override
  protected HeroTone heroTone() {
    return HeroTone.plum;
  }

  @Action
  Message planVisit() {
    return Message.success("Your visit planner would open here.");
  }

  @Action
  Message browse() {
    return new Message("The collection would open here.");
  }
}
