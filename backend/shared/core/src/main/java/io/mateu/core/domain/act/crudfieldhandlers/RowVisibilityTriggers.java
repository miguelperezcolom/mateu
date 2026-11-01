package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;

import io.mateu.core.infra.declarative.FormViewModel;
import io.mateu.dtos.OnValueChangeTriggerDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TriggerDto;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * Keeps a row editor's fields in step with its row's {@link VisibilitySupplier} while the user
 * edits: changing a field the visibility depends on (a block's "type") re-builds the editor on the
 * server ({@code <field>_refresh-detail}), so the fields of the new type show and the others go.
 *
 * <p>Which fields it depends on is found out, not declared: each choice field of the row (an enum,
 * a boolean) is given each of its other values, and when that changes the set of hidden fields, a
 * change of that field fires the refresh. A field the visibility does not depend on never costs a
 * round-trip. A free-text field is not probed: a visibility that hangs on what is typed is decided
 * when the editor opens (and on Prev/Next), not keystroke by keystroke.
 */
final class RowVisibilityTriggers {

  static final String REFRESH_SUFFIX = "_refresh-detail";

  private RowVisibilityTriggers() {}

  static ServerSideComponentDto addTo(
      ServerSideComponentDto editor, Object row, String fid, HttpRequest httpRequest) {
    var drivers = drivingFields(row, httpRequest);
    if (drivers.isEmpty()) {
      return editor;
    }
    var triggers = new ArrayList<TriggerDto>();
    if (editor.triggers() != null) {
      triggers.addAll(editor.triggers());
    }
    drivers.forEach(
        name -> triggers.add(new OnValueChangeTriggerDto(fid + REFRESH_SUFFIX, name, null)));
    return editor.withTriggers(triggers);
  }

  /** The fields of {@code row} whose value decides which of its fields are hidden. */
  static List<String> drivingFields(Object row, HttpRequest httpRequest) {
    if (!(row instanceof VisibilitySupplier)) {
      return List.of();
    }
    var fields =
        getAllEditableFields(row.getClass()).stream()
            .filter(f -> !Modifier.isStatic(f.getModifiers()))
            .toList();
    var baseline = hiddenFields(row, fields, httpRequest);
    if (baseline == null) {
      return List.of();
    }
    Map<String, Object> values = FormViewModel.toMap(row);
    var drivers = new ArrayList<String>();
    for (Field field : fields) {
      for (Object candidate : candidateValues(field)) {
        var probeValues = new HashMap<String, Object>(values);
        probeValues.put(field.getName(), candidate);
        Object probe;
        try {
          probe = MateuInstanceFactory.newInstance(row.getClass(), probeValues, httpRequest);
        } catch (RuntimeException e) {
          continue;
        }
        var hidden = hiddenFields(probe, fields, httpRequest);
        if (hidden != null && !hidden.equals(baseline)) {
          drivers.add(field.getName());
          break;
        }
      }
    }
    return drivers;
  }

  private static List<Object> candidateValues(Field field) {
    var type = field.getType();
    if (type.isEnum()) {
      var names = new ArrayList<Object>();
      for (Object constant : type.getEnumConstants()) {
        names.add(((Enum<?>) constant).name());
      }
      return names;
    }
    if (type == boolean.class || type == Boolean.class) {
      return List.of(true, false);
    }
    return List.of();
  }

  /** The names of the fields the row hides, or null when it cannot be asked about this row. */
  private static Set<String> hiddenFields(Object row, List<Field> fields, HttpRequest httpRequest) {
    if (!(row instanceof VisibilitySupplier visibilitySupplier)) {
      return null;
    }
    var hidden = new TreeSet<String>();
    try {
      for (Field field : fields) {
        if (visibilitySupplier.isHidden(field.getName(), httpRequest)) {
          hidden.add(field.getName());
        }
      }
    } catch (RuntimeException e) {
      return null;
    }
    return hidden;
  }
}
