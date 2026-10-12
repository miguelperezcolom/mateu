package io.mateu.core.domain.out;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isPage;

import io.mateu.core.infra.documents.DocumentCommands;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.data.Document;
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

      // a returned command (or list of commands) is behaviour, not a page: its toString() is no
      // window title (the @Searchable pick answered «[UICommand[type=DispatchEvent…» as one)
      if (!isCommandResult(instance) && isPage(instance, httpRequest.runActionRq().route())) {
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
      } else if (httpRequest.getAttribute("windowTitle") == null
          && instance instanceof io.mateu.uidl.interfaces.ComponentTreeSupplier
          && declaresTitle(titleSource(instance))) {
        // A composed page (Dashboard, Welcome, HeroSearch, SmartSearchPage, Foldout,
        // ItemOverview, GanttPage, DataManagement…) is not reflected as a page, so its @Title
        // never reached the window: the tab kept the previous page's title, and the route-change
        // announcement screen readers rely on (SetWindowTitle) never came.
        result.add(
            new UICommandDto(
                targetComponentId,
                UICommandTypeDto.SetWindowTitle,
                getTitle(titleSource(instance))));
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
    // a Document is shown or downloaded: lowered to a DownloadFile command, the bytes inline or
    // behind a single-use URL (DocumentCommands decides)
    if (instance instanceof Document document) {
      result.add(mapDocument(targetComponentId, document, baseUrl));
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
              .filter(o -> o instanceof UICommand || o instanceof Step || o instanceof Document)
              .map(
                  o ->
                      o instanceof Document document
                          ? mapDocument(targetComponentId, document, baseUrl)
                          : mapCommand(
                              targetComponentId,
                              o instanceof Step s ? s.toCommand() : (UICommand) o))
              .toList());
    }
    return result;
  }

  /**
   * What names the window for a composed page: the plain class an {@code @AutoPage} bridge or a
   * component adapter renders carries the {@code @Title}, not the bridge.
   */
  private static Object titleSource(Object instance) {
    return io.mateu.core.infra.ModelBridge.ownerOf(instance);
  }

  /** Whether the view names its own title — never a humanized class name or a toString. */
  private static boolean declaresTitle(Object instance) {
    return instance instanceof io.mateu.uidl.interfaces.TitleSupplier
        || io.mateu.core.infra.reflection.MetaAnnotations.isPresent(
            instance.getClass(), io.mateu.uidl.annotations.Title.class);
  }

  private static boolean isCommandResult(Object instance) {
    if (instance instanceof UICommand || instance instanceof Step || instance instanceof Document) {
      return true;
    }
    // a wire DTO handed back as is — a LongTask progress step is a UIFragmentDto aimed at the
    // progress dialog — is no page either: its toString() used to become the window title
    // ("UIFragmentDto[targetComponentId=…"), announced by screen readers on every step
    if (instance instanceof io.mateu.dtos.UIFragmentDto
        || instance instanceof io.mateu.dtos.UIIncrementDto) {
      return true;
    }
    return instance instanceof Collection<?> collection
        && !collection.isEmpty()
        && collection.stream()
            .allMatch(o -> o instanceof UICommand || o instanceof Step || o instanceof Document);
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

  private static UICommandDto mapDocument(
      String targetComponentId, Document document, String baseUrl) {
    return new UICommandDto(
        targetComponentId,
        UICommandTypeDto.DownloadFile,
        DocumentCommands.toFileDownload(document, baseUrl));
  }

  private static UICommandDto mapCommand(String targetComponentId, UICommand command) {
    return new UICommandDto(
        targetComponentId, UICommandTypeDto.valueOf(command.type().name()), command.data());
  }
}
