package io.mateu.core.domain.act;

import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.getLookupOptionsSupplier;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import jakarta.inject.Named;
import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

@Named
public class SearchFieldActionRunner implements ActionRunner {

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    // Wizards resolve search-<field> against the CURRENT STEP through their own dispatcher
    // (WizardActionDispatcher → WizardLookupHandler); claiming the action here made @Lookup
    // fields inside wizard steps unreachable (the field was looked up on the wizard itself).
    if (instance instanceof io.mateu.core.infra.declarative.orchestrators.wizard.Wizard) {
      return false;
    }
    return actionId != null && actionId.startsWith("search-");
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var actionId = command.actionId();
    if (actionId.startsWith("search-")) {
      var httpRequest = command.httpRequest();
      // search-field-childfield (nested/inline grid) or search-field (plain @Lookup field).
      String fieldName = actionId.substring("search-".length());
      var target = parseSearchTarget(fieldName);
      LookupOptionsSupplier optionsSupplier = null;
      Lookup fkAnnotation = null;
      if (target.child() != null) {
        var parentFieldName = target.parent();
        var childFieldName = target.child();
        var rowClass =
            getGenericClass(
                (ParameterizedType)
                    getFieldByName(getViewModelClass(instance, httpRequest), parentFieldName)
                        .getGenericType(),
                List.class,
                "E");
        optionsSupplier =
            getLookupOptionsSupplier(instance, getFieldByName(rowClass, childFieldName));
      } else {
        optionsSupplier =
            getLookupOptionsSupplier(
                instance, getFieldByName(getViewModelClass(instance, httpRequest), fieldName));
      }

      if (optionsSupplier == null) {
        throw new RuntimeException("no lookup options supplier found for field " + fieldName);
      }

      Pageable pageable = httpRequest.getParameters(Pageable.class);
      String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
      if (searchText == null) {
        searchText = "";
      }
      var cleanSearchText = searchText.toLowerCase();

      var listingData = optionsSupplier.search(fieldName, cleanSearchText, pageable, httpRequest);
      if (listingData == null || listingData.page() == null) {
        throw new RuntimeException(
            "no data returned when searching for " + fieldName + " with " + cleanSearchText + "");
      }

      return Flux.just(new Data(Map.of(fieldName, listingData.page())));
    }
    return null;
  }

  /**
   * Splits a {@code search-} action target (the id with the {@code search-} prefix already removed)
   * into the parent field and, for a nested/inline-grid column search, its child column. The child
   * (column) is always a bare Java identifier with no dash, so we split on the <b>last</b> dash:
   * this stays correct even when the parent grid field id carries a prefix that itself contains
   * dashes. A target with no dash is a plain {@code @Lookup} field ({@code child == null}).
   */
  static SearchTarget parseSearchTarget(String target) {
    if (target.contains("-")) {
      int cut = target.lastIndexOf('-');
      return new SearchTarget(target.substring(0, cut), target.substring(cut + 1));
    }
    return new SearchTarget(target, null);
  }

  // public: micronaut's @Import(annotated = "*") picks up nested types as beans, and the
  // generated bean definition must be able to access the canonical constructor
  public record SearchTarget(String parent, String child) {}
}
