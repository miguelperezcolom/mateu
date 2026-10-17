package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.editableview.EditableView;
import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.core.infra.declarative.orchestrators.masterdetail.MasterDetailView;
import io.mateu.core.infra.declarative.orchestrators.masterdetail.NoSelection;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.FoldoutLayoutDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.DetailPart;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.FoldoutNavigation;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The SECOND load of a mediator archetype — the one the inner ux sends once the shell is up, with
 * the view's own type and its {@code _componentRoute} in the state — renders the archetype's page:
 * the master/detail page with its part switcher, the editable view's view and editor pages (inline
 * and embedded variants), and a foldout's header navigation and badges.
 */
class OrchestratorInnerLoadsSyncTest {

  // ── master/detail ──────────────────────────────────────────────────────────

  public static class Summary {
    public String code = "";
  }

  public static class Payments {
    public String total = "100";
  }

  public static class History {
    public String last = "yesterday";
  }

  @UI("/inner-md")
  @Title("Booking")
  public static class BookingMd extends MasterDetailView {
    @Section("Summary")
    public Summary summary = new Summary();

    @DetailPart(label = "Payments", key = "pay", order = 2)
    public Payments payments = new Payments();

    @DetailPart(order = 1)
    public History history = new History();

    @Override
    protected void load(HttpRequest httpRequest) {
      summary.code = "B-7";
    }

    @Override
    protected List<Component> header(HttpRequest httpRequest) {
      return List.of(new Text("booking header"));
    }
  }

  @UI("/inner-md-empty")
  @Title("Empty md")
  public static class EmptyMd extends MasterDetailView {
    @DetailPart(label = "Only")
    public History only = new History();

    @Override
    protected void load(HttpRequest httpRequest) {}

    @Override
    protected NoSelection noSelection() {
      return NoSelection.EMPTY;
    }

    @Override
    protected String title(HttpRequest httpRequest) {
      return "Custom title";
    }
  }

  // ── editable view ──────────────────────────────────────────────────────────

  @Title("Guest")
  public static class GuestView {
    public String name = "Ada";
  }

  @Title("Edit guest")
  public static class GuestEditor {
    public String name = "Ada";
  }

  static final List<String> SAVED = new ArrayList<>();

  @UI("/inner-guest")
  public static class GuestCard extends EditableView<GuestView, GuestEditor> {
    @Override
    public GuestView view(HttpRequest httpRequest) {
      return new GuestView();
    }

    @Override
    public GuestEditor editor(HttpRequest httpRequest) {
      return new GuestEditor();
    }

    @Override
    public void save(HttpRequest httpRequest) {
      SAVED.add("saved");
    }
  }

  @UI("/inner-guest-ro")
  @ReadOnly
  public static class ReadOnlyGuestCard extends GuestCard {}

  // ── foldout ────────────────────────────────────────────────────────────────

  @UI("/inner-foldout")
  @Title("Room 101")
  public static class RoomFoldout extends Foldout {
    static String constant = "not a component";

    Markdown overview = new Markdown("room overview", null, null);

    List<Badge> status = List.of(new Badge("Clean"), new Badge("Occupied"));

    @Panel Markdown roomHistory = new Markdown("history", null, null);

    @Override
    public FoldoutNavigation navigationHeader() {
      return new FoldoutNavigation("Room 101", "Rooms", "backToRooms", "previousRoom", "");
    }

    @Override
    public String overviewEditActionId() {
      return "editRoom";
    }

    @Override
    protected Component panelSummary(String panelFieldName) {
      return new Text("3 stays");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            BookingMd.class,
            EmptyMd.class,
            GuestCard.class,
            ReadOnlyGuestCard.class,
            RoomFoldout.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto inner(
      Class<?> type, String route, String mount, String actionId, Map<String, Object> extra) {
    var state = new HashMap<String, Object>();
    state.put("_componentRoute", mount);
    state.putAll(extra);
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(mount)
            .serverSideType(type.getName())
            .actionId(actionId)
            .initiatorComponentId("ux")
            .componentState(state)
            .parameters(Map.of())
            .build());
  }

  private static PageDto page(UIIncrementDto increment) {
    var page = WireWalk.first(increment, PageDto.class);
    assertThat(page).as("a page in " + increment).isNotNull();
    return page;
  }

  private static List<String> toolbar(PageDto page) {
    return page.toolbar().stream().map(ButtonDto::label).toList();
  }

  // ── master/detail ──────────────────────────────────────────────────────────

  @Test
  void theInnerLoadRendersTheMasterAndOneButtonPerPartInDeclaredOrder() {
    var increment = inner(BookingMd.class, "/inner-md", "/inner-md", "", Map.of());
    var page = page(increment);
    assertThat(page.title()).isEqualTo("Booking");
    // order = 1 before order = 2; a part without a label is labelled by its field
    assertThat(toolbar(page)).containsExactly("history", "Payments");
    assertThat(page.toolbar().get(0).actionId()).isEqualTo("__md_pick:history");
    assertThat(String.valueOf(increment)).contains("booking header").contains("B-7");
    // the first part is selected by default: it is the one rendered
    var fields =
        WireWalk.all(increment, io.mateu.dtos.FormFieldDto.class).stream()
            .map(io.mateu.dtos.FormFieldDto::fieldId)
            .toList();
    assertThat(fields).containsExactly("summary-code", "history-last");
  }

  @Test
  void theRouteEncodedSelectionIsThePartRendered() {
    var increment = inner(BookingMd.class, "/inner-md/__md/pay?tab=1", "/inner-md", "", Map.of());
    var page = page(increment);
    assertThat(page.toolbar()).extracting(ButtonDto::actionId).contains("__md_pick:pay");
    // only the selected part is rendered next to the master
    var fields =
        WireWalk.all(increment, io.mateu.dtos.FormFieldDto.class).stream()
            .map(io.mateu.dtos.FormFieldDto::fieldId)
            .toList();
    assertThat(fields).containsExactly("summary-code", "payments-total");
  }

  @Test
  void anEmptySelectionShowsOnlyTheSwitcherAndTheCustomTitle() {
    var page = page(inner(EmptyMd.class, "/inner-md-empty", "/inner-md-empty", "", Map.of()));
    assertThat(page.title()).isEqualTo("Custom title");
    assertThat(toolbar(page)).containsExactly("Only");
  }

  // ── editable view ──────────────────────────────────────────────────────────

  @Test
  void theViewPageOffersEditAndTheEditorPageOffersCancelAndSave() {
    var view = page(inner(GuestCard.class, "/inner-guest", "/inner-guest", "", Map.of()));
    assertThat(view.title()).isEqualTo("Guest");
    assertThat(view.level()).isZero();
    assertThat(toolbar(view)).containsExactly("Edit");

    var editorIncrement = inner(GuestCard.class, "/inner-guest/edit", "/inner-guest", "", Map.of());
    var editor = page(editorIncrement);
    assertThat(editor.title()).isEqualTo("Edit guest");
    assertThat(toolbar(editor)).containsExactly("Cancel", "Save");
    assertThat(WireWalk.all(editorIncrement, ActionDto.class))
        .anySatisfy(
            a -> {
              assertThat(a.id()).isEqualTo("save");
              assertThat(a.validationRequired()).isTrue();
            });
  }

  @Test
  void anInlineEditableViewNestsItsTitleOneLevelDown() {
    var editor =
        page(
            inner(
                GuestCard.class,
                "/inner-guest/edit",
                "/inner-guest",
                "",
                Map.of("_inline", "true")));
    assertThat(editor.level()).isEqualTo(1);
    var view =
        page(inner(GuestCard.class, "/inner-guest", "/inner-guest", "", Map.of("_inline", true)));
    assertThat(view.level()).isEqualTo(1);
  }

  @Test
  void aReadOnlyEditableViewHasNoEditButton() {
    var view =
        page(inner(ReadOnlyGuestCard.class, "/inner-guest-ro", "/inner-guest-ro", "", Map.of()));
    assertThat(view.toolbar()).isEmpty();
  }

  @Test
  void savingAnEmbeddedViewDoesNotTouchTheBrowserHistory() {
    SAVED.clear();
    var routed =
        inner(GuestCard.class, "/inner-guest/edit", "/inner-guest", "save", Map.of("name", "Eva"));
    assertThat(SAVED).hasSize(1);
    assertThat(routed.commands()).extracting(c -> c.type().name()).contains("PushStateToHistory");

    var embedded =
        inner(
            GuestCard.class,
            "/inner-guest/edit",
            "/inner-guest",
            "save",
            Map.of("_embeddedMediator", "true"));
    assertThat(embedded.commands())
        .extracting(UICommandDto::type)
        .extracting(Enum::name)
        .contains("MarkAsClean")
        .doesNotContain("PushStateToHistory");
  }

  // ── foldout ────────────────────────────────────────────────────────────────

  @Test
  void aFoldoutAdvertisesItsNavigationAndEditActionsAndShowsItsBadges() {
    var increment = mateu.sync("/inner-foldout");
    var foldout =
        WireWalk.all(increment, FoldoutLayoutDto.class).stream().findFirst().orElseThrow();
    assertThat(foldout.headerTitle()).isEqualTo("Room 101");
    assertThat(foldout.badges()).containsExactly("Clean", "Occupied");
    assertThat(foldout.overviewEditActionId()).isEqualTo("editRoom");
    assertThat(foldout.navigation().parentActionId()).isEqualTo("backToRooms");
    // a @Panel without a title is titled by its field
    assertThat(foldout.panels()).extracting(p -> p.title()).containsExactly("Room history");

    var ids = WireWalk.all(increment, ActionDto.class).stream().map(ActionDto::id).toList();
    assertThat(ids).contains("backToRooms", "previousRoom", "editRoom").doesNotContain("");
    assertThat(String.valueOf(increment)).contains("3 stays");
  }
}
