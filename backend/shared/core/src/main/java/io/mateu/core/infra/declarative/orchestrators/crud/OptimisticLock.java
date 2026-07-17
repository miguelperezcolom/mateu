package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.Optional;
import lombok.SneakyThrows;

/**
 * Optimistic locking over the entity's {@code @Version} field: {@link #check} compares the incoming
 * entity's version against the stored one and throws {@link StaleEditException} when someone else
 * saved in between (unless the request carries {@code _forceOverwrite}, the conflict dialog's
 * explicit override), and {@link #bump} increments the version before persisting. Both are no-ops
 * for entities without a {@code @Version} field.
 */
public final class OptimisticLock {

  /** Signals a concurrent edit: the stored entity is newer than the one being saved. */
  public static class StaleEditException extends RuntimeException {
    public StaleEditException() {
      super("The record was modified by someone else while you were editing it");
    }
  }

  private OptimisticLock() {}

  public static Optional<Field> versionField(Class<?> entityClass) {
    for (Class<?> current = entityClass;
        current != null && current != Object.class;
        current = current.getSuperclass()) {
      for (Field field : current.getDeclaredFields()) {
        if (MetaAnnotations.isPresent(field, Version.class)) {
          field.setAccessible(true);
          return Optional.of(field);
        }
      }
    }
    return Optional.empty();
  }

  @SneakyThrows
  public static <T> void check(T incoming, Optional<T> stored, HttpRequest httpRequest) {
    if (stored.isEmpty()) {
      return;
    }
    var field = versionField(incoming.getClass());
    if (field.isEmpty()) {
      return;
    }
    if (forceOverwrite(httpRequest)) {
      // the user chose to overwrite from the conflict dialog: adopt the STORED version so the
      // bump below moves it forward instead of resurrecting the stale one
      field.get().set(incoming, field.get().get(stored.get()));
      return;
    }
    long incomingVersion = ((Number) field.get().get(incoming)).longValue();
    long storedVersion = ((Number) field.get().get(stored.get())).longValue();
    if (storedVersion > incomingVersion) {
      throw new StaleEditException();
    }
  }

  @SneakyThrows
  public static <T> void bump(T entity) {
    var field = versionField(entity.getClass());
    if (field.isEmpty()) {
      return;
    }
    long version = ((Number) field.get().get(entity)).longValue();
    if (field.get().getType() == int.class || field.get().getType() == Integer.class) {
      field.get().set(entity, (int) (version + 1));
    } else {
      field.get().set(entity, version + 1);
    }
  }

  /**
   * The conflict dialog: reload (discard my changes and see theirs) or overwrite (my version wins,
   * explicitly — the overwrite button re-dispatches the save action with {@code _forceOverwrite}
   * merged into its parameters). Buttons bubble to the initiator component, which advertises both
   * actions.
   */
  public static io.mateu.uidl.data.Dialog conflictDialog(
      String text,
      String reloadActionId,
      String overwriteActionId,
      java.util.Map<String, Object> overwriteParameters) {
    var parameters = new java.util.LinkedHashMap<String, Object>();
    parameters.put("_forceOverwrite", true);
    if (overwriteParameters != null) {
      parameters.putAll(overwriteParameters);
    }
    return io.mateu.uidl.data.Dialog.builder()
        .headerTitle("Modificado por otro usuario")
        .content(
            io.mateu.uidl.data.VerticalLayout.builder()
                .content(
                    java.util.List.of(
                        io.mateu.uidl.data.Text.builder().text(text).build(),
                        io.mateu.uidl.data.HorizontalLayout.builder()
                            .content(
                                java.util.List.of(
                                    io.mateu.uidl.data.Button.builder()
                                        .label("Recargar")
                                        .actionId(reloadActionId)
                                        .build(),
                                    io.mateu.uidl.data.Button.builder()
                                        .label("Sobrescribir")
                                        .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary)
                                        .actionId(overwriteActionId)
                                        .parameters(parameters)
                                        .build()))
                            .style("justify-content: flex-end; gap: 0.5rem;")
                            .build()))
                .build())
        .width("30rem")
        .build();
  }

  private static boolean forceOverwrite(HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    return parameters != null && Boolean.TRUE.equals(toBoolean(parameters.get("_forceOverwrite")));
  }

  private static Boolean toBoolean(Object value) {
    if (value instanceof Boolean bool) {
      return bool;
    }
    return value != null && "true".equalsIgnoreCase(value.toString());
  }
}
