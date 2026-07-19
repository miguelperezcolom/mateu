package io.mateu.core.infra.declarative.orchestrators.foldout;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.FoldoutLayout;
import io.mateu.uidl.data.FoldoutNavigation;
import io.mateu.uidl.data.FoldoutOrientation;
import io.mateu.uidl.data.FoldoutPanel;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PageWidthSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

/**
 * Declarative Redwood-style foldout page: a fixed overview panel on the left plus lateral fold-out
 * panels with categories of associated information.
 *
 * <ul>
 *   <li>The first component field without {@link Panel} is the <b>overview</b> (always visible).
 *   <li>Each component field annotated with {@link Panel} becomes a fold-out panel (title defaults
 *       to the field label; {@code open} controls the initial state).
 * </ul>
 *
 * Populate the fields in the constructor or field initializers.
 */
public abstract class Foldout implements ComponentTreeSupplier, ActionSupplier, PageWidthSupplier {

  /**
   * Foldout pages are edge-to-edge by default (the RDS Foldout anatomy is a full-bleed canvas);
   * annotate the concrete view with {@code @PageWidth} to change it.
   */
  @Override
  public PageWidthStyle pageWidth() {
    return PageWidthStyle.EDGE_TO_EDGE;
  }

  @Override
  public String style() {
    return null;
  }

  /**
   * Navigation Header shown at the very top (RDS Foldout anatomy): controls to move to the
   * previous/next object of the same type or go to the parent. Defaults to {@code null} (no
   * header). Override to build a {@link FoldoutNavigation}; each non-blank {@code *ActionId} names
   * a method on this class that Mateu runs when the control is clicked.
   */
  public FoldoutNavigation navigationHeader() {
    return null;
  }

  /**
   * ActionId run when the user clicks the overview's Edit affordance (RDS Foldout edit flow).
   * Defaults to {@code null} (no Edit button). The named method typically returns a {@code Dialog}
   * (vertical config) or a {@code URI}/{@code NavigateTo} to an edit page (horizontal config).
   */
  public String overviewEditActionId() {
    return null;
  }

  /**
   * Registers the Navigation Header controls' + overview-edit actionIds so the frontend can
   * dispatch them.
   */
  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    List<Action> actions = new ArrayList<>();
    FoldoutNavigation nav = navigationHeader();
    if (nav != null) {
      for (String id :
          new String[] {nav.parentActionId(), nav.previousActionId(), nav.nextActionId()}) {
        if (id != null && !id.isBlank()) {
          actions.add(Action.builder().id(id).build());
        }
      }
    }
    String editId = overviewEditActionId();
    if (editId != null && !editId.isBlank()) {
      actions.add(Action.builder().id(editId).build());
    }
    return actions;
  }

  /**
   * Big heading shown in the header band above the columns (the RDS "overview title"). Defaults to
   * the class {@code @Title}; override to compute it. Return {@code null}/blank to hide the header.
   */
  public String headerTitle() {
    Title title = MetaAnnotations.find(getClass(), Title.class);
    return title != null && !title.value().isBlank() ? title.value() : null;
  }

  /**
   * Chips shown under the header title (RDS "Label Value" pills). Defaults to the first {@code
   * List<Badge>} field found; override to compute them.
   */
  @SneakyThrows
  public List<Badge> headerBadges() {
    for (Field field : getClass().getDeclaredFields()) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      if (List.class.isAssignableFrom(field.getType())
          && field.getGenericType() instanceof ParameterizedType pt
          && pt.getActualTypeArguments().length == 1
          && pt.getActualTypeArguments()[0] == Badge.class) {
        field.setAccessible(true);
        Object value = field.get(this);
        if (value instanceof List<?> list) {
          List<Badge> badges = new ArrayList<>();
          for (Object item : list) {
            if (item instanceof Badge badge) {
              badges.add(badge);
            }
          }
          return badges;
        }
      }
    }
    return List.of();
  }

  /**
   * Orientation of the Page Overview (RDS Foldout spec). {@link FoldoutOrientation#vertical}
   * (default) pins the overview on the left with panels to its right; {@link
   * FoldoutOrientation#horizontal} spans the overview across the top with panels in a row below.
   */
  public FoldoutOrientation orientation() {
    return FoldoutOrientation.vertical;
  }

  @Override
  @SneakyThrows
  public Component component(HttpRequest httpRequest) {
    Component overview = null;
    List<FoldoutPanel> panels = new ArrayList<>();
    for (Field field : getClass().getDeclaredFields()) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      field.setAccessible(true);
      Object value = field.get(this);
      if (!(value instanceof Component component)) {
        continue;
      }
      Panel panel = MetaAnnotations.find(field, Panel.class);
      if (panel == null) {
        if (overview == null) {
          overview = component;
        }
        continue;
      }
      panels.add(
          FoldoutPanel.builder()
              .id(field.getName())
              .title(!panel.title().isEmpty() ? panel.title() : getLabel(field))
              .subtitle(!panel.subtitle().isEmpty() ? panel.subtitle() : null)
              .icon(!panel.icon().isEmpty() ? panel.icon() : null)
              .open(panel.open())
              .content(component)
              .build());
    }
    return FoldoutLayout.builder()
        .id(id())
        .overview(overview)
        .panels(panels)
        .headerTitle(headerTitle())
        .badges(headerBadges())
        .orientation(orientation())
        .navigation(navigationHeader())
        .overviewEditActionId(overviewEditActionId())
        .build();
  }
}
