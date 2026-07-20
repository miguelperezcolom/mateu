package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.declarative.orchestrators.calendar.CalendarPage;
import io.mateu.core.infra.declarative.orchestrators.collectiondetail.CollectionDetail;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.core.infra.declarative.orchestrators.editableview.EditableView;
import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.core.infra.declarative.orchestrators.generaloverview.GeneralOverview;
import io.mateu.core.infra.declarative.orchestrators.herosearch.HeroSearch;
import io.mateu.core.infra.declarative.orchestrators.importwizard.ImportWizard;
import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.core.infra.declarative.orchestrators.masterdetail.MasterDetailView;
import io.mateu.core.infra.declarative.orchestrators.smartsearch.SmartSearchPage;
import io.mateu.core.infra.declarative.orchestrators.todolist.TodoList;
import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.PageTemplate;
import io.mateu.uidl.annotations.PageType;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.interfaces.ListingBackend;

/**
 * Resolves the page's coarse template type (the Oracle Redwood page-template families) to its wire
 * name: the explicit {@code @PageTemplate} on the view class wins; otherwise the type is inferred
 * from the ModelView's shape — archetypes map to their family, a {@code ListingBackend} is a
 * collection page, a ModelView with {@code MetricCard} fields is a dashboard, and a plain reflected
 * form is a form page.
 */
public final class PageTypeResolver {

  /**
   * The view's page type as its wire name ({@code landing}|{@code collection}|{@code detail}|{@code
   * form}|{@code process}|{@code dashboard}). Never null: every page gets a type.
   */
  public static String wirePageType(Object instance) {
    return toWireName(resolve(instance));
  }

  /** The view's page type (explicit annotation first, then the shape mapping). */
  public static PageType resolve(Object instance) {
    var type = instance instanceof Class ? (Class<?>) instance : instance.getClass();
    var annotation = MetaAnnotations.find(type, PageTemplate.class);
    if (annotation != null) {
      return annotation.value();
    }
    if (Dashboard.class.isAssignableFrom(type)) return PageType.DASHBOARD;
    if (Welcome.class.isAssignableFrom(type)) return PageType.LANDING;
    if (HeroSearch.class.isAssignableFrom(type)) return PageType.LANDING;
    if (SmartSearchPage.class.isAssignableFrom(type)) return PageType.COLLECTION;
    if (TodoList.class.isAssignableFrom(type)) return PageType.COLLECTION;
    if (CalendarPage.class.isAssignableFrom(type)) return PageType.COLLECTION;
    if (CollectionDetail.class.isAssignableFrom(type)) return PageType.COLLECTION;
    if (Wizard.class.isAssignableFrom(type)) return PageType.PROCESS;
    if (ImportWizard.class.isAssignableFrom(type)) return PageType.PROCESS;
    if (Foldout.class.isAssignableFrom(type)) return PageType.DETAIL;
    if (ItemOverview.class.isAssignableFrom(type)) return PageType.DETAIL;
    if (GeneralOverview.class.isAssignableFrom(type)) return PageType.DETAIL;
    if (MasterDetailView.class.isAssignableFrom(type)) return PageType.DETAIL;
    if (EditableView.class.isAssignableFrom(type)) return PageType.DETAIL;
    if (Crud.class.isAssignableFrom(type)) return PageType.COLLECTION;
    if (ListingBackend.class.isAssignableFrom(type)) return PageType.COLLECTION;
    if (getAllFields(type).stream().anyMatch(field -> MetricCard.class.equals(field.getType()))) {
      return PageType.DASHBOARD;
    }
    return PageType.FORM;
  }

  /** Wire name of a {@link PageType}: the lowercase enum name. */
  public static String toWireName(PageType pageType) {
    if (pageType == null) {
      return null;
    }
    return pageType.name().toLowerCase();
  }
}
