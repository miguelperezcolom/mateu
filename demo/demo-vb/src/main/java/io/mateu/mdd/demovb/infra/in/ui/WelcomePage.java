package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import java.net.URI;
import java.util.List;

/** Arquetipo Welcome: hero con CTAs + tiles destacadas. */
@UI("/welcome")
@Title("Welcome")
public class WelcomePage extends Welcome {

  Button start =
      Button.builder()
          .label("Start checkout")
          .actionId("goCheckout")
          .buttonStyle(ButtonStyle.primary)
          .build();

  Button browse = Button.builder().label("See products").actionId("goProducts").build();

  @Panel(title = "1 · Browse the catalog")
  VerticalLayout step1 =
      VerticalLayout.builder()
          .content(List.of(new Text("w1", "Find the product in the Products listing.")))
          .build();

  @Panel(title = "2 · Guided checkout")
  VerticalLayout step2 =
      VerticalLayout.builder()
          .content(List.of(new Text("w2", "Complete the three-step checkout wizard.")))
          .build();

  @Panel(title = "3 · Track the booking")
  VerticalLayout step3 =
      VerticalLayout.builder()
          .content(List.of(new Text("w3", "Follow everything from the booking foldout.")))
          .build();

  @Override
  protected String heroTitle() {
    return "VB Demo front desk";
  }

  @Override
  protected String heroSubtitle() {
    return "Everything in this app is painted from the Mateu backend";
  }

  @Action
  Object goCheckout() {
    return URI.create("/checkout");
  }

  @Action
  Object goProducts() {
    return URI.create("/products");
  }
}
