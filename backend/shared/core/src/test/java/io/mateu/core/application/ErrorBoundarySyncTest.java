package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.ErrorBoundary;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import jakarta.validation.ConstraintViolationException;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * What a user sees when an action fails: the message of an exception MEANT for them
 * (UserFacingException, Bean Validation), or a generic one with a reference id — never the raw
 * class name and message of a bug. Mirrored in .NET (ErrorBoundaryTests) and Python
 * (test_error_boundary.py).
 */
class ErrorBoundarySyncTest {

  @UI("/error-boundary")
  public static class Orders {
    String name = "x";

    @Action
    void outOfStock() {
      throw new UserFacingException("Not enough stock", "Only 3 units left.");
    }

    @Action
    void plainUserMessage() {
      throw new UserFacingException("Pick a delivery date first.");
    }

    @Action
    void invalid() {
      throw new ConstraintViolationException("quantity: must be greater than 0", Set.of());
    }

    @Action
    void bug() {
      throw new IllegalStateException("SELECT * FROM orders WHERE tenant = 'acme' failed");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Orders.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static MessageDto run(String actionId) {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/error-boundary")
                .actionId(actionId)
                .serverSideType(Orders.class.getName())
                .componentState(Map.of("name", "x"))
                .initiatorComponentId("app")
                .build());
    assertThat(increment.messages()).hasSize(1);
    return increment.messages().get(0);
  }

  @Test
  void aUserFacingExceptionIsShownAsWritten() {
    var message = run("outOfStock");
    assertThat(message.title()).isEqualTo("Not enough stock");
    assertThat(message.text()).isEqualTo("Only 3 units left.");
    assertThat(run("plainUserMessage").text()).isEqualTo("Pick a delivery date first.");
  }

  @Test
  void aValidationErrorIsShown() {
    var message = run("invalid");
    assertThat(message.title()).isEqualTo("Validation error");
    assertThat(message.text()).contains("must be greater than 0");
  }

  @Test
  void aBugIsGenericWithAReference() {
    var message = run("bug");
    assertThat(message.title()).isEqualTo(ErrorBoundary.GENERIC_TITLE);
    assertThat(message.text())
        .startsWith(ErrorBoundary.GENERIC_TEXT)
        .doesNotContain("SELECT")
        .doesNotContain("IllegalStateException");
    assertThat(message.text().substring(ErrorBoundary.GENERIC_TEXT.length())).hasSize(12);
  }
}
