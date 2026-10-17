package io.mateu.sample1.app.locking;

import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.interfaces.Identifiable;

/** A record under optimistic locking: two people editing it at once get the conflict dialog. */
public class LockedArticle implements Identifiable {
  public String id;
  public String name;
  @Version public long version;

  public LockedArticle() {}

  LockedArticle(String id, String name, long version) {
    this.id = id;
    this.name = name;
    this.version = version;
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
