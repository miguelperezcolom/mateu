package io.mateu.uidl.interfaces;

public interface HasPostHydrationMethod {

  void onHydrated(HttpRequest httpRequest);
}
