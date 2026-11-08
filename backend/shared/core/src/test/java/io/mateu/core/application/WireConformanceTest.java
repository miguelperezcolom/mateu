package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.AutoLayout;
import io.mateu.uidl.annotations.Banner;
import io.mateu.uidl.annotations.BulletedList;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.OnRowSelected;
import io.mateu.uidl.annotations.Overline;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.SeparatorBefore;
import io.mateu.uidl.annotations.StaticView;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toc;
import io.mateu.uidl.annotations.TreeSelect;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.data.TextSize;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.OptionsSupplier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The Java half of the shared wire conformance corpus (see {@code conformance/README.md}).
 *
 * <p>Java is the reference: this test GENERATES the goldens (with {@code -Dconformance.write=true})
 * and then verifies against them like any other server. The point is not that Java passes — it
 * will, it wrote them — but that the expectation now lives in a file the other two servers read,
 * instead of inside three separate test suites that only their own authors run.
 */
class WireConformanceTest {

  // ── The fixtures. Each must be mirrored, with the same semantics, by every server. ───────────

  /** Field kinds, a section, and the labels/dataTypes they imply. */
  @SuppressWarnings("unused")
  @UI("/conformance/simple-form")
  @Title("Simple form")
  @Subtitle("Every basic field kind")
  public static class SimpleForm {
    @Section("Identity")
    public String name = "Ada";

    public int age = 36;
    public boolean active = true;
    public LocalDate birthDate = LocalDate.of(1815, 12, 10);
    public Colour colour = Colour.green;

    public enum Colour {
      red,
      green,
      blue
    }
  }

  /**
   * The inferred column count: SEVEN visible fields lay out in TWO columns (up to six: one — every
   * other form case pins that side), counted over the fields that render as form fields.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/form-columns")
  @Title("Form columns")
  public static class FormColumnsForm {
    public String firstName = "Ada";
    public String lastName = "Lovelace";
    public String email = "ada@example.com";
    public String phone = "555-0100";
    public String city = "London";
    public String country = "UK";
    public String notes = "Analyst";
  }

  /** The canonical page header: the elements a renderer hoists out of the body. */
  @SuppressWarnings("unused")
  @UI("/conformance/page-header")
  @Title("Requisition 4471")
  @Subtitle("Pending approval")
  @Overline("Requisitions")
  public static class PageHeader {
    @KPI public String amount = "1,240 €";

    @Timestamp("Last updated")
    public String updatedAt = "2026-07-20 12:00";

    public String notes = "";
  }

  /**
   * The Redwood welcome banner: a centered HeroSection (id "welcome-banner") prepended to the page
   * content, its title falling back to the page title when the banner declares none.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/welcome-banner")
  @Title("Onboarding")
  @io.mateu.uidl.annotations.WelcomeBanner(subtitle = "Three steps and you are done")
  public static class WelcomeBannerPage {
    public String name = "";
  }

  /** Consecutive fields under the same @Tab label group into one tab of a TabLayout strip. */
  @SuppressWarnings("unused")
  @UI("/conformance/tabs")
  @Title("Tabs")
  public static class Tabs {
    @Tab("General")
    public String name = "Ada";

    @Tab("General")
    public String email = "ada@example.com";

    @Tab("Details")
    public String role = "Analyst";

    @Tab("Details")
    public String city = "London";
  }

  /** Zoned layout: sections distributed into side-by-side columns with flex-basis widths. */
  @SuppressWarnings("unused")
  @UI("/conformance/zones")
  @Title("Zoned form")
  @Zones({@Zone(name = "left", width = "64%"), @Zone(name = "right", width = "36%")})
  public static class ZonedForm {
    @Section(value = "Main", zone = "left")
    public String name = "Ada";

    @Section(value = "Side", zone = "right")
    public String notes = "Quiet";
  }

  /**
   * Money intent on the wire: an editable money field keeps the numeric dataType and carries the
   * intent as the stereotype; a plain-text money field keeps the dense plainText stereotype and the
   * intent moves to dataType money.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/money-field")
  @Title("Money field")
  public static class MoneyField {
    @Stereotype(FieldStereotype.money)
    public BigDecimal price = new BigDecimal("1250.5");

    @PlainText
    @Stereotype(FieldStereotype.money)
    public BigDecimal total = new BigDecimal("99.5");
  }

  /** A page-level themed banner: @Banner on a method, the String return as description. */
  @SuppressWarnings("unused")
  @UI("/conformance/banner")
  @Title("Banner page")
  public static class BannerPage {
    public String name = "Ada";

    @Banner(theme = BannerTheme.INFO, title = "Heads up")
    public String info() {
      return "Something to note";
    }
  }

  /** A floating action button: a {@code @Fab} method becomes an entry in the page's fabs. */
  @SuppressWarnings("unused")
  @UI("/conformance/fab")
  @Title("Fab page")
  public static class FabPage {
    public String name = "Ada";

    // NOTE: the label attribute is ignored on this path — the wire label comes from the
    // capitalised method name (or @Label), so the method is named to yield "Add".
    @Fab(icon = "vaadin:plus", label = "Add")
    public void add() {}
  }

  /** Section decorations: property-list rows, a separator above a field, a sized text. */
  @SuppressWarnings("unused")
  @UI("/conformance/separator-text")
  @Title("Guest file")
  public static class SeparatorText {
    @Section(value = "Documento", propertyList = true)
    public String documento = "12345678X";

    public String nombre = "María";

    @Section("Contacto")
    public String telefono = "+34 600 000 000";

    @SeparatorBefore public String email = "maria@example.com";

    @Text(size = TextSize.xl)
    public String titular = "Bienvenida";
  }

  /** Client-side rules: @Disabled and @Hidden(expr) travel as SetDataValue rules. */
  @SuppressWarnings("unused")
  @UI("/conformance/client-rules")
  @Title("Client rules")
  public static class ClientRules {
    // Declared before the @Hidden field on purpose: Java emits all disabled rules before the
    // hidden ones, the ports emit per field in declaration order — this order makes them agree.
    @Disabled public String code = "X-1";

    public boolean special = false;

    @Hidden("!state.special")
    public String nickname = "";
  }

  /**
   * The {@code @StaticView} promise: the full response — structure and data — is a
   * session-cacheable constant, and the wire component must say so ({@code staticView=true}).
   */
  @SuppressWarnings("unused")
  @UI("/conformance/static-view")
  @Title("About")
  @StaticView
  public static class StaticAbout {
    public String heading = "This page never changes";
  }

  /**
   * Small-enum inference: under {@code @AutoLayout} an enum with <= 4 constants renders as radio
   * buttons (stereotype "radio"), not a dropdown — with its options on the wire.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/small-enum-radio")
  @Title("Small enum radio")
  @AutoLayout
  public static class SmallEnumRadio {
    public Size size = Size.MEDIUM;

    public enum Size {
      SMALL,
      MEDIUM,
      LARGE
    }
  }

  /** The Dashboard archetype: MetricCards group into a Scoreboard band, @Panel tiles the grid. */
  @SuppressWarnings("unused")
  @UI("/conformance/dashboard")
  @Title("Ops dashboard")
  public static class DashboardPage extends Dashboard {
    public MetricCard revenue =
        MetricCard.builder()
            .title("Revenue")
            .value("1.2")
            .unit("M€")
            .trend(MetricTrend.up)
            .trendLabel("+8%")
            .build();

    public MetricCard occupancy = MetricCard.builder().title("Occupancy").value("87%").build();

    @Panel(title = "Notes", subtitle = "Today")
    public io.mateu.uidl.data.Text notes = new io.mateu.uidl.data.Text("All systems nominal");
  }

  /**
   * A card menu authored in code: a group that opens as a panel of CARDS (display "cards"), each
   * entry a card with its description, its own entries the card's actions.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/card-menu")
  @Title("Card menu")
  public static class CardMenuApp implements AppSupplier {

    @Override
    public AppShell getApp(HttpRequest httpRequest) {
      var reservations =
          new RouteLink(
              "/b/r",
              "/b/r",
              "Reservations",
              null,
              false,
              null,
              null,
              false,
              false,
              null,
              null,
              null,
              "Search and modify reservations",
              null,
              false);
      return AppShell.builder()
          .title("Card menu")
          .homeRoute("/plain")
          .variant(AppVariant.HAMBURGER_MENU)
          .menu(
              List.of(
                  new Menu(
                      "/b",
                      "Bookings",
                      List.of(reservations),
                      false,
                      null,
                      null,
                      false,
                      false,
                      null,
                      null,
                      false,
                      io.mateu.uidl.data.MenuPresentation.cards()),
                  new RouteLink("/plain", "Plain")))
          .build();
    }
  }

  /**
   * The app-level shell extras as flags on the app metadata: the command center (an always-present
   * palette FAB), the notification bell (an app implementing NotificationsSupplier) and the global
   * entity search (GlobalSearchSupplier).
   */
  @SuppressWarnings("unused")
  @UI("/conformance/app-extras")
  @Title("Extras app")
  @io.mateu.uidl.annotations.App(commandCenter = true)
  public static class ExtrasApp
      implements io.mateu.uidl.interfaces.NotificationsSupplier,
          io.mateu.uidl.interfaces.GlobalSearchSupplier {

    @io.mateu.uidl.annotations.Menu public String home = "/a";

    @Override
    public List<io.mateu.uidl.data.AppNotification> notifications(HttpRequest httpRequest) {
      return List.of();
    }

    @Override
    public void markNotificationsRead(List<String> ids, HttpRequest httpRequest) {}

    @Override
    public List<io.mateu.uidl.data.GlobalSearchResult> globalSearch(
        String searchText, HttpRequest httpRequest) {
      return List.of();
    }
  }

  /** An app whose shell and its whole menu are composed IN CODE via {@link AppSupplier}. */
  @SuppressWarnings("unused")
  @UI("/conformance/app-in-code")
  @Title("App in code")
  public static class AppInCode implements AppSupplier {

    @Override
    public AppShell getApp(HttpRequest httpRequest) {
      return AppShell.builder()
          .title("App in code")
          .homeRoute("/a")
          .variant(AppVariant.HAMBURGER_MENU)
          .menu(
              List.of(
                  new RouteLink("/a", "A"),
                  new Menu("/g", "G", List.of(new RouteLink("/g/x", "X")))))
          .build();
    }
  }

  /**
   * Bean-validation constraints on the wire: {@code @NotEmpty}/{@code @NotNull} set the field's
   * {@code required} flag, and all four constraints also travel as component-level {@code
   * validations} entries carrying the client-side condition and message.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/validation")
  @Title("Validated form")
  public static class ValidatedForm {
    @NotEmpty public String name = "Ada";

    @NotNull public String email = "ada@example.com";

    @Min(18)
    @Max(99)
    public int age = 36;
  }

  /**
   * Text constraints on the wire: {@code @Size} (min and/or max, each bound its own entry, an open
   * max printed as Integer.MAX_VALUE in the message) and {@code @Pattern} (the regexp verbatim
   * inside a JS literal), default and custom messages, after a required check — and a
   * {@code @Hidden("expression")} field whose constraint is relaxed while it is hidden.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/validation-text")
  @Title("Validated text")
  public static class ValidatedTextForm {
    @NotEmpty
    @Size(min = 3, max = 8)
    @Pattern(regexp = "^[A-Z]+$")
    public String code = "ABC";

    @Size(min = 2)
    public String nickname = "";

    @Size(max = 140)
    public String bio = "";

    @Size(max = 10, message = "Too long")
    public String tag = "";

    @Pattern(regexp = "^[0-9]{5}$", message = "Five digits")
    @Hidden("state['code'] === ''")
    public String zip = "";
  }

  /**
   * Constraints on fields the user cannot type into: a {@code @ReadOnly} and a {@code @PlainText}
   * field next to an editable one.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/validation-locked")
  @Title("Locked fields")
  public static class LockedFieldsForm {
    @NotEmpty public String name = "Ada";

    @NotEmpty @io.mateu.uidl.annotations.ReadOnly public String code = "A-1";

    @Size(min = 3)
    @io.mateu.uidl.annotations.PlainText
    public String caption = "Hello";
  }

  /** The stereotype vocabulary: slider/stars on ints, password/textarea on strings. */
  @SuppressWarnings("unused")
  @UI("/conformance/stereotypes")
  @Title("Stereotypes")
  public static class Stereotypes {
    @Stereotype(FieldStereotype.slider)
    public int volume = 50;

    @Stereotype(FieldStereotype.stars)
    public int rating = 4;

    @Stereotype(FieldStereotype.password)
    public String secret = "hunter2";

    @Stereotype(FieldStereotype.textarea)
    public String notes = "Some longer text";
  }

  /**
   * A remote reference field: {@code @Lookup} renders a combobox whose options come from the
   * field's {@code search-<fieldId>} action (stereotype combobox + remoteCoordinates on the wire);
   * the pre-set value's display label rides in the fragment data as {@code <fieldId>-label},
   * resolved through the view's own {@link LookupLabelSupplier}.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/lookup")
  @Title("Lookup")
  public static class LookupForm implements LookupLabelSupplier {
    @Lookup public String supplier = "a2";

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
      return "a2".equals(id) ? "Acme" : null;
    }
  }

  /**
   * A @TreeSelect field: stereotype treeSelect, the leavesOnly flag as treeLeavesOnly, and a
   * hierarchical option set — the options carry their CHILDREN on the wire.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/tree-select")
  @Title("Tree select")
  public static class TreeSelectForm implements OptionsSupplier {

    @TreeSelect(leavesOnly = true)
    public String zone = "";

    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
      return List.of(
          new Option(
              "es", "Spain", List.of(new Option("mca", "Mallorca"), new Option("men", "Menorca"))),
          new Option("pt", "Portugal"));
    }
  }

  /**
   * The fluent Notice: a compact themed inline banner (text + theme tint + right-aligned action +
   * slim flag), composed as a component tree — the one shape all three servers share (the
   * declarative {@code @Notice} String-field marker is Java-only).
   */
  @SuppressWarnings("unused")
  @UI("/conformance/notice")
  @Title("Notice")
  public static class NoticePage implements ComponentTreeSupplier {

    @Override
    public String style() {
      // no container styling: the ports' tree suppliers declare none, and the Java default
      // ("max-width:900px;margin: auto;") is a Java-only envelope member the case is not about
      return null;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
      return Notice.builder()
          .text("2 complaints pending")
          .theme("warning")
          .actionLabel("Review")
          .actionId("review")
          .slim(true)
          .build();
    }
  }

  /**
   * The generic fluent building blocks ported to .NET and Python in 3.0-alpha.426 (M-A5):
   * Breadcrumbs, Icon, Notification, Element, Tooltip, Details, SplitLayout and ConfirmDialog in
   * one component tree. Pins their member names and where their parts travel (Tooltip/Details wrap
   * components IN the metadata; SplitLayout and ConfirmDialog carry theirs as children).
   */
  @SuppressWarnings("unused")
  @UI("/conformance/generic-components")
  @Title("Components")
  public static class GenericComponentsPage implements ComponentTreeSupplier {

    @Override
    public String style() {
      return null;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
      return new io.mateu.uidl.data.VerticalLayout(
          new io.mateu.uidl.data.Breadcrumbs(
              "Order 42",
              List.of(
                  new io.mateu.uidl.data.Breadcrumb("Home", "/"),
                  new io.mateu.uidl.data.Breadcrumb("Orders", "/orders")),
              null,
              null),
          new io.mateu.uidl.data.Icon(io.mateu.uidl.interfaces.IconKey.PlusCircle, null, null),
          new io.mateu.uidl.data.Notification("Saved", "The order was saved", null, null),
          io.mateu.uidl.data.Element.builder()
              .name("order-chart")
              .attributes(java.util.Map.of("id", "chart", "kind", "bar"))
              .on(java.util.Map.of("click", "drill"))
              .content("loading")
              .build(),
          new io.mateu.uidl.data.Tooltip(
              "Total including taxes", new io.mateu.uidl.data.Text("1250 EUR"), null, null),
          io.mateu.uidl.data.Details.builder()
              .summary(new io.mateu.uidl.data.Text("More"))
              .content(new io.mateu.uidl.data.Text("Delivery notes"))
              .opened(true)
              .build(),
          io.mateu.uidl.data.SplitLayout.builder()
              .master(new io.mateu.uidl.data.Text("Master"))
              .detail(new io.mateu.uidl.data.Text("Detail"))
              .orientation(io.mateu.uidl.data.Orientation.vertical)
              .variant(io.mateu.uidl.data.SplitLayoutVariant.small)
              .build(),
          io.mateu.uidl.data.ConfirmDialog.builder()
              .header("Delete order?")
              .content(new io.mateu.uidl.data.Text("This cannot be undone"))
              .canCancel(true)
              .confirmText("Delete")
              .confirmActionId("deleteOrder")
              .cancelActionId("keepOrder")
              .build());
    }
  }

  public static class Profile {
    @NotEmpty public String name = "Ada";
    public String city = "London";
  }

  /**
   * An editable view: a read page with an Edit button that flips to the editor and back. Java's
   * first load is a mediator, so the cases pin its two content loads (view and edit).
   */
  @UI("/conformance/editable-view")
  @Title("Profile")
  public static class ProfileView
      extends io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView<Profile> {
    @Override
    public Profile load(HttpRequest httpRequest) {
      return new Profile();
    }

    @Override
    public void persist(Profile entity, HttpRequest httpRequest) {}
  }

  /** A CRUD whose record view page leads its toolbar with a method of the crud. */
  @UI("/conformance/view-toolbar-button")
  @Title("Products")
  public static class ProductsWithViewButton
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Product> {
    @Override
    public io.mateu.uidl.interfaces.CrudStore<Product> store() {
      return productStore();
    }

    @io.mateu.uidl.annotations.ViewToolbarButton(confirmationRequired = true)
    public Message discontinue(Product product) {
      return Message.success("Discontinued");
    }
  }

  /**
   * The {@code @Action} knobs the ports gained for 3.0 GA: a streamed background action, a
   * confirmation with its texts, a link, a client script and a custom event — each on the page's
   * {@code actions}.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/action-extras")
  @Title("Action extras")
  public static class ActionExtrasPage {
    public String name = "Ada";

    // ONE action carrying every knob: Java lists @Action methods in Class.getDeclaredMethods()
    // order, which the JVM does not specify (it changed between two runs), so a fixture with
    // several actions would pin an order no server controls
    @io.mateu.uidl.annotations.Action(
        sse = true,
        background = true,
        confirmationRequired = true,
        confirmationTitle = "Delete?",
        confirmationMessage = "It cannot be undone",
        confirmationText = "Delete",
        confirmationDenialText = "Keep",
        href = "https://mateu.io",
        js = "console.log('hi')",
        customEventName = "order-picked")
    public Message act() {
      return Message.success("Done");
    }
  }

  /** An app shell's presentation knobs: a split content area, an accent, the Ask button's brand. */
  @SuppressWarnings("unused")
  @UI("/conformance/app-branding")
  @Title("Branded app")
  @io.mateu.uidl.annotations.App(
      layout = io.mateu.uidl.fluent.AppLayout.SPLIT,
      accentColor = "#00796b",
      askLabel = "Ask Mateu",
      askIcon = "vaadin:question")
  public static class BrandedApp {
    @io.mateu.uidl.annotations.Menu public String home = "/a";
  }

  /**
   * A record master's way back up (the OCI-console style): {@code @App(backLink = PARENT)} draws a
   * single "← Records" link to the nearest route above that resolves to a screen — labelled with
   * that screen's title, resolved server-side — and no breadcrumb trail.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/app-back-link")
  @Title("Record")
  @io.mateu.uidl.annotations.App(backLink = io.mateu.uidl.annotations.BackLink.PARENT)
  public static class BackLinkApp {
    @io.mateu.uidl.annotations.Menu public String overview = "/a";
  }

  /** The screen above the back-link app: its title labels the app's "← Parent" link. */
  @SuppressWarnings("unused")
  @UI("/conformance")
  @Title("Records")
  public static class BackLinkParent {
    public String name;
  }

  /**
   * Section options: the first section pinned while the page scrolls, the second forced to one
   * column (the form infers two from its eight fields) with a style on its content.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/section-options")
  @Title("Section options")
  public static class SectionOptionsForm {
    @io.mateu.uidl.annotations.Section(value = "Guests", sticky = true)
    public String lead;

    public String second;
    public String third;
    public String fourth;

    @io.mateu.uidl.annotations.Section(value = "Notes", columns = 1, style = "gap: 0;")
    public String first;

    public String other;
    public String more;
    public String last;
  }

  public record Employee(
      String id,
      @io.mateu.uidl.annotations.MainFilter String name,
      @io.mateu.uidl.annotations.HiddenInList String notes,
      @io.mateu.uidl.annotations.HiddenInView String salaryBand,
      @io.mateu.uidl.annotations.HiddenInEditor String createdBy,
      @io.mateu.uidl.annotations.HiddenInCreate String code)
      implements io.mateu.uidl.interfaces.Identifiable {
    @Override
    public String toString() {
      return name != null && !name.isBlank() ? name : "New employee";
    }
  }

  static final List<Employee> EMPLOYEES =
      List.of(
          new Employee("E-1", "Ada", "Likes tea", "B2", "admin", "ADA"),
          new Employee("E-2", "Grace", "Navy", "B3", "admin", "GRC"));

  /**
   * A crud whose entity hides fields per surface ({@code @HiddenInList/View/Editor/Create}) and
   * names its main filter: the listing, and the edit and new forms.
   */
  @UI("/conformance/crud-hidden-in")
  @Title("Employees")
  public static class EmployeesCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Employee> {
    @Override
    public io.mateu.uidl.interfaces.CrudStore<Employee> store() {
      return new io.mateu.uidl.interfaces.CrudStore<>() {
        @Override
        public java.util.Optional<Employee> findById(String id) {
          return EMPLOYEES.stream().filter(e -> e.id().equals(id)).findFirst();
        }

        @Override
        public String save(Employee entity) {
          return entity.id();
        }

        @Override
        public List<Employee> findAll() {
          return EMPLOYEES;
        }

        @Override
        public void deleteAllById(List<String> ids) {}
      };
    }
  }

  public record Seat(
      String id,
      String name,
      @io.mateu.uidl.annotations.HiddenInCreate @Min(100) @Max(999) Integer code,
      @io.mateu.uidl.annotations.HiddenInEditor @Min(1) @Max(9) Integer quota)
      implements io.mateu.uidl.interfaces.Identifiable {
    @Override
    public String toString() {
      return name != null && !name.isBlank() ? name : "New seat";
    }
  }

  static final List<Seat> SEATS = List.of(new Seat("S-1", "Front", 101, 2));

  /**
   * A crud whose hidden-in fields carry constraints: a form that does not render a field sends no
   * validation for it (and the server does not check it there) — {@code @HiddenInCreate code}'s
   * bounds are on the edit form only, {@code @HiddenInEditor quota}'s bounds on the create form
   * only.
   */
  @UI("/conformance/crud-hidden-constraints")
  @Title("Seats")
  public static class SeatsCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Seat> {
    @Override
    public io.mateu.uidl.interfaces.CrudStore<Seat> store() {
      return new io.mateu.uidl.interfaces.CrudStore<>() {
        @Override
        public java.util.Optional<Seat> findById(String id) {
          return SEATS.stream().filter(e -> e.id().equals(id)).findFirst();
        }

        @Override
        public String save(Seat entity) {
          return entity.id();
        }

        @Override
        public List<Seat> findAll() {
          return SEATS;
        }

        @Override
        public void deleteAllById(List<String> ids) {}
      };
    }
  }

  /**
   * A hero search page over a declarative listing with its own filters type: the centered hero over
   * the listing, the filters type's fields as the facet bar, results as cards, starting empty.
   */
  @UI("/conformance/hero-search-filters")
  @Title("Books")
  public static class HeroBooks
      extends io.mateu.core.infra.declarative.orchestrators.herosearch.HeroSearch<
          BookFilters, Book> {
    @Override
    protected String heroTitle() {
      return "Find a book";
    }

    @Override
    protected String heroSubtitle() {
      return "Search the catalogue";
    }

    @Override
    public io.mateu.uidl.data.ListingData<Book> search(
        io.mateu.uidl.data.SearchRequest request, HttpRequest httpRequest) {
      return books();
    }
  }

  /**
   * An action that opens a placed dialog: draggable, resizable, at a given top/left, with its size
   * — the members the ports never set before 3.0 GA.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/dialog-placement")
  @Title("Dialog placement")
  public static class DialogPlacementPage {
    public String name = "Ada";

    @io.mateu.uidl.annotations.Action
    public Object openNotes() {
      return io.mateu.uidl.data.Dialog.builder()
          .headerTitle("Notes")
          .content(new io.mateu.uidl.data.Text("Free text"))
          .top("4rem")
          .left("2rem")
          .draggable(true)
          .resizable(true)
          .width("30rem")
          .height("20rem")
          .modeless(true)
          .closeButtonOnHeader(true)
          .build();
    }
  }

  /**
   * A class-level {@code @AutoSave}: every change runs the named action after the debounce — an
   * {@code AutoSave} trigger with its action id and debounce, and the action advertised (the client
   * only sends what the component advertises).
   */
  @SuppressWarnings("unused")
  @UI("/conformance/auto-save")
  @Title("Settings")
  @io.mateu.uidl.annotations.AutoSave(debounceMillis = 500, action = "persist")
  public static class AutoSaveForm {
    public String nickname = "ada";
    public boolean newsletter;

    @io.mateu.uidl.annotations.Action
    public Message persist() {
      return Message.success("Saved");
    }
  }

  /**
   * The last wire component types the ports lacked (3.0 GA parity): layouts (BoardLayout,
   * CarouselLayout, Container, FullWidth, Scroller, FormItem, FormSubSection, MasterDetailLayout),
   * navigation (ContextMenu, Directory, MenuBar), the fluent Grid with a column group, the chat and
   * message pieces, a not-found page, a virtual list, the cookie banner and the two editors. Pins
   * their member names and where their parts travel.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/more-components")
  @Title("More components")
  public static class MoreComponentsPage implements ComponentTreeSupplier {

    @Override
    public String style() {
      return null;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
      var t = (java.util.function.Function<String, Component>) io.mateu.uidl.data.Text::new;
      return new io.mateu.uidl.data.VerticalLayout(
          new io.mateu.uidl.data.BoardLayout(
              "board",
              List.of(
                  new io.mateu.uidl.data.BoardLayoutRow(
                      List.of(
                          new io.mateu.uidl.data.BoardLayoutItem(t.apply("Sales"), null, null, 2),
                          new io.mateu.uidl.data.BoardLayoutItem(t.apply("Stock"), null, null, 1)),
                      null,
                      null)),
              null,
              null),
          io.mateu.uidl.data.CarouselLayout.builder()
              .id("carousel")
              .content(List.of(t.apply("Slide 1"), t.apply("Slide 2")))
              .auto(true)
              .duration(4000)
              .dots(true)
              .loop(true)
              .build(),
          new io.mateu.uidl.data.Container(t.apply("Contained"), null, null),
          new io.mateu.uidl.data.FullWidth(t.apply("Wide"), null, null),
          new io.mateu.uidl.data.Scroller(t.apply("Scrolled"), "height: 10rem", null),
          new io.mateu.uidl.data.FormItem("item", List.of(t.apply("Field")), null, null),
          new io.mateu.uidl.data.FormSubSection("Address", List.of(t.apply("Street")), null, null),
          new io.mateu.uidl.data.MasterDetailLayout(
              "md",
              t.apply("Master"),
              t.apply("Detail"),
              io.mateu.uidl.data.Orientation.horizontal,
              null,
              null,
              null),
          io.mateu.uidl.data.ContextMenu.builder()
              .menu(List.of(new io.mateu.uidl.data.RouteLink("/orders", "Orders")))
              .wrapped(t.apply("Right click me"))
              .activateOnLeftClick(true)
              .build(),
          new io.mateu.uidl.data.Directory(
              List.of(
                  new io.mateu.uidl.data.Menu(
                      "/sales",
                      "Sales",
                      List.of(new io.mateu.uidl.data.RouteLink("/sales/orders", "Orders")))),
              null,
              null),
          io.mateu.uidl.fluent.MenuBar.builder()
              .option(new io.mateu.uidl.data.RouteLink("/home", "Home"))
              .option(new io.mateu.uidl.data.RouteLink("/help", "Help"))
              .build(),
          io.mateu.uidl.data.Grid.builder()
              .id("grid")
              .content(
                  List.of(
                      io.mateu.uidl.data.GridColumn.builder()
                          .id("name")
                          .label("Name")
                          .dataType(io.mateu.uidl.data.FieldDataType.string)
                          .build(),
                      new io.mateu.uidl.data.GridGroupColumn(
                          "occupancy",
                          "Occupancy",
                          null,
                          null,
                          List.of(
                              io.mateu.uidl.data.GridColumn.builder()
                                  .id("adults")
                                  .label("Adults")
                                  .dataType(io.mateu.uidl.data.FieldDataType.integer)
                                  .build(),
                              io.mateu.uidl.data.GridColumn.builder()
                                  .id("children")
                                  .label("Children")
                                  .dataType(io.mateu.uidl.data.FieldDataType.integer)
                                  .build()))))
              .page(
                  new io.mateu.uidl.data.Page<>(
                      "",
                      10,
                      0,
                      1,
                      List.of(java.util.Map.of("name", "Ada", "adults", 2, "children", 1))))
              .rowStripes(true)
              .build(),
          new io.mateu.uidl.data.Chat("/chat/sse", null, null, null),
          new io.mateu.uidl.data.MessageList(
              "messages",
              List.of(new io.mateu.uidl.data.MessageListItem("Hello", "Ada")),
              null,
              null),
          new io.mateu.uidl.data.MessageInput("input", "send", null, null),
          io.mateu.uidl.data.NotFound.builder()
              .title("Not here")
              .message("That page does not exist")
              .backRoute("/")
              .backLabel("Home")
              .build(),
          new io.mateu.uidl.data.VirtualList(
              new io.mateu.uidl.data.Page<>(
                  "", 10, 0, 2, List.of(t.apply("Row 1"), t.apply("Row 2"))),
              null,
              null),
          io.mateu.uidl.data.CookieConsent.builder()
              .message("We use cookies")
              .dismiss("OK")
              .position(io.mateu.uidl.data.CookieConsentPosition.Bottom)
              .build(),
          new io.mateu.uidl.data.FormEditor("{}", null, null),
          new io.mateu.uidl.data.Workflow("<bpmn/>", null, null));
    }
  }

  /**
   * Every trigger kind a view can declare, ported to .NET ({@code [Trigger]}) and Python
   * ({@code @trigger}) in 3.0-alpha.426 (M-A5): a periodic OnLoad refresh, OnSuccess/OnError of
   * another action (chained actions), OnValueChange of one field, and a {@code @SubscribeTo} on the
   * global bus. The actions they name are advertised (the client only sends what the component
   * advertises).
   */
  @SuppressWarnings("unused")
  @UI("/conformance/triggers")
  @Title("Triggers")
  @io.mateu.uidl.annotations.Trigger(
      type = io.mateu.uidl.annotations.TriggerType.OnLoad,
      actionId = "refresh",
      timeoutMillis = 5000,
      times = 0,
      background = true)
  @io.mateu.uidl.annotations.Trigger(
      type = io.mateu.uidl.annotations.TriggerType.OnSuccess,
      actionId = "reload",
      calledActionId = "save")
  @io.mateu.uidl.annotations.Trigger(
      type = io.mateu.uidl.annotations.TriggerType.OnError,
      actionId = "notifyFailure",
      calledActionId = "save")
  @io.mateu.uidl.annotations.Trigger(
      type = io.mateu.uidl.annotations.TriggerType.OnValueChange,
      actionId = "recalculate",
      propertyName = "quantity")
  @io.mateu.uidl.annotations.SubscribeTo(event = "order-saved", action = "reload")
  public static class TriggersForm {
    public int quantity = 1;

    public void refresh() {}

    public void reload() {}

    public void save() {}

    public void notifyFailure() {}

    public void recalculate() {}
  }

  /**
   * Field help text and slider bounds on a reflected form, ported to .NET ({@code [Help]}, {@code
   * [SliderMin]}, {@code [SliderMax]}) and Python ({@code Help()}, {@code SliderMin()}, {@code
   * SliderMax()}) in 3.0-alpha.426 (M-A5): {@code @Help} travels as the field's {@code
   * description}.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/field-help")
  @Title("Field help")
  public static class FieldHelpForm {
    @io.mateu.uidl.annotations.Help("We never share it")
    public String email = "";

    @io.mateu.uidl.annotations.SliderMin(10)
    @io.mateu.uidl.annotations.SliderMax(50)
    public int volume = 20;
  }

  /**
   * The input hints of a fluent FormField, ported with it to .NET and Python (M-A5): placeholder,
   * description (help text), autofocus, step and the slider bounds.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/field-hints")
  @Title("Field hints")
  public static class FieldHintsPage implements ComponentTreeSupplier {

    @Override
    public String style() {
      return null;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
      return io.mateu.uidl.data.FormField.builder()
          .id("amount")
          .label("Amount")
          .dataType(io.mateu.uidl.data.FieldDataType.number)
          .placeholder("0.00")
          .description("Including taxes")
          .autofocus(true)
          .step(0.5)
          .sliderMin(10)
          .sliderMax(50)
          .colspan(1)
          .optionsColumns(1)
          .build();
    }
  }

  /**
   * A page toolbar action, ported to .NET ({@code [Toolbar]}) and Python ({@code @toolbar}) in
   * 3.0-alpha.426 (M-A5): a {@code @Toolbar} method is a header toolbar button (its label from
   * {@code @Label}, else the humanized method name; its style from the annotation) and an
   * advertised action. One method only: the JVM does not promise the order of a class's declared
   * methods, so two actions could swap places between runs.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/page-toolbar")
  @Title("Page toolbar")
  public static class PageToolbarForm {
    public String name = "Ada";

    @io.mateu.uidl.annotations.Toolbar(buttonStyle = io.mateu.uidl.data.ButtonStyle.primary)
    @io.mateu.uidl.annotations.Label("Publish now")
    public void publish() {}
  }

  /**
   * A @BulletedList collection field renders as a plain read-only &lt;ul&gt; (stereotype
   * bulletedList).
   */
  @SuppressWarnings("unused")
  @UI("/conformance/bulleted-list")
  @Title("Bulleted list")
  public static class BulletedListPage {
    @BulletedList
    public List<String> preferences = List.of("Extra pillow", "High floor", "Sea view");
  }

  /**
   * An {@code @AppContext} enum field on the app class becomes a header context selector
   * (AppDto.contextSelectors): fieldName from the field, label from the annotation, options from
   * the enum constants (value = constant name, label = humanized). The {@code @Menu} leaf makes the
   * class an APP so the sync answers the App fragment; its annotation is fully qualified because
   * this file already imports the fluent {@code io.mateu.uidl.data.Menu}.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/app-context")
  @Title("Context app")
  public static class ContextApp {

    @io.mateu.uidl.annotations.Menu public String home = "/a";

    @AppContext(label = "Hotel")
    public Hotel hotel;

    public enum Hotel {
      palma,
      madrid
    }
  }

  /**
   * App header actions: the app class implements {@link AppActionsSupplier} and its actions travel
   * on the app metadata as contextActions — a plain button (actionId + label + icon) and a dropdown
   * (null actionId, children) whose children are the only dispatching leaves.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/app-header-actions")
  @Title("Header actions")
  public static class HeaderActionsApp implements AppActionsSupplier {

    // FQN on purpose: the runner already imports io.mateu.uidl.data.Menu (AppInCode), which would
    // clash with the annotation. A @Menu member is what classifies the class as an app.
    @io.mateu.uidl.annotations.Menu String home = "/";

    @Override
    public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
      return List.of(
          new AppHeaderAction("sync", "Sync now", "vaadin:refresh"),
          AppHeaderAction.menu(
              "Export",
              "vaadin:download",
              List.of(
                  new AppHeaderAction("exportPdf", "As PDF"),
                  new AppHeaderAction("exportExcel", "As Excel"))));
    }

    public Message sync() {
      return new Message("Synced");
    }
  }

  /** {@code @Toc} forces the sticky sections index: the page carries {@code toc=true}. */
  @SuppressWarnings("unused")
  @UI("/conformance/toc")
  @Title("Long document")
  @Toc
  public static class TocPage {
    @Section("Overview")
    public String summary = "All good";

    @Section("Details")
    public String detail = "Everything";

    @Section("Contact")
    public String phone = "+34 600 000 000";

    @Section("History")
    public String history = "Created 2026";

    @Section("Notes")
    public String notes = "None";
  }

  /** A list of nested rows becomes a grid: columns from the row type, @OnRowSelected the click. */
  @SuppressWarnings("unused")
  @UI("/conformance/grid-field")
  @Title("Guest grid")
  public static class GridField {
    @OnRowSelected("onSel")
    public List<GuestRow> guests =
        new ArrayList<>(List.of(new GuestRow("Alice", 34), new GuestRow("Bob", 29)));

    public void onSel(GuestRow row) {}

    public static class GuestRow {
      public String name = "";
      public int age = 0;

      public GuestRow() {}

      public GuestRow(String name, int age) {
        this.name = name;
        this.age = age;
      }
    }
  }

  /**
   * A grid field whose row type has a @Details field (the content that opens under a row, behind a
   * button) and whose row editor is customised: @DetailFormCustomisation (position, columns, style,
   * theme) + @MasterDetail (the grid's min height while the editor shows).
   */
  @SuppressWarnings("unused")
  @UI("/conformance/grid-field-detail")
  @Title("Order lines")
  public static class GridFieldDetail {
    @io.mateu.uidl.annotations.DetailFormCustomisation(
        position = io.mateu.uidl.data.FormPosition.bottom,
        columns = 1,
        style = "padding: 1rem;",
        theme = "compact")
    @io.mateu.uidl.annotations.MasterDetail(minHeightWhenDetailVisible = "20rem")
    public List<LineRow> lines = new ArrayList<>(List.of(new LineRow("Desk", "Oak")));

    public static class LineRow {
      public String product = "";

      @io.mateu.uidl.annotations.Details public String notes = "";

      public LineRow() {}

      public LineRow(String product, String notes) {
        this.product = product;
        this.notes = notes;
      }
    }
  }

  /**
   * Every option of the fluent listing (Java's fluent {@code Listing}, the ports' {@code
   * ListingComponent}) that the ports did not carry before 3.0 GA: page size and first page,
   * header/footer/pre-search components, the toolbar and group actions, the row detail path and its
   * button, lazy column rendering, lazy loading, infinite scrolling, the grid cell colours, the
   * row-selection action, the content height, the listing type, the search switches, grouping, row
   * tones, drag type and row selection.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/fluent-crudl-options")
  @Title("Fluent listing options")
  public static class FluentCrudlOptionsPage implements ComponentTreeSupplier {

    @Override
    public String style() {
      return null;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
      return io.mateu.uidl.fluent.Listing.builder()
          .id("orders")
          .title("Orders")
          .listingType(io.mateu.uidl.fluent.ListingType.card)
          .column(
              io.mateu.uidl.data.GridColumn.builder()
                  .id("customer")
                  .label("Customer")
                  .dataType(io.mateu.uidl.data.FieldDataType.string)
                  .build())
          .toolbarItem(new io.mateu.uidl.data.Button("Export", "export"))
          .size(3)
          .initialPage(2)
          .headerItem(new io.mateu.uidl.data.Text("Head"))
          .footerItem(new io.mateu.uidl.data.Text("Foot"))
          .preSearchItem(new io.mateu.uidl.data.Text("Search to start"))
          .detailPath("notes")
          .useButtonForDetail(true)
          .lazyColumnRendering(true)
          .lazyLoading(true)
          .infiniteScrolling(true)
          .vaadinGridCellBackground("#fafafa")
          .vaadinGridCellPadding("4px")
          .onRowSelectionChangedActionId("rowsChanged")
          .contentHeight("20rem")
          .searchOnEnter(false)
          .autoFocusOnSearchText(false)
          .groupBy("status")
          .groupAction(new io.mateu.uidl.data.Button("Close group", "closeGroup"))
          .rowStatusField("status")
          .dragType("order")
          .rowsSelectionEnabled(true)
          .build();
    }
  }

  /** The StatusList front-office component: labelled status rows — a chip row and an action row. */
  @UI("/conformance/status-list")
  @Title("Status list")
  public static class StatusListPage implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
      return StatusList.builder()
          .id("statusList")
          .items(
              List.of(
                  StatusItem.builder()
                      .id("ses")
                      .icon("✓")
                      .title("Traveller report")
                      .description("Sent automatically on check-in")
                      .status("Automatic")
                      .statusColor("success")
                      .build(),
                  StatusItem.builder()
                      .id("key")
                      .icon("🔑")
                      .title("Encode key card")
                      .description("Digital key add-on")
                      .actionLabel("Encode")
                      .actionId("encodeKey")
                      .build()))
          .build();
    }
  }

  /**
   * {@code @Compact}: the high-density preset lands on the page style (marker {@code
   * --mateu-compact:1}).
   */
  @SuppressWarnings("unused")
  @UI("/conformance/compact")
  @Title("Compact page")
  @Compact
  public static class CompactPage {
    public String name = "Ada";
    public String email = "ada@example.com";
  }

  /**
   * The access annotations as an ANONYMOUS caller sees them: the {@code @EyesOnly} field is not on
   * the wire at all, the {@code @ReadOnlyUnless} one is read-only and the {@code @DisabledUnless}
   * button disabled. The security half of the wire, pinned across the three servers.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/access-annotations")
  @Title("Access annotations")
  public static class AccessAnnotations {
    public String name = "Ada";

    @io.mateu.uidl.annotations.EyesOnly(roles = "hr")
    public String salary = "100k";

    @io.mateu.uidl.annotations.ReadOnlyUnless(roles = "manager")
    public String notes = "n/a";

    @io.mateu.uidl.annotations.Button
    @io.mateu.uidl.annotations.DisabledUnless(roles = "manager")
    public void approve() {}
  }

  // ── Listings and CRUDs ───────────────────────────────────────────────────────────────────────

  public enum ProductStatus {
    Available,
    OutOfStock,
    Discontinued
  }

  /**
   * The starters' Product: an id, a text, a number and an enum — and, like the starters', a {@code
   * toString()} that names the record, so its record pages are titled after it in every port.
   */
  public record Product(String id, String name, double price, ProductStatus status)
      implements io.mateu.uidl.interfaces.Identifiable {
    @Override
    public String toString() {
      return name != null && !name.isBlank() ? name : "New product";
    }
  }

  static final List<Product> PRODUCTS =
      List.of(
          new Product("P-001", "Espresso machine", 249.0, ProductStatus.Available),
          new Product("P-002", "Coffee grinder", 89.5, ProductStatus.Available),
          new Product("P-003", "Milk frother", 39.9, ProductStatus.OutOfStock));

  static io.mateu.uidl.interfaces.CrudStore<Product> productStore() {
    return new io.mateu.uidl.interfaces.CrudStore<>() {
      @Override
      public java.util.Optional<Product> findById(String id) {
        return PRODUCTS.stream().filter(p -> p.id().equals(id)).findFirst();
      }

      @Override
      public String save(Product entity) {
        return entity.id();
      }

      @Override
      public List<Product> findAll() {
        return PRODUCTS;
      }

      @Override
      public void deleteAllById(List<String> ids) {}
    };
  }

  /**
   * The plain CRUD the starters ship: listing with search + derived filters, New/Delete, the id
   * column a link to the record. What every port must answer when the user opens it.
   */
  @UI("/conformance/crud")
  @Title("Products")
  public static class ProductsCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Product> {
    @Override
    public io.mateu.uidl.interfaces.CrudStore<Product> store() {
      return productStore();
    }
  }

  public record Book(String id, String title, int pages) {}

  public record BookFilters(String title, boolean classic) {}

  static io.mateu.uidl.data.ListingData<Book> books() {
    return io.mateu.uidl.data.ListingData.from(
        List.of(new Book("b1", "El Quijote", 863), new Book("b2", "Rayuela", 600)));
  }

  /** A read-only listing that declares a search box and a filters type — nothing else. */
  @UI("/conformance/listing-filters")
  @Title("Books")
  public static class FilteredBooks
      implements io.mateu.uidl.interfaces.Listing<Book>,
          io.mateu.uidl.interfaces.Searchable,
          io.mateu.uidl.interfaces.Filterable<BookFilters> {
    @Override
    public io.mateu.uidl.data.ListingData<Book> search(
        io.mateu.uidl.data.SearchRequest request, HttpRequest httpRequest) {
      return books();
    }
  }

  /** A listing that is navigable: the id column becomes the link to the record. */
  @UI("/conformance/listing-navigable")
  @Title("Books")
  public static class NavigableBooks
      implements io.mateu.uidl.interfaces.Listing<Book>,
          io.mateu.uidl.interfaces.Navigable<Book, String> {
    @Override
    public io.mateu.uidl.data.ListingData<Book> search(
        io.mateu.uidl.data.SearchRequest request, HttpRequest httpRequest) {
      return books();
    }

    @Override
    public Book view(String id, HttpRequest httpRequest) {
      return books().page().content().get(0);
    }
  }

  /** A sale: grouped by region, totals over amount and a count over invoice. */
  public static class Sale implements io.mateu.uidl.interfaces.Identifiable {
    public String id;
    @io.mateu.uidl.annotations.GroupBy public String region;

    @io.mateu.uidl.annotations.Aggregate(io.mateu.uidl.data.AggregateFunction.sum)
    public double amount;

    @io.mateu.uidl.annotations.Aggregate(io.mateu.uidl.data.AggregateFunction.count)
    public String invoice;

    public Sale() {}

    public Sale(String id, String region, double amount, String invoice) {
      this.id = id;
      this.region = region;
      this.amount = amount;
      this.invoice = invoice;
    }

    @Override
    public String id() {
      return id;
    }
  }

  /** A CRUD whose columns carry aggregates and whose rows group by a column. */
  @UI("/conformance/crud-grouped")
  @Title("Sales")
  public static class SalesCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Sale> {
    @Override
    public io.mateu.uidl.interfaces.CrudStore<Sale> store() {
      return new io.mateu.uidl.interfaces.CrudStore<>() {
        final List<Sale> sales =
            List.of(
                new Sale("1", "North", 100.0, "F-1"),
                new Sale("2", "South", 50.0, "F-2"),
                new Sale("3", "North", 25.0, "F-3"));

        @Override
        public java.util.Optional<Sale> findById(String id) {
          return sales.stream().filter(s -> s.id.equals(id)).findFirst();
        }

        @Override
        public String save(Sale entity) {
          return entity.id;
        }

        @Override
        public List<Sale> findAll() {
          return sales;
        }

        @Override
        public void deleteAllById(List<String> ids) {}
      };
    }
  }

  public enum Tone {
    calm,
    loud
  }

  /** One column per basic type: what each becomes on a listing. */
  public record Measurement(
      String label,
      int count,
      double amount,
      boolean active,
      LocalDate day,
      java.time.LocalDateTime at,
      Tone tone) {}

  /** A bare listing whose row carries every basic type: the column mapping, pinned. */
  @UI("/conformance/listing-columns")
  @Title("Measurements")
  public static class MeasurementsListing implements io.mateu.uidl.interfaces.Listing<Measurement> {
    @Override
    public io.mateu.uidl.data.ListingData<Measurement> search(
        io.mateu.uidl.data.SearchRequest request, HttpRequest httpRequest) {
      return io.mateu.uidl.data.ListingData.from(List.of());
    }
  }

  /** The canonical header's previous/next record links (PageDto.peerNav). */
  @UI("/conformance/peer-nav")
  @Title("Record 2")
  public static class PeerNavPage implements io.mateu.uidl.interfaces.PeerNavigationSupplier {
    public String name = "Two";

    @Override
    public io.mateu.uidl.data.PeerNav peers(HttpRequest httpRequest) {
      return new io.mateu.uidl.data.PeerNav("Record 1", "/records/1", "Record 3", "/records/3");
    }
  }

  /**
   * The content slot of an app that declares only menu items: the shell's home is the
   * "_no_home_route" sentinel and the browser loads it against the app type (request.json).
   */
  /**
   * The screen NoHomeApp's menu leads to (a typed @Menu leaf: no value rides in the app's state).
   */
  @UI("/conformance/app-no-home/orders")
  public static class NoHomeOrders {
    public String note = "orders";
  }

  @UI("/conformance/app-no-home")
  public static class NoHomeApp {
    @io.mateu.uidl.annotations.Menu NoHomeOrders orders;
  }

  /** The account step of the sign-up wizard: one required text. */
  public static class AccountStep
      implements io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep {
    @jakarta.validation.constraints.NotEmpty public String email;
  }

  /** The plan step: a number with a default. */
  public static class PlanStep
      implements io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep {
    public int seats = 1;
  }

  /** The read-only result step, shown after the completion action. */
  public static class DoneStep
      implements io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep {
    public String reference;
  }

  /**
   * A three-step wizard: two data steps and the result screen. The case pins the FIRST step — the
   * progress indicator, the step form, the Next button and no Back.
   */
  @UI("/conformance/wizard")
  @Title("Sign up")
  public static class SignUpWizard
      extends io.mateu.core.infra.declarative.orchestrators.wizard.Wizard {
    public AccountStep account;
    public PlanStep plan;
    public DoneStep done;

    @io.mateu.uidl.annotations.WizardCompletionAction
    public void signUp() {}
  }

  /**
   * Options fetched from a REST endpoint: one field declares the request inline, the other names a
   * catalogue source by {@code ref} (the wire carries the name; the catalogue travels apart).
   */
  @UI("/conformance/rest-source")
  @Title("Shipping")
  public static class RestSourceForm {
    @io.mateu.uidl.annotations.RestOptions(
        url = "https://api.example.com/countries?q=${state.country}",
        itemsPath = "items",
        valuePath = "code",
        labelPath = "name")
    public String country;

    @io.mateu.uidl.annotations.RestOptions(source = "currencies")
    public String currency;
  }

  // ── Second requests: what an ACTION answers, not what a first load draws ────────────────────

  /**
   * An action's effects on the envelope: two messages (a success toast with an explicit duration,
   * and an error, which every backend makes sticky — duration 0) and a navigation command.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/action-effects")
  @Title("Action effects")
  public static class ActionEffectsPage {
    public String name = "Ada";

    @io.mateu.uidl.annotations.Action
    public Object confirm() {
      return List.of(
          Message.builder()
              .variant(io.mateu.uidl.data.NotificationVariant.success)
              .position(io.mateu.uidl.data.NotificationPosition.middle)
              .title("Done")
              .text("Saved")
              .duration(4000)
              .build(),
          Message.builder()
              .variant(io.mateu.uidl.data.NotificationVariant.error)
              .position(io.mateu.uidl.data.NotificationPosition.middle)
              .title("Warehouse")
              .text("Could not notify the warehouse")
              .duration(4000)
              .build(),
          io.mateu.uidl.data.UICommand.navigateTo("/conformance/simple-form"));
    }
  }

  /** An action that opens a drawer: an ADD fragment carrying the Drawer and its content. */
  @SuppressWarnings("unused")
  @UI("/conformance/drawer")
  @Title("Drawer")
  public static class DrawerPage {
    public String name = "Ada";

    @io.mateu.uidl.annotations.Action
    public Object openDetails() {
      return io.mateu.uidl.data.Drawer.builder()
          .headerTitle("Details")
          .subtitle("Read only")
          .content(new io.mateu.uidl.data.Text("Nothing to edit here"))
          .position(io.mateu.uidl.data.DrawerPosition.end)
          .build();
    }
  }

  /**
   * A save the server refuses: the button is advertised validationRequired, the state leaves the
   * required field empty, and the server re-checks it instead of trusting the client.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/rejected-save")
  @Title("Rejected save")
  public static class RejectedSaveForm {
    @NotEmpty public String name;

    @io.mateu.uidl.annotations.Button
    public Object save() {
      return Message.success("Saved");
    }
  }

  /**
   * An action that fails unexpectedly: the error boundary answers "Something went wrong" with a
   * reference id (normalised away, it is per request) and never the exception.
   */
  @SuppressWarnings("unused")
  @UI("/conformance/error-boundary")
  @Title("Error boundary")
  public static class FailingActionPage {
    public String name = "Ada";

    @io.mateu.uidl.annotations.Action
    public Object explode() {
      throw new IllegalStateException("database is down at db-01");
    }
  }

  /**
   * Cases pinned on a SECOND request — a case directory with a {@code request.json} ({@code route},
   * {@code consumedRoute}, {@code actionId}, {@code componentState}) is rendered by sending that
   * request to the case's fixture type instead of the first load. Identical in the three runners.
   */
  private static final java.util.Map<String, Class<?>> REQUESTED =
      java.util.Map.ofEntries(
          java.util.Map.entry("app-no-home-content", NoHomeApp.class),
          java.util.Map.entry("crud-search", ProductsCrud.class),
          java.util.Map.entry("action-effects", ActionEffectsPage.class),
          java.util.Map.entry("drawer", DrawerPage.class),
          java.util.Map.entry("dialog-placement", DialogPlacementPage.class),
          java.util.Map.entry("crud-hidden-in-edit", EmployeesCrud.class),
          java.util.Map.entry("crud-hidden-in-new", EmployeesCrud.class),
          java.util.Map.entry("crud-hidden-constraints-edit", SeatsCrud.class),
          java.util.Map.entry("crud-hidden-constraints-new", SeatsCrud.class),
          java.util.Map.entry("editable-view", ProfileView.class),
          java.util.Map.entry("editable-view-edit", ProfileView.class),
          java.util.Map.entry("view-toolbar-button", ProductsWithViewButton.class),
          java.util.Map.entry("rejected-save", RejectedSaveForm.class),
          java.util.Map.entry("error-boundary", FailingActionPage.class),
          java.util.Map.entry("wizard-step-2", SignUpWizard.class),
          java.util.Map.entry("crud-new", ProductsCrud.class),
          java.util.Map.entry("crud-edit", ProductsCrud.class),
          java.util.Map.entry("crud-view", ProductsCrud.class));

  private static final List<String> CASES =
      List.of(
          "simple-form",
          "page-header",
          "tabs",
          "zones",
          "money-field",
          "banner",
          "fab",
          "separator-text",
          "client-rules",
          "static-view",
          "small-enum-radio",
          "dashboard",
          "app-in-code",
          "validation",
          "validation-text",
          "validation-locked",
          "stereotypes",
          "lookup",
          "tree-select",
          "notice",
          "bulleted-list",
          "app-context",
          "app-header-actions",
          "toc",
          "grid-field",
          "status-list",
          "compact",
          "access-annotations",
          "crud",
          "listing-filters",
          "listing-navigable",
          "crud-grouped",
          "listing-columns",
          "peer-nav",
          "app-no-home-content",
          "card-menu",
          "app-extras",
          "welcome-banner",
          "crud-search",
          "wizard",
          "rest-source",
          "action-effects",
          "drawer",
          "rejected-save",
          "error-boundary",
          "wizard-step-2",
          "crud-new",
          "crud-edit",
          "crud-view",
          "generic-components",
          "triggers",
          "field-help",
          "field-hints",
          "page-toolbar",
          "form-columns",
          "more-components",
          "auto-save",
          "dialog-placement",
          "action-extras",
          "app-branding",
          "app-back-link",
          "section-options",
          "crud-hidden-in",
          "crud-hidden-in-edit",
          "crud-hidden-in-new",
          "crud-hidden-constraints-edit",
          "crud-hidden-constraints-new",
          "editable-view",
          "editable-view-edit",
          "view-toolbar-button",
          "grid-field-detail",
          "fluent-crudl-options",
          "hero-search-filters",
          "definition-actions");

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    // The YAML cases first, each on a Mateu of its own: booting (and closing) one re-points the
    // core's process-wide statics, so the shared instance below has to be the last one booted.
    for (var name : CASES) {
      if (Files.isDirectory(corpus().resolve(name).resolve("specs"))) {
        var answer = actualYaml(name);
        YAML_ANSWERS.put(name, new Object[] {answer, lastRawBytes});
      }
    }
    mateu =
        TestMateu.withUis(
            SimpleForm.class,
            PageHeader.class,
            Tabs.class,
            ZonedForm.class,
            MoneyField.class,
            BannerPage.class,
            FabPage.class,
            SeparatorText.class,
            ClientRules.class,
            StaticAbout.class,
            SmallEnumRadio.class,
            DashboardPage.class,
            AppInCode.class,
            ValidatedForm.class,
            ValidatedTextForm.class,
            LockedFieldsForm.class,
            Stereotypes.class,
            LookupForm.class,
            TreeSelectForm.class,
            NoticePage.class,
            BulletedListPage.class,
            ContextApp.class,
            HeaderActionsApp.class,
            TocPage.class,
            GridField.class,
            StatusListPage.class,
            CompactPage.class,
            AccessAnnotations.class,
            ProductsCrud.class,
            FilteredBooks.class,
            NavigableBooks.class,
            SalesCrud.class,
            MeasurementsListing.class,
            PeerNavPage.class,
            NoHomeApp.class,
            CardMenuApp.class,
            ExtrasApp.class,
            WelcomeBannerPage.class,
            SignUpWizard.class,
            RestSourceForm.class,
            ActionEffectsPage.class,
            DrawerPage.class,
            RejectedSaveForm.class,
            FailingActionPage.class,
            GenericComponentsPage.class,
            TriggersForm.class,
            FieldHelpForm.class,
            FieldHintsPage.class,
            PageToolbarForm.class,
            FormColumnsForm.class,
            MoreComponentsPage.class,
            AutoSaveForm.class,
            DialogPlacementPage.class,
            ActionExtrasPage.class,
            BrandedApp.class,
            BackLinkApp.class,
            BackLinkParent.class,
            SectionOptionsForm.class,
            EmployeesCrud.class,
            ProfileView.class,
            ProductsWithViewButton.class,
            GridFieldDetail.class,
            FluentCrudlOptionsPage.class,
            SeatsCrud.class,
            HeroBooks.class);
    // The core test classpath carries a specs/ui/sources.yaml for the catalogue suites; no case
    // declares a source, so it must not leak restSources into the app goldens (the ports run with
    // no catalogue at all).
    try {
      var registry =
          mateu.context().getBean(io.mateu.core.application.runaction.RestSourceRegistry.class);
      var field = registry.getClass().getDeclaredField("catalog");
      field.setAccessible(true);
      field.set(registry, io.mateu.uidl.data.RestSourceCatalog.empty());
    } catch (ReflectiveOperationException e) {
      throw new IllegalStateException(e);
    }
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── The corpus ───────────────────────────────────────────────────────────────────────────────

  /**
   * The wire mapper, configured as the adapters configure theirs — dates as ISO strings rather than
   * numeric tuples, which is what actually travels and what the other servers emit.
   */
  private static final ObjectMapper MAPPER =
      new ObjectMapper()
          .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
          .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

  static Path corpus() {
    return Path.of(System.getProperty("user.dir"))
        .resolve("../../../conformance/cases")
        .normalize();
  }

  /**
   * Values that legitimately differ between servers or between runs. Comparing them would make the
   * corpus report noise, and a check that reports noise gets ignored — so they are dropped on both
   * sides rather than argued about.
   */
  private static final Set<String> VOLATILE =
      Set.of(
          "id",
          "structureHash",
          "generatedAt",
          "serverSideType",
          "homeServerSideType",
          "targetComponentId");

  /** Drops volatile members and empty ones, and sorts keys, so two servers can be compared. */
  static JsonNode normalise(JsonNode node) {
    return normalise(node, false);
  }

  /**
   * An ACTION's id is not volatile: it is the name the client sends, so a missing or renamed action
   * is a contract break. Dropped with every generated id, the ports' CRUD forms shipped with dead
   * Save/Edit buttons that no case noticed.
   */
  static JsonNode normalise(JsonNode node, boolean inActions) {
    if (node.isObject()) {
      var out = MAPPER.createObjectNode();
      var names = new java.util.TreeSet<String>();
      node.fieldNames().forEachRemaining(names::add);
      for (var name : names) {
        if (VOLATILE.contains(name)
            && !(name.equals("id") && (inActions || Boolean.getBoolean("conformance.keepIds")))) {
          continue;
        }
        var value = normalise(node.get(name), name.equals("actions"));
        if (isDefault(value) && !(MEANINGFUL_ZERO.contains(name) && isZero(value))) {
          continue; // absent and default mean the same thing to a renderer
        }
        out.set(name, value);
      }
      return out;
    }
    if (node.isArray()) {
      ArrayNode out = MAPPER.createArrayNode();
      node.forEach(child -> out.add(normalise(child, inActions)));
      return out;
    }
    if (node.isTextual() && REFERENCE.matcher(node.asText()).find()) {
      return MAPPER
          .getNodeFactory()
          .textNode(REFERENCE.matcher(node.asText()).replaceAll("Reference: <ref>"));
    }
    return node;
  }

  /**
   * The error boundary's per-request reference id ("… Reference: 5e7a29f0ad71"): a server's log
   * key, different on every run and in every server, so it is masked — the text around it is not.
   */
  static final java.util.regex.Pattern REFERENCE =
      java.util.regex.Pattern.compile("Reference: [A-Za-z0-9-]+");

  /**
   * Members whose zero value is NOT their absent value: a renderer reads an absent one as a
   * non-zero default, so {@code false}/{@code 0} must be sent explicitly and is kept here — the
   * "absent == default" rule would otherwise hide a producer that omits it. {@code duration} 0 is a
   * sticky toast (absent = the renderer's default timeout); the booleans default to TRUE when
   * absent ({@code visible}, {@code opened}, {@code open}, {@code searchable}, {@code centered},
   * {@code asideSticky}); {@code debounceMillis} 0 is "no debounce" (absent = 800). Identical in
   * the three runners and listed in {@code reference/wire-specification.md}.
   */
  static final Set<String> MEANINGFUL_ZERO =
      Set.of(
          "duration",
          "visible",
          "opened",
          "open",
          "searchable",
          "centered",
          "asideSticky",
          "debounceMillis");

  private static boolean isZero(JsonNode value) {
    return value.isBoolean() || value.isNumber();
  }

  /**
   * Whether a value carries no information. Servers legitimately differ on whether they SEND a
   * member at its default or omit it — Java emits {@code false}/{@code 0}/{@code ""}, the ports
   * omit them — and a renderer cannot tell the two apart. Comparing them would make the corpus
   * report dozens of differences that mean nothing, and a corpus that reports noise gets ignored.
   */
  private static boolean isDefault(JsonNode value) {
    return value.isNull()
        || (value.isArray() && value.isEmpty())
        || (value.isObject() && value.isEmpty())
        || (value.isBoolean() && !value.asBoolean())
        || (value.isNumber() && value.asDouble() == 0d)
        || (value.isTextual() && value.asText().isEmpty());
  }

  /**
   * Cases whose first load answers a MEDIATOR shell (a CRUD, or a listing promoted to one): the
   * browser then loads the content through it with the route consumed. The ports answer that
   * content directly, so the corpus pins the content load — the screen the user actually sees.
   *
   * <p>What it does NOT pin is the mediator PROTOCOL around it, which is structural: Java's listing
   * advertises only its own actions and lets New/View/Delete bubble to the mediator, and carries
   * the mediator's private routing state ({@code _route}, {@code idFieldForRow}); the ports have no
   * mediator and answer every action in place. So for these cases the content component's {@code
   * actions} and the fragment's {@code initialData}/{@code state} are left out on every side (see
   * {@link #withoutMediatorProtocol}); everything the renderer draws is pinned.
   */
  private static final java.util.Map<String, Class<?>> MEDIATED =
      java.util.Map.of(
          "crud", ProductsCrud.class,
          "crud-grouped", SalesCrud.class,
          "listing-navigable", NavigableBooks.class,
          "crud-hidden-in", EmployeesCrud.class);

  /**
   * Cases loaded by a plain sync whose component is a mediator all the same: the wizard advertises
   * a {@code *} catch-all and keeps its position in its own state, while the ports list
   * next/back/skip/the completion and keep {@code __step}. Their actions and state stay out on
   * every side, exactly as for {@link #MEDIATED}; everything the wizard draws is pinned.
   */
  private static final Set<String> MEDIATOR_PROTOCOL_ONLY =
      Set.of(
          "wizard",
          "wizard-step-2",
          "crud-new",
          "crud-edit",
          "crud-view",
          "crud-hidden-in-edit",
          "crud-hidden-in-new",
          "crud-hidden-constraints-edit",
          "crud-hidden-constraints-new",
          "editable-view",
          "editable-view-edit",
          "view-toolbar-button");

  /**
   * A YAML case: its {@code specs/ui/} directory is served as the classpath's {@code specs/ui/**}
   * (everything else from the test classpath) to a Mateu booted for it alone, and its {@code
   * request.json} route is loaded — the ports point their specs directory at the same files.
   */
  private static JsonNode actualYaml(String name) {
    try {
      var request =
          MAPPER.readTree(Files.readString(corpus().resolve(name).resolve("request.json")));
      var root = corpus().resolve(name).toUri().toURL();
      var thread = Thread.currentThread();
      var previous = thread.getContextClassLoader();
      var overlay = new SpecsOverlay(root, WireConformanceTest.class.getClassLoader());
      thread.setContextClassLoader(overlay);
      try (var yaml = TestMateu.withUis()) {
        return roundTrip(
            yaml.run(
                io.mateu.dtos.RunActionRqDto.builder()
                    .route(request.path("route").asText(""))
                    .consumedRoute(
                        request.has("consumedRoute") ? request.get("consumedRoute").asText() : null)
                    .actionId(request.path("actionId").asText(""))
                    .componentState(java.util.Map.of())
                    .build()));
      } finally {
        thread.setContextClassLoader(previous);
      }
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  /** Serves {@code specs/ui/**} from one case directory; everything else from the parent. */
  static final class SpecsOverlay extends ClassLoader {
    private final java.net.URLClassLoader specs;

    SpecsOverlay(java.net.URL root, ClassLoader parent) {
      super(parent);
      this.specs = new java.net.URLClassLoader(new java.net.URL[] {root}, null);
    }

    private static boolean isSpec(String name) {
      return name.startsWith("specs/ui") || name.startsWith("/specs/ui");
    }

    @Override
    public java.net.URL getResource(String name) {
      return isSpec(name) ? specs.getResource(name) : super.getResource(name);
    }

    @Override
    public java.util.Enumeration<java.net.URL> getResources(String name) throws IOException {
      return isSpec(name) ? specs.getResources(name) : super.getResources(name);
    }
  }

  /** The YAML cases' answers (and raw sizes), rendered in {@link #boot()}. */
  private static final java.util.Map<String, Object[]> YAML_ANSWERS = new java.util.HashMap<>();

  private static JsonNode actual(String route) {
    if (YAML_ANSWERS.get(route) instanceof Object[] answer) {
      lastRawBytes = (Integer) answer[1];
      return ((JsonNode) answer[0]).deepCopy();
    }
    var requested = REQUESTED.get(route);
    var requestFile = corpus().resolve(route).resolve("request.json");
    if (requested != null && Files.exists(requestFile)) {
      try {
        var request = MAPPER.readTree(Files.readString(requestFile));
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> state =
            request.has("componentState")
                ? MAPPER.convertValue(request.get("componentState"), java.util.Map.class)
                : java.util.Map.of();
        var answer =
            roundTrip(
                mateu.run(
                    io.mateu.dtos.RunActionRqDto.builder()
                        .route(request.path("route").asText(""))
                        .consumedRoute(
                            request.has("consumedRoute")
                                ? request.get("consumedRoute").asText()
                                : null)
                        .actionId(request.path("actionId").asText(""))
                        .serverSideType(requested.getName())
                        .componentState(state)
                        .build()));
        if (MEDIATED_FORMS.contains(route)) {
          answer = withoutMediatedRoute(answer);
        }
        return MEDIATOR_PROTOCOL_ONLY.contains(route) ? withoutMediatorProtocol(answer) : answer;
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }
    var path = "/conformance/" + route;
    var mediated = MEDIATED.get(route);
    var increment =
        mediated == null
            ? mateu.sync(path)
            : mateu.run(
                io.mateu.dtos.RunActionRqDto.builder()
                    .route(path)
                    .consumedRoute(path)
                    .serverSideType(mediated.getName())
                    .actionId("")
                    .initiatorComponentId("c1_app")
                    .componentState(java.util.Map.of())
                    .build());
    if (mediated != null || MEDIATOR_PROTOCOL_ONLY.contains(route)) {
      return withoutMediatorProtocol(roundTrip(increment));
    }
    return roundTrip(increment);
  }

  /**
   * The CRUD's record forms (new / edit / view): Java's mediator answers them on the CRUD's own
   * route (the mediator's, the one every later action is sent back to), the ports — which have no
   * mediator — on the record's route ({@code /new}, {@code /P-001/edit}). Which route a component
   * answers on is the mediator protocol; everything the form draws is pinned. Identical in the
   * three runners.
   */
  static final Set<String> MEDIATED_FORMS =
      Set.of(
          "crud-new",
          "crud-edit",
          "crud-view",
          "crud-hidden-in-edit",
          "crud-hidden-in-new",
          "crud-hidden-constraints-edit",
          "crud-hidden-constraints-new",
          "editable-view",
          "editable-view-edit",
          "view-toolbar-button");

  static JsonNode withoutMediatedRoute(JsonNode increment) {
    for (var fragment : increment.path("fragments")) {
      if (fragment.get("component") instanceof com.fasterxml.jackson.databind.node.ObjectNode c) {
        c.remove("route");
      }
    }
    return increment;
  }

  /** Drops the mediator protocol of a mediated case — identical in the three runners. */
  static JsonNode withoutMediatorProtocol(JsonNode increment) {
    for (var fragment : increment.path("fragments")) {
      ((com.fasterxml.jackson.databind.node.ObjectNode) fragment).remove("state");
      if (fragment.get("component") instanceof com.fasterxml.jackson.databind.node.ObjectNode c) {
        c.remove("actions");
        c.remove("initialData");
        // the mediator's own refresh subscriptions ("mateu-crud:*" events — a delete or a drawer
        // save tells the listing to search again); the ports re-render the listing in place
        if (c.get("triggers") instanceof com.fasterxml.jackson.databind.node.ArrayNode triggers) {
          for (int i = triggers.size() - 1; i >= 0; i--) {
            if (triggers.get(i).path("eventName").asText("").startsWith("mateu-crud:")) {
              triggers.remove(i);
            }
          }
        }
      }
    }
    return increment;
  }

  /** The size of the last increment {@link #roundTrip} serialised, as it travels (UTF-8 bytes). */
  private static int lastRawBytes;

  private static JsonNode roundTrip(Object increment) {
    // Round-trip through text so a BigDecimal (DecimalNode) and the same value read back from the
    // golden (DoubleNode) compare equal: they serialise to the identical "1250.5", and it is that
    // serialised form the corpus pins — not Jackson's in-memory numeric node type.
    try {
      var json = MAPPER.writeValueAsString(increment);
      lastRawBytes = json.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;
      return normalise(MAPPER.readTree(json));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  void everyCaseMatchesTheCorpus() throws IOException {
    var write = Boolean.getBoolean("conformance.write");
    for (var name : CASES) {
      var actual = actual(name);
      var file = corpus().resolve(name).resolve("expected.json");
      if (write) {
        Files.createDirectories(file.getParent());
        Files.writeString(
            file, MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(actual) + "\n");
        continue;
      }
      assertThat(Files.exists(file))
          .as("golden for '%s' (generate it with -Dconformance.write=true)", name)
          .isTrue();
      assertThat(actual)
          .as("case '%s' — the reference no longer produces what the corpus pins", name)
          .isEqualTo(MAPPER.readTree(Files.readString(file)));
    }
  }

  /**
   * The response-size budget: the RAW wire JSON (before normalisation — what the browser downloads)
   * of every corpus screen stays under the ceiling pinned in {@code
   * src/test/resources/perf/response-size-budget.json} (measured + 10%). Sizes are deterministic,
   * so this gates where a latency check could not: a mapper that starts emitting a duplicated
   * subtree, empty husks or a whole catalogue per screen fails here instead of slowing every app.
   *
   * <p>Re-baseline (a reviewed change, saying why in the file's {@code reason}) with {@code
   * -Dresponse.size.write=true}.
   */
  @Test
  void everyCaseStaysWithinItsResponseSizeBudget() throws IOException {
    var file =
        Path.of(System.getProperty("user.dir"))
            .resolve("src/test/resources/perf/response-size-budget.json");
    var measured = new java.util.TreeMap<String, Integer>();
    for (var name : CASES) {
      actual(name);
      measured.put(name, lastRawBytes);
    }
    if (Boolean.getBoolean("response.size.write")) {
      var out = MAPPER.createObjectNode();
      out.put(
          "note",
          "Ceiling per corpus screen = raw wire JSON bytes measured + 10%. Raise one only as a"
              + " reviewed change, saying why in 'reason'. Regenerate with"
              + " -Dresponse.size.write=true.");
      out.put("reason", System.getProperty("response.size.reason", "baseline 2026-11"));
      var ceilings = out.putObject("ceilings");
      var raw = out.putObject("measured");
      measured.forEach(
          (name, bytes) -> {
            ceilings.put(name, (int) Math.ceil(bytes * 1.10));
            raw.put(name, bytes);
          });
      Files.createDirectories(file.getParent());
      Files.writeString(
          file, MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(out) + "\n");
      return;
    }
    assertThat(Files.exists(file))
        .as("response-size budget (generate it with -Dresponse.size.write=true)")
        .isTrue();
    var ceilings = MAPPER.readTree(Files.readString(file)).path("ceilings");
    var over = new ArrayList<String>();
    measured.forEach(
        (name, bytes) -> {
          var ceiling = ceilings.path(name);
          if (ceiling.isMissingNode()) {
            over.add(name + ": no ceiling (re-baseline with -Dresponse.size.write=true)");
          } else if (bytes > ceiling.asInt()) {
            over.add(name + ": " + bytes + " bytes > ceiling " + ceiling.asInt());
          }
        });
    assertThat(over).as("corpus screens over their response-size budget").isEmpty();
  }

  /**
   * Every case of the corpus is rendered here: a case directory without a Java fixture would be a
   * spec no reference produces, checked (or silently skipped) by the ports alone.
   */
  @Test
  void everyCaseOfTheCorpusHasAFixture() throws IOException {
    try (var dirs = Files.list(corpus())) {
      assertThat(dirs.filter(Files::isDirectory).map(d -> d.getFileName().toString()))
          .containsExactlyInAnyOrderElementsOf(CASES);
    }
  }

  @Test
  void normalisationDropsWhatServersMayLegitimatelyDisagreeOn() throws IOException {
    var raw =
        MAPPER.readTree(
            "{\"id\":\"generated-7\",\"type\":\"Page\",\"badges\":[],\"subtitle\":null,\"title\":\"X\"}");
    assertThat(normalise(raw).toString()).isEqualTo("{\"title\":\"X\",\"type\":\"Page\"}");
  }

  @Test
  void normalisationIsStableRegardlessOfKeyOrder() throws IOException {
    var one = MAPPER.readTree("{\"b\":1,\"a\":2}");
    var other = MAPPER.readTree("{\"a\":2,\"b\":1}");
    assertThat(normalise(one)).isEqualTo(normalise(other));
  }
}
