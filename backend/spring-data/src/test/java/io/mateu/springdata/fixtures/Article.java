package io.mateu.springdata.fixtures;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Version;

/** The AutoCrud fixture: a String id and a JPA {@code @Version} kept in the form state. */
@Entity
public class Article implements Identifiable {

  @Id public String id;
  public String title;
  public int pages;

  @Version @Hidden public Long version;

  public Article() {}

  public Article(String id, String title, int pages) {
    this.id = id;
    this.title = title;
    this.pages = pages;
  }

  @Override
  public String id() {
    return id;
  }
}
