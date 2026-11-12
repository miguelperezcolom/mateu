package io.mateu.core.infra.uploads;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.FileStorage;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** Which {@link FileStorage} serves a field: by name, the default one, or the only one there is. */
public final class FileStorages {

  private FileStorages() {}

  /** The stores the application registered; empty before Mateu has booted. */
  public static Collection<FileStorage> registered() {
    try {
      if (!MateuBeanProvider.isInitialized()) {
        return List.of();
      }
      return MateuBeanProvider.getSingletonBeans(FileStorage.class);
    } catch (RuntimeException notInitialised) {
      return List.of();
    }
  }

  /**
   * The store named {@code name}; for a blank name the one named {@code ""}, else the only store
   * registered. A NAMED field gets only the store with that name — a typo must not silently land
   * files in another store (the field falls back to a data URI, and a WARN says why).
   */
  public static Optional<FileStorage> find(String name, Collection<FileStorage> stores) {
    var wanted = name == null ? "" : name.trim();
    for (var store : stores) {
      if (wanted.equals(nameOf(store))) {
        return Optional.of(store);
      }
    }
    if (wanted.isEmpty() && stores.size() == 1) {
      return Optional.of(stores.iterator().next());
    }
    return Optional.empty();
  }

  private static String nameOf(FileStorage store) {
    var name = store.name();
    return name == null ? "" : name.trim();
  }
}
