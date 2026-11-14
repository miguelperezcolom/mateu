package com.example.workshop;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.test.Identity;
import io.mateu.test.MateuTest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Workshop, lab 06: the access rule, tested with no Keycloak at all — the harness opens the screen
 * as a given identity, exactly as Mateu reads the one Spring Security established from the token.
 */
class SignInUiTest {

  MateuTest mateu;

  @BeforeEach
  void start() {
    mateu = MateuTest.builder().scan("com.example.workshop").start();
  }

  @AfterEach
  void stop() {
    mateu.close();
  }

  @Test
  void aClerkSeesNoDiscount() {
    assertFalse(mateu.open("/quote", Identity.withRoles("clerk")).hasField("discount"));
  }

  @Test
  void anonymousSeesNoDiscountEither() {
    assertFalse(mateu.open("/quote").hasField("discount"));
  }

  @Test
  void aManagerGivesADiscount() {
    var quote = mateu.open("/quote", Identity.withRoles("manager"));
    quote.field("quantity").set(2);
    quote.field("unitPrice").set(50.0);
    quote.field("discount").set(20);
    quote.button("Calculate").press();
    assertEquals(80.0, ((Number) quote.field("total").value()).doubleValue());
  }

  @Test
  void theRolesOfAKeycloakTokenCount() {
    // what an access token of labs/06-sign-in/keycloak carries (its "roles" mapper)
    var ada = Identity.withClaims(Map.of("sub", "ada", "roles", List.of("manager")));
    assertTrue(mateu.open("/quote", ada).hasField("discount"));
  }
}
