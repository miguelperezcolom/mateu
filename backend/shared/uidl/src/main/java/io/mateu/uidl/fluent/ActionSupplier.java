package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

public interface ActionSupplier {

  List<Action> actions(HttpRequest httpRequest);
}
