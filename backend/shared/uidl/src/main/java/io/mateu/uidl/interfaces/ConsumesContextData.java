package io.mateu.uidl.interfaces;

import java.util.Map;

public interface ConsumesContextData {

  void consume(Map<String, Object> context, HttpRequest httpRequest);
}
