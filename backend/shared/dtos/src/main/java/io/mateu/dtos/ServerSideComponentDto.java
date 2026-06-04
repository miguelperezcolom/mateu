package io.mateu.dtos;

import java.util.List;

import lombok.Builder;
import lombok.With;

@With
@Builder
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
    String containerId,
    /**
     * When true, the frontend tracks field changes and shows a confirmation dialog if the user
     * navigates away without saving. Set via {@code @ConfirmOnNavigationIfDirty} or automatically
     * for CRUD create/edit views.
     */
    boolean confirmOnNavigationIfDirty)
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
        containerId,
        confirmOnNavigationIfDirty);
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
        containerId,
        confirmOnNavigationIfDirty);
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
        containerId,
        confirmOnNavigationIfDirty);
  }

  @Override
  public ComponentDto withChildren(List<ComponentDto> children) {
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
        containerId,
        confirmOnNavigationIfDirty);
  }
}
