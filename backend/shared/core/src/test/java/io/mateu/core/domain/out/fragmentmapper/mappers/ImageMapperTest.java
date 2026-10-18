package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.ImageDto;
import io.mateu.uidl.data.Image;
import org.junit.jupiter.api.Test;

/** An image carries its text alternative to the wire, so every renderer can give it a name. */
class ImageMapperTest {

  private static ImageDto mapped(Image image) {
    return (ImageDto) ImageMapper.mapImageToDto(image).metadata();
  }

  @Test
  void theDeclaredAltTextReachesTheWire() {
    assertThat(mapped(Image.builder().src("/logo.png").alt("Company logo").build()).alt())
        .isEqualTo("Company logo");
    assertThat(mapped(new Image("/logo.png", "Company logo")).alt()).isEqualTo("Company logo");
  }

  @Test
  void anEmptyAltDeclaresTheImageDecorative() {
    assertThat(mapped(new Image("/divider.png", "")).alt()).isEmpty();
  }

  @Test
  void theConstructorsThatPredateAltDeclareNone() {
    assertThat(mapped(new Image("/logo.png")).alt()).isNull();
    assertThat(mapped(new Image("/logo.png", "width: 4rem", "logo")).alt()).isNull();
  }
}
