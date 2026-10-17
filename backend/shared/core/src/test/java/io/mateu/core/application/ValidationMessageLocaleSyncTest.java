package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Bean-validation messages follow the REQUEST's language (what the Translator says — the chrome's),
 * with English when the request names none — never the JVM's default locale. A server on a Spanish
 * machine answered an English user's drawer refusal in Spanish ("el tamaño debe estar entre…"),
 * because the interpolator Mateu configured took its default locale from the JVM.
 */
class ValidationMessageLocaleSyncTest {

  public static class Contact implements Identifiable {
    String id;

    @Size(min = 3)
    String code;

    @Email String email;

    public Contact() {}

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Contact> CONTACTS = new ArrayList<>();

  @UI("/locale-contacts")
  @Title("Contacts")
  public static class ContactsCrud extends AutoCrud<Contact> {
    @Override
    public boolean editInDrawer() {
      return true;
    }

    @Override
    public CrudStore<Contact> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Contact> findById(String id) {
          return CONTACTS.stream().filter(c -> c.id().equals(id)).findFirst();
        }

        @Override
        public String save(Contact entity) {
          CONTACTS.add(entity);
          return entity.id;
        }

        @Override
        public List<Contact> findAll() {
          return CONTACTS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  @UI("/locale-booking")
  public static class Booking {
    @Size(min = 3, message = "{booking.code.size}")
    String code;

    @io.mateu.uidl.annotations.Button
    io.mateu.uidl.data.Message save() {
      return new io.mateu.uidl.data.Message("saved");
    }
  }

  static TestMateu mateu;
  static Locale jvmDefault;

  @BeforeAll
  static void boot() {
    jvmDefault = Locale.getDefault();
    Locale.setDefault(Locale.forLanguageTag("es-ES"));
    mateu = TestMateu.withUis(ContactsCrud.class, Booking.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
    Locale.setDefault(jvmDefault);
  }

  private UIIncrementDto create(Map<String, String> headers) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/locale-contacts")
            .consumedRoute("/locale-contacts")
            .serverSideType(ContactsCrud.class.getName())
            .actionId("create")
            .initiatorComponentId("c1_app")
            .componentState(Map.of("code", "ab", "email", "not-an-email"))
            .build(),
        headers);
  }

  @Test
  void aRequestNamingNoLanguageIsAnsweredInEnglishOnASpanishMachine() {
    var refusal = String.valueOf(create(Map.of()));
    assertThat(CONTACTS).isEmpty();
    // the same text the browser shows for the same constraint
    assertThat(refusal).contains("Size must be between 3 and");
    assertThat(refusal).contains("must be a well-formed email address");
    assertThat(refusal).doesNotContain("tamaño").doesNotContain("correo");
  }

  @Test
  void anEnglishRequestIsAnsweredInEnglishOnASpanishMachine() {
    var refusal = String.valueOf(create(Map.of("Accept-Language", "en-GB,en;q=0.9")));
    assertThat(refusal).contains("must be a well-formed email address");
    assertThat(refusal).doesNotContain("correo");
  }

  @Test
  void aSpanishRequestGetsTheValidatorsSpanishMessages() {
    var refusal = String.valueOf(create(Map.of("Accept-Language", "es-ES,es;q=0.9")));
    assertThat(refusal).contains("correo electrónico");
  }

  private UIIncrementDto booking(String actionId, Map<String, String> headers) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/locale-booking")
            .consumedRoute("_empty")
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(new java.util.HashMap<>(Map.of("code", "ab")))
            .build(),
        headers);
  }

  private static List<String> clientMessages(UIIncrementDto increment) {
    return ((io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component())
        .validations().stream().map(io.mateu.dtos.ValidationDto::message).toList();
  }

  @Test
  void anAppsOwnMessageKeysAreResolvedInTheRequestsLanguageForTheClient() {
    assertThat(clientMessages(booking("", Map.of("Accept-Language", "es"))))
        .containsExactly("Al menos 3 caracteres");
    // a Spanish machine: a request naming no language (or one no bundle speaks) is in English
    assertThat(clientMessages(booking("", Map.of()))).containsExactly("At least 3 characters");
    assertThat(clientMessages(booking("", Map.of("Accept-Language", "sw"))))
        .containsExactly("At least 3 characters");
  }

  @Test
  void theServersRefusalSaysWhatTheClientSays() {
    assertThat(String.valueOf(booking("save", Map.of("Accept-Language", "es"))))
        .contains("Code: Al menos 3 caracteres");
    assertThat(String.valueOf(booking("save", Map.of()))).contains("Code: At least 3 characters");
  }
}
