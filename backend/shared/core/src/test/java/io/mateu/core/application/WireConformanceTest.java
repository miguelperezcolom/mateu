package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.AutoLayout;
import io.mateu.uidl.annotations.Banner;
import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.KPI;
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
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.TextSize;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
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
          .variant(AppVariant.MENU_ON_TOP)
          .menu(
              List.of(
                  new RouteLink("/a", "A"),
                  new Menu("/g", "G", List.of(new RouteLink("/g/x", "X")))))
          .build();
    }
  }

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
          "app-in-code");

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
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
            AppInCode.class);
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
  private static final Set<String> VOLATILE = Set.of("id", "structureHash", "generatedAt");

  /** Drops volatile members and empty ones, and sorts keys, so two servers can be compared. */
  static JsonNode normalise(JsonNode node) {
    if (node.isObject()) {
      var out = MAPPER.createObjectNode();
      var names = new java.util.TreeSet<String>();
      node.fieldNames().forEachRemaining(names::add);
      for (var name : names) {
        if (VOLATILE.contains(name)) {
          continue;
        }
        var value = normalise(node.get(name));
        if (isDefault(value)) {
          continue; // absent and default mean the same thing to a renderer
        }
        out.set(name, value);
      }
      return out;
    }
    if (node.isArray()) {
      ArrayNode out = MAPPER.createArrayNode();
      node.forEach(child -> out.add(normalise(child)));
      return out;
    }
    return node;
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

  private static JsonNode actual(String route) {
    var increment = mateu.sync("/conformance/" + route);
    // Round-trip through text so a BigDecimal (DecimalNode) and the same value read back from the
    // golden (DoubleNode) compare equal: they serialise to the identical "1250.5", and it is that
    // serialised form the corpus pins — not Jackson's in-memory numeric node type.
    try {
      return normalise(MAPPER.readTree(MAPPER.writeValueAsString(increment)));
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
