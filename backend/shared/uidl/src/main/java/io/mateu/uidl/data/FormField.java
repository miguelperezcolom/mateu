package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import lombok.Builder;

@Builder(toBuilder = true)
public record FormField(
    String id,
    String label,
    FieldDataType dataType,
    FieldStereotype stereotype,
    boolean readOnly,
    boolean required,
    boolean autofocus,
    String placeholder,
    String description,
    List<Option> options,
    RemoteCoordinates remoteCoordinates,
    Object initialValue,
    String style,
    String cssClasses,
    List<GridContent> columns,
    boolean inlineEditing,
    String onItemSelectionActionId,
    String rowSelectionShortcut,
    int colspan,
    FormPosition formPosition,
    String formStyle,
    String formTheme,
    int formColumns,
    int sliderMin,
    int sliderMax,
    boolean stepButtonsVisible,
    double step,
    Double min,
    Double max,
    String itemIdPath,
    Map<String, String> attributes,
    String detailPath,
    boolean useButtonForDetail,
    String minHeightWhenDetailVisible,
    int optionsColumns,
    boolean mainFilter,
    // tree selects (stereotype treeSelect): restrict selection to leaf nodes
    boolean treeLeavesOnly,
    boolean multiline,
    // property-list sections (@Section(propertyList=true)): render as a read-only row with the
    // label aligned left and the plain-text value aligned right, separated by a divider line
    boolean propertyRow,
    NavLink link)
    implements Component {

  public FormField {
    stereotype = stereotype != null ? stereotype : FieldStereotype.regular;
  }

  @Override
  public List<Option> options() {
    return options != null ? options : List.of();
  }

  public List<GridContent> columns() {
    return columns != null ? columns : List.of();
  }
}
