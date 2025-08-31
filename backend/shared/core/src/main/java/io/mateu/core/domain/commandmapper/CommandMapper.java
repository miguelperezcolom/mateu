package io.mateu.core.domain.commandmapper;

import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.net.URL;
import java.util.Collection;
import java.util.List;

public class CommandMapper {

  public static List<UICommandDto> mapToCommandDtos(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    String targetComponentId = httpRequest.runActionRq().initiatorComponentId();

    if (instance instanceof URI uri) {
      return List.of(mapCommand(targetComponentId, UICommand.navigateTo(uri.toString())));
    }
    if (instance instanceof URL url) {
      return List.of(
          mapCommand(targetComponentId, new UICommand(UICommandType.NavigateTo, url.toString())));
    }
    if (instance instanceof UICommand command) {
      return List.of(mapCommand(targetComponentId, command));
    }
    if (instance instanceof Collection<?> collection) {
      return collection.stream()
          .filter(o -> o instanceof UICommand)
          .map(command -> mapCommand(targetComponentId, (UICommand) command))
          .toList();
    }
    return List.of();
  }

  private static UICommandDto mapCommand(String targetComponentId, UICommand command) {
    return new UICommandDto(
        targetComponentId, UICommandTypeDto.valueOf(command.type().name()), command.data());
  }
}
