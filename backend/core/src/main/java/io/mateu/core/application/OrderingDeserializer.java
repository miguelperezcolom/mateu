package io.mateu.core.application;

import com.google.common.base.Strings;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.mdd.shared.interfaces.SortType;
import io.mateu.util.Helper;
import java.util.*;
import java.util.stream.Collectors;

public class OrderingDeserializer {

  private final String raw;

  public OrderingDeserializer(String raw) {
    this.raw = raw;
  }

  public List<SortCriteria> deserialize() {
    if (Strings.isNullOrEmpty(raw)) {
      return List.of();
    }
    try {
      List<Map<String, Object>> data =
          (List<Map<String, Object>>)
              Helper.fromJson(new String(Base64.getDecoder().decode(raw)), ArrayList.class);
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