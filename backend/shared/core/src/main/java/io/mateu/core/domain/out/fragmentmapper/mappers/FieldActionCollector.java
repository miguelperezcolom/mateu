package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.OnRowSelected;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.fluent.Action;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import reactor.core.publisher.Flux;

final class FieldActionCollector {

  static List<Action> collect(Object serverSideObject) {
    List<Action> fieldActions = new ArrayList<>();

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Action.class))
        .map(
            field ->
                ActionDtoMapper.mapToAction(
                        field.getAnnotation(io.mateu.uidl.annotations.Action.class))
                    .withId(field.getName()))
        .forEach(fieldActions::add);
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Action.class))
        .map(
            method -> {
              Action action =
                  ActionDtoMapper.mapToAction(
                          method.getAnnotation(io.mateu.uidl.annotations.Action.class))
                      .withId(method.getName());
              return isFluxReturning(method) ? action.withSse(true) : action;
            })
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> List.class.isAssignableFrom(field.getType()))
        .flatMap(
            field -> {
              String fieldName = field.getName();
              String fieldsToValidate = getConstrainedFieldNames(field);
              return Stream.of(
                      "_create",
                      "_create-and-stay",
                      "_add",
                      "_select",
                      "_selected",
                      "_prev",
                      "_next",
                      "_save",
                      "_remove",
                      "_move-up",
                      "_move-down",
                      "_cancel")
                  .map(
                      suffix -> {
                        boolean needsValidation =
                            suffix.equals("_create")
                                || suffix.equals("_create-and-stay")
                                || suffix.equals("_save");
                        return Action.builder()
                            .id(fieldName + suffix)
                            .validationRequired(needsValidation)
                            .fieldsToValidate(needsValidation ? fieldsToValidate : null)
                            .build();
                      });
            })
        .forEach(fieldActions::add);

    // Register the developer action a grid field binds to row selection (@OnRowSelected), so the
    // event dispatched on row click is claimed and sent to the server (otherwise it bubbles
    // unhandled).
    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, OnRowSelected.class))
        .map(
            field ->
                Action.builder()
                    .id(MetaAnnotations.find(field, OnRowSelected.class).value())
                    .build())
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, Lookup.class))
        .filter(field -> !MetaAnnotations.find(field, Lookup.class).bubble())
        .map(field -> Action.builder().id("search-" + field.getName()).build())
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, Searchable.class))
        .filter(field -> !MetaAnnotations.find(field, Searchable.class).bubble())
        .map(field -> Action.builder().id("code-" + field.getName()).build())
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, Searchable.class))
        .filter(field -> !MetaAnnotations.find(field, Searchable.class).bubble())
        .map(field -> Action.builder().id("codesearch-" + field.getName()).build())
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(
            field ->
                !field.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)
                    && (MetaAnnotations.isPresent(field, Button.class)
                        || MetaAnnotations.isPresent(field, Toolbar.class)))
        .map(field -> Action.builder().id(field.getName()).validationRequired(true).build())
        .forEach(fieldActions::add);
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(
            method ->
                !method.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)
                    && (method.isAnnotationPresent(Button.class)
                        || method.isAnnotationPresent(Toolbar.class)))
        .map(
            method ->
                Action.builder()
                    .id(method.getName())
                    .validationRequired(true)
                    .sse(isFluxReturning(method))
                    .build())
        .forEach(fieldActions::add);

    return fieldActions;
  }

  private static String getConstrainedFieldNames(Field listField) {
    if (!(listField.getGenericType() instanceof ParameterizedType pt)) {
      return null;
    }
    var typeArg = pt.getActualTypeArguments()[0];
    if (!(typeArg instanceof Class<?> elementClass)) {
      return null;
    }
    String names =
        Arrays.stream(elementClass.getDeclaredFields())
            .filter(FieldActionCollector::hasValidationConstraint)
            .map(Field::getName)
            .reduce((a, b) -> a + "," + b)
            .orElse(null);
    return names;
  }

  private static boolean hasValidationConstraint(Field field) {
    return MetaAnnotations.isPresent(field, NotEmpty.class)
        || MetaAnnotations.isPresent(field, NotNull.class)
        || MetaAnnotations.isPresent(field, Min.class)
        || MetaAnnotations.isPresent(field, Max.class)
        || MetaAnnotations.isPresent(field, Size.class)
        || MetaAnnotations.isPresent(field, Pattern.class);
  }

  private static boolean isFluxReturning(Method method) {
    return Flux.class.isAssignableFrom(method.getReturnType());
  }

  private FieldActionCollector() {}
}
