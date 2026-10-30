package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A YAML page that fills a design-system page template ({@code template:} on a {@code type: Form}):
 * the template's own values travel on {@code FormDto.template} and its slots arrive laid out among
 * the page's children, each in a container whose id names the slot — so a renderer without the
 * template draws the page and one with it (Redwood → Spectra) places each slot.
 *
 * <p>Also the Java golden of the browser expander (expandPageTemplate.test.ts): regenerate with
 * {@code -Dexpander.golden.write=true}.
 */
class PageTemplateSyncTest {

  static TestMateu mateu;
  static final ObjectMapper MAPPER = new ObjectMapper();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static JsonNode render(String route) throws Exception {
    var increment = mateu.sync("/" + route);
    assertThat(increment.fragments()).as(route + " should render").isNotEmpty();
    var json = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(increment);
    if (Boolean.getBoolean("expander.golden.write")) {
      Files.writeString(
          TemplateComponentsDefinitionSyncTest.FIXTURES.resolve(route + ".golden.json"),
          json + "\n");
    }
    return MAPPER.readTree(json).path("fragments").path(0).path("component");
  }

  private static JsonNode byId(JsonNode node, String id) {
    if (id.equals(node.path("id").asText())) {
      return node;
    }
    List<JsonNode> nested = new ArrayList<>();
    node.path("children").forEach(nested::add);
    node.path("metadata").path("content").forEach(nested::add);
    if (node.path("metadata").path("content").isObject()) {
      nested.add(node.path("metadata").path("content"));
    }
    for (var child : nested) {
      var found = byId(child, id);
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  @Test
  void theTemplateValuesTravelOnTheForm() throws Exception {
    var metadata = render("item-overview-page").path("metadata");
    assertThat(metadata.path("type").asText()).isEqualTo("Form");
    var template = metadata.path("template");
    assertThat(template.path("type").asText()).isEqualTo("ItemOverviewPage");
    assertThat(template.path("avatar").path("src").asText()).isEqualTo("${state.image}");
    assertThat(template.path("avatar").path("initials").asText()).isEqualTo("LS");
    // the header the template takes its title, badge and actions from is the form's own
    assertThat(metadata.path("title").asText()).isEqualTo("${state.name}");
    assertThat(metadata.path("badges").path(0).path("text").asText()).isEqualTo("Jedi");
    assertThat(metadata.path("toolbar").path(0).path("label").asText()).isEqualTo("Edit");
  }

  @Test
  void theSlotsArriveLaidOutInContainersNamedAfterThem() throws Exception {
    var page = render("item-overview-page");
    assertThat(page.path("children")).hasSize(1);
    var layout = page.path("children").path(0);
    assertThat(layout.path("id").asText()).isEqualTo("item-overview");

    var body = byId(page, "item-overview-body");
    assertThat(body).isNotNull();
    assertThat(body.path("children")).hasSize(2);
    assertThat(body.path("children").path(0).path("metadata").path("fieldId").asText())
        .isEqualTo("gender");

    var footer = byId(page, "item-overview-footer");
    assertThat(footer).isNotNull();
    assertThat(footer.path("children").path(0).path("metadata").path("text").asText())
        .isEqualTo("Last seen on Tatooine");

    var media = byId(page, "item-overview-media");
    assertThat(media).isNotNull();
    assertThat(media.path("children").path(0).path("metadata").path("src").asText())
        .isEqualTo("${state.image}");

    var main = byId(page, "item-overview-main");
    assertThat(main).isNotNull();
    assertThat(main.path("children").path(0).path("metadata").path("type").asText())
        .isEqualTo("TabLayout");
  }

  @Test
  void aPhotoIsTheMediaAndAnAbsentFooterLeavesNoSlot() throws Exception {
    var page = render("item-overview-photo");
    var template = page.path("metadata").path("template");
    assertThat(template.path("photo").path("src").asText()).isEqualTo("${state.picture}");
    assertThat(template.path("avatar").isMissingNode() || template.path("avatar").isNull())
        .isTrue();
    var media = byId(page, "item-overview-media");
    assertThat(media.path("children").path(0).path("metadata").path("src").asText())
        .isEqualTo("${state.picture}");
    assertThat(byId(page, "item-overview-footer")).isNull();
  }

  @Test
  void aWelcomePageIsTheBannerOverTheTiles() throws Exception {
    var page = render("welcome-page");
    var metadata = page.path("metadata");
    assertThat(metadata.path("template").path("type").asText()).isEqualTo("WelcomePage");
    // the banner draws the header: the form carries none, nor a toolbar of its own
    assertThat(metadata.path("noHeader").asBoolean()).isTrue();
    assertThat(metadata.path("toolbar")).isEmpty();
    var hero = byId(page, "welcome");
    assertThat(hero).isNotNull();
    var heroMetadata = hero.path("metadata");
    assertThat(heroMetadata.path("type").asText()).isEqualTo("HeroSection");
    assertThat(heroMetadata.path("title").asText()).isEqualTo("Star Wars");
    assertThat(heroMetadata.path("subtitle").asText()).isEqualTo("Every screen is YAML.");
    assertThat(heroMetadata.path("overline").asText()).isEqualTo("A Mateu demo");
    // Spectra's dark-<tone> names the hero's tone
    assertThat(heroMetadata.path("tone").asText()).isEqualTo("slate");
    // the calls to action, in order, inside the banner
    assertThat(hero.path("children")).hasSize(2);
    assertThat(hero.path("children").path(0).path("metadata").path("label").asText())
        .isEqualTo("Browse the characters");
    // the tiles follow the banner
    assertThat(page.path("children").path(1).path("metadata").path("type").asText())
        .isEqualTo("DashboardLayout");
  }

  @Test
  void aDashboardLandingPageIsTheScoreboardOverThePanels() throws Exception {
    var page = render("dashboard-page");
    var metadata = page.path("metadata");
    assertThat(metadata.path("template").path("type").asText()).isEqualTo("DashboardLandingPage");
    // the page header stays the form's
    assertThat(metadata.path("title").asText()).isEqualTo("The galaxy at a glance");
    assertThat(metadata.path("noHeader").asBoolean()).isFalse();
    var kpi = byId(page, "dashboard-kpi");
    assertThat(kpi).isNotNull();
    assertThat(kpi.path("metadata").path("type").asText()).isEqualTo("Scoreboard");
    assertThat(kpi.path("children")).hasSize(2);
    var panels = byId(page, "dashboard-panels");
    assertThat(panels.path("metadata").path("type").asText()).isEqualTo("DashboardLayout");
    assertThat(panels.path("children")).hasSize(2);
  }

  @Test
  void aGeneralOverviewPageIsTheMainSlotBesideTheInfoPanel() throws Exception {
    var page = render("general-overview-page");
    var metadata = page.path("metadata");
    assertThat(metadata.path("template").path("type").asText()).isEqualTo("GeneralOverviewPage");
    assertThat(metadata.path("kpis").path(0).path("title").asText()).isEqualTo("Climate");
    assertThat(page.path("children").path(0).path("id").asText()).isEqualTo("general-overview");
    var main = byId(page, "general-overview-main");
    assertThat(main.path("children").path(0).path("metadata").path("fieldId").asText())
        .isEqualTo("diameter");
    var info = byId(page, "general-overview-info");
    assertThat(info.path("children").path(0).path("metadata").path("fieldId").asText())
        .isEqualTo("population");
  }

  @Test
  void aCollectionDetailPageShowsTheDetailOrNoSelection() throws Exception {
    var page = render("collection-detail-page");
    assertThat(page.path("metadata").path("template").path("type").asText())
        .isEqualTo("CollectionDetailPage");
    var list = byId(page, "collection-detail-list");
    assertThat(list.path("children").path(0).path("metadata").path("text").asText())
        .isEqualTo("The collection");
    var detail = byId(page, "collection-detail-detail");
    assertThat(detail.path("children").path(0).path("metadata").path("fieldId").asText())
        .isEqualTo("classification");
    assertThat(byId(page, "collection-detail-no-selection")).isNull();

    // no content = no selection: the noSelection slot takes the detail's place
    var empty = render("collection-detail-empty");
    assertThat(byId(empty, "collection-detail-detail")).isNull();
    assertThat(
            byId(empty, "collection-detail-no-selection")
                .path("children")
                .path(0)
                .path("metadata")
                .path("text")
                .asText())
        .isEqualTo("Pick one");
  }

  @Test
  void aPartialInATemplateSlotIsExpanded() throws Exception {
    var list = byId(render("collection-detail-partial"), "collection-detail-list");
    assertThat(list.path("children")).hasSize(2);
    assertThat(list.path("children").path(1).path("metadata").path("text").asText())
        .isEqualTo("Prices include VAT.");
  }

  @Test
  void aFoldoutPageIsOneFoldoutLayout() throws Exception {
    var page = render("foldout-page");
    var foldout = byId(page, "foldout");
    assertThat(foldout.path("metadata").path("type").asText()).isEqualTo("FoldoutLayout");
    // the header is the page's: the title is not repeated over the overview
    assertThat(foldout.path("metadata").path("headerTitle").isNull()).isTrue();
    assertThat(foldout.path("metadata").path("panels")).hasSize(2);
    assertThat(foldout.path("metadata").path("panels").path(0).path("title").asText())
        .isEqualTo("Specifications");
  }

  @Test
  void aMultimediaContentPageIsTheBannerOverTheSections() throws Exception {
    var page = render("multimedia-page");
    var metadata = page.path("metadata");
    assertThat(metadata.path("template").path("type").asText()).isEqualTo("MultimediaContentPage");
    assertThat(metadata.path("noHeader").asBoolean()).isTrue();
    var banner = byId(page, "multimedia-banner");
    assertThat(banner.path("metadata").path("type").asText()).isEqualTo("HeroSection");
    assertThat(banner.path("metadata").path("overline").asText()).isEqualTo("Episode IV");
    assertThat(banner.path("metadata").path("tone").asText()).isEqualTo("plum");
    assertThat(page.path("children").path(1).path("metadata").path("type").asText())
        .isEqualTo("Card");
  }

  @Test
  void aPageWithoutATemplateIsFree() throws Exception {
    var page = render("page-header-extras");
    assertThat(
            page.path("metadata").path("template").isMissingNode()
                || page.path("metadata").path("template").isNull())
        .isTrue();
  }
}
