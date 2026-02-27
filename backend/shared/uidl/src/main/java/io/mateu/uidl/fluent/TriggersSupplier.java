package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

public interface TriggersSupplier {

  List<Trigger> triggers(HttpRequest httpRequest);

}
