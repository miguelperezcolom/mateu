package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.BannerThemeDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ButtonSizeDto;
import io.mateu.dtos.CardDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.dtos.HorizontalLayoutDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TabDto;
import io.mateu.dtos.TabLayoutDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.dtos.VerticalLayoutDto;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Banner;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.FoldedLayout;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toc;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.interfaces.BannerSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * In-JVM sync tests for page layout & chrome: {@code @Section} grouping (zones, sticky),
 * {@code @Tab} strips (shortcuts), {@code @Zones} multi-column layout, {@code @FoldedLayout},
 * {@code @Toc}, {@code @Compact}/{@code @Style}, {@code @Inline} nested expansion with
 * section-title-row / bottom buttons, page banners (declarative and supplier), {@code @Fab}
 * floating buttons, titles/subtitles and KPIs — asserted on the wire DTO tree a real {@code
 * /mateu/v3/sync} request produces.
 */
class LayoutSyncTest {

  // ------------------------------------------------------------------ fixtures

  @SuppressWarnings("unused")
  @UI("/layout/sections")
  @Title("Ficha")
  @Subtitle("Detalle completo")
  public static class SectionsPage {
    @Section("General")
    String name = "Ada";

    String surname = "Lovelace";

    @Section("Detalles")
    String details = "d";

    @Section(value = "Resumen", sticky = true)
    String summary = "s";
  }

  @SuppressWarnings("unused")
  @UI("/layout/zones")
  @Zones({@Zone(name = "left", width = "60%"), @Zone(name = "right", width = "40%")})
  public static class ZonesPage {
    @Section(value = "Uno", zone = "left")
    String a = "a";

    @Section(value = "Dos", zone = "left")
    String b = "b";

    @Section(value = "Tres", zone = "right")
    String c = "c";

    @Section(value = "Perdida", zone = "nowhere")
    String d = "d";
  }

  @SuppressWarnings("unused")
  @UI("/layout/zones-untitled")
  @Zones({@Zone(name = "left", width = "60%"), @Zone(name = "right", width = "40%")})
  public static class ZonesUntitledPage {
    // Two consecutive UNTITLED sections (same value "") pointing at different zones: they must
    // stay separate sections — the grouper compares every @Section attribute, not just the name.
    @Section(value = "", zone = "left")
    String izquierda = "I";

    @Section(value = "", zone = "right")
    String derecha = "D";
  }

  @UI("/layout/zones-banded")
  @Zones({@Zone(name = "left", width = "60%"), @Zone(name = "right", width = "40%")})
  public static class ZonesBandedPage {
    // No zone → full-width band across the top, above the zoned row.
    @Section(value = "Cabecera")
    String head = "h";

    @Section(value = "Izquierda", zone = "left")
    String a = "a";

    @Section(value = "Derecha", zone = "right")
    String b = "b";
  }

  @SuppressWarnings("unused")
  @UI("/layout/tabs")
  public static class TabsPage {
    @Tab(value = "Uno", shortcut = "alt+1")
    String first = "1";

    String second = "2";

    // open=true → this tab is the one selected when the strip first renders (not the first tab).
    @Tab(value = "Dos", open = true)
    String third = "3";
  }

  @SuppressWarnings("unused")
  @UI("/layout/folded")
  @FoldedLayout
  public static class FoldedPage {
    @Section("Izquierda")
    String left = "l";

    @Section("Derecha")
    String right = "r";
  }

  @SuppressWarnings("unused")
  @UI("/layout/toc-on")
  @Toc
  public static class TocOnPage {
    @Section("Una")
    String a = "a";

    @Section("Dos")
    String b = "b";
  }

  @SuppressWarnings("unused")
  @UI("/layout/toc-off")
  @Toc(false)
  public static class TocOffPage {
    @Section("Una")
    String a = "a";

    @Section("Dos")
    String b = "b";
  }

  @SuppressWarnings("unused")
  @UI("/layout/compact")
  @Compact
  @Style(StyleConstants.FULL_WIDTH)
  public static class CompactPage {
    String a = "a";
  }

  @SuppressWarnings("unused")
  public static class InlineGuts {
    String notes = "n";

    @Toolbar
    @Label("Refrescar")
    public void refresh() {}

    @Button
    @Label("Validar")
    public void validate() {}
  }

  @SuppressWarnings("unused")
  @UI("/layout/inline")
  public static class InlinePage {
    @Section("Principal")
    String owner = "o";

    @Section("Anidada")
    @Inline
    InlineGuts nested = new InlineGuts();
  }

  @SuppressWarnings("unused")
  @UI("/layout/banners")
  public static class BannerPage {
    String a = "a";

    @Banner(theme = BannerTheme.INFO, title = "Aviso")
    public String infoBanner() {
      return "Texto informativo";
    }

    @Banner(theme = BannerTheme.WARNING, title = "Cuidado", closeable = true, timeoutSeconds = 7)
    public void warnBanner() {}
  }

  @SuppressWarnings("unused")
  @UI("/layout/banner-supplier")
  public static class BannerSupplierPage implements BannerSupplier {
    String a = "a";

    @Override
    public List<PageBanner> banners() {
      return List.of(new PageBanner(BannerTheme.SUCCESS, "Hecho", "Todo bien", true, 3));
    }

    @Banner(title = "Nunca visible")
    public void shadowedByTheSupplier() {}
  }

  @SuppressWarnings("unused")
  @UI("/layout/fabs")
  public static class FabPage {
    String a = "a";

    @Fab(icon = "vaadin:plus", order = 1)
    public void createItem() {}

    @Fab(icon = "vaadin:refresh", order = 0)
    @Label("Recargar")
    public void reload() {}
  }

  @SuppressWarnings("unused")
  @UI("/layout/dynamic-title")
  public static class DynamicTitlePage implements TitleSupplier {
    String customer = "ACME";

    @Override
    public String title() {
      return "Cliente " + customer;
    }
  }

  @SuppressWarnings("unused")
  @UI("/layout/kpis")
  public static class KpiPage {
    @KPI
    @Label("Total ventas")
    int total = 42;

    @KPI String status = "OK";

    String name = "n";
  }

  // ------------------------------------------------------------------ harness

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            SectionsPage.class,
            ZonesPage.class,
            ZonesUntitledPage.class,
            ZonesBandedPage.class,
            TabsPage.class,
            FoldedPage.class,
            TocOnPage.class,
            TocOffPage.class,
            CompactPage.class,
            InlinePage.class,
            BannerPage.class,
            BannerSupplierPage.class,
            FabPage.class,
            DynamicTitlePage.class,
            KpiPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ------------------------------------------------------------------ @Section

  @Test
  void sectionsProduceOneMateuSectionCardPerSection() {
    var cards = sectionCards(mateu.sync("/layout/sections"));
    assertThat(cards).hasSize(3);
    assertThat(cards).allSatisfy(card -> assertThat(card.cssClasses()).contains("mateu-section"));
  }

  @Test
  void sectionTitlesRenderAsHeadings() {
    var texts = allMetadata(mateu.sync("/layout/sections"), TextDto.class);
    assertThat(texts.stream().map(TextDto::text)).contains("General", "Detalles", "Resumen");
  }

  @Test
  void stickySectionCardIsPinnedAndMarked() {
    var cards = sectionCards(mateu.sync("/layout/sections"));
    var sticky =
        cards.stream().filter(c -> c.cssClasses().contains("mateu-section--sticky")).toList();
    assertThat(sticky).hasSize(1);
    assertThat(sticky.get(0).style()).contains("position: sticky");
    assertThat(
            cards.stream()
                .filter(c -> !c.cssClasses().contains("mateu-section--sticky"))
                .map(ComponentDto::style))
        .allSatisfy(style -> assertThat(style).doesNotContain("position: sticky"));
  }

  @Test
  void multipleSectionsStackInAVerticalLayoutByDefault() {
    var page = page(mateu.sync("/layout/sections"));
    assertThat(page.children()).isNotEmpty();
    var wrapper = (ClientSideComponentDto) page.children().get(0);
    assertThat(wrapper.metadata()).isInstanceOf(VerticalLayoutDto.class);
  }

  @Test
  void titleAndSubtitleAnnotationsTravelInPageMetadata() {
    var pageDto = pageDto(mateu.sync("/layout/sections"));
    assertThat(pageDto.title()).isEqualTo("Ficha");
    assertThat(pageDto.subtitle()).isEqualTo("Detalle completo");
  }

  @Test
  void absentTocMeansAutoOnTheWire() {
    assertThat(pageDto(mateu.sync("/layout/sections")).toc()).isNull();
  }

  // ------------------------------------------------------------------ @Zones

  @Test
  void zonesLayOutSectionColumnsSideBySide() {
    var page = page(mateu.sync("/layout/zones"));
    var row = (ClientSideComponentDto) page.children().get(0);
    assertThat(row.metadata()).isInstanceOf(HorizontalLayoutDto.class);
    // left + right + trailing leftover column
    assertThat(row.children()).hasSize(3);
    assertThat(row.children())
        .allSatisfy(
            column ->
                assertThat(((ClientSideComponentDto) column).metadata())
                    .isInstanceOf(VerticalLayoutDto.class));
  }

  @Test
  void zoneWidthsBecomeFlexBasisStyles() {
    var page = page(mateu.sync("/layout/zones"));
    var row = (ClientSideComponentDto) page.children().get(0);
    // The row wraps: a column squeezed under its min-width drops below the previous one.
    assertThat(((io.mateu.dtos.HorizontalLayoutDto) row.metadata()).wrap()).isTrue();
    var columns = row.children();
    // Grow AND shrink around the declared basis minus the spacing gap (with flex-wrap the line
    // breaks are computed from the basis, so 60% + 40% + gap would wrap or overflow);
    // min-width sets the responsive wrap point.
    assertThat(columns.get(0).style()).contains("flex: 1 1 calc(60%").contains("min-width: min(");
    assertThat(columns.get(1).style()).contains("flex: 1 1 calc(40%");
    // the leftover column has no fixed width — it grows
    assertThat(columns.get(2).style()).contains("flex: 1");
  }

  @Test
  void sectionsDistributeIntoTheirDeclaredZones() {
    var page = page(mateu.sync("/layout/zones"));
    var columns = ((ClientSideComponentDto) page.children().get(0)).children();
    assertThat(sectionCardsUnder(columns.get(0))).hasSize(2);
    assertThat(sectionCardsUnder(columns.get(1))).hasSize(1);
    assertThat(sectionCardsUnder(columns.get(2))).hasSize(1);
  }

  @Test
  void sectionWithUnknownZoneFallsIntoTrailingColumn() {
    var page = page(mateu.sync("/layout/zones"));
    var columns = ((ClientSideComponentDto) page.children().get(0)).children();
    var trailingTexts = new ArrayList<String>();
    collectMetadata(columns.get(2), TextDto.class).forEach(text -> trailingTexts.add(text.text()));
    assertThat(trailingTexts).contains("Perdida");
  }

  @Test
  void consecutiveUntitledSectionsInDifferentZonesStaySeparate() {
    var page = page(mateu.sync("/layout/zones-untitled"));
    var row = (ClientSideComponentDto) page.children().get(0);
    assertThat(row.metadata()).isInstanceOf(HorizontalLayoutDto.class);
    // left column + right column — the two untitled sections did NOT merge into one
    assertThat(row.children()).hasSize(2);
    assertThat(
            collectMetadata(row.children().get(0), io.mateu.dtos.FormFieldDto.class).stream()
                .map(io.mateu.dtos.FormFieldDto::fieldId))
        .contains("izquierda")
        .doesNotContain("derecha");
    assertThat(
            collectMetadata(row.children().get(1), io.mateu.dtos.FormFieldDto.class).stream()
                .map(io.mateu.dtos.FormFieldDto::fieldId))
        .contains("derecha");
  }

  @Test
  void sectionWithoutZoneRendersAsFullWidthBandAboveTheZonedRow() {
    var page = page(mateu.sync("/layout/zones-banded"));
    // A vertical stack: the full-width band first, then the side-by-side zoned row.
    var stack = (ClientSideComponentDto) page.children().get(0);
    assertThat(stack.metadata()).isInstanceOf(VerticalLayoutDto.class);
    assertThat(stack.children()).hasSize(2);

    var band = stack.children().get(0);
    assertThat(collectMetadata(band, TextDto.class).stream().map(TextDto::text))
        .contains("Cabecera");
    assertThat(collectMetadata(band, HorizontalLayoutDto.class)).isEmpty();

    var row = (ClientSideComponentDto) stack.children().get(1);
    assertThat(row.metadata()).isInstanceOf(HorizontalLayoutDto.class);
    assertThat(row.children()).hasSize(2);
  }

  // ------------------------------------------------------------------ @Tab

  @Test
  void tabbedFieldsGroupIntoATabLayout() {
    var increment = mateu.sync("/layout/tabs");
    var tabLayout = findComponentWithMetadata(increment, TabLayoutDto.class);
    assertThat(tabLayout).isNotNull();
    assertThat(tabLayout.id()).isEqualTo("_tabs");
    assertThat(tabLayout.children()).hasSize(2);
    var labels =
        tabLayout.children().stream()
            .map(tab -> ((TabDto) ((ClientSideComponentDto) tab).metadata()).label())
            .toList();
    assertThat(labels).containsExactly("Uno", "Dos");
  }

  @Test
  void tabShortcutTravelsOnTheWireAndAbsentShortcutIsNull() {
    var tabLayout = findComponentWithMetadata(mateu.sync("/layout/tabs"), TabLayoutDto.class);
    var tabs =
        tabLayout.children().stream()
            .map(tab -> (TabDto) ((ClientSideComponentDto) tab).metadata())
            .toList();
    assertThat(tabs.get(0).shortcut()).isEqualTo("alt+1");
    assertThat(tabs.get(1).shortcut()).isNull();
  }

  @Test
  void tabMarkedOpenIsActiveOnTheWireAndOthersAreNot() {
    var tabLayout = findComponentWithMetadata(mateu.sync("/layout/tabs"), TabLayoutDto.class);
    var tabs =
        tabLayout.children().stream()
            .map(tab -> (TabDto) ((ClientSideComponentDto) tab).metadata())
            .toList();
    // "Dos" declares @Tab(open=true) → active; the first tab ("Uno") is not the default anymore.
    assertThat(tabs.get(0).active()).isFalse();
    assertThat(tabs.get(1).active()).isTrue();
  }

  @Test
  void untaggedFieldFollowingATabbedFieldJoinsTheOpenTab() {
    var tabLayout = findComponentWithMetadata(mateu.sync("/layout/tabs"), TabLayoutDto.class);
    var firstTabFieldIds =
        collectMetadata(tabLayout.children().get(0), FormFieldDto.class).stream()
            .map(FormFieldDto::fieldId)
            .toList();
    assertThat(firstTabFieldIds).contains("first", "second");
    var secondTabFieldIds =
        collectMetadata(tabLayout.children().get(1), FormFieldDto.class).stream()
            .map(FormFieldDto::fieldId)
            .toList();
    assertThat(secondTabFieldIds).contains("third").doesNotContain("first", "second");
  }

  @Test
  void singleImplicitSectionStillRendersAMateuSectionCard() {
    assertThat(sectionCards(mateu.sync("/layout/tabs"))).hasSize(1);
  }

  // ------------------------------------------------------------------ @FoldedLayout

  @Test
  void foldedLayoutLaysSectionsOutHorizontally() {
    var page = page(mateu.sync("/layout/folded"));
    var row = (ClientSideComponentDto) page.children().get(0);
    assertThat(row.metadata()).isInstanceOf(HorizontalLayoutDto.class);
    assertThat(((HorizontalLayoutDto) row.metadata()).spacing()).isTrue();
    assertThat(sectionCardsUnder(row)).hasSize(2);
  }

  // ------------------------------------------------------------------ @Toc

  @Test
  void tocAnnotationForcesTheSectionsIndexOn() {
    assertThat(pageDto(mateu.sync("/layout/toc-on")).toc()).isEqualTo(Boolean.TRUE);
  }

  @Test
  void tocFalseSuppressesTheSectionsIndex() {
    assertThat(pageDto(mateu.sync("/layout/toc-off")).toc()).isEqualTo(Boolean.FALSE);
  }

  // ------------------------------------------------------------------ @Compact / @Style

  @Test
  void compactInjectsTheDensityPresetNextToTheDeclaredStyle() {
    var page = page(mateu.sync("/layout/compact"));
    assertThat(page.style()).contains(StyleConstants.FULL_WIDTH);
    assertThat(page.style()).contains("--mateu-compact:1");
    assertThat(page.style()).contains("--vaadin-form-layout-row-spacing");
  }

  @Test
  void compactShrinksTheFormLayoutColumnWidth() {
    var formLayouts = allMetadata(mateu.sync("/layout/compact"), FormLayoutDto.class);
    assertThat(formLayouts).isNotEmpty();
    assertThat(formLayouts.get(0).columnWidth()).isEqualTo("7em");
    // a non-compact page keeps the default (null) column width
    var plain = allMetadata(mateu.sync("/layout/sections"), FormLayoutDto.class);
    assertThat(plain).isNotEmpty();
    assertThat(plain.get(0).columnWidth()).isNull();
  }

  // ------------------------------------------------------------------ @Inline

  @Test
  void inlineFieldsExpandIntoTheParentSectionWithPrefixedIds() {
    var fieldIds =
        allMetadata(mateu.sync("/layout/inline"), FormFieldDto.class).stream()
            .map(FormFieldDto::fieldId)
            .toList();
    assertThat(fieldIds).contains("owner", "nested-notes");
  }

  @Test
  void inlineToolbarMethodBecomesASectionTitleRowButton() {
    var increment = mateu.sync("/layout/inline");
    var refresh = findButton(increment, "nested-form-action-nested-refresh");
    assertThat(refresh).isNotNull();
    assertThat(refresh.label()).isEqualTo("Refrescar");
    // it sits on the same horizontal row as the section title
    var titleRow = rowContaining(increment, "Anidada");
    assertThat(titleRow).isNotNull();
    assertThat(collectMetadata(titleRow, ButtonDto.class))
        .anySatisfy(b -> assertThat(b.actionId()).isEqualTo("nested-form-action-nested-refresh"));
  }

  @Test
  void inlineButtonMethodBecomesABottomSectionButton() {
    var increment = mateu.sync("/layout/inline");
    var validate = findButton(increment, "nested-form-action-nested-validate");
    assertThat(validate).isNotNull();
    assertThat(validate.label()).isEqualTo("Validar");
    // the bottom button row is right-aligned and does NOT contain the section title
    var titleRow = rowContaining(increment, "Anidada");
    assertThat(collectMetadata(titleRow, ButtonDto.class))
        .noneSatisfy(b -> assertThat(b.actionId()).isEqualTo("nested-form-action-nested-validate"));
  }

  @Test
  void sectionButtonsDefaultToTheSmallSizeVariant() {
    var increment = mateu.sync("/layout/inline");
    // both the title-row toolbar button and the bottom @Button default to size=small
    assertThat(findButton(increment, "nested-form-action-nested-refresh").size())
        .isEqualTo(ButtonSizeDto.small);
    assertThat(findButton(increment, "nested-form-action-nested-validate").size())
        .isEqualTo(ButtonSizeDto.small);
  }

  @Test
  void runningANestedInlineActionReturnsAnIncrement() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/layout/inline")
                .actionId("nested-form-action-nested-refresh")
                .serverSideType(InlinePage.class.getName())
                .componentState(Map.of("owner", "o", "nested-notes", "n"))
                .build());
    assertThat(increment).isNotNull();
  }

  // ------------------------------------------------------------------ banners

  @Test
  void declarativeBannersTravelInPageMetadata() {
    var banners = pageDto(mateu.sync("/layout/banners")).banners();
    assertThat(banners).hasSize(2);
    var info =
        banners.stream().filter(b -> b.theme() == BannerThemeDto.INFO).findFirst().orElseThrow();
    assertThat(info.title()).isEqualTo("Aviso");
    assertThat(info.description()).isEqualTo("Texto informativo");
    assertThat(info.hasCloseButton()).isFalse();
    assertThat(info.timeoutSeconds()).isZero();
  }

  @Test
  void bannerCloseableAndTimeoutAttributesAreForwarded() {
    var banners = pageDto(mateu.sync("/layout/banners")).banners();
    var warning =
        banners.stream().filter(b -> b.theme() == BannerThemeDto.WARNING).findFirst().orElseThrow();
    assertThat(warning.title()).isEqualTo("Cuidado");
    assertThat(warning.hasCloseButton()).isTrue();
    assertThat(warning.timeoutSeconds()).isEqualTo(7);
    assertThat(warning.description()).isNull();
  }

  @Test
  void bannerSupplierTakesPrecedenceOverBannerAnnotations() {
    var banners = pageDto(mateu.sync("/layout/banner-supplier")).banners();
    assertThat(banners).hasSize(1);
    var banner = banners.get(0);
    assertThat(banner.theme()).isEqualTo(BannerThemeDto.SUCCESS);
    assertThat(banner.title()).isEqualTo("Hecho");
    assertThat(banner.description()).isEqualTo("Todo bien");
    assertThat(banner.hasCloseButton()).isTrue();
    assertThat(banner.timeoutSeconds()).isEqualTo(3);
  }

  // ------------------------------------------------------------------ @Fab

  @Test
  void fabMethodsBecomePageFabsSortedByOrder() {
    var fabs = pageDto(mateu.sync("/layout/fabs")).fabs();
    assertThat(fabs).hasSize(2);
    // order=0 (reload) sorts before order=1 (createItem)
    assertThat(fabs.get(0).actionId()).isEqualTo("reload");
    assertThat(fabs.get(0).label()).isEqualTo("Recargar");
    assertThat(fabs.get(0).icon()).isEqualTo("vaadin:refresh");
    assertThat(fabs.get(1).actionId()).isEqualTo("createItem");
    assertThat(fabs.get(1).icon()).isEqualTo("vaadin:plus");
    assertThat(fabs.get(1).buttonStyle()).isEqualTo("primary");
    assertThat(fabs.get(1).id()).isEqualTo("createItem");
  }

  // ------------------------------------------------------------------ titles / KPIs

  @Test
  void titleSupplierComputesThePageTitleAtRuntime() {
    assertThat(pageDto(mateu.sync("/layout/dynamic-title")).title()).isEqualTo("Cliente ACME");
  }

  @Test
  void kpiFieldsTravelAsPageKpis() {
    var kpis = pageDto(mateu.sync("/layout/kpis")).kpis();
    assertThat(kpis).hasSize(2);
    var total = kpis.stream().filter(k -> "42".equals(k.text())).findFirst().orElseThrow();
    assertThat(total.title()).isEqualTo("Total ventas");
    assertThat(kpis.stream().map(io.mateu.dtos.KPIDto::text)).contains("OK");
    // KPI fields are excluded from the form body
    var fieldIds =
        allMetadata(mateu.sync("/layout/kpis"), FormFieldDto.class).stream()
            .map(FormFieldDto::fieldId)
            .toList();
    assertThat(fieldIds).contains("name").doesNotContain("total", "status");
  }

  // ------------------------------------------------------------------ tree helpers

  /** The page component: the ClientSideComponentDto carrying the PageDto metadata. */
  static ClientSideComponentDto page(UIIncrementDto increment) {
    var root = increment.fragments().get(0).component();
    var page =
        flatten(root).stream()
            .filter(
                c ->
                    c instanceof ClientSideComponentDto client
                        && client.metadata() instanceof PageDto)
            .map(ClientSideComponentDto.class::cast)
            .findFirst()
            .orElse(null);
    assertThat(page).as("page component in %s", root).isNotNull();
    return page;
  }

  static PageDto pageDto(UIIncrementDto increment) {
    return (PageDto) page(increment).metadata();
  }

  /** All section cards (cards marked with the mateu-section css class) in the increment. */
  static List<ClientSideComponentDto> sectionCards(UIIncrementDto increment) {
    return sectionCardsUnder(increment.fragments().get(0).component());
  }

  static List<ClientSideComponentDto> sectionCardsUnder(ComponentDto root) {
    return flatten(root).stream()
        .filter(
            c ->
                c instanceof ClientSideComponentDto client
                    && client.metadata() instanceof CardDto
                    && client.cssClasses() != null
                    && client.cssClasses().contains("mateu-section"))
        .map(ClientSideComponentDto.class::cast)
        .toList();
  }

  static <T extends ComponentMetadataDto> List<T> allMetadata(
      UIIncrementDto increment, Class<T> type) {
    return collectMetadata(increment.fragments().get(0).component(), type);
  }

  static <T extends ComponentMetadataDto> List<T> collectMetadata(
      ComponentDto root, Class<T> type) {
    return flatten(root).stream()
        .filter(
            c -> c instanceof ClientSideComponentDto client && type.isInstance(client.metadata()))
        .map(c -> type.cast(((ClientSideComponentDto) c).metadata()))
        .toList();
  }

  static ClientSideComponentDto findComponentWithMetadata(
      UIIncrementDto increment, Class<? extends ComponentMetadataDto> type) {
    return flatten(increment.fragments().get(0).component()).stream()
        .filter(
            c -> c instanceof ClientSideComponentDto client && type.isInstance(client.metadata()))
        .map(ClientSideComponentDto.class::cast)
        .findFirst()
        .orElse(null);
  }

  static ButtonDto findButton(UIIncrementDto increment, String actionId) {
    return allMetadata(increment, ButtonDto.class).stream()
        .filter(b -> actionId.equals(b.actionId()))
        .findFirst()
        .orElse(null);
  }

  /** The horizontal layout row whose subtree contains a Text with the given content. */
  static ClientSideComponentDto rowContaining(UIIncrementDto increment, String text) {
    return flatten(increment.fragments().get(0).component()).stream()
        .filter(
            c ->
                c instanceof ClientSideComponentDto client
                    && client.metadata() instanceof HorizontalLayoutDto)
        .map(ClientSideComponentDto.class::cast)
        .filter(
            row ->
                collectMetadata(row, TextDto.class).stream().anyMatch(t -> text.equals(t.text())))
        .findFirst()
        .orElse(null);
  }

  /**
   * Depth-first flattening of the whole component tree. Descends into children AND into every
   * ComponentDto reachable from metadata records (cards carry their content in {@code
   * CardDto.content}, custom fields in {@code CustomFieldDto.content}, pages in header/footer...),
   * discovered reflectively over the record components so it works for every metadata shape.
   */
  static List<ComponentDto> flatten(ComponentDto root) {
    var out = new ArrayList<ComponentDto>();
    walk(root, out);
    return out;
  }

  private static void walk(ComponentDto node, List<ComponentDto> out) {
    if (node == null) {
      return;
    }
    out.add(node);
    if (node.children() != null) {
      node.children().forEach(child -> walk(child, out));
    }
    if (node instanceof ClientSideComponentDto client && client.metadata() != null) {
      walkMetadata(client.metadata(), out);
    }
  }

  private static void walkMetadata(ComponentMetadataDto metadata, List<ComponentDto> out) {
    for (var rc : metadata.getClass().getRecordComponents()) {
      Object value;
      try {
        value = rc.getAccessor().invoke(metadata);
      } catch (ReflectiveOperationException e) {
        continue;
      }
      if (value instanceof ComponentDto component) {
        walk(component, out);
      } else if (value instanceof List<?> list) {
        for (var item : list) {
          if (item instanceof ComponentDto component) {
            walk(component, out);
          }
        }
      }
    }
  }
}
