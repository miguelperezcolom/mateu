package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.masterdetail.MasterDetailView;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.Getter;
import lombok.Setter;

/**
 * Minimal {@link MasterDetailView} orchestrator: an always-visible master section plus two detail
 * parts shown on demand. Exercises the master/detail orchestration across all four adapters.
 */
@UI("/master-detail")
@Title("Master Detail Demo")
@Zones({@Zone(name = "master", width = "60%"), @Zone(name = "detail", width = "40%")})
public class MasterDetailDemo extends MasterDetailView {

  @Section(value = "Order", zone = "master")
  @Inline
  OrderSection order = new OrderSection();

  @DetailPart(label = "Customer", order = 0)
  @Section(value = "Customer", zone = "detail")
  @Inline
  CustomerSection customer = new CustomerSection();

  @DetailPart(label = "Items", order = 1)
  @Section(value = "Items", zone = "detail")
  @Inline
  ItemsSection items = new ItemsSection();

  @Override
  protected void load(HttpRequest httpRequest) {
    // Static demo data — fields are seeded by their initializers.
  }

  @Getter
  @Setter
  @PlainText
  public static class OrderSection {
    String reference = "ORD-001";
    String status = "Open";
  }

  @Getter
  @Setter
  @PlainText
  public static class CustomerSection {
    String name = "Acme Corp";
    String email = "acme@example.com";
  }

  @Getter
  @Setter
  @PlainText
  public static class ItemsSection {
    String summary = "3 items";
    String total = "1450.75";
  }
}
