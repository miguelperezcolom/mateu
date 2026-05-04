package io.mateu.dtos;

import java.util.List;
import lombok.With;

@With
public record ServerSideComponentDto(
    String id,
    String serverSideType,
    String route,
    List<ComponentDto> children,
    Object initialData,
    String style,
    String cssClasses,
    List<ActionDto> actions,
    List<TriggerDto> triggers,
    List<RuleDto> rules,
    List<ValidationDto> validations,
    String slot,
    String containerId)
    implements ComponentDto {

  @Override
  public ComponentDto setStyle(String style) {
    return new ServerSideComponentDto(
        id,
        serverSideType,
        route,
        children,
        initialData,
        style,
        cssClasses,
        actions,
        triggers,
        rules,
        validations,
        slot,
        containerId);
  }

  @Override
  public ComponentDto addStyle(String style) {
    var newStyle = this.style == null ? "" : this.style;
    newStyle += ";" + style;
    return new ServerSideComponentDto(
        id,
        serverSideType,
        route,
        children,
        initialData,
        newStyle,
        cssClasses,
        actions,
        triggers,
        rules,
        validations,
        slot,
        containerId);
  }

  @Override
  public ComponentDto setSlot(String slot) {
    return new ServerSideComponentDto(
        id,
        serverSideType,
        route,
        children,
        initialData,
        style,
        cssClasses,
        actions,
        triggers,
        rules,
        validations,
        slot,
        containerId);
  }
}
