package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.out.componentmapper.PageTypeResolver;
import io.mateu.core.infra.declarative.Listing;
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
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.PageTemplate;
import io.mateu.uidl.annotations.PageType;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The page's coarse template type (the Redwood page-template families) travels on the wire and is
 * inferred from the ModelView's shape: archetypes map to their family, a {@code ListingBackend} is
 * a collection page, {@code MetricCard} fields make a dashboard, a plain reflected form is a form
 * page — and the explicit {@code @PageTemplate} always wins.
 */
class PageTypeResolverSyncTest {

  // ---------------------------------------------------------------- resolver (archetype map)

  @Test
  void archetypesMapToTheirTemplateFamily() {
    assertThat(PageTypeResolver.wirePageType(new Dashboard() {})).isEqualTo("dashboard");
    assertThat(PageTypeResolver.wirePageType(new Welcome() {})).isEqualTo("landing");
    assertThat(
            PageTypeResolver.wirePageType(
                new HeroSearch<Object, Object>() {
                  @Override
                  public ListingData<Object> search(
                      String searchText,
                      Object filters,
                      Pageable pageable,
                      HttpRequest httpRequest) {
                    return null;
                  }
                }))
        .isEqualTo("landing");
    assertThat(
            PageTypeResolver.wirePageType(
                new SmartSearchPage<Object, Object>() {
                  @Override
                  public ListingData<Object> search(
                      String searchText,
                      Object filters,
                      Pageable pageable,
                      HttpRequest httpRequest) {
                    return null;
                  }
                }))
        .isEqualTo("collection");
    assertThat(
            PageTypeResolver.wirePageType(
                new TodoList<Object>() {
                  @Override
                  protected List<Object> rows(HttpRequest httpRequest) {
                    return List.of();
                  }

                  @Override
                  protected String idOf(Object row) {
                    return null;
                  }

                  @Override
                  protected String titleOf(Object row) {
                    return null;
                  }

                  @Override
                  protected String groupOf(Object row) {
                    return null;
                  }

                  @Override
                  protected Object actionOn(Object row, HttpRequest httpRequest) {
                    return null;
                  }
                }))
        .isEqualTo("collection");
    assertThat(
            PageTypeResolver.wirePageType(
                new CalendarPage() {
                  @Override
                  protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
                    return List.of();
                  }

                  @Override
                  protected Object actionOn(CalendarEvent event, HttpRequest httpRequest) {
                    return null;
                  }
                }))
        .isEqualTo("collection");
    assertThat(
            PageTypeResolver.wirePageType(
                new CollectionDetail<Object>() {
                  @Override
                  protected List<Object> rows(String searchText, HttpRequest httpRequest) {
                    return List.of();
                  }

                  @Override
                  protected String idOf(Object row) {
                    return null;
                  }

                  @Override
                  protected String titleOf(Object row) {
                    return null;
                  }

                  @Override
                  protected Component detail(Object row, HttpRequest httpRequest) {
                    return null;
                  }
                }))
        .isEqualTo("collection");
    assertThat(PageTypeResolver.wirePageType(new Wizard() {})).isEqualTo("process");
    assertThat(
            PageTypeResolver.wirePageType(
                new ImportWizard<Object>() {
                  @Override
                  protected void importRows(List<Object> rows, HttpRequest httpRequest) {}
                }))
        .isEqualTo("process");
    assertThat(PageTypeResolver.wirePageType(new Foldout() {})).isEqualTo("detail");
    assertThat(PageTypeResolver.wirePageType(new ItemOverview() {})).isEqualTo("detail");
    assertThat(
            PageTypeResolver.wirePageType(
                new GeneralOverview<Object>() {
                  @Override
                  protected List<Option> switcherOptions(HttpRequest httpRequest) {
                    return List.of();
                  }

                  @Override
                  protected Object load(String id, HttpRequest httpRequest) {
                    return null;
                  }

                  @Override
                  protected Component overview(Object row, HttpRequest httpRequest) {
                    return null;
                  }
                }))
        .isEqualTo("detail");
    assertThat(
            PageTypeResolver.wirePageType(
                new MasterDetailView() {
                  @Override
                  protected void load(HttpRequest httpRequest) {}
                }))
        .isEqualTo("detail");
    assertThat(
            PageTypeResolver.wirePageType(
                new EditableView<Object, Object>() {
                  @Override
                  public Object view(HttpRequest httpRequest) {
                    return null;
                  }

                  @Override
                  public Object editor(HttpRequest httpRequest) {
                    return null;
                  }

                  @Override
                  public void save(HttpRequest httpRequest) {}
                }))
        .isEqualTo("detail");
    assertThat(PageTypeResolver.wirePageType(Crud.class)).isEqualTo("collection");
  }

  // ---------------------------------------------------------------- wire (shape mapping)

  @SuppressWarnings("unused")
  @UI("/plain-type-form")
  @Title("Plain")
  public static class PlainForm {
    String name;
  }

  @SuppressWarnings("unused")
  @UI("/kpi-board")
  @Title("Board")
  public static class KpiBoard {
    MetricCard revenue = MetricCard.builder().title("Revenue").value("1.2").build();
  }

  @SuppressWarnings("unused")
  @UI("/typed-as-process")
  @Title("Typed")
  @PageTemplate(PageType.PROCESS)
  public static class TypedAsProcess {
    String name;
  }

  public record Row(String id) {}

  @SuppressWarnings("unused")
  @UI("/plain-listing")
  @Title("Listing")
  public static class PlainListing extends Listing<Object, Row> {
    @Override
    public ListingData<Row> search(
        String searchText, Object filters, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.from(List.of());
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            PlainForm.class, KpiBoard.class, TypedAsProcess.class, PlainListing.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String pageTypeOf(String route) {
    UIIncrementDto increment = mateu.sync(route);
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto server) {
        return server.pageType();
      }
    }
    throw new AssertionError("no server side component for " + route);
  }

  @Test
  void aPlainReflectedFormIsAFormPage() {
    assertThat(pageTypeOf("/plain-type-form")).isEqualTo("form");
  }

  @Test
  void metricCardFieldsMakeADashboard() {
    assertThat(pageTypeOf("/kpi-board")).isEqualTo("dashboard");
  }

  @Test
  void theExplicitAnnotationWins() {
    assertThat(pageTypeOf("/typed-as-process")).isEqualTo("process");
  }

  @Test
  void aListingBackendIsACollectionPage() {
    assertThat(pageTypeOf("/plain-listing")).isEqualTo("collection");
  }
}
