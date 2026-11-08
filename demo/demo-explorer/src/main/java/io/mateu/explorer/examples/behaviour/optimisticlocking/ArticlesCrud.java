package io.mateu.explorer.examples.behaviour.optimisticlocking;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.IntStream;

/**
 * A {@code @Version} field: every save bumps it, and a save carrying an older version than the
 * stored one — somebody saved in between — is not applied: the user gets a conflict dialog to
 * reload the record or overwrite it.
 */
@Title("Articles")
public class ArticlesCrud extends AutoCrud<ArticlesCrud.Article> {

  public static class Article implements Identifiable {
    public String id;
    public String title;
    public Integer stock;
    @Version public long version;

    public Article() {}

    Article(String id, String title, Integer stock) {
      this.id = id;
      this.title = title;
      this.stock = stock;
      this.version = 1;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return id + " " + title;
    }
  }

  static final String[] TITLES = {"Keyboard", "Mouse", "Monitor", "Webcam", "Headset"};

  static final List<Article> ARTICLES =
      new CopyOnWriteArrayList<>(
          IntStream.range(0, 50)
              .mapToObj(i -> new Article("A-" + (1 + i), TITLES[i % 5] + " " + (1 + i / 5), (i * 9) % 40))
              .toList());

  @Override
  public CrudStore<Article> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Article> findById(String id) {
        return ARTICLES.stream().filter(a -> a.id.equals(id)).findFirst();
      }

      @Override
      public String save(Article article) {
        ARTICLES.replaceAll(a -> a.id.equals(article.id) ? article : a);
        return article.id;
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
