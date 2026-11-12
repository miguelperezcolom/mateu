package io.mateu.test;

import static io.mateu.test.Json.bool;
import static io.mateu.test.Json.list;
import static io.mateu.test.Json.map;
import static io.mateu.test.Json.str;

import io.mateu.uidl.annotations.Experimental;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * A field on a {@link Screen}: what it shows and typing into it. Typing changes the state the
 * screen sends with its next action, as in a browser — nothing goes to the server until an action
 * runs (or a trigger on the field fires, which {@link #set} honours).
 */
@Experimental("test harness (3.0)")
public final class Field {

  private final Screen screen;
  private final Screen.Frame frame;
  final Map<String, Object> node;

  Field(Screen screen, Screen.Frame frame, Map<String, Object> node) {
    this.screen = screen;
    this.frame = frame;
    this.node = node;
  }

  /**
   * The field id (the Java field name, or the YAML {@code fieldId}).
   *
   * @return the id
   */
  public String id() {
    return str(node.get("fieldId"));
  }

  /**
   * The label shown next to it.
   *
   * @return the label
   */
  public String label() {
    return str(node.get("label"));
  }

  /**
   * The current value: what the server sent, or what the test typed since.
   *
   * @return the value, as JSON (string, number, boolean, list, map) or null
   */
  public Object value() {
    return frame.state.get(id());
  }

  /**
   * The current value as text ({@code ""} when empty).
   *
   * @return the value as text
   */
  public String text() {
    var value = value();
    return value == null ? "" : String.valueOf(value);
  }

  /**
   * The wire data type ({@code string}, {@code integer}, {@code number}, {@code bool}, {@code
   * date}, {@code money}…).
   *
   * @return the data type
   */
  public String dataType() {
    return str(node.get("dataType"));
  }

  /**
   * How it is drawn ({@code input}, {@code select}, {@code radio}, {@code textarea}, {@code
   * plainText}…).
   *
   * @return the stereotype
   */
  public String stereotype() {
    return str(node.get("stereotype"));
  }

  /**
   * Whether it is read-only (a {@code @ReadOnly} field, a read-only view, a {@code @ReadOnlyUnless}
   * the caller does not satisfy).
   *
   * @return whether it is read-only
   */
  public boolean readOnly() {
    return bool(node.get("readOnly"));
  }

  /**
   * Whether it is marked required.
   *
   * @return whether it is required
   */
  public boolean required() {
    return bool(node.get("required"));
  }

  /**
   * Whether it is disabled unconditionally — {@code @Disabled} with no expression, a
   * {@code @DisabledUnless} the caller does not satisfy. A rule with an expression is not evaluated
   * (it runs in the browser).
   *
   * @return whether it is disabled
   */
  public boolean disabled() {
    for (Object rule : list(frame.ruleSource().get("rules"))) {
      var r = map(rule);
      if (id().equals(r.get("fieldName"))
          && "disabled".equalsIgnoreCase(str(r.get("fieldAttribute")))
          && "true".equals(str(r.get("filter")).trim())
          && "true".equals(str(r.get("expression")).trim())) {
        return true;
      }
    }
    return false;
  }

  /**
   * The choices of a select / radio / combo, as {@code value → label}, in order.
   *
   * @return the options
   */
  public List<Option> options() {
    var out = new ArrayList<Option>();
    for (Object option : list(node.get("options"))) {
      var o = map(option);
      out.add(new Option(o.get("value"), str(o.get("label"))));
    }
    return out;
  }

  /**
   * Types a value into the field (a string, a number, a boolean, an enum constant's name, a list
   * for a multi-select). Refused on a read-only or disabled field, as the browser would.
   *
   * @param value the value
   * @return the screen
   */
  public Screen set(Object value) {
    if (readOnly() || disabled()) {
      throw new AssertionError("Field \"" + describe() + "\" is not editable");
    }
    var json = value instanceof Enum<?> e ? e.name() : value;
    frame.state.put(id(), json);
    screen.startGesture();
    for (Object trigger : list(frame.ruleSource().get("triggers"))) {
      var t = map(trigger);
      if ("OnValueChange".equalsIgnoreCase(str(t.get("type")))) {
        var property = str(t.get("propertyName"));
        if (property.isEmpty() || property.equals(id())) {
          screen.dispatch(frame, str(t.get("actionId")), Map.of());
        }
      }
    }
    return screen;
  }

  /**
   * Empties the field.
   *
   * @return the screen
   */
  public Screen clear() {
    return set(null);
  }

  String describe() {
    return id() + (label().isEmpty() || label().equals(id()) ? "" : " (\"" + label() + "\")");
  }

  @Override
  public String toString() {
    return describe() + " = " + text();
  }

  /**
   * One choice of a field.
   *
   * @param value the value sent when it is picked
   * @param label what the user reads
   */
  @Experimental("test harness (3.0)")
  public record Option(Object value, String label) {}
}
