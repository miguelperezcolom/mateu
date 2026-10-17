package io.mateu.sample1.app.journeys;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Optimistic locking on a ROUTED crud (tests/journeys/crud.spec.ts): the editor is its own page
 * ({@code /j/articles/A-1/edit}), and {@code @Version} turns a stale save into the conflict dialog.
 */
@UI("/j/articles")
@Title("Journey articles")
public class JArticlesCrud extends AutoCrud<JArticlesCrud.Article> {

  public static class Article implements Identifiable {
    public String id;
    public String name;
    public int stock;
    @Version public long version;

    public Article() {}

    Article(String id, String name, int stock) {
      this.id = id;
      this.name = name;
      this.stock = stock;
      this.version = 1;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static final List<Article> ARTICLES = new CopyOnWriteArrayList<>();

  static {
    reset();
  }

  static void reset() {
    ARTICLES.clear();
    ARTICLES.add(new Article("A-1", "Original", 7));
  }

  @Override
  public CrudStore<Article> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Article> findById(String id) {
        return ARTICLES.stream().filter(a -> a.id.equals(id)).findFirst();
      }

      @Override
      public String save(Article entity) {
        ARTICLES.replaceAll(a -> a.id.equals(entity.id) ? entity : a);
        return entity.id;
      }

      @Override
      public List<Article> findAll() {
        return List.copyOf(ARTICLES);
      }

      @Override
      public void deleteAllById(List<String> ids) {
        ARTICLES.removeIf(a -> ids.contains(a.id));
      }
    };
  }
}
