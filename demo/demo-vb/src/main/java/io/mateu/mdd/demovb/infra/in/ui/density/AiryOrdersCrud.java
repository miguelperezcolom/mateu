package io.mateu.mdd.demovb.infra.in.ui.density;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;

/** The orders at the standard density — compare with {@link DenseOrdersCrud} ({@code @Compact}). */
@UI("/orders-airy")
@Title("Orders")
public class AiryOrdersCrud extends AutoCrud<DensityOrders.Order> {

  @Override
  public CrudStore<DensityOrders.Order> store() {
    return DensityOrders.store();
  }
}
