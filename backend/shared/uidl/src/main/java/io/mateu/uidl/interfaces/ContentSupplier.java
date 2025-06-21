package io.mateu.uidl.interfaces;

public interface ContentSupplier<T extends Content> {

  T get(HttpRequest httpRequest);
}
