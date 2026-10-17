package io.mateu.sample1.app.locking;

import io.mateu.uidl.interfaces.CrudStore;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** One in-memory table per screen, copied on read so each "user" edits their own instance. */
class LockedArticleStore implements CrudStore<LockedArticle> {

  private final List<LockedArticle> rows = new ArrayList<>();

  LockedArticleStore(String prefix) {
    rows.add(new LockedArticle(prefix + "1", "Original", 1));
    rows.add(new LockedArticle(prefix + "2", "Second", 1));
  }

  private static LockedArticle copy(LockedArticle a) {
    return new LockedArticle(a.id, a.name, a.version);
  }

  @Override
  public synchronized Optional<LockedArticle> findById(String id) {
    return rows.stream().filter(a -> a.id.equals(id)).findFirst().map(LockedArticleStore::copy);
  }

  @Override
  public synchronized String save(LockedArticle entity) {
    if (entity.id == null || entity.id.isBlank()) {
      entity.id = "n" + (rows.size() + 1);
    }
    var stored = copy(entity);
    if (rows.stream().anyMatch(a -> a.id.equals(stored.id))) {
      rows.replaceAll(a -> a.id.equals(stored.id) ? stored : a);
    } else {
      rows.add(stored);
    }
    return stored.id;
  }

  @Override
  public synchronized List<LockedArticle> findAll() {
    return rows.stream().map(LockedArticleStore::copy).toList();
  }

  @Override
  public synchronized void deleteAllById(List<String> ids) {
    rows.removeIf(a -> ids.contains(a.id));
  }
}
