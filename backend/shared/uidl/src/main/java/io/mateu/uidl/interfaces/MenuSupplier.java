package io.mateu.uidl.interfaces;

import java.util.List;

public interface MenuSupplier {

  List<Actionable> menu(HttpRequest httpRequest);
}
