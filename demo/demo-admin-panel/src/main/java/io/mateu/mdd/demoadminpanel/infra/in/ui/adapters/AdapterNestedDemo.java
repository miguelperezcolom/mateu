package io.mateu.mdd.demoadminpanel.infra.in.ui.adapters;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Demo of an adapted type used as a <em>nested field</em>. {@code documento} is a normal Mateu form
 * field; {@code pedido} is a {@link Pedido} (no Mateu form annotations) rendered through
 * {@link PedidoAdapter} as an independent island inside this form: it carries its own
 * {@code serverSideType}, state and actions, so pressing its <em>Guardar</em> round-trips through
 * the adapter on its own — without the host form being involved. Field initializers seed the
 * initial view (no OnLoad trigger needed).
 */
@UI("/adapter-nested-demo")
@Title("Documento con pedido adaptado")
public class AdapterNestedDemo {

  String documento = "DOC-2026-0007";

  Pedido pedido = new Pedido();
}
