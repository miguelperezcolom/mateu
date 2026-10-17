package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.ResponsiveGridDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.annotations.Aside;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ContentAsidePosition;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ContentSupplier;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * How a reflected page's body is put together beyond a plain form: an {@code @Aside} on the START
 * side at the default width, not sticky, holding a plain object (rendered as a component); an aside
 * whose value is missing leaves the form as it is; a page with no editable data is the list of its
 * components; and a {@link ContentSupplier} supplies its own content.
 */
class PageContentVariantsSyncTest {

  public static class Tips {
    public String tip = "Use the keyboard";
  }

  @UI("/content-aside-start")
  @Title("Aside start")
  public static class AsideStart {
    public String name = "Ada";

    @Aside(position = ContentAsidePosition.start, sticky = false)
    public Tips tips = new Tips();

    @Aside public Text missing = null;
  }

  @UI("/content-aside-empty")
  @Title("Aside empty")
  public static class AsideEmpty {
    public String name = "Ada";

    @Aside public Text nothing = null;
  }

  @UI("/content-components")
  @Title("Components only")
  public static class ComponentsOnly {
    public Text intro = new Text("Welcome aboard");
    public Text outro = new Text("See you soon");
  }

  @UI("/content-supplied")
  @Title("Supplied")
  public static class Supplied implements ContentSupplier {
    @Override
    public List<Component> content() {
      return List.of(new Text("supplied content"));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(AsideStart.class, AsideEmpty.class, ComponentsOnly.class, Supplied.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<String> texts(Object root) {
    return WireWalk.all(root, TextDto.class).stream().map(TextDto::text).toList();
  }

  @Test
  void aStartAsideAtTheDefaultWidthHoldsAPlainObject() {
    var increment = mateu.sync("/content-aside-start");
    var grid = WireWalk.first(increment, ResponsiveGridDto.class);
    assertThat(grid).isNotNull();
    assertThat(grid.gridTemplateAreas()).isEqualTo("\"aside main\"");
    assertThat(grid.gridTemplateColumns()).isEqualTo("22rem 1fr");
    assertThat(grid.stickyAreas()).isEmpty();
    assertThat(WireWalk.all(increment, FormFieldDto.class))
        .extracting(FormFieldDto::fieldId)
        .contains("name");
    assertThat(String.valueOf(increment)).contains("Use the keyboard");
  }

  @Test
  void anAsideWithNothingInItLeavesTheFormAlone() {
    var increment = mateu.sync("/content-aside-empty");
    assertThat(WireWalk.all(increment, ResponsiveGridDto.class)).isEmpty();
    assertThat(WireWalk.all(increment, FormFieldDto.class))
        .extracting(FormFieldDto::fieldId)
        .contains("name");
  }

  @Test
  void aPageWithNoDataIsTheListOfItsComponents() {
    assertThat(texts(mateu.sync("/content-components"))).contains("Welcome aboard", "See you soon");
  }

  @Test
  void aContentSupplierSuppliesItsOwnContent() {
    assertThat(texts(mateu.sync("/content-supplied"))).contains("supplied content");
  }
}
