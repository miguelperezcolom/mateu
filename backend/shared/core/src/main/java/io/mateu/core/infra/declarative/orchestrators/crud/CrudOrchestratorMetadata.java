package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.GridContent;
import java.util.List;

final class CrudOrchestratorMetadata {

  static boolean readOnly(Crud<?, ?, ?, ?, ?, ?> orchestrator) {
    if (MetaAnnotations.isPresent(orchestrator.getClass(), ReadOnly.class)) return true;
    return MetaAnnotations.isPresent(orchestrator.viewClass(), ReadOnly.class);
  }

  static String title(Crud<?, ?, ?, ?, ?, ?> orchestrator) {
    if (MetaAnnotations.isPresent(orchestrator.getClass(), Title.class)) {
      return MetaAnnotations.find(orchestrator.getClass(), Title.class).value();
    }
    return toUpperCaseFirst(orchestrator.getClass().getSimpleName());
  }

  static String getStyleForList(Crud<?, ?, ?, ?, ?, ?> orchestrator, List<GridContent> columns) {
    if (MetaAnnotations.isPresent(orchestrator.getClass(), Style.class)) {
      return MetaAnnotations.find(orchestrator.getClass(), Style.class).value();
    }
    return columns.size() > 5 ? "width: 100%;" : StyleConstants.CONTAINER;
  }

  static String getStyleForView(Crud<?, ?, ?, ?, ?, ?> orchestrator) {
    var viewClass = orchestrator.viewClass();
    if (MetaAnnotations.isPresent(viewClass, Style.class)) {
      return MetaAnnotations.find(viewClass, Style.class).value();
    }
    if (MetaAnnotations.isPresent(orchestrator.getClass(), Style.class)) {
      return MetaAnnotations.find(orchestrator.getClass(), Style.class).value();
    }
    return getFormColumns(viewClass) > 2 ? "width: 100%;" : "max-width:900px;margin: auto;";
  }

  private CrudOrchestratorMetadata() {}
}
