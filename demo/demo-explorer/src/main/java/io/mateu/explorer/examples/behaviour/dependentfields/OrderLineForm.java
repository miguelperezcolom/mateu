package io.mateu.explorer.examples.behaviour.dependentfields;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import java.util.List;
import java.util.Map;

/**
 * Fields that follow other fields. An {@code OnValueChange} trigger runs a server action when one
 * field changes; the action updates the form and returns it:
 *
 * <ul>
 *   <li>changing the <em>country</em> re-offers the <em>city</em> options ({@link OptionsSupplier}
 *       reads the current country) and clears a city that no longer belongs;
 *   <li>changing <em>quantity</em> or <em>unit price</em> recomputes the <em>total</em>.
 * </ul>
 */
@Title("Order line")
@Trigger(type = TriggerType.OnValueChange, actionId = "countryChanged", propertyName = "country")
@Trigger(type = TriggerType.OnValueChange, actionId = "recalculate", propertyName = "quantity")
@Trigger(type = TriggerType.OnValueChange, actionId = "recalculate", propertyName = "unitPrice")
public class OrderLineForm implements OptionsSupplier {

  static final Map<String, List<String>> CITIES =
      Map.of(
          "Spain", List.of("Madrid", "Palma", "Seville"),
          "France", List.of("Paris", "Lyon", "Nice"),
          "Italy", List.of("Rome", "Milan", "Naples"));

  String country = "Spain";

  String city;

  int quantity = 1;

  double unitPrice = 10;

  @ReadOnly double total = 10;

  @Override
  public boolean supports(Class<?> fieldType, String fieldName, Class<?> formType) {
    return "country".equals(fieldName) || "city".equals(fieldName);
  }

  @Override
  public List<Option> options(String fieldName, HttpRequest httpRequest) {
    var values =
        "country".equals(fieldName)
            ? List.of("Spain", "France", "Italy")
            : CITIES.getOrDefault(country, List.of());
    return values.stream().map(Option::new).toList();
  }

  public OrderLineForm countryChanged() {
    if (city != null && !CITIES.getOrDefault(country, List.of()).contains(city)) {
      city = null;
    }
    return this;
  }

  public OrderLineForm recalculate() {
    total = quantity * unitPrice;
    return this;
  }
}
