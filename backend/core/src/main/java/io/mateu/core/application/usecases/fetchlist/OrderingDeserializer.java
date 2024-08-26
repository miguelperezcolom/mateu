package io.mateu.core.application.usecases.fetchlist;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.dtos.SortCriteria;
import io.mateu.dtos.SortType;
import java.nio.charset.Charset;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class OrderingDeserializer {

  private final Serializer serializer;

  public OrderingDeserializer(Serializer serializer) {
    this.serializer = serializer;
  }

  public List<SortCriteria> deserialize(String raw) {
    if (Strings.isNullOrEmpty(raw)) {
      return List.of();
    }
    try {
      List<Map<String, Object>> data =
          (List<Map<String, Object>>)
              serializer.fromJson(
                  new String(Base64.getDecoder().decode(raw), Charset.defaultCharset()),
                  ArrayList.class);
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
