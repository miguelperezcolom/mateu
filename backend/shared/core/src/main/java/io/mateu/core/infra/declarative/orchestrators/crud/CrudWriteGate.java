package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.NotCreatable;
import io.mateu.uidl.annotations.NotDeletable;
import io.mateu.uidl.annotations.NotEditable;

/**
 * The ONE server-side answer to "may this crud create / edit / delete right now", consulted by
 * every write path (delete, bulk delete, save, create, save-and-next, update-row, the New/Edit
 * forms and their drawers) and by what the crud advertises. It is the conjunction of everything
 * that hides the affordance: {@code readOnly()} ({@code @ReadOnly} on the crud or its view class),
 * the {@code @NotCreatable}/{@code @NotEditable}/{@code @NotDeletable} annotations (on the crud or
 * the class its metadata comes from), the capability switches {@code canCreate()}/{@code
 * canEdit()}/{@code canDelete()} and the {@code display()} toggles ({@code off} and {@code
 * disabled} are both "cannot").
 *
 * <p>These used to be UI-only — the buttons were not drawn, but {@code delete}/{@code save}/{@code
 * create} were always advertised and ran when a request named them, so a view-only crud deleted and
 * wrote rows from a crafted request. A refused write is a {@link MateuForbiddenException}: 403 and
 * one WARN, like an action the view does not advertise.
 */
@io.mateu.uidl.annotations.Internal
public final class CrudWriteGate {

  private CrudWriteGate() {}

  public static boolean mayCreate(Crud<?, ?, ?, ?, ?, ?> crud) {
    return crud != null
        && !crud.readOnly()
        && crud.canCreate()
        && !annotated(crud, NotCreatable.class)
        && displayOf(crud).create().enabled();
  }

  public static boolean mayEdit(Crud<?, ?, ?, ?, ?, ?> crud) {
    return crud != null
        && !crud.readOnly()
        && crud.canEdit()
        && !annotated(crud, NotEditable.class);
  }

  public static boolean mayDelete(Crud<?, ?, ?, ?, ?, ?> crud) {
    return crud != null
        && !crud.readOnly()
        && crud.canDelete()
        && !annotated(crud, NotDeletable.class)
        && displayOf(crud).delete().enabled();
  }

  /** Refuses (403 + WARN) a create the crud does not offer. */
  public static void checkCreate(Crud<?, ?, ?, ?, ?, ?> crud) {
    if (!mayCreate(crud)) {
      throw refused("create", crud);
    }
  }

  /** Refuses (403 + WARN) an edit the crud does not offer. */
  public static void checkEdit(Crud<?, ?, ?, ?, ?, ?> crud) {
    if (!mayEdit(crud)) {
      throw refused("edit", crud);
    }
  }

  /** Refuses (403 + WARN) a delete the crud does not offer. */
  public static void checkDelete(Crud<?, ?, ?, ?, ?, ?> crud) {
    if (!mayDelete(crud)) {
      throw refused("delete", crud);
    }
  }

  private static io.mateu.uidl.data.CrudDisplay displayOf(Crud<?, ?, ?, ?, ?, ?> crud) {
    var display = crud.display();
    return display != null ? display : io.mateu.uidl.data.CrudDisplay.defaults();
  }

  private static boolean annotated(
      Crud<?, ?, ?, ?, ?, ?> crud, Class<? extends java.lang.annotation.Annotation> annotation) {
    var metadataSource = crud.metadataSource();
    return MetaAnnotations.isPresent(crud.getClass(), annotation)
        || (metadataSource != null && MetaAnnotations.isPresent(metadataSource, annotation));
  }

  private static MateuForbiddenException refused(String what, Crud<?, ?, ?, ?, ?, ?> crud) {
    return new MateuForbiddenException(
        what + ": " + crud.getClass().getName() + " does not let the user " + what);
  }
}
