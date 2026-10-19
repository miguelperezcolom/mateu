package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.InlineEditing;

/**
 * Whether a crud offers {@code update-row} — the write behind inline editing: only when it edits
 * inline (class-level {@code @InlineEditing}, on the crud or the class its metadata comes from) AND
 * lets the user edit at all ({@code canEdit()}). It used to be advertised by every crud, so any
 * listing accepted a crafted row write.
 */
@io.mateu.uidl.annotations.Internal
public final class InlineEditingGate {

  private InlineEditingGate() {}

  public static boolean offered(Crud<?, ?, ?, ?, ?, ?> crud) {
    if (crud == null || !crud.canEdit()) {
      return false;
    }
    return MetaAnnotations.isPresent(crud.getClass(), InlineEditing.class)
        || MetaAnnotations.isPresent(crud.metadataSource(), InlineEditing.class);
  }
}
