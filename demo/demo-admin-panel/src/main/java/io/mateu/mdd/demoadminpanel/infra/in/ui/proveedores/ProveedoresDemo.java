package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** Demo of the @ProveedorId semantic annotation (a @Lookup composed into a domain annotation). */
@UI("/proveedor-demo")
@Title("Pedido")
public class ProveedoresDemo {

  String referencia;

  @ProveedorId
  String proveedorId;

  String observaciones;
}
