package io.mateu.core.infra.reflection.write;

import static io.mateu.core.domain.act.DefaultActionRunnerProvider.asFlux;
import static io.mateu.core.infra.declarative.crudorchestrator.DataLayer.getLookupOptionsSupplier;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.act.ActionRunner;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

@Named
@RequiredArgsConstructor
public class ForeignKeyResolverActionRunner implements ActionRunner {

  private final InstanceFactoryProvider instanceFactoryProvider;

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    if (actionId.startsWith("search-")) {
      var field = getFieldByName(instance.getClass(), actionId.substring("search-".length()));
      if (field != null) {
        return field.isAnnotationPresent(Lookup.class);
      }
    }
    return false;
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var fieldName = command.actionId().substring("search-".length());
    var field = getFieldByName(instance.getClass(), fieldName);
    var optionsSupplier = getLookupOptionsSupplier(instance, field);
    var httpRequest = command.httpRequest();
    Pageable pageable = httpRequest.getParameters(Pageable.class);
    String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
    if (searchText == null) {
      searchText = "";
    }
    var cleanSearchText = searchText.toLowerCase();

    var listingData = optionsSupplier.search(fieldName, cleanSearchText, pageable, httpRequest);

    var result = new Data(Map.of(fieldName, listingData.page()));
    return asFlux(result, instance);
  }
}
