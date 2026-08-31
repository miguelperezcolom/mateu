package io.mateu.core.application;

import static java.util.stream.Collectors.toMap;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.contract.ModelViewContractExtractor;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ModelViewContractDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Phase 1 of the visual builder: the bindable contract of a ModelView (its fields + actions),
 * derived from the SAME mapped component the UI renders, is the single source of truth a
 * visual/YAML layout is validated against. Pins that the extractor reports the real field ids, data
 * types, required flags and action ids.
 */
class ModelViewContractSyncTest {

  @UI("/contract-demo")
  public static class CustomerView {
    @NotEmpty public String name;
    public int age;
    public LocalDate birthDate;

    @Action
    public Message save() {
      return new Message("saved");
    }

    @Action
    public Message reset() {
      return new Message("reset");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(CustomerView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ModelViewContractDto contractOf(String route) {
    var increment = mateu.sync(route);
    assertThat(increment.fragments()).isNotEmpty();
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    return ModelViewContractExtractor.extract(component);
  }

  @Test
  void reportsTheModelViewClassName() {
    assertThat(contractOf("/contract-demo").modelView()).isEqualTo(CustomerView.class.getName());
  }

  @Test
  void reportsEachBindableFieldWithItsDataTypeAndRequiredFlag() {
    Map<String, ModelViewContractDto.Field> byId =
        contractOf("/contract-demo").fields().stream()
            .collect(toMap(ModelViewContractDto.Field::id, f -> f));

    assertThat(byId).containsKeys("name", "age", "birthDate");
    assertThat(byId.get("name").dataType()).isEqualTo("string");
    assertThat(byId.get("name").required()).isTrue();
    assertThat(byId.get("age").dataType()).isEqualTo("integer");
    assertThat(byId.get("age").required()).isFalse();
    assertThat(byId.get("birthDate").dataType()).isEqualTo("date");
  }

  @Test
  void reportsTheBindableActionIds() {
    assertThat(contractOf("/contract-demo").actions())
        .extracting(ModelViewContractDto.Action::id)
        .contains("save", "reset");
  }

  @Test
  @SuppressWarnings("unchecked")
  void theContractIsDeliveredOverTheWireViaTheReservedContractAction() {
    // How the tooling actually fetches it: a normal sync request naming the ModelView as
    // serverSideType and the reserved __contract__ action; the contract rides back on appData.
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .serverSideType(CustomerView.class.getName())
                .route("/contract-demo")
                .actionId(RunActionUseCase.CONTRACT_ACTION)
                .build());

    var appData = (Map<String, Object>) increment.appData();
    assertThat(appData).containsKey(RunActionUseCase.CONTRACT_KEY);
    var contract = (ModelViewContractDto) appData.get(RunActionUseCase.CONTRACT_KEY);
    assertThat(contract.modelView()).isEqualTo(CustomerView.class.getName());
    assertThat(contract.fields())
        .extracting(ModelViewContractDto.Field::id)
        .contains("name", "age");
    assertThat(contract.actions())
        .extracting(ModelViewContractDto.Action::id)
        .contains("save", "reset");
  }
}
