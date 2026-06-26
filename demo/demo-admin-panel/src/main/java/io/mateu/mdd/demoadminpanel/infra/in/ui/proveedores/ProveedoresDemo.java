package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** Demo of semantic annotations: @ProveedorId/@HotelId (lookup) and @Importe (stereotype). */
@UI("/proveedor-demo")
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
}
