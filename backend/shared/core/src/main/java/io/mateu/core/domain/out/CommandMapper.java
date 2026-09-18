package io.mateu.core.domain.out;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isPage;

import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.fluent.Step;
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

    if (httpRequest.getAttribute("updateUrl") != null
        && !"_no_update".equals(httpRequest.getAttribute("updateUrl"))) {
      result.add(
          new UICommandDto(
              targetComponentId,
              UICommandTypeDto.PushStateToHistory,
              httpRequest.getAttribute("updateUrl")));
    }

    // an embedded mediator island is not the window — its (often suppressed/empty) title must
    // not clobber the host page's tab title
    if (!isEmbeddedMediatorRequest(httpRequest)) {
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
    // A flow Step is behavior returned from a method: lower it to its wire command (coherence-plan
    // #3). v0 verbs are 1:1 with a UICommand, so a returned Step (or a list of them) becomes
    // commands on the increment — the flow model made live, additively.
    if (instance instanceof Step step) {
      result.add(mapCommand(targetComponentId, step.toCommand()));
    }
    if (instance instanceof Collection<?> collection) {
      result.addAll(
          collection.stream()
              .filter(o -> o instanceof UICommand || o instanceof Step)
              .map(
                  o ->
                      mapCommand(
                          targetComponentId, o instanceof Step s ? s.toCommand() : (UICommand) o))
              .toList());
    }
    return result;
  }

  // same marker check as EditableView.isEmbedded / EmbeddedOrchestratorFieldBuilder
  private static boolean isEmbeddedMediatorRequest(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    if (rq == null) {
      return false;
    }
    return (rq.route() != null && rq.route().contains("_embeddedMediator"))
        || (rq.serverSideComponentRoute() != null
            && rq.serverSideComponentRoute().contains("_embeddedMediator"));
  }

  private static UICommandDto mapCommand(String targetComponentId, UICommand command) {
    return new UICommandDto(
        targetComponentId, UICommandTypeDto.valueOf(command.type().name()), command.data());
  }
}
