package io.mateu.core.domain.out.commandmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isPage;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;

import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.interfaces.CommandSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class CommandMapper {

  public static List<UICommandDto> mapToCommandDtos(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    String targetComponentId = httpRequest.runActionRq().initiatorComponentId();

    List<UICommandDto> result = new ArrayList<>();

    if (httpRequest.getAttribute("updateUrl") != null && !"_no_update".equals(httpRequest.getAttribute("updateUrl"))) {
      result.add(
          new UICommandDto(
              targetComponentId,
              UICommandTypeDto.PushStateToHistory,
              httpRequest.getAttribute("updateUrl")));
    }

    if (httpRequest.getAttribute("windowTitle") != null) {
      result.add(
          new UICommandDto(
              targetComponentId,
              UICommandTypeDto.SetWindowTitle,
              httpRequest.getAttribute("windowTitle")));
    }

    if (isPage(instance, httpRequest.runActionRq().route())) {
      if (httpRequest.getAttribute("windowTitle") == null) {
        result.add(
            new UICommandDto(
                targetComponentId, UICommandTypeDto.SetWindowTitle, getTitle(instance)));
      } else {
        result.add(
            new UICommandDto(
                targetComponentId,
                UICommandTypeDto.SetWindowTitle,
                httpRequest.getAttribute("windowTitle")));
      }
    }

    if (instance instanceof CommandSupplier commandSupplier) {
      result.addAll(
          commandSupplier.commands(httpRequest).stream()
              .map(command -> mapCommand(targetComponentId, (UICommand) command))
              .toList());
    }
    if (instance instanceof URI uri) {
      result.add(mapCommand(targetComponentId, UICommand.navigateTo(uri.toString())));
    }
    if (instance instanceof URL url) {
      result.add(
          mapCommand(targetComponentId, new UICommand(UICommandType.NavigateTo, url.toString())));
    }
    if (instance instanceof UICommand command) {
      result.add(mapCommand(targetComponentId, command));
    }
    if (instance instanceof Collection<?> collection) {
      result.addAll(
          collection.stream()
              .filter(o -> o instanceof UICommand)
              .map(command -> mapCommand(targetComponentId, (UICommand) command))
              .toList());
    }
    return result;
  }

  private static UICommandDto mapCommand(String targetComponentId, UICommand command) {
    return new UICommandDto(
        targetComponentId, UICommandTypeDto.valueOf(command.type().name()), command.data());
  }
}
