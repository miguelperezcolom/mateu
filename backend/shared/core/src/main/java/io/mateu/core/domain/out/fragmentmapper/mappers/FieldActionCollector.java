package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.InlineEditing;
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

  private static boolean rowDecidesItsVisibility(Field listField) {
    try {
      var rowClass =
          io.mateu.uidl.reflection.GenericClassProvider.getGenericClass(
              listField, listField.getType(), "E");
      return rowClass != null
          && io.mateu.uidl.interfaces.VisibilitySupplier.class.isAssignableFrom(rowClass);
    } catch (RuntimeException e) {
      return false;
    }
  }

  static List<Action> collect(Object serverSideObject) {
    List<Action> fieldActions = new ArrayList<>();

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Action.class))
        .map(
            field ->
                ActionDtoMapper.mapToAction(
                        MetaAnnotations.find(field, io.mateu.uidl.annotations.Action.class))
                    .withId(field.getName()))
        .forEach(fieldActions::add);
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(method -> MetaAnnotations.isPresent(method, io.mateu.uidl.annotations.Action.class))
        .map(
            method -> {
              Action action =
                  ActionDtoMapper.mapToAction(
                          MetaAnnotations.find(method, io.mateu.uidl.annotations.Action.class))
                      .withId(method.getName());
              // @Action says how the button BEHAVES (confirmation, timeout…) and @RestAction what
              // it CALLS: together, a confirmed call the browser makes itself. Dropping the
              // @RestAction here sent a confirmed REST call to a server instead — fatal in a static
              // bundle, where there is none.
              var rest = restActionOf(method);
              if (rest != null) {
                action = action.withRestAction(rest);
              }
              return isFluxReturning(method) ? action.withSse(true) : action;
            })
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> List.class.isAssignableFrom(field.getType()))
        // a transient list is not page data, so not an editable grid field
        .filter(field -> !java.lang.reflect.Modifier.isTransient(field.getModifiers()))
        // a list of components (a Foldout's List<Badge>, a List<Component>) is display, not rows
        .filter(field -> !isComponentList(field))
        .flatMap(
            field -> {
              String fieldName = field.getName();
              String fieldsToValidate = getConstrainedFieldNames(field);
              // the row editor re-built when a field its visibility depends on changes: only a
              // row that decides its own visibility has one (the wire of every other list is as
              // it was, on every backend)
              var suffixes =
                  rowDecidesItsVisibility(field)
                      ? Stream.of("_refresh-detail")
                      : Stream.<String>empty();
              return Stream.concat(
                      Stream.of(
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
                          "_cancel"),
                      suffixes)
                  .map(
                      suffix -> {
                        boolean needsValidation =
                            suffix.equals("_create")
                                || suffix.equals("_create-and-stay")
                                || suffix.equals("_save");
                        // the editor re-built on a value change is a read: no veil, no
                        // exclusivity (the latest change wins)
                        boolean refresh = suffix.equals("_refresh-detail");
                        return Action.builder()
                            .id(fieldName + suffix)
                            .background(refresh)
                            .idempotent(refresh)
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

    // Register the per-column lookup search action for inline-editing grids, so a @Lookup cell's
    // combo box can search remotely (routed to SearchFieldActionRunner as search-<field>-<column>).
    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> List.class.isAssignableFrom(field.getType()))
        .filter(field -> MetaAnnotations.isPresent(field, InlineEditing.class))
        .map(field -> Action.builder().id("search-" + field.getName() + "-*").build())
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
                !MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Action.class)
                    && (MetaAnnotations.isPresent(field, Button.class)
                        || MetaAnnotations.isPresent(field, Toolbar.class)))
        .map(field -> Action.builder().id(field.getName()).validationRequired(true).build())
        .forEach(fieldActions::add);
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(
            method ->
                !MetaAnnotations.isPresent(method, io.mateu.uidl.annotations.Action.class)
                    && (MetaAnnotations.isPresent(method, Button.class)
                        || MetaAnnotations.isPresent(method, Toolbar.class)))
        .map(
            method ->
                Action.builder()
                    .id(method.getName())
                    .validationRequired(true)
                    .sse(isFluxReturning(method))
                    .restAction(restActionOf(method))
                    .build())
        .forEach(fieldActions::add);
    // A page-level @Fab method is a floating button the browser can only SEND if the page
    // advertises its action: without this every page FAB was a dead click ("action … was
    // requested but no component on the page handles it"). Not validated: a FAB is a page-wide
    // shortcut (new, help…), not a submit of the form under it.
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(
            method ->
                !MetaAnnotations.isPresent(method, io.mateu.uidl.annotations.Action.class)
                    && !MetaAnnotations.isPresent(method, Button.class)
                    && !MetaAnnotations.isPresent(method, Toolbar.class)
                    && MetaAnnotations.isPresent(method, io.mateu.uidl.annotations.Fab.class))
        .map(
            method ->
                Action.builder()
                    .id(method.getName())
                    .validationRequired(false)
                    .sse(isFluxReturning(method))
                    .build())
        .forEach(fieldActions::add);

    return fieldActions;
  }

  /**
   * The client-side REST descriptor when the method carries {@code @RestAction} (headers parsed
   * from "Name: Value" strings); null otherwise — the button then dispatches to the Mateu server as
   * usual.
   */
  private static io.mateu.uidl.data.RestAction restActionOf(java.lang.reflect.Method method) {
    var a = MetaAnnotations.find(method, io.mateu.uidl.annotations.RestAction.class);
    if (a == null) {
      return null;
    }
    var headers = new java.util.LinkedHashMap<String, String>();
    for (String h : a.headers()) {
      int i = h.indexOf(':');
      if (i > 0) {
        headers.put(h.substring(0, i).trim(), h.substring(i + 1).trim());
      }
    }
    var source =
        io.mateu.uidl.data.RestDataSource.builder()
            .ref(a.source())
            .url(a.url())
            .method(io.mateu.core.domain.DeclaredRestMethod.of(a.source(), a.method(), "POST"))
            .headers(headers)
            .body(a.body())
            .proxy(a.proxy())
            .build();
    return new io.mateu.uidl.data.RestAction(
        source,
        a.successMessage().isEmpty() ? null : a.successMessage(),
        a.resultPath().isEmpty() ? null : a.resultPath(),
        a.successRoute().isEmpty() ? null : a.successRoute(),
        a.forEachSelectedRow());
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
        || MetaAnnotations.isPresent(field, Pattern.class)
        || MetaAnnotations.isPresent(field, jakarta.validation.constraints.Email.class)
        || MetaAnnotations.isPresent(field, jakarta.validation.constraints.Positive.class)
        || MetaAnnotations.isPresent(field, jakarta.validation.constraints.PositiveOrZero.class)
        || MetaAnnotations.isPresent(field, jakarta.validation.constraints.Negative.class)
        || MetaAnnotations.isPresent(field, jakarta.validation.constraints.NegativeOrZero.class)
        || MetaAnnotations.isPresent(field, jakarta.validation.constraints.DecimalMin.class)
        || MetaAnnotations.isPresent(field, jakarta.validation.constraints.DecimalMax.class);
  }

  private static boolean isFluxReturning(Method method) {
    return Flux.class.isAssignableFrom(method.getReturnType());
  }

  private FieldActionCollector() {}

  /** A {@code List<X>} whose element type is a UI component — rendered, never edited as rows. */
  private static boolean isComponentList(java.lang.reflect.Field field) {
    if (!(field.getGenericType() instanceof java.lang.reflect.ParameterizedType parameterized)
        || parameterized.getActualTypeArguments().length != 1) {
      return false;
    }
    var element = parameterized.getActualTypeArguments()[0];
    if (element instanceof java.lang.reflect.WildcardType wildcard
        && wildcard.getUpperBounds().length == 1) {
      element = wildcard.getUpperBounds()[0];
    }
    return element instanceof Class<?> type
        && io.mateu.uidl.fluent.Component.class.isAssignableFrom(type);
  }
}
