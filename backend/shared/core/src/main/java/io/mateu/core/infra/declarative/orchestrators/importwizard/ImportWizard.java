package io.mateu.core.infra.declarative.orchestrators.importwizard;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Guided CSV import wizard: upload (or paste) a CSV, map its columns onto the row class's fields
 * (auto-mapped by name similarity, adjustable in an inline-editable grid), review a validation
 * report (conversion failures + jakarta constraint violations per line), then import the valid rows
 * through {@link #importRows(List, HttpRequest)}. The result step shows imported/skipped counts.
 *
 * <p>Extend it, route it with {@code @UI}, and implement {@code importRows}:
 *
 * <pre>{@code
 * @UI("/product-import")
 * public class ProductImport extends ImportWizard<Product> {
 *   @Override
 *   protected void importRows(List<Product> rows, HttpRequest httpRequest) {
 *     rows.forEach(repository::save);
 *   }
 * }
 * }</pre>
 *
 * <p>{@code rowClass()} defaults to the {@code Row} generic argument; override {@link #title()} for
 * a custom heading.
 */
public abstract class ImportWizard<Row> extends Wizard implements TitleSupplier {

  @Label("Upload")
  protected UploadStep upload = new UploadStep();

  @Label("Mapping")
  protected MappingStep mapping = new MappingStep();

  @Label("Validation")
  protected ValidationStep validation = new ValidationStep();

  @Label("Result")
  protected ImportResultStep result;

  /**
   * The request being dispatched, stashed so the no-arg completion action can hand it to {@link
   * #importRows(List, HttpRequest)}; transient (and cleared before the response state is built) so
   * it never reaches the component state.
   */
  private transient HttpRequest currentRequest;

  /** The class each CSV data row hydrates into; defaults to the {@code Row} generic argument. */
  @SuppressWarnings("unchecked")
  protected Class<Row> rowClass() {
    return getGenericClass(getClass(), ImportWizard.class, "Row");
  }

  /** Receives the valid typed rows when the user confirms the import. */
  protected abstract void importRows(List<Row> rows, HttpRequest httpRequest);

  @Override
  public String title() {
    return "Import " + rowClass().getSimpleName();
  }

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    super.onHydrated(httpRequest);
    // self-healing: the mapping grid's select options derive from it on every render
    mapping.rowClassName = rowClass().getName();
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    currentRequest = httpRequest;
    try {
      int before = currentStepNumber();
      var outcome = super.handleAction(actionId, httpRequest);
      if ("next".equals(actionId)) {
        if (before == 0 && currentStepNumber() == 1) {
          populateMappings();
        }
        if (before == 1 && currentStepNumber() == 2) {
          validateRows();
        }
      }
      return outcome;
    } finally {
      // cleared before the response state is serialized, so the stash never leaks into it
      currentRequest = null;
    }
  }

  @WizardCompletionAction
  @Label("Import")
  Object doImport() {
    var preview = buildPreview();
    importRows(preview.validRows(), currentRequest);
    result = new ImportResultStep();
    result.imported = preview.validRows().size();
    result.skipped = preview.invalidRowCount();
    return null;
  }

  /** Parses the CSV header + first data row and auto-maps columns by name similarity. */
  private void populateMappings() {
    mapping.rowClassName = rowClass().getName();
    mapping.mappings = new ArrayList<>();
    var records = CsvParser.parse(upload.content());
    if (records.isEmpty()) {
      return;
    }
    var header = records.get(0);
    var sample = records.size() > 1 ? records.get(1) : List.<String>of();
    var targets = ImportRowAssembler.assignableFields(rowClass());
    for (int i = 0; i < header.size(); i++) {
      var sampleValue = i < sample.size() ? sample.get(i) : "";
      mapping.mappings.add(
          new ColumnMapping(header.get(i), sampleValue, autoMap(header.get(i), targets)));
    }
  }

  /** Exact case-insensitive name match first, then containment either way; blank = unmapped. */
  private static String autoMap(String column, List<Field> targets) {
    var normalized = column.trim().toLowerCase(Locale.ROOT);
    for (var target : targets) {
      if (target.getName().toLowerCase(Locale.ROOT).equals(normalized)) {
        return target.getName();
      }
    }
    for (var target : targets) {
      var name = target.getName().toLowerCase(Locale.ROOT);
      if (!normalized.isEmpty() && (name.contains(normalized) || normalized.contains(name))) {
        return target.getName();
      }
    }
    return "";
  }

  /** Re-parses and validates every data row when entering the validation step. */
  private void validateRows() {
    var preview = buildPreview();
    validation.validRows = preview.validRows().size();
    validation.invalidRows = preview.invalidRowCount();
    validation.issues = new ArrayList<>(preview.issues());
  }

  private ImportRowAssembler.Preview<Row> buildPreview() {
    return ImportRowAssembler.assemble(
        rowClass(), CsvParser.parse(upload.content()), mapping.mappings);
  }
}
