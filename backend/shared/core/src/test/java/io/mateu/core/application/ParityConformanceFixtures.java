package io.mateu.core.application;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Banner;
import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.CssClasses;
import io.mateu.uidl.annotations.DivStyle;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Footer;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Header;
import io.mateu.uidl.annotations.Line;
import io.mateu.uidl.annotations.MappedValue;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.OptionsLayout;
import io.mateu.uidl.annotations.Priority;
import io.mateu.uidl.annotations.Rule;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Tooltip;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.UseRadioButtons;
import io.mateu.uidl.annotations.Validation;
import io.mateu.uidl.annotations.ValueMapping;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardLabels;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.EmbeddedView;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.AvatarSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.FooterSupplier;
import io.mateu.uidl.interfaces.HeaderSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.ValueGenerator;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * The fixtures of the parity cases added for 3.0 GA (2026-11-10): each pins one surface the .NET
 * and Python ports had no way to declare until then. Identical semantics in the three runners.
 */
@SuppressWarnings("unused")
public final class ParityConformanceFixtures {

  private ParityConformanceFixtures() {}

  // ── page-decorations / page-decorations-supplied ────────────────────────────────────────────

  /**
   * The page's avatar, header and footer blocks, declared on fields — never drawn in the body. The
   * blocks are package-private: Java serialises a page's PUBLIC fields as its initialData, a
   * component value included, which is not what the case pins (the ports never send it).
   */
  @UI("/conformance/page-decorations")
  @Title("Customer")
  public static class PageDecorationsPage {
    @Avatar Component avatar = new io.mateu.uidl.data.Avatar("Ada Lovelace");

    @Header Component banner = new Text("Gold member");

    @Footer Component legal = new Text("Data kept for five years");

    public String name = "Ada";
  }

  /** The same blocks, supplied in code. */
  @UI("/conformance/page-decorations-supplied")
  @Title("Customer")
  public static class SuppliedDecorationsPage
      implements HeaderSupplier, FooterSupplier, AvatarSupplier {
    public String name = "Ada";

    @Override
    public List<Component> header(HttpRequest httpRequest) {
      return List.of(new Text("Gold member"), new Text("Since 2019"));
    }

    @Override
    public Collection<Component> footer() {
      return List.of(new Text("Data kept for five years"));
    }

    @Override
    public Component avatar() {
      return new io.mateu.uidl.data.Avatar("Ada Lovelace");
    }
  }

  // ── tab-shortcuts ───────────────────────────────────────────────────────────────────────────

  /** {@code @Tab(shortcut)}: each tab carries the key combination that selects it. */
  @UI("/conformance/tab-shortcuts")
  @Title("Tabs")
  public static class TabShortcuts {
    @Tab(value = "General", shortcut = "alt+1")
    public String name = "Ada";

    @Tab(value = "Details", shortcut = "alt+2")
    public String city = "London";
  }

  // ── listing-column-options ──────────────────────────────────────────────────────────────────

  /** A row whose fields carry every reflected column option. */
  public record Shipment(
      @Priority(value = 1, identifier = true) String code,
      @ColumnWidth("9rem") String carrier,
      @Line(2) String destination,
      @Style("color: grey;") String notes,
      @Tooltip("notes") String state) {}

  @UI("/conformance/listing-column-options")
  @Title("Shipments")
  public static class ShipmentsListing implements Listing<Shipment> {
    @Override
    public ListingData<Shipment> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of());
    }
  }

  // ── listing-mapped-values ───────────────────────────────────────────────────────────────────

  /** A row whose values are MAPPED on their way out: a status chip and a mapped label. */
  public record Ticket(
      String id,
      @Status(
              mappings = {
                @StatusMapping(from = "OPEN", to = StatusType.WARNING),
                @StatusMapping(from = "DONE", to = StatusType.SUCCESS)
              },
              defaultStatus = StatusType.NONE)
          String state,
      @MappedValue(
              mappings = {
                @ValueMapping(from = "H", to = "High"),
                @ValueMapping(from = "L", to = "Low")
              },
              defaultValue = "Normal")
          String urgency) {}

  @UI("/conformance/listing-mapped-values")
  @Title("Tickets")
  public static class TicketsListing implements Listing<Ticket> {
    @Override
    public ListingData<Ticket> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(
          List.of(new Ticket("t1", "OPEN", "H"), new Ticket("t2", "DONE", "X")));
    }
  }

  // ── crud-generated-new / crud-generated-edit ────────────────────────────────────────────────

  /**
   * The server's ticket numbers: what a {@code @GeneratedValue} field starts a creation form with.
   * (Not the id: the corpus drops every {@code id} member as volatile, so it would pin nothing.)
   */
  public static class TicketNumbers implements ValueGenerator {
    @Override
    public Object generate() {
      return "T-100";
    }
  }

  /** A reference the server generates, a code only editable when creating, and a free text. */
  public record Case(
      String id,
      @GeneratedValue(TicketNumbers.class) String reference,
      @EditableOnlyWhenCreating String code,
      String title)
      implements Identifiable {
    @Override
    public String toString() {
      return title != null && !title.isBlank() ? title : "New case";
    }
  }

  static final List<Case> CASES = List.of(new Case("T-001", "T-001", "INC", "Printer jam"));

  @UI("/conformance/crud-generated")
  @Title("Cases")
  public static class CasesCrud extends AutoCrud<Case> {
    @Override
    public CrudStore<Case> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Case> findById(String id) {
          return CASES.stream().filter(c -> c.id().equals(id)).findFirst();
        }

        @Override
        public String save(Case entity) {
          return entity.id();
        }

        @Override
        public List<Case> findAll() {
          return CASES;
        }

        @Override
        public void deleteAllById(List<String> ids) {}
      };
    }
  }

  // ── wizard-labels ───────────────────────────────────────────────────────────────────────────

  public static class NameStep implements WizardStep {
    public String name = "Ada";
  }

  public static class CityStep implements WizardStep {
    public String city = "London";
  }

  public static class ConfirmStep implements WizardStep {
    public boolean agree;
  }

  public static class ThanksStep implements WizardStep {
    public String reference;
  }

  /**
   * {@code @WizardLabels}: the built-in Back and Next buttons carry the wizard's own words. The
   * case pins the SECOND of three data steps, where both show.
   */
  @UI("/conformance/wizard-labels")
  @Title("Join")
  @WizardLabels(back = "Previous", next = "Continue")
  public static class LabelledWizard extends Wizard {
    public NameStep who;
    public CityStep where;
    public ConfirmStep confirm;
    public ThanksStep thanks;

    @WizardCompletionAction
    public void join() {}
  }

  // ── island-data ─────────────────────────────────────────────────────────────────────────────

  /** A view embedded in another page: its lookup label travels WITH the island. */
  public static class SupplierIsland implements LookupLabelSupplier {
    @io.mateu.uidl.annotations.Lookup public String supplier = "a2";

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
      return "a2".equals(id) ? "Acme" : null;
    }
  }

  @UI("/conformance/island-data")
  @Title("Island")
  public static class IslandDataPage implements ComponentTreeSupplier {
    @Override
    public String style() {
      return null;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
      return new EmbeddedView(new SupplierIsland());
    }
  }

  // ── app-fabs ────────────────────────────────────────────────────────────────────────────────

  /** App-level floating buttons ({@code @Fab} methods of the app class), one restyled. */
  @UI("/conformance/app-fabs")
  @Title("Fab app")
  public static class FabApp {
    @Menu public String home = "/a";

    @Fab(icon = "vaadin:plus")
    public void create() {}

    @Fab(icon = "vaadin:question", buttonStyle = ButtonStyle.tertiary, order = 1)
    public void help() {}
  }

  /** A page-level {@code @Fab} whose button style is not the default. */
  @UI("/conformance/fab-style")
  @Title("Fab page")
  public static class StyledFabPage {
    public String name = "Ada";

    @Fab(icon = "vaadin:edit", buttonStyle = ButtonStyle.secondary)
    public void edit() {}
  }

  // ── field-decorations ───────────────────────────────────────────────────────────────────────

  public enum Size {
    S,
    M,
    L
  }

  /**
   * Presentation declared on the class and its fields: the page's own style and CSS classes,
   * options laid out in columns, a field's own style, the style of the div around a field, and a
   * String field shown as an inline notice. (A field's {@code @CssClasses} reaches no wire member,
   * so the case does not declare one.)
   */
  @UI("/conformance/field-decorations")
  @Title("Decorations")
  @Style("max-width: 40rem;")
  @CssClasses("decorated")
  public static class FieldDecorations {
    @UseRadioButtons
    @OptionsLayout(columns = 3)
    public Size size = Size.M;

    @Style("color: grey;")
    public String styled = "a";

    @DivStyle("padding: 1rem;")
    public String wrapped = "c";

    @Notice(theme = "warning", slim = true, actionLabel = "Review", actionId = "review")
    public String complaints = "2 complaints pending";
  }

  // ── class-rules ─────────────────────────────────────────────────────────────────────────────

  /** Class-level {@code @Rule} and {@code @Validation}: declared once, for the whole form. */
  @UI("/conformance/class-rules")
  @Title("Order")
  @Rule(
      filter = "state.total > 100",
      action = RuleAction.SetDataValue,
      fieldName = "discount",
      fieldAttribute = RuleFieldAttribute.hidden,
      value = "",
      expression = "false",
      actionId = "",
      result = RuleResult.Continue)
  @Validation(condition = "state.total >= 0", fieldId = "total", message = "Cannot be negative")
  public static class ClassRulesForm {
    public int total = 10;
    public String discount = "";
  }

  // ── banner-options ──────────────────────────────────────────────────────────────────────────

  /**
   * A declared banner the user can close and that goes away on its own. ONE method: Java's method
   * order is the JVM's, so a case never pins two declared banners side by side.
   */
  @UI("/conformance/banner-options")
  @Title("Banners")
  public static class BannerOptionsPage {
    public String name = "Ada";

    @Banner(
        theme = BannerTheme.WARNING,
        title = "Maintenance",
        closeable = true,
        timeoutSeconds = 10)
    public String maintenance() {
      return "Tonight at 22:00";
    }
  }
}
