package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.GridContent;
import java.util.List;

final class CrudOrchestratorMetadata {

  static boolean readOnly(Crud<?, ?, ?, ?, ?, ?> orchestrator) {
    if (orchestrator.getClass().isAnnotationPresent(ReadOnly.class)) return true;
    return orchestrator.viewClass().isAnnotationPresent(ReadOnly.class);
  }

  static String title(Crud<?, ?, ?, ?, ?, ?> orchestrator) {
    if (orchestrator.getClass().isAnnotationPresent(Title.class)) {
      return orchestrator.getClass().getAnnotation(Title.class).value();
    }
    return toUpperCaseFirst(orchestrator.getClass().getSimpleName());
  }

  static String getStyleForList(Crud<?, ?, ?, ?, ?, ?> orchestrator, List<GridContent> columns) {
    if (orchestrator.getClass().isAnnotationPresent(Style.class)) {
      return orchestrator.getClass().getAnnotation(Style.class).value();
    }
    return columns.size() > 5 ? "width: 100%;" : StyleConstants.CONTAINER;
  }

  static String getStyleForView(Crud<?, ?, ?, ?, ?, ?> orchestrator) {
    var viewClass = orchestrator.viewClass();
    if (viewClass.isAnnotationPresent(Style.class)) {
      return viewClass.getAnnotation(Style.class).value();
    }
    if (orchestrator.getClass().isAnnotationPresent(Style.class)) {
      return orchestrator.getClass().getAnnotation(Style.class).value();
    }
    return getFormColumns(viewClass) > 2 ? "width: 100%;" : "max-width:900px;margin: auto;";
  }

  private CrudOrchestratorMetadata() {}
}
