package io.mateu.sample1.app;

import io.mateu.uidl.annotations.Aside;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;

/**
 * An @Aside page: the form is the main region, the @Aside panel sits beside it. Now composed as a
 * "main aside" named-slot template on the one responsive grid (coherence-plan #7/#9), retiring the
 * bespoke ContentLayout. Backs the layout e2e (layout-sizing.spec.ts) — verifies the form-wrapping
 * does not change the page rendering.
 */
@UI("/aside-demo")
@Title("Booking")
public class AsideDemo {

  @Section("Guest")
  public String firstName = "Ada";

  public String lastName = "Lovelace";

  @Section("Stay")
  public String hotel = "Riu Palace";

  public String nights = "3";

  @Aside(width = "20rem")
  public Component help =
      Card.builder()
          .title(Text.builder().text("Need help?").build())
          .content(Text.builder().text("Call the front desk at ext. 100.").build())
          .build();
}
