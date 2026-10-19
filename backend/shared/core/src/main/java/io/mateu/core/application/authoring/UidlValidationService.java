package io.mateu.core.application.authoring;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.application.runaction.ActionRegistry;
import io.mateu.core.application.runaction.ComponentRegistry;
import io.mateu.core.application.runaction.FieldTypeRegistry;
import io.mateu.core.application.runaction.PartialRegistry;
import io.mateu.core.application.runaction.RestSourceRegistry;
import io.mateu.core.application.runaction.YamlUidlLoader;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Set;

/**
 * {@link UidlValidator} over THIS app: the semantic checks resolve against its source, action,
 * component and field type catalogues and its partials, and a definition the structural pass finds
 * no error in is also handed to the real loader — so "valid" never means "and then the page answers
 * Not found". Behind the reserved {@code __validate__} action, which the MCP endpoint and the
 * sidecar both call.
 */
@Named
@Singleton
public class UidlValidationService {

  /** Kinds the YAML loader turns into a component tree (the ones a load failure can hit). */
  private static final Set<String> LOADED_KINDS = Set.of("component", "envelope");

  private final RestSourceRegistry sources;
  private final ActionRegistry actions;
  private final ComponentRegistry components;
  private final FieldTypeRegistry fieldTypes;
  private final YamlUidlLoader loader;
  private final ObjectMapper om = new ObjectMapper();

  @Inject
  public UidlValidationService(
      RestSourceRegistry sources,
      ActionRegistry actions,
      ComponentRegistry components,
      FieldTypeRegistry fieldTypes,
      YamlUidlLoader loader) {
    this.sources = sources;
    this.actions = actions;
    this.components = components;
    this.fieldTypes = fieldTypes;
    this.loader = loader;
  }

  /** The validation report of {@code yaml} ({valid, kind, errors, warnings}). */
  public ObjectNode validate(String yaml) {
    var report =
        new UidlValidator(AuthoringResources.specsSchema(om), om).validate(yaml, context());
    if (report.path("valid").asBoolean() && LOADED_KINDS.contains(report.path("kind").asText())) {
      var parsed = loader.parseTextReporting(yaml);
      if (parsed.problem() != null) {
        var issue = report.withArray("errors").addObject();
        issue.put("code", "load_failed");
        issue.put("message", "The definition could not be loaded: " + parsed.problem());
        issue.put("path", "$");
        report.put("valid", false);
      }
    }
    return report;
  }

  ValidationContext context() {
    return new ValidationContext(
        name -> safe(() -> sources.get(name).isPresent()),
        name -> safe(() -> !PartialRegistry.instance().resolve(name, null).isEmpty()),
        name -> safe(() -> components.get(name).isPresent()),
        name -> safe(() -> actions.get(name).isPresent()),
        name -> safe(() -> fieldTypes.catalog().get(name).isPresent()));
  }

  private static boolean safe(java.util.function.BooleanSupplier check) {
    try {
      return check.getAsBoolean();
    } catch (RuntimeException e) {
      // a catalogue that cannot be read is not the author's mistake: do not flag the reference
      return true;
    }
  }
}
