package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A {@code @ViewToolbarButton} that changes the record in the store and answers with a message (the
 * common "Return loan" button): the record's view is shown again, reloaded — not left with the
 * values it had before the action — and the message still shows. An answer that decides where to go
 * itself (a navigation) is left alone.
 */
class CrudViewToolbarRefreshSyncTest {

  static final Map<String, String> STATUS = new ConcurrentHashMap<>();

  public static class Loan implements Identifiable {
    public String id;
    public String status;

    public Loan() {}

    Loan(String id, String status) {
      this.id = id;
      this.status = status;
    }

    @Override
    public String id() {
      return id;
    }
  }

  @UI("/loans")
  @Title("Loans")
  public static class Loans extends AutoCrud<Loan> {

    @ViewToolbarButton
    public Message giveBack(Loan loan) {
      STATUS.put(loan.id, "RETURNED");
      return Message.success("Returned");
    }

    @ViewToolbarButton
    public Object giveBackAndGo(Loan loan) {
      STATUS.put(loan.id, "RETURNED");
      return List.of(Message.success("Returned"), UICommand.navigateTo("/elsewhere"));
    }

    @Override
    public CrudStore<Loan> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Loan> findById(String id) {
          return Optional.ofNullable(STATUS.get(id)).map(status -> new Loan(id, status));
        }

        @Override
        public String save(Loan entity) {
          STATUS.put(entity.id, entity.status);
          return entity.id;
        }

        @Override
        public List<Loan> findAll() {
          return STATUS.entrySet().stream().map(e -> new Loan(e.getKey(), e.getValue())).toList();
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          selectedIds.forEach(STATUS::remove);
        }
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Loans.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    STATUS.clear();
    STATUS.put("l1", "OPEN");
  }

  private static UIIncrementDto onView(String method) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/loans/l1")
            .consumedRoute("/loans")
            .serverSideType(Loans.class.getName())
            .actionId("action-on-view-" + method)
            .componentState(Map.of("id", "l1", "status", "OPEN"))
            .initiatorComponentId("ln_app")
            .build());
  }

  @Test
  void aMessageAnswerShowsTheMessageAndTheReloadedRecord() {
    var increment = onView("giveBack");
    assertThat(STATUS).containsEntry("l1", "RETURNED");
    assertThat(increment.messages()).anySatisfy(m -> assertThat(m.text()).isEqualTo("Returned"));
    assertThat(String.valueOf(increment.fragments())).contains("RETURNED").doesNotContain("OPEN");
  }

  @Test
  void anAnswerThatNavigatesIsLeftAlone() {
    var increment = onView("giveBackAndGo");
    assertThat(increment.commands())
        .anySatisfy(
            command -> {
              assertThat(command.type()).isEqualTo(UICommandTypeDto.NavigateTo);
              assertThat(command.data()).isEqualTo("/elsewhere");
            });
  }
}
