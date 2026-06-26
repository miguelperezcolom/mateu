package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Demo of semantic annotations on fields, methods and the class:
 *
 * <ul>
 *   <li>field: {@code @ProveedorId}/{@code @HotelId} (lookup), {@code @Importe} /
 *       {@code @ImporteTotal} (stereotype + label + help)
 *   <li>method: {@code @AccionGuardar} (composes {@code @Toolbar} + {@code @Label})
 *   <li>class: {@code @PantallaCompacta} (composes {@code @Compact})
 * </ul>
 */
@UI("/proveedor-demo")
@PantallaCompacta
@Title("Pedido")
public class ProveedoresDemo {

  String referencia;

  @ProveedorId
  String proveedorId;

  @HotelId
  String hotelId;

  @Importe
  java.math.BigDecimal total;

  @ImporteTotal
  java.math.BigDecimal granTotal;

  String observaciones;

  @AccionGuardar
  Object guardar(HttpRequest httpRequest) {
    return Message.success("Pedido guardado");
  }
}
