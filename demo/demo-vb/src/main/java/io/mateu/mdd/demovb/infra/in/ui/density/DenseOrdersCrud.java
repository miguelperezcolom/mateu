package io.mateu.mdd.demovb.infra.in.ui.density;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;

/**
 * The same orders as {@link AiryOrdersCrud}, at HIGH DENSITY ({@code @Compact}): on Redwood the
 * table switches to JET's {@code display="grid"} and the record pages take the Redwood
 * small-control density tokens; on Vaadin the grid's compact theme and the Lumo preset.
 */
@UI("/orders-dense")
@Title("Orders (dense)")
@Compact
public class DenseOrdersCrud extends AutoCrud<DensityOrders.Order> {

  @Override
  public CrudStore<DensityOrders.Order> store() {
    return DensityOrders.store();
  }
}
