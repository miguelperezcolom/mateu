package io.mateu.mdd.demoadminpanel.infra.in.ui.adapters;

import io.mateu.uidl.data.AdaptedView;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.interfaces.ComponentAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * A {@link ComponentAdapter} for {@link Pedido}: it has no Mateu annotations, so this bean teaches
 * Mateu how to turn it into a UI (components + state) and how to rebuild it from the state that
 * comes back on an action. Registered automatically because it is a Spring bean.
 */
@Service
public class PedidoAdapter implements ComponentAdapter<Pedido> {

  @Override
  public Class<Pedido> type() {
    return Pedido.class;
  }

  @Override
  public AdaptedView adapt(Pedido pedido, HttpRequest httpRequest) {
    var form =
        FormLayout.builder()
            .autoResponsive(true)
            .content(
                List.of(
                    FormField.builder()
                        .id("referencia")
                        .label("Referencia")
                        .dataType(FieldDataType.string)
                        .build(),
                    FormField.builder()
                        .id("cliente")
                        .label("Cliente")
                        .dataType(FieldDataType.string)
                        .build(),
                    FormField.builder()
                        .id("cantidad")
                        .label("Cantidad")
                        .dataType(FieldDataType.integer)
                        .build(),
                    FormField.builder()
                        .id("total")
                        .label("Total (€)")
                        .dataType(FieldDataType.number)
                        .build()))
            .build();

    var page =
        PageView.builder()
            .title("Pedido (adaptado)")
            .subtitle("Renderizado por PedidoAdapter — Pedido no es un componente Mateu")
            .contentItem(form)
            .toolbarItem(new Button("Guardar", "guardar"))
            .build();

    // State keys mirror the FormField ids so the frontend binds each field to its value.
    Map<String, Object> state = new LinkedHashMap<>();
    state.put("referencia", pedido.referencia);
    state.put("cliente", pedido.cliente);
    state.put("cantidad", pedido.cantidad);
    state.put("total", pedido.total);

    return AdaptedView.of(page, state, List.of("guardar"));
  }

  @Override
  public Pedido deserialize(Map<String, Object> state, HttpRequest httpRequest) {
    // Only overwrite keys present in the incoming state, so the field initializers survive when the
    // instance is built from an empty state (e.g. the initial load that creates the route instance).
    var pedido = new Pedido();
    if (state.containsKey("referencia")) {
      pedido.referencia = asString(state.get("referencia"));
    }
    if (state.containsKey("cliente")) {
      pedido.cliente = asString(state.get("cliente"));
    }
    if (state.containsKey("cantidad")) {
      pedido.cantidad = asInt(state.get("cantidad"));
    }
    if (state.containsKey("total")) {
      pedido.total = asBigDecimal(state.get("total"));
    }
    return pedido;
  }

  private static String asString(Object v) {
    return v != null ? String.valueOf(v) : null;
  }

  private static int asInt(Object v) {
    if (v == null || String.valueOf(v).isBlank()) {
      return 0;
    }
    return (int) Double.parseDouble(String.valueOf(v));
  }

  private static BigDecimal asBigDecimal(Object v) {
    if (v == null || String.valueOf(v).isBlank()) {
      return null;
    }
    return new BigDecimal(String.valueOf(v));
  }
}
