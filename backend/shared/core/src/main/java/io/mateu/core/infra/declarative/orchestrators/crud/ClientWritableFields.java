package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.domain.FieldAccess;
import io.mateu.core.domain.out.componentmapper.PageFormBuilder;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Mass-assignment protection for a save: the state the browser posts may only change what the form
 * let the user change. A field the editor rendered READ-ONLY for this request ({@code ReadOnly},
 * {@code EditableOnlyWhenCreating} on an edit, a {@code ReadOnlySupplier}, a {@code ReadOnlyUnless}
 * the caller does not satisfy), did not render at all ({@code HiddenInEditor} / {@code
 * HiddenInCreate}, an {@code EyesOnly} the caller does not satisfy), and on an edit the record's
 * id, takes its value from the server — the loaded record on an edit, the fresh creation form on a
 * create — whatever the request carries. The same holds INSIDE nested objects.
 *
 * <p>Without it, {@code POST route=/products/P-001/edit actionId=save state={"id":"P-001-X",…}}
 * saved a NEW row P-001-X next to P-001 — with a database store, an insert (or an overwrite of
 * another row) of a record the user never opened — and answered with a url under the wrong mount.
 *
 * <p>Left to the client on purpose: the optimistic-lock {@code @Version} (the save compares it), a
 * {@code @GeneratedValue} on a create (the server generated it for the form being saved).
 */
@io.mateu.uidl.annotations.Internal
public final class ClientWritableFields {

  private ClientWritableFields() {}

  /**
   * {@code state} with every field the form did not let the user write replaced by its value in
   * {@code baseline} (a state-shaped map of the server's own instance), or removed when the
   * baseline has none.
   */
  static Map<String, Object> restrict(
      Class<?> entityClass,
      Map<String, Object> state,
      Object baselineInstance,
      Map<String, Object> baseline,
      String idField,
      boolean creation,
      HttpRequest httpRequest) {
    if (state == null) {
      return null;
    }
    var restricted = new LinkedHashMap<>(state);
    for (Field field : getAllFields(entityClass)) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      var name = field.getName();
      if (!isServerOwned(field, baselineInstance, idField, creation, httpRequest)) {
        // writable itself, but what it nests may not be (an @Inline Pay's @ReadOnlyUnless salary)
        if (restricted.get(name) != null) {
          restricted.put(
              name,
              nested(
                  field,
                  restricted.get(name),
                  baseline != null ? baseline.get(name) : null,
                  httpRequest,
                  0));
        }
        continue;
      }
      if (baseline != null && baseline.containsKey(name)) {
        restricted.put(name, baseline.get(name));
      } else {
        restricted.remove(name);
      }
    }
    return restricted;
  }

  /**
   * The entity a save stores: {@code posted} with the fields the form did not let the user write
   * taken from {@code baselineInstance} (see {@link #restrict}), laid over the baseline so the
   * fields the posted state does not carry keep their values, and built as the SERVER — the
   * protected fields now carry the stored values, which the client-state filter would otherwise
   * drop as if the client had sent them, erasing them (GA review: an edit by a user who cannot see
   * an {@code @EyesOnly} field blanked it).
   */
  @SuppressWarnings("unchecked")
  public static <T> T entityFor(
      Class<T> entityClass,
      Map<String, Object> posted,
      Object baselineInstance,
      String idField,
      boolean creation,
      HttpRequest httpRequest) {
    var baseline =
        baselineInstance == null
            ? null
            : io.mateu.core.infra.declarative.FormViewModel.toMap(baselineInstance);
    var restricted =
        restrict(
            entityClass,
            posted == null ? Map.of() : posted,
            baselineInstance,
            baseline,
            idField,
            creation,
            httpRequest);
    var merged = new LinkedHashMap<String, Object>();
    if (baseline != null) {
      merged.putAll(baseline);
    }
    merged.putAll(restricted);
    return FieldAccess.asServer(
        () ->
            (T)
                io.mateu.uidl.interfaces.MateuInstanceFactory.newInstance(
                    entityClass, merged, httpRequest));
  }

  /**
   * Runs an app-written save or create ({@code Editable.save}, {@code Creatable.create}) with the
   * request's posted form state replaced by what the form let the user write laid over {@code
   * baselineInstance} (the record {@code edit(id)} answers, the fresh {@code creationForm()}), and
   * with the state read as the SERVER's, so the app's {@code getComponentState(...)} sees the
   * baseline's protected values instead of losing them — never a blank object filled from client
   * state.
   */
  @SuppressWarnings("unchecked")
  public static <T> T runWithWritableState(
      HttpRequest httpRequest,
      Class<?> formClass,
      Object baselineInstance,
      String idField,
      boolean creation,
      java.util.function.Function<HttpRequest, T> work) {
    var rq = httpRequest.runActionRq();
    if (rq == null || formClass == null) {
      return work.apply(httpRequest);
    }
    var parameters = rq.parameters();
    var bubbled =
        parameters != null && parameters.get("initiatorState") instanceof Map<?, ?> m
            ? (Map<String, Object>) m
            : null;
    var posted = bubbled != null ? bubbled : rq.componentState();
    var baseline =
        baselineInstance == null
            ? null
            : io.mateu.core.infra.declarative.FormViewModel.toMap(baselineInstance);
    var restricted =
        restrict(
            formClass,
            posted == null ? Map.of() : posted,
            baselineInstance,
            baseline,
            idField,
            creation,
            httpRequest);
    var merged = new LinkedHashMap<String, Object>();
    if (baseline != null) {
      merged.putAll(baseline);
    }
    merged.putAll(restricted);
    io.mateu.dtos.RunActionRqDto copy;
    if (bubbled != null) {
      var newParameters = new LinkedHashMap<String, Object>(parameters);
      newParameters.put("initiatorState", merged);
      copy = io.mateu.core.domain.RequestOverride.copy(rq, null, newParameters);
    } else {
      copy = io.mateu.core.domain.RequestOverride.copy(rq, merged, null);
    }
    var narrowed = io.mateu.core.domain.RequestOverride.withRunActionRq(httpRequest, copy);
    return FieldAccess.asServer(() -> work.apply(narrowed));
  }

  /** The declared id of a form ({@code @PrimaryKey}, else a field named {@code id}), or null. */
  public static String declaredIdOf(Class<?> type) {
    String named = null;
    for (var field : getAllFields(type)) {
      if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.PrimaryKey.class)) {
        return field.getName();
      }
      if ("id".equals(field.getName())) {
        named = "id";
      }
    }
    return named;
  }

  /**
   * An inline-edited row as posted, narrowed to the CELLS of the grid: a field the listing does not
   * draw as a column ({@code @Hidden}, {@code @HiddenInList}, the {@code @Details} pane, a menu, a
   * collection, one hidden from the caller) was never editable in place, so a row naming it is not
   * an edit of it.
   */
  public static Map<String, Object> gridCells(
      Class<?> entityClass, Map<String, Object> row, HttpRequest httpRequest) {
    if (row == null) {
      return null;
    }
    var cells = new LinkedHashMap<String, Object>();
    for (Field field : getAllFields(entityClass)) {
      var name = field.getName();
      if (!row.containsKey(name)
          || Modifier.isStatic(field.getModifiers())
          || MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Hidden.class)
          || MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.HiddenInList.class)
          || MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Details.class)
          || MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Menu.class)
          || java.util.Collection.class.isAssignableFrom(field.getType())
          || !FieldAccess.isShown(field, httpRequest)) {
        continue;
      }
      cells.put(name, row.get(name));
    }
    return cells;
  }

  /**
   * A nested value as posted, with what the caller may not write inside it taken from the stored
   * {@code baseline} value (matched by position for a list), else dropped.
   */
  @SuppressWarnings("unchecked")
  private static Object nested(
      Field field, Object posted, Object baseline, HttpRequest httpRequest, int depth) {
    if (depth > 8) {
      return posted;
    }
    if (posted instanceof Map<?, ?> map) {
      return overlay(field.getType(), (Map<String, Object>) map, baseline, httpRequest, depth);
    }
    if (posted instanceof List<?> list
        && field.getGenericType() instanceof ParameterizedType parameterized
        && parameterized.getActualTypeArguments().length == 1
        && parameterized.getActualTypeArguments()[0] instanceof Class<?> element) {
      var stored = baseline instanceof List<?> l ? l : List.of();
      var out = new ArrayList<Object>(list.size());
      for (int i = 0; i < list.size(); i++) {
        var item = list.get(i);
        out.add(
            item instanceof Map<?, ?> map
                ? overlay(
                    element,
                    (Map<String, Object>) map,
                    i < stored.size() ? stored.get(i) : null,
                    httpRequest,
                    depth)
                : item);
      }
      return out;
    }
    return posted;
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> overlay(
      Class<?> type,
      Map<String, Object> posted,
      Object baseline,
      HttpRequest httpRequest,
      int depth) {
    if (!FieldAccess.isGuarded(type)) {
      return posted;
    }
    var stored = baseline instanceof Map<?, ?> m ? (Map<String, Object>) m : null;
    var out = new LinkedHashMap<>(posted);
    for (Field field : getAllFields(type)) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      var name = field.getName();
      if (!FieldAccess.mayWrite(field, httpRequest)) {
        if (stored != null && stored.containsKey(name)) {
          out.put(name, stored.get(name));
        } else {
          out.remove(name);
        }
      } else if (out.get(name) != null) {
        out.put(
            name,
            nested(
                field,
                out.get(name),
                stored != null ? stored.get(name) : null,
                httpRequest,
                depth + 1));
      }
    }
    return out;
  }

  private static boolean isServerOwned(
      Field field, Object baselineInstance, String idField, boolean creation, HttpRequest rq) {
    if (MetaAnnotations.isPresent(field, Version.class) || OptimisticLock.isStoreManaged(field)) {
      return false; // the client's copy is what the conflict check compares
    }
    if (!creation && field.getName().equals(idField)) {
      return true; // an edit saves the record it loaded, never another one
    }
    if (creation && MetaAnnotations.isPresent(field, GeneratedValue.class)) {
      return false; // generated by the server for the form being saved
    }
    if (creation
        && field
            .getName()
            .equals(
                io.mateu.core.domain.out.componentmapper.TechnicalId.of(
                    baselineInstance != null
                        ? baselineInstance.getClass()
                        : field.getDeclaringClass()))) {
      return true; // a technical id: the store assigns it, the creation form has no input for it
    }
    // a field the caller may not write — hidden from them (@EyesOnly), locked (@ReadOnlyUnless,
    // @DisabledUnless) — keeps the stored value: it never reached their form, so its absence in
    // the posted state is not an edit
    return !FieldAccess.mayWrite(field, rq)
        || PageFormBuilder.isReadOnly(field, baselineInstance, creation, rq)
        || PageFormBuilder.isHiddenInEditor(field, creation);
  }
}
