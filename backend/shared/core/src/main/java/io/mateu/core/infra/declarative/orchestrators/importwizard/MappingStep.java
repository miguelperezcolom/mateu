package io.mateu.core.infra.declarative.orchestrators.importwizard;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import java.util.ArrayList;
import java.util.List;

/**
 * Second step of the {@link ImportWizard}: one {@link ColumnMapping} row per CSV column, populated
 * when leaving the upload step (header + first data row, auto-mapped by name similarity). The
 * {@code targetField} cell is edited in place with a select whose options are the row class's
 * assignable field names — supplied via {@link OptionsSupplier}, which the grid inline-editor
 * machinery consults on the form instance.
 */
public class MappingStep implements WizardStep, OptionsSupplier {

  @InlineEditing
  @Label("Column mapping")
  public List<ColumnMapping> mappings = new ArrayList<>();

  /**
   * The row class the options derive from; travels in the (hidden) state so the select options
   * survive re-renders — the step is re-instantiated from the state on every request.
   */
  @Hidden public String rowClassName;

  @Override
  public boolean supports(Class<?> fieldType, String fieldName, Class<?> formType) {
    return "targetField".equals(fieldName);
  }

  @Override
  public List<Option> options(String fieldName, HttpRequest httpRequest) {
    if (!"targetField".equals(fieldName) || rowClassName == null || rowClassName.isBlank()) {
      return List.of();
    }
    try {
      var rowClass = forName(rowClassName);
      var options = new ArrayList<Option>();
      options.add(new Option("", "— skip —"));
      ImportRowAssembler.assignableFields(rowClass)
          .forEach(field -> options.add(new Option(field.getName(), field.getName())));
      return options;
    } catch (ClassNotFoundException e) {
      return List.of();
    }
  }
}
