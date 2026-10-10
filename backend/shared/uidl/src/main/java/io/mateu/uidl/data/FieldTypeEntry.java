package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;
import java.util.Map;
import lombok.Builder;

/**
 * One named FIELD TYPE of the app's domain vocabulary ({@code specs/ui/types.yaml}): what a domain
 * concept — an order status, an amount of money, an e-mail — looks like as a field or a column,
 * declared ONCE so no page has to repeat its data type, stereotype, options, limits and format.
 *
 * <p>A form field or a grid column references it by {@code fieldType: <id>}. The type's attributes
 * are the DEFAULTS and the field's own explicit attributes win — exactly like a semantic (composed)
 * annotation overridden locally. Resolution happens wherever a definition is turned into the wire
 * (the server's YAML loader, the browser's expander, the ports' loaders), before the component is
 * built, so the wire never carries {@code fieldType}.
 *
 * <p>Every attribute is a key of {@link FormField} or {@link GridColumn}, spelled the same, so a
 * type reads like the field it stands for; an attribute the target does not have is simply not used
 * by it (a column ignores {@code placeholder}, a form field ignores {@code tones}). All of them are
 * optional and boxed: an ABSENT attribute is not a default, it leaves the field's own value (or the
 * field's default) alone.
 *
 * @param id the name fields reference; unique within the catalogue
 * @param label the default label
 * @param dataType the default data type
 * @param stereotype the default stereotype (badge, email, textarea, …)
 * @param placeholder the default placeholder of an input
 * @param description the default help text of a field
 * @param required whether a field of this type is required by default
 * @param readOnly whether a field of this type is read-only by default
 * @param options the default options of a select / radio / combobox
 * @param optionsSource the default REST source of the options (typically {@code {ref: name}})
 * @param min the default minimum (numbers)
 * @param max the default maximum (numbers)
 * @param step the default step (numbers)
 * @param colspan the default form colspan
 * @param style the default inline style
 * @param cssClasses the default css classes
 * @param align the default column alignment
 * @param width the default column width
 * @param autoWidth whether a column of this type sizes to its content
 * @param tones a status column's badge tone per VALUE ({@code OPEN: warning}); the tones are {@code
 *     success | warning | danger | info | neutral}, like {@code @RowStatus}. A value not listed
 *     keeps the default reading of the word
 */
@Experimental("field types (types.yaml)")
@Builder(toBuilder = true)
public record FieldTypeEntry(
    String id,
    String label,
    FieldDataType dataType,
    FieldStereotype stereotype,
    String placeholder,
    String description,
    Boolean required,
    Boolean readOnly,
    List<Option> options,
    RestDataSource optionsSource,
    Double min,
    Double max,
    Double step,
    Integer colspan,
    String style,
    String cssClasses,
    ColumnAlignment align,
    String width,
    Boolean autoWidth,
    Map<String, String> tones) {

  public FieldTypeEntry {
    id = id == null ? "" : id.trim();
  }

  /** A type with just a data type and a stereotype — the common case, for code suppliers. */
  public static FieldTypeEntry of(String id, FieldDataType dataType, FieldStereotype stereotype) {
    return new FieldTypeEntry(
        id,
        null,
        dataType,
        stereotype,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null);
  }
}
