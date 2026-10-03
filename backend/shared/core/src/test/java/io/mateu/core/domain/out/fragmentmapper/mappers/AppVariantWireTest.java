package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.AppVariantDto;
import io.mateu.uidl.fluent.AppVariant;
import org.junit.jupiter.api.Test;

/** How the app's variant travels to the renderers. */
class AppVariantWireTest {

  @Test
  void hamburgerMenuIsTheRightSpellingAndTravelsUnderTheOldName() {
    assertThat(AppMapper.toDto(AppVariant.HAMBURGER_MENU)).isEqualTo(AppVariantDto.HAMBURGUER_MENU);
    assertThat(AppMapper.toDto(AppVariant.HAMBURGUER_MENU))
        .isEqualTo(AppVariantDto.HAMBURGUER_MENU);
  }

  @Test
  void hamburgerSectionsTravelsAsItself() {
    assertThat(AppMapper.toDto(AppVariant.HAMBURGER_SECTIONS))
        .isEqualTo(AppVariantDto.HAMBURGER_SECTIONS);
  }

  @Test
  void everyVariantHasAWireValue() {
    for (var variant : AppVariant.values()) {
      assertThat(AppMapper.toDto(variant)).as(variant.name()).isNotNull();
    }
  }
}
