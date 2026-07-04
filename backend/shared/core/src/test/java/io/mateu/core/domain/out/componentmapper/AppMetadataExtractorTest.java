package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.Actionable;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class AppMetadataExtractorTest {

  // ── fixtures ───────────────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  static class SampleApp {
    @Label("Mis clientes")
    String clientes;

    @jdk.jfr.Label("JFR label, not Mateu's")
    String facturas;

    String pedidos;

    @Label("Cerrar caja")
    void closeTill() {}

    void openTill() {}
  }

  private static Field field(String name) throws Exception {
    return SampleApp.class.getDeclaredField(name);
  }

  private static Method method(String name) throws Exception {
    return SampleApp.class.getDeclaredMethod(name);
  }

  // ── getLabel: must honour io.mateu.uidl.annotations.Label ──────────────────

  @Test
  void fieldLabelAnnotationIsHonoured() throws Exception {
    assertThat(AppMetadataExtractor.getLabel(field("clientes"))).isEqualTo("Mis clientes");
  }

  @Test
  void methodLabelAnnotationIsHonoured() throws Exception {
    assertThat(AppMetadataExtractor.getLabel(method("closeTill"))).isEqualTo("Cerrar caja");
  }

  @Test
  void unannotatedMembersFallBackToHumanizedName() throws Exception {
    assertThat(AppMetadataExtractor.getLabel(field("pedidos"))).isEqualTo("Pedidos");
    assertThat(AppMetadataExtractor.getLabel(method("openTill"))).isEqualTo("Open till");
  }

  /**
   * Regression: {@code AppMetadataExtractor} used to import {@code jdk.jfr.Label} (which also has a
   * {@code value()}), so Mateu's {@code @Label} on menu entries was silently ignored while an
   * unrelated JFR annotation was read instead.
   */
  @Test
  void jdkJfrLabelIsIgnored() throws Exception {
    assertThat(AppMetadataExtractor.getLabel(field("facturas"))).isEqualTo("Facturas");
  }

  // ── getVariant: AUTO heuristic ─────────────────────────────────────────────

  @App(AppVariant.HAMBURGUER_MENU)
  static class ExplicitVariantApp {}

  static class AutoVariantApp {}

  @Test
  void explicitVariantWinsOverHeuristic() {
    var variant =
        AppMetadataExtractor.getVariant(new ExplicitVariantApp(), List.of(new Menu("Solo uno")));
    assertThat(variant).isEqualTo(AppVariant.HAMBURGUER_MENU);
  }

  @Test
  void autoWithoutMenusFallsBackToTabs() {
    var menu = List.<Actionable>of(new RouteLink("/a", "A"), new RouteLink("/b", "B"));
    assertThat(AppMetadataExtractor.getVariant(new AutoVariantApp(), menu))
        .isEqualTo(AppVariant.TABS);
  }

  @Test
  void autoWithFewFlatMenusSelectsMenuOnTop() {
    var menu =
        List.<Actionable>of(
            new Menu("/uno", "Uno", List.of(new RouteLink("/a", "A"))), new Menu("Dos"));
    assertThat(AppMetadataExtractor.getVariant(new AutoVariantApp(), menu))
        .isEqualTo(AppVariant.MENU_ON_TOP);
  }

  @Test
  void autoWithManyEntriesSelectsHamburguerMenu() {
    var menu =
        IntStream.rangeClosed(1, 8).mapToObj(i -> (Actionable) new Menu("Menu " + i)).toList();
    assertThat(AppMetadataExtractor.getVariant(new AutoVariantApp(), menu))
        .isEqualTo(AppVariant.HAMBURGUER_MENU);
  }

  @Test
  void autoWithNestedMenusSelectsTiles() {
    var menu =
        List.<Actionable>of(
            new Menu("/padre", "Padre", List.of(new Menu("Hijo"))), new Menu("Plano"));
    assertThat(AppMetadataExtractor.getVariant(new AutoVariantApp(), menu))
        .isEqualTo(AppVariant.TILES);
  }
}
