package io.mateu.explorer.examples.behaviour.rules;

import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.interfaces.RuleSupplier;
import java.util.List;

/**
 * Rules run in the BROWSER, on every change, with no round trip: an expression over the form's
 * {@code state} decides whether a field is hidden, disabled or required.
 *
 * <ul>
 *   <li>{@code @Hidden("expr")} — hidden while the expression holds;
 *   <li>{@code @Disabled("expr")} — disabled while it holds;
 *   <li>anything else (required, min, max, pattern…) — a {@link Rule} from a {@link RuleSupplier}.
 * </ul>
 */
@Title("Shipping")
public class ShippingForm implements RuleSupplier {

  boolean company;

  @Hidden("!state.company")
  String companyName;

  @Hidden("!state.company")
  String vatNumber;

  boolean giftWrap;

  @Disabled("!state.giftWrap")
  String giftMessage;

  @Override
  public List<Rule> rules() {
    // the VAT number is required only for a company
    return List.of(
        Rule.builder()
            .filter("true")
            .action(RuleAction.SetDataValue)
            .fieldName("vatNumber")
            .fieldAttribute(RuleFieldAttribute.required)
            .expression("!!state.company")
            .result(RuleResult.Continue)
            .build());
  }
}
