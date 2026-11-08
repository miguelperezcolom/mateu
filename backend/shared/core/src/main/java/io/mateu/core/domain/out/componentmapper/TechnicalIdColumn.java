package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PrimaryKey;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridContent;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * The technical id of a listing whose rows open by click is not a column (UX review W-V-TABLE-ID).
 *
 * <p>When a whole row opens the record (U1), the id column has no job left: it was the link, and a
 * generated id ("…-54211fd5db0c", 4711) tells the user nothing. So the REFLECTED column of the
 * row's declared id is left out and the next column becomes the row's link. The row data keeps the
 * id — opening, selecting and deleting still read it from the row.
 *
 * <p>The rule, identical in Java, .NET and Python:
 *
 * <ul>
 *   <li>only a listing whose rows open by click (its first column carries {@code actionId="view"});
 *   <li>only the row's DECLARED id: the field marked {@link PrimaryKey}, else the field named
 *       {@code id} (.NET {@code [Id]} / {@code Id}, Python {@code id}) — never the first-field
 *       fallback, which is a business field;
 *   <li>whatever its type: what the value looks like is not known when the columns are built;
 *   <li>unless the field declares a {@link Label}: a named column is one the developer wants shown
 *       (a business code: {@code @Label("Code") String id});
 *   <li>never the only column, and never a column of a hand-declared (fluent / YAML) listing.
 * </ul>
 */
public final class TechnicalIdColumn {

  /** The columns without the row's technical id column, when the rule applies (see the class). */
  public static List<GridContent> withoutTechnicalId(
      Class<?> rowClass, Collection<? extends GridContent> columns) {
    var list = new ArrayList<GridContent>(columns);
    var idField = technicalIdField(rowClass);
    if (idField == null) return list;
    long dataColumns = list.stream().filter(c -> c instanceof GridColumn).count();
    if (dataColumns < 2) return list;
    list.removeIf(c -> c instanceof GridColumn column && idField.equals(column.id()));
    return list;
  }

  /** The name of the row's technical id field, or null when the row shows its id. */
  static String technicalIdField(Class<?> rowClass) {
    if (rowClass == null) return null;
    Field declared = null;
    Field named = null;
    for (Field field : getAllFields(rowClass)) {
      if (declared == null && MetaAnnotations.isPresent(field, PrimaryKey.class)) declared = field;
      if (named == null && "id".equals(field.getName())) named = field;
    }
    var id = declared != null ? declared : named;
    if (id == null || MetaAnnotations.isPresent(id, Label.class)) return null;
    return id.getName();
  }

  private TechnicalIdColumn() {}
}
