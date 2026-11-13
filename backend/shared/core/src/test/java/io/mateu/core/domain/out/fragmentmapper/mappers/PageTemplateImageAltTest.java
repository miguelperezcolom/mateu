package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.ItemOverviewPage;
import io.mateu.uidl.data.TemplateImage;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A page template's image is read by screen readers: its declared {@code alt}, else the page's
 * title (GA Explorer pass — the item-overview photo had no alt at all).
 */
class PageTemplateImageAltTest {

  @Test
  void theAltIsTheDeclaredOneElseThePageTitle() {
    var untitledPhoto =
        ItemOverviewPage.builder().photo(new TemplateImage("/img/luke.png", null)).build();
    assertThat(PageTemplates.dtoOf(untitledPhoto, "Luke Skywalker").photo().alt())
        .isEqualTo("Luke Skywalker");
    var described =
        ItemOverviewPage.builder()
            .photo(new TemplateImage("/img/luke.png", null, "Luke on Tatooine"))
            .build();
    assertThat(PageTemplates.dtoOf(described, "Luke Skywalker").photo().alt())
        .isEqualTo("Luke on Tatooine");
    assertThat(PageTemplates.dtoOf(untitledPhoto, null).photo().alt()).isNull();
  }

  @Test
  void theImageDrawnForTheTemplateCarriesTheAltToo() {
    var form =
        io.mateu.uidl.fluent.Form.builder()
            .title("Luke Skywalker")
            .template(
                ItemOverviewPage.builder().photo(new TemplateImage("/img/luke.png", null)).build())
            .content(List.of())
            .build();
    var images = new java.util.ArrayList<Image>();
    collect(PageTemplates.contentOf(form), images);
    assertThat(images)
        .singleElement()
        .satisfies(i -> assertThat(i.alt()).isEqualTo("Luke Skywalker"));
  }

  private static void collect(Object node, List<Image> out) {
    if (node instanceof Image image) {
      out.add(image);
      return;
    }
    if (node instanceof Iterable<?> items) {
      items.forEach(item -> collect(item, out));
      return;
    }
    if (node != null && node.getClass().isRecord()) {
      for (var component : node.getClass().getRecordComponents()) {
        try {
          collect(component.getAccessor().invoke(node), out);
        } catch (ReflectiveOperationException e) {
          throw new IllegalStateException(e);
        }
      }
    }
  }
}
