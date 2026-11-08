package io.mateu.explorer.examples.behaviour.branching;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * A branching wizard: {@link #stepApplies} decides, from earlier answers, whether a step is there at
 * all. The address step only applies to home delivery — otherwise it is jumped in both directions
 * and left out of the progress indicator. Evaluated on every render.
 */
@Title("Delivery")
public class DeliveryWizard extends Wizard {

  public enum Method {
    PICKUP_IN_STORE,
    HOME_DELIVERY
  }

  public static class HowStep implements WizardStep {
    @NotNull public Method method = Method.PICKUP_IN_STORE;
  }

  public static class AddressStep implements WizardStep {
    @NotEmpty public String street;
    @NotEmpty public String city;
  }

  public static class ConfirmStep implements WizardStep {
    public String notes;
  }

  public static class Done implements WizardStep {
    @PlainText public String message = "Order placed.";
  }

  HowStep how = new HowStep();
  AddressStep address = new AddressStep();
  ConfirmStep confirm = new ConfirmStep();
  Done done;

  @Override
  protected boolean stepApplies(String stepFieldName) {
    if ("address".equals(stepFieldName)) {
      return how.method == Method.HOME_DELIVERY;
    }
    return true;
  }

  @WizardCompletionAction
  @Action(validationRequired = true)
  @Label("Place order")
  Object placeOrder() {
    done = new Done();
    done.message =
        how.method == Method.HOME_DELIVERY
            ? "Order placed — shipping to " + address.street + ", " + address.city + "."
            : "Order placed — pick it up in store.";
    return null;
  }
}
