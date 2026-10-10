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

  /**
   * A data-authored shell ({@code type: AppShell}, {@code variant: AUTO} — what the New › App Shell
   * template writes) used to put AUTO on the wire, and no renderer draws AUTO: a blank page.
   */
  @Test
  void autoIsResolvedBeforeTheWireForShellsWithoutAnAnnotatedClass() {
    var routeLinks =
        java.util.List.<io.mateu.uidl.interfaces.Actionable>of(
            new io.mateu.uidl.data.RouteLink("home", "Home"),
            new io.mateu.uidl.data.RouteLink("products", "Products"));
    var resolved =
        io.mateu.core.domain.out.componentmapper.AppVariants.resolve(AppVariant.AUTO, routeLinks);
    assertThat(resolved).isNotEqualTo(AppVariant.AUTO);
    assertThat(io.mateu.core.domain.out.componentmapper.AppVariants.resolve(null, null))
        .isNotEqualTo(AppVariant.AUTO);
    assertThat(
            io.mateu.core.domain.out.componentmapper.AppVariants.resolve(
                AppVariant.TILES, routeLinks))
        .isEqualTo(AppVariant.TILES);
  }

  @Test
  void everyVariantHasAWireValue() {
    for (var variant : AppVariant.values()) {
      assertThat(AppMapper.toDto(variant)).as(variant.name()).isNotNull();
    }
  }
}
