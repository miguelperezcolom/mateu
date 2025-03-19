package io.mateu.core.infra;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;

public class JsonSerializer {

  @SneakyThrows
  public static String toJson(Object object) {
    ObjectMapper mapper = new ObjectMapper();
    return mapper.writeValueAsString(object);
  }
}
