package io.mateu.core.application.usecases.fetchlist;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.dtos.SortCriteria;
import io.mateu.dtos.SortType;
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