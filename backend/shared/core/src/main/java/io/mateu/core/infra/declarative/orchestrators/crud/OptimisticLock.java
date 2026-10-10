package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.Optional;

/**
 * Optimistic locking over the entity's {@code @Version} field: {@link #check} compares the incoming
 * entity's version against the stored one and throws {@link StaleEditException} when someone else
 * saved in between (unless the request carries {@code _forceOverwrite}, the conflict dialog's
 * explicit override), and {@link #bump} increments the version before persisting. Both are no-ops
 * for entities without a {@code @Version} field.
 *
 * <p>A <em>store-managed</em> version — a field carrying JPA's {@code jakarta.persistence.Version}
 * (or {@code javax.persistence.Version}, or Spring Data's {@code
 * org.springframework.data.annotation.Version}) — takes part in {@link #check} exactly like Mateu's
 * own {@code @Version}, so a stale save opens the same conflict dialog and the overwrite button
 * adopts the stored version; but {@link #bump} leaves it alone, because the persistence provider
 * increments it itself (bumping it here would make the provider see a version that is not the
 * stored one and reject every save). The annotations are matched by name, so core needs no JPA
 * dependency.
 */
public final class OptimisticLock {

  /** Signals a concurrent edit: the stored entity is newer than the one being saved. */
  public static class StaleEditException extends RuntimeException {
    public StaleEditException() {
      super("The record was modified by someone else while you were editing it");
    }

    /** Same, translating the persistence provider's own optimistic-lock failure. */
    public StaleEditException(Throwable cause) {
      super("The record was modified by someone else while you were editing it", cause);
    }
  }

  /** Version annotations whose field the persistence provider increments by itself. */
  private static final java.util.Set<String> STORE_MANAGED_VERSIONS =
      java.util.Set.of(
          "jakarta.persistence.Version",
          "javax.persistence.Version",
          "org.springframework.data.annotation.Version");

  private OptimisticLock() {}

  public static Optional<Field> versionField(Class<?> entityClass) {
    for (Class<?> current = entityClass;
        current != null && current != Object.class;
        current = current.getSuperclass()) {
      for (Field field : current.getDeclaredFields()) {
        if (MetaAnnotations.isPresent(field, Version.class) || isStoreManaged(field)) {
          field.setAccessible(true);
          return Optional.of(field);
        }
      }
    }
    return Optional.empty();
  }

  /**
   * Whether the version field is incremented by the persistence provider (JPA / Spring Data
   * {@code @Version}) rather than by Mateu.
   */
  public static boolean isStoreManaged(Field field) {
    for (var annotation : field.getAnnotations()) {
      if (STORE_MANAGED_VERSIONS.contains(annotation.annotationType().getName())) {
        return true;
      }
    }
    return false;
  }

  public static <T> void check(T incoming, Optional<T> stored, HttpRequest httpRequest) {
    if (stored.isEmpty()) {
      return;
    }
    var field = versionField(incoming.getClass());
    if (field.isEmpty()) {
      return;
    }
    // the @Version field is setAccessible(true) in versionField, so IllegalAccessException is
    // effectively unreachable — wrapped so callers don't need @SneakyThrows.
    try {
      if (forceOverwrite(httpRequest)) {
        // the user chose to overwrite from the conflict dialog: adopt the STORED version so the
        // bump below moves it forward instead of resurrecting the stale one
        field.get().set(incoming, field.get().get(stored.get()));
        return;
      }
      Object incomingVersion = field.get().get(incoming);
      Object storedVersion = field.get().get(stored.get());
      if (incomingVersion == null || storedVersion == null) {
        // the form did not carry the version (or the row has none yet): nothing to compare
        return;
      }
      if (isNewer(storedVersion, incomingVersion)) {
        throw new StaleEditException();
      }
    } catch (IllegalAccessException e) {
      throw new RuntimeException(e);
    }
  }

  /** Numbers compare numerically whatever their type; JPA timestamp versions as Comparables. */
  @SuppressWarnings({"unchecked", "rawtypes"})
  private static boolean isNewer(Object stored, Object incoming) {
    if (stored instanceof Number storedNumber && incoming instanceof Number incomingNumber) {
      return storedNumber.longValue() > incomingNumber.longValue();
    }
    if (stored instanceof Comparable comparable && stored.getClass().isInstance(incoming)) {
      return comparable.compareTo(incoming) > 0;
    }
    return !stored.equals(incoming);
  }

  public static <T> void bump(T entity) {
    var field = versionField(entity.getClass());
    if (field.isEmpty() || isStoreManaged(field.get())) {
      return;
    }
    try {
      Object current = field.get().get(entity);
      if (!(current instanceof Number number)) {
        return;
      }
      long version = number.longValue();
      if (field.get().getType() == int.class || field.get().getType() == Integer.class) {
        field.get().set(entity, (int) (version + 1));
      } else {
        field.get().set(entity, version + 1);
      }
    } catch (IllegalAccessException e) {
      throw new RuntimeException(e);
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
