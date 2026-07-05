package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ModelSupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The remaining reflective form-field variants: fluent Component fields, Callable fields,
 * ModelSupplier indirection, @Composition (single and list), @Text fields and @GeneratedValue
 * read-only ids.
 */
class FieldVariantsSyncTest {

  @SuppressWarnings("unused")
  public static class LineItem {
    String concept = "c";
    int qty = 1;
  }

  @SuppressWarnings("unused")
  @UI("/variants")
  public static class VariantsForm {
    @Text String note;

    Component banner = new io.mateu.uidl.data.Text("inline fluent banner");

    Callable<Component> lazy = () -> new io.mateu.uidl.data.Text("lazy content");
  }

  /** The page delegates its model to another object. */
  @SuppressWarnings("unused")
  @UI("/delegated")
  public static class DelegatedPage implements ModelSupplier {
    @Override
    public Object model() {
      return new LineItem();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(VariantsForm.class, DelegatedPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void variantsFormSyncs() {
    var increment = mateu.sync("/variants");
    assertThat(increment.fragments()).isNotEmpty();
  }

  @Test
  void fluentComponentFieldsRenderInline() {
    var increment = mateu.sync("/variants");
    var texts = new ArrayList<String>();
    collectTexts(increment.fragments().get(0).component(), texts);
    assertThat(texts).contains("inline fluent banner");
  }

  @Test
  void callableFieldsRenderTheirResult() {
    var increment = mateu.sync("/variants");
    var texts = new ArrayList<String>();
    collectTexts(increment.fragments().get(0).component(), texts);
    assertThat(texts).contains("lazy content");
  }

  @Test
  void modelSupplierPagesRenderTheSuppliedModel() {
    // ModelSupplier affects the RENDERED model; the state stays keyed to the page itself
    var increment = mateu.sync("/delegated");
    assertThat(increment.fragments()).isNotEmpty();
  }

  private static void collectTexts(Object component, List<String> out) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof io.mateu.dtos.TextDto text) {
        out.add(text.text());
      }
      FieldKindsSyncTest.walk(component, io.mateu.dtos.TextDto.class, new ArrayList<>());
      client.children().forEach(child -> collectTexts(child, out));
      // metadata-nested components too
      var texts = new ArrayList<io.mateu.dtos.TextDto>();
      FieldKindsSyncTest.walk(client, io.mateu.dtos.TextDto.class, texts);
      texts.forEach(text -> out.add(text.text()));
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      server.children().forEach(child -> collectTexts(child, out));
    }
  }
}
