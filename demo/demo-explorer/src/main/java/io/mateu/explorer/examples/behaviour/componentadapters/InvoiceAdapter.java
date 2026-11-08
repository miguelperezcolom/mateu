package io.mateu.explorer.examples.behaviour.componentadapters;

import io.mateu.uidl.data.AdaptedView;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.interfaces.ComponentAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Teaches Mateu to render an {@link Invoice}: {@code adapt} returns the components, the state (keyed
 * like the field ids) and the actions the view exposes; {@code deserialize} rebuilds the Invoice from
 * the state an action sends back. Being a bean registers it.
 */
@Component
public class InvoiceAdapter implements ComponentAdapter<Invoice> {

  @Override
  public Class<Invoice> type() {
    return Invoice.class;
  }

  @Override
  public AdaptedView adapt(Invoice invoice, HttpRequest httpRequest) {
    var form =
        FormLayout.builder()
            .autoResponsive(true)
            .content(
                List.of(
                    field("number", "Number", FieldDataType.string),
                    field("customer", "Customer", FieldDataType.string),
                    field("lines", "Lines", FieldDataType.integer),
                    field("total", "Total (€)", FieldDataType.number)))
            .build();
    Map<String, Object> state = new LinkedHashMap<>();
    state.put("number", invoice.number);
    state.put("customer", invoice.customer);
    state.put("lines", invoice.lines);
    state.put("total", invoice.total);
    return AdaptedView.of(
        new VerticalLayout(form, new Button("Issue invoice", "issue")), state, List.of("issue"));
  }

  @Override
  public Invoice deserialize(Map<String, Object> state, HttpRequest httpRequest) {
    // only the keys that came back: on an empty state the field initializers survive
    var invoice = new Invoice();
    if (state.containsKey("number")) invoice.number = String.valueOf(state.get("number"));
    if (state.containsKey("customer")) invoice.customer = String.valueOf(state.get("customer"));
    if (state.get("lines") instanceof Number n) invoice.lines = n.intValue();
    if (state.get("total") instanceof Number n) invoice.total = n.doubleValue();
    return invoice;
  }

  private static FormField field(String id, String label, FieldDataType type) {
    return FormField.builder().id(id).label(label).dataType(type).build();
  }
}
