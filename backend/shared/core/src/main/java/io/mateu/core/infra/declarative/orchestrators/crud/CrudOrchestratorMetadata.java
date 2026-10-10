package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.FoldoutDetail;
import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.GridContent;
import java.util.List;

final class CrudOrchestratorMetadata {

  static boolean readOnly(Crud<?, ?, ?, ?, ?, ?> orchestrator) {
    if (MetaAnnotations.isPresent(orchestrator.metadataSource(), ReadOnly.class)) return true;
    return MetaAnnotations.isPresent(orchestrator.viewClass(), ReadOnly.class);
  }

  static String title(Crud<?, ?, ?, ?, ?, ?> orchestrator) {
    if (MetaAnnotations.isPresent(orchestrator.metadataSource(), Title.class)) {
      return MetaAnnotations.find(orchestrator.metadataSource(), Title.class).value();
    }
    return toUpperCaseFirst(orchestrator.metadataSource().getSimpleName());
  }

  static String getStyleForList(Crud<?, ?, ?, ?, ?, ?> orchestrator, List<GridContent> columns) {
    if (MetaAnnotations.isPresent(orchestrator.metadataSource(), Style.class)) {
      return withCompact(
          MetaAnnotations.find(orchestrator.metadataSource(), Style.class).value(),
          orchestrator.metadataSource());
    }
    // the collection spans the whole content column (RDS) — no inner cap
    return withCompact("width: 100%;", orchestrator.metadataSource());
  }

  static String getStyleForView(Crud<?, ?, ?, ?, ?, ?> orchestrator) {
    var style = styleForView(orchestrator.viewClass(), orchestrator.metadataSource());
    return MetaAnnotations.isPresent(
            orchestrator.viewClass(), io.mateu.uidl.annotations.Compact.class)
        ? withCompact(style, orchestrator.viewClass())
        : withCompact(style, orchestrator.metadataSource());
  }

  /**
   * A {@code @Compact} crud is a dense page like any {@code @Compact} page: its list and detail
   * carry the high-density preset ({@link io.mateu.uidl.StyleConstants#COMPACT}, with the {@code
   * --mateu-compact:1} marker every renderer keys on).
   */
  private static String withCompact(String style, Class<?> source) {
    if (!MetaAnnotations.isPresent(source, io.mateu.uidl.annotations.Compact.class)) {
      return style;
    }
    var base = style == null ? "" : style.trim();
    return (base.isEmpty() || base.endsWith(";") ? base : base + ";")
        + io.mateu.uidl.StyleConstants.COMPACT;
  }

  /** The detail's container style: an explicit {@code @Style} first, then the page it asks for. */
  static String styleForView(Class<?> viewClass, Class<?> metadataSource) {
    if (MetaAnnotations.isPresent(viewClass, Style.class)) {
      return MetaAnnotations.find(viewClass, Style.class).value();
    }
    if (MetaAnnotations.isPresent(metadataSource, Style.class)) {
      return MetaAnnotations.find(metadataSource, Style.class).value();
    }
    // A foldout detail and a view asking for a full or edge-to-edge page take the whole content
    // column, as the Redwood renderer draws them: capped at 900px the panels had no room beside the
    // overview in Vaadin, while Redwood showed three or four of them.
    if (MetaAnnotations.isPresent(viewClass, FoldoutDetail.class)
        || wide(viewClass)
        || wide(metadataSource)) {
      return "width: 100%;";
    }
    return getFormColumns(viewClass) > 2 ? "width: 100%;" : "max-width:900px;margin: auto;";
  }

  /** Whether a class asks for a page wider than the fixed one ({@code @PageWidth}). */
  private static boolean wide(Class<?> type) {
    if (type == null || !MetaAnnotations.isPresent(type, PageWidth.class)) {
      return false;
    }
    var width = MetaAnnotations.find(type, PageWidth.class).value();
    return width == PageWidthStyle.FULL_WIDTH || width == PageWidthStyle.EDGE_TO_EDGE;
  }

  private CrudOrchestratorMetadata() {}
}
