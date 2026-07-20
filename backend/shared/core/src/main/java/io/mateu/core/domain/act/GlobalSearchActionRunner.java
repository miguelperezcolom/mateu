package io.mateu.core.domain.act;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.interfaces.GlobalSearchSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

/**
 * The command palette's entity search: {@code _globalsearch} with a {@code searchText} parameter,
 * dispatched app-level (the palette lives on the shell — same rail as the {@code @AppContext}
 * remote search), answering {@code Data{_globalsearch: [...]}} from the app class's {@link
 * GlobalSearchSupplier}.
 */
@Named
public class GlobalSearchActionRunner implements ActionRunner {

  public static final String ACTION_ID = "_globalsearch";

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return ACTION_ID.equals(actionId);
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    var supplier = findSupplier(instance, httpRequest);
    if (supplier == null) {
      throw new RuntimeException(
          "the app class does not implement GlobalSearchSupplier — no global search to serve");
    }
    var parameters = httpRequest.runActionRq().parameters();
    var searchText =
        parameters != null && parameters.get("searchText") != null
            ? parameters.get("searchText").toString()
            : "";
    var results = supplier.globalSearch(searchText, httpRequest);
    return Flux.just(new Data(Map.of("_globalsearch", results != null ? results : List.of())));
  }

  /**
   * The resolved instance may be the shell wrapper — the palette sends the app's serverSideType.
   */
  @SneakyThrows
  private GlobalSearchSupplier findSupplier(Object instance, HttpRequest httpRequest) {
    if (instance instanceof GlobalSearchSupplier supplier) {
      return supplier;
    }
    var serverSideType = httpRequest.runActionRq().serverSideType();
    if (serverSideType != null && !serverSideType.isBlank()) {
      var appClass = forName(serverSideType);
      if (GlobalSearchSupplier.class.isAssignableFrom(appClass)) {
        return (GlobalSearchSupplier)
            io.mateu.uidl.di.MateuBeanProvider.getBean(
                    io.mateu.uidl.interfaces.InstanceFactory.class)
                .newInstance(appClass, Map.of(), httpRequest);
      }
    }
    return null;
  }
}
