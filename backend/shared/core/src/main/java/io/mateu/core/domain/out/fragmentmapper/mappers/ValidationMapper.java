package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.isForm;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isPage;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Validation;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ValidationSupplier;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

public class ValidationMapper {

  /**
   * Request attribute saying which of the two editors is being built, set by the CRUD form builder.
   * Absent means the edit form, which is what every other form is: {@code @HiddenInCreate} has no
   * meaning outside a creation form, and this is the same default {@code PageFormBuilder} is called
   * with when a plain page renders itself.
   */
  public static final String FOR_CREATION_FORM = "forCreationForm";

  public static List<ValidationDto> mapValidations(Object serverSideObject, String route) {
    return mapValidations(serverSideObject, route, null);
  }

  public static List<ValidationDto> mapValidations(
      Object serverSideObject, String route, HttpRequest httpRequest) {
    return createValidations(serverSideObject, route, httpRequest).stream()
        .map(ValidationMapper::mapToValidation)
        .toList();
  }

  public static List<io.mateu.uidl.data.Validation> createValidations(
      Object serverSideObject, String route) {
    return createValidations(serverSideObject, route, null);
  }

  public static List<io.mateu.uidl.data.Validation> createValidations(
      Object serverSideObject, String route, HttpRequest httpRequest) {
    if (serverSideObject instanceof ValidationSupplier validationSupplier) {
      return validationSupplier.validations();
    }
    List<io.mateu.uidl.data.Validation> fieldLevelValidations = new ArrayList<>();
    if (isPage(serverSideObject, route)
        || isForm(serverSideObject)
        || serverSideObject.getClass().isRecord()) {
      getAllFields(serverSideObject.getClass()).stream()
          .filter(field -> isFillable(field, serverSideObject, httpRequest))
          .flatMap(field -> getValidations(field).stream())
          .filter(Objects::nonNull)
          .forEach(fieldLevelValidations::add);
    }
    return Stream.concat(
            fieldLevelValidations.stream(),
            Arrays.stream(serverSideObject.getClass().getAnnotationsByType(Validation.class))
                .map(ValidationMapper::mapToValidation))
        .toList();
  }

  /**
   * A constraint on a field this form does not render is unsatisfiable, so it is not sent: there is
   * no input to type the value into, and the client would refuse to submit for ever, naming a field
   * the user cannot see. {@code @NotEmpty} on an id that is {@code @HiddenInCreate} — assigned at
   * creation, immutable afterwards — is the ordinary way to arrive here.
   *
   * <p>Not the same thing as {@code @Hidden("expression")}, which is conditional: that one is still
   * sent, with its condition relaxed by the expression — see {@link
   * #getValidationsWithFieldPrefix}. This is for fields whose absence is decided on the server.
   *
   * <p>Without an {@link HttpRequest} there is no form context to judge against — a listing, a
   * static export — and every constraint is kept, which is what this did before there was a
   * question to ask.
   */
  private static boolean isFillable(Field field, Object instance, HttpRequest httpRequest) {
    if (httpRequest == null) {
      return true;
    }
    var forCreationForm = Boolean.TRUE.equals(httpRequest.getAttribute(FOR_CREATION_FORM));
    return PageFormBuilder.rendersAsInput(field, instance, forCreationForm, httpRequest);
  }

  public static List<io.mateu.uidl.data.Validation> getValidations(Field field) {
    return getValidationsWithFieldPrefix("", field);
  }

  public static List<io.mateu.uidl.data.Validation> getValidationsWithFieldPrefix(
      String prefix, Field field) {
    List<io.mateu.uidl.data.Validation> validations =
        ConstraintValidationMapper.getValidationsWithFieldPrefix(prefix, field);
    Hidden hidden = MetaAnnotations.find(field, Hidden.class);
    if (hidden != null && !hidden.value().isBlank()) {
      validations =
          validations.stream()
              .map(
                  v ->
                      io.mateu.uidl.data.Validation.builder()
                          .fieldId(v.fieldId())
                          .condition("(" + hidden.value() + ") || (" + v.condition() + ")")
                          .message(v.message())
                          .build())
              .toList();
    }
    return validations;
  }

  public static io.mateu.uidl.data.Validation mapToValidation(Validation annotation) {
    return io.mateu.uidl.data.Validation.builder()
        .fieldId(annotation.fieldId())
        .condition(annotation.condition())
        .message(annotation.message())
        .build();
  }

  public static ValidationDto mapToValidation(io.mateu.uidl.data.Validation annotation) {
    return ValidationDto.builder()
        .fieldId(annotation.fieldId())
        .condition(annotation.condition())
        .message(annotation.message())
        .build();
  }
}
