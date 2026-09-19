package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.With;

@With
public record ClientSideComponentDto(
    ComponentMetadataDto metadata,
    String id,
    List<ComponentDto> children,
    String style,
    String cssClasses,
    String slot,
    /**
     * The sizing intent (coherence-plan #8): "hug" (size to content), "fill" (grow to fill the
     * space its parent leaves), or "fixed:&lt;len&gt;" (a concrete size, e.g. "fixed:15rem"). Null
     * = unset (the renderer keeps its default flow). Portable intent-as-data — the web maps it to
     * flex/grid, native to its own constraints. Set by inference or an explicit @Size override.
     */
    String sizing)
    implements ComponentDto {

  public ClientSideComponentDto {
    children = children != null ? Collections.unmodifiableList(children) : List.of();
  }

  /**
   * Back-compatible 6-arg constructor (no sizing) — the many mappers that build a component without
   * a sizing intent keep compiling; sizing defaults to null (unset).
   */
  public ClientSideComponentDto(
      ComponentMetadataDto metadata,
      String id,
      List<ComponentDto> children,
      String style,
      String cssClasses,
      String slot) {
    this(metadata, id, children, style, cssClasses, slot, null);
  }

  @Override
  public List<ComponentDto> children() {
    return Collections.unmodifiableList(children);
  }

  @Override
  public ComponentDto setStyle(String style) {
    return new ClientSideComponentDto(metadata, id, children, style, cssClasses, slot, sizing);
  }

  @Override
  public ComponentDto addStyle(String style) {
    var newStyle = this.style == null ? "" : this.style;
    newStyle += ";" + style;
    return new ClientSideComponentDto(metadata, id, children, newStyle, cssClasses, slot, sizing);
  }

  @Override
  public ComponentDto setSlot(String slot) {
    return new ClientSideComponentDto(metadata, id, children, style, cssClasses, slot, sizing);
  }

  @Override
  public ComponentDto withChildren(List<ComponentDto> children) {
    return new ClientSideComponentDto(metadata, id, children, style, cssClasses, slot, sizing);
  }
}
