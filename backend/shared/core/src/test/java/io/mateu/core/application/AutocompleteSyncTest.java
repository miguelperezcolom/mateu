package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.uidl.annotations.Autocomplete;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import java.util.ArrayList;
import org.assertj.core.groups.Tuple;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * WCAG 1.3.5 Identify Input Purpose: a field about the user carries its HTML autocomplete token on
 * the wire — declared with {@code @Autocomplete}, inferred only for an editable email field.
 */
class AutocompleteSyncTest {

  @SuppressWarnings("unused")
  @UI("/autocomplete")
  @Title("Sign up")
  public static class SignUpForm {
    @Autocomplete("given-name")
    String firstName;

    @Autocomplete("tel")
    String phone;

    @Stereotype(FieldStereotype.email)
    String email;

    @Stereotype(FieldStereotype.email)
    @Autocomplete("off")
    String referrerEmail;

    String notes;
  }

  @SuppressWarnings("unused")
  @UI("/autocomplete-readonly")
  @Title("Profile")
  @ReadOnly
  public static class ProfileView {
    @Stereotype(FieldStereotype.email)
    String email = "a@b.c";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(SignUpForm.class, ProfileView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ArrayList<FormFieldDto> fieldsOf(String route) {
    var fields = new ArrayList<FormFieldDto>();
    FieldKindsSyncTest.walk(
        mateu.sync(route).fragments().get(0).component(), FormFieldDto.class, fields);
    return fields;
  }

  @Test
  void aDeclaredPurposeTravelsAndAnEmailFieldIsInferred() {
    assertThat(fieldsOf("/autocomplete"))
        .extracting(FormFieldDto::fieldId, FormFieldDto::autocomplete)
        .contains(
            Tuple.tuple("firstName", "given-name"),
            Tuple.tuple("phone", "tel"),
            Tuple.tuple("email", "email"),
            Tuple.tuple("referrerEmail", "off"),
            Tuple.tuple("notes", null));
  }

  @Test
  void aReadOnlyEmailIsNotAnInput() {
    assertThat(fieldsOf("/autocomplete-readonly"))
        .extracting(FormFieldDto::autocomplete)
        .containsOnlyNulls();
  }
}
