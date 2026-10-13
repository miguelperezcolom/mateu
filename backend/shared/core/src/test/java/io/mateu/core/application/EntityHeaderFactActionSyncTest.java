package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.EntityHeaderDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A fact of an EntityHeader can carry an action (the pencil next to "EMPRESA"): its id travels on
 * the fact, the view that has a method for it advertises it (the web client only sends advertised
 * actions), and dispatching it with the fact's parameters runs that method.
 */
class EntityHeaderFactActionSyncTest {

  @SuppressWarnings("unused")
  @UI("/stay-with-company")
  @Title("Stay")
  public static class StayPage {

    static Map<String, Object> received;

    @Label("")
    Callable<Component> header =
        () ->
            EntityHeader.builder()
                .id("stay")
                .title("María Fernández")
                .facts(
                    List.of(
                        Fact.builder().label("TOTAL RESERVA").value("€ 4.890,00").build(),
                        Fact.builder()
                            .label("EMPRESA")
                            .value("Acme Corporation Ltd")
                            .actionId("changeCompany")
                            .actionLabel("Cambiar empresa")
                            .parameters(Map.of("stayId", "S-1"))
                            .build()))
                .build();

    public void changeCompany(HttpRequest httpRequest) {
      received = httpRequest.runActionRq().parameters();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(StayPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private EntityHeaderDto header() {
    return FieldKindsSyncTest.collect(
            mateu.sync("/stay-with-company").fragments().get(0).component(), EntityHeaderDto.class)
        .get(0);
  }

  @Test
  void theFactCarriesItsActionAndTheDisplayOnlyOneDoesNot() {
    var facts = header().facts();
    assertThat(facts.get(0).actionId()).isNull();
    assertThat(facts.get(0).icon()).isNull();
    var company = facts.get(1);
    assertThat(company.actionId()).isEqualTo("changeCompany");
    assertThat(company.icon()).isEqualTo("vaadin:pencil");
    assertThat(company.actionLabel()).isEqualTo("Cambiar empresa");
    assertThat(company.parameters()).containsEntry("stayId", "S-1");
  }

  @Test
  void theViewAdvertisesTheFactsAction() {
    var component =
        (ServerSideComponentDto) mateu.sync("/stay-with-company").fragments().get(0).component();
    assertThat(component.actions()).extracting(ActionDto::id).contains("changeCompany");
  }

  @Test
  void dispatchingTheFactsActionRunsTheViewsMethodWithItsParameters() {
    StayPage.received = null;
    mateu.run(
        RunActionRqDto.builder()
            .route("/stay-with-company")
            .consumedRoute("/stay-with-company")
            .serverSideType(StayPage.class.getName())
            .actionId("changeCompany")
            .componentState(Map.of())
            .parameters(Map.of("stayId", "S-1"))
            .initiatorComponentId("stay_app")
            .build());
    assertThat(StayPage.received).containsEntry("stayId", "S-1");
  }
}
