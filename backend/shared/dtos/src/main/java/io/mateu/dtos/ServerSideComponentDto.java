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
    boolean confirmOnNavigationIfDirty,
    /**
     * Logical source name stamped into custom events emitted by this component (as {@code
     * detail.__source}) so that {@code @SubscribeTo(source = COMPONENT, from = ...)} subscribers
     * can filter by origin. Set via {@code @Emits(name = ...)}; null when unset.
     */
    String emitsName,
    /**
     * How the page's content column is sized within the viewport (the first parameter of the Oracle
     * Redwood page templates): {@code "fixed"} (capped, centered column), {@code "fullWidth"}
     * (fluid with side margins, uncapped) or {@code "edgeToEdge"} (content touches the viewport
     * edges). {@code null} = the renderer infers it from the page content.
     */
    String pageWidth,
    /**
     * The page's coarse template type (the Oracle Redwood page-template families): {@code
     * "landing"}, {@code "collection"}, {@code "detail"}, {@code "form"}, {@code "process"} or
     * {@code "dashboard"} — inferred from the ModelView's shape unless declared with
     * {@code @PageTemplate}.
     */
    String pageType,
    /**
     * The view is declared {@code @StaticView}: its full response never varies, so the client may
     * cache it for the session and SKIP the round-trip on return visits (the last step of the
     * client structure cache). A developer promise; {@code false} unless declared.
     */
    boolean staticView,
    /**
     * Stable content hash (ETag) of this component's STRUCTURE — everything but per-request
     * state/data. The client stores it next to the cached structure and echoes it back as {@code
     * RunActionRqDto.knownStructureHash}; when it still matches, the server omits the component
     * from the response and the client reuses its cached structure (template-ref /
     * stale-while-revalidate, phase b). Computed by the server after mapping; {@code null} on the
     * wire only for old backends.
     */
    String structureHash)
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
        confirmOnNavigationIfDirty,
        emitsName,
        pageWidth,
        pageType,
        staticView,
        structureHash);
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
        confirmOnNavigationIfDirty,
        emitsName,
        pageWidth,
        pageType,
        staticView,
        structureHash);
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
        confirmOnNavigationIfDirty,
        emitsName,
        pageWidth,
        pageType,
        staticView,
        structureHash);
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
        confirmOnNavigationIfDirty,
        emitsName,
        pageWidth,
        pageType,
        staticView,
        structureHash);
  }
}
