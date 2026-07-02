package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;
import java.util.List;

public interface HeaderSupplier {

  List<Component> header(HttpRequest httpRequest);
}
