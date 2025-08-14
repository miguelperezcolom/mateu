package io.mateu.dtos;

import java.util.List;

public record ServerSideComponentDto(
    String id,
    String serverSideType,
    List<ComponentDto> children,
    Object initialData,
    String style,
    String cssClasses,
    List<ActionDto> actions,
    List<TriggerDto> triggers,
    List<RuleDto> rules,
    String slot)
    implements ComponentDto {

  @Override
  public ComponentDto setStyle(String style) {
    return new ServerSideComponentDto(
        id,
        serverSideType,
        children,
        initialData,
        style,
        cssClasses,
        actions,
        triggers,
        rules,
        slot);
  }

  @Override
  public ComponentDto setSlot(String slot) {
    return new ServerSideComponentDto(
        id,
        serverSideType,
        children,
        initialData,
        style,
        cssClasses,
        actions,
        triggers,
        rules,
        slot);
  }
}
