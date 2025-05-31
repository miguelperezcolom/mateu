package io.mateu.uidl.interfaces;

import java.util.List;

public interface HasMenu {

  List<Actionable> createMenu(HttpRequest httpRequest);
}
