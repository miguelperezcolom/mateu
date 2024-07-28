package io.mateu.core.application.util;

import com.google.common.base.Strings;
import io.mateu.core.domain.uidefinition.shared.interfaces.SortCriteria;
import io.mateu.core.domain.uidefinition.shared.interfaces.SortType;
import io.mateu.core.domain.model.util.Serializer;
import java.util.*;
import java.util.stream.Collectors;

public class OrderingDeserializer {

  private final String raw;

  public OrderingDeserializer(String raw) {
    this.raw = raw;
  }

  public List<SortCriteria> deserialize(Serializer serializer) {
    if (Strings.isNullOrEmpty(raw)) {
      return List.of();
    }
    try {
      List<Map<String, Object>> data =
          (List<Map<String, Object>>)
              serializer.fromJson(new String(Base64.getDecoder().decode(raw)), ArrayList.class);
      return data.stream()
          .map(
              m ->
                  new SortCriteria(
                      (String) m.get("column"), SortType.valueOf((String) m.get("order"))))
          .collect(Collectors.toList());
    } catch (Exception e) {
      e.printStackTrace();
    }
    return List.of();
  }
}
