package io.mateu.core.domain.act;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.InstanceFactory;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import jakarta.inject.Named;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

/**
 * Server-side search for an application-level context selector ({@code @AppContext} field on the
 * app class): the header picker fires {@code _appcontext-search-<fieldName>} with a {@code
 * searchText} parameter when its loaded options may be truncated, and gets back the matching
 * options under {@code _appcontext_<fieldName>} (same page shape as the lookup fields' {@code
 * search-<field>} action). Options come from the field's type: enum constants filtered by
 * containment, or the {@code LookupOptionsSupplier}'s own search.
 */
@Named
public class AppContextSearchActionRunner implements ActionRunner {

  public static final String ACTION_PREFIX = "_appcontext-search-";

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return actionId != null && actionId.startsWith(ACTION_PREFIX);
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    var fieldName = command.actionId().substring(ACTION_PREFIX.length());
    // the resolved instance may be the app shell wrapper or the home content, not the app class
    // itself — the widget sends the app's serverSideType, which is where the field lives
    var field = findAppContextField(instance, httpRequest, fieldName);
    if (field == null || !MetaAnnotations.isPresent(field, AppContext.class)) {
      throw new RuntimeException(fieldName + " is not an @AppContext field");
    }
    var parameters = httpRequest.runActionRq().parameters();
    var searchText =
        parameters != null && parameters.get("searchText") != null
            ? parameters.get("searchText").toString().toLowerCase()
            : "";
    var page = searchOptions(field, searchText, httpRequest);
    return Flux.just(new Data(Map.of("_appcontext_" + fieldName, page)));
  }

  private java.lang.reflect.Field findAppContextField(
      Object instance, HttpRequest httpRequest, String fieldName) throws Exception {
    for (Class<?> c = instance.getClass(); c != null && c != Object.class; c = c.getSuperclass()) {
      try {
        return c.getDeclaredField(fieldName);
      } catch (NoSuchFieldException ignored) {
        // walk up, then fall back to the declared app type
      }
    }
    var serverSideType = httpRequest.runActionRq().serverSideType();
    if (serverSideType != null && !serverSideType.isBlank()) {
      return Class.forName(serverSideType).getDeclaredField(fieldName);
    }
    return null;
  }

  @SneakyThrows
  private Object searchOptions(
      java.lang.reflect.Field field, String searchText, HttpRequest httpRequest) {
    if (field.getType().isEnum()) {
      var options =
          Arrays.stream(field.getType().getEnumConstants())
              .map(
                  constant ->
                      new Option(
                          ((Enum<?>) constant).name(),
                          io.mateu.uidl.Humanizer.toUpperCaseFirst(((Enum<?>) constant).name())))
              .filter(option -> option.label().toLowerCase().contains(searchText))
              .toList();
      return io.mateu.uidl.data.ListingData.of(options.toArray(Option[]::new)).page();
    }
    if (LookupOptionsSupplier.class.isAssignableFrom(field.getType())) {
      var supplier =
          (LookupOptionsSupplier)
              MateuBeanProvider.getBean(InstanceFactory.class)
                  .newInstance(field.getType(), Map.of(), httpRequest);
      var listingData =
          supplier.search(
              field.getName(), searchText, new Pageable(0, 100, List.of()), httpRequest);
      if (listingData == null || listingData.page() == null) {
        throw new RuntimeException("no data returned when searching context " + field.getName());
      }
      return listingData.page();
    }
    throw new RuntimeException("the @AppContext field " + field.getName() + " provides no options");
  }
}
