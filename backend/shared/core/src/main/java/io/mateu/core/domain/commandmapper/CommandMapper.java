package io.mateu.core.domain.commandmapper;

import io.mateu.dtos.UICommandDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class CommandMapper {

  public static List<UICommandDto> mapToCommandDtos(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    return List.of();
  }
}
