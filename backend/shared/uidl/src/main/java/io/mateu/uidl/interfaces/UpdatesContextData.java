package io.mateu.uidl.interfaces;

import java.util.Map;

public interface UpdatesContextData {

  String getContextData(Map<String, Object> context, HttpRequest httpRequest);
}
