package io.mateu.mdd.demoadminpanel.infra.in.ui.adapters;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.math.BigDecimal;

/**
 * A plain domain object — it carries no Mateu <em>form</em> annotations and is not a Mateu
 * component; its whole UI (and its state round-trip) is defined by {@link PedidoAdapter}, a
 * registered {@code ComponentAdapter<Pedido>}. The {@code @UI} here only registers a route so the
 * adapter can be seen rendered on initial load; the field initializers seed that initial view.
 */
@UI("/adapter-demo")
public class Pedido {

  public String referencia = "PED-2026-0042";
  public String cliente = "Bodegas Riojanas S.A.";
  public int cantidad = 12;
  public BigDecimal total = new BigDecimal("1450.75");

  public Pedido() {}

  /**
   * Runs after the action's state has been deserialized back into this instance — so the values it
   * echoes prove the full component → state → object round-trip.
   */
  Object guardar(HttpRequest httpRequest) {
    return Message.success(
        "Pedido guardado: " + referencia + " · " + cliente + " · " + cantidad + " uds · " + total);
  }
}
