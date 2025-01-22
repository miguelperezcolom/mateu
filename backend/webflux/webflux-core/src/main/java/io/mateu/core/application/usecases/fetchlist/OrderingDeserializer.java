package io.mateu.core.application.usecases.fetchlist;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.dtos.SortCriteriaDto;
import io.mateu.dtos.SortTypeDto;
import java.nio.charset.Charset;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class OrderingDeserializer {

  private final SerializerService serializerService;

  public OrderingDeserializer(SerializerService serializerService) {
    this.serializerService = serializerService;
  }

  public List<SortCriteriaDto> deserialize(String raw) {
    if (Strings.isNullOrEmpty(raw)) {
      return List.of();
    }
    try {
      List<Map<String, Object>> data =
          (List<Map<String, Object>>)
              serializerService.fromJson(
                  new String(Base64.getDecoder().decode(raw), Charset.defaultCharset()),
                  ArrayList.class);
      return data.stream()
          .map(
              m ->
                  new SortCriteriaDto(
                      (String) m.get("column"), SortTypeDto.valueOf((String) m.get("order"))))
          .collect(Collectors.toList());
    } catch (Exception e) {
      e.printStackTrace();
    }
    return List.of();
  }
}
