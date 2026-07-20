package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.HeroSectionDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WelcomeBanner;
import java.util.ArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@code @WelcomeBanner} on a view class puts the Redwood "Welcome Banner" element at the top of
 * the page — mapped to a centered {@code HeroSection} as the first content (title falling back to
 * the page {@code @Title}). Any page carrying a HeroSection also suppresses the accent strip in the
 * Redwood renderer (the strip only shows on pages without a welcome banner).
 */
class WelcomeBannerSyncTest {

  @SuppressWarnings("unused")
  @UI("/bannered-form")
  @Title("Bannered")
  @WelcomeBanner(title = "Find your flow", subtitle = "Three steps and you are done")
  public static class BanneredForm {
    String name;
  }

  @SuppressWarnings("unused")
  @UI("/titled-banner")
  @Title("The page title")
  @WelcomeBanner
  public static class TitledBannerForm {
    String name;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BanneredForm.class, TitledBannerForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static HeroSectionDto heroOf(String route) {
    UIIncrementDto increment = mateu.sync(route);
    var heroes = new ArrayList<HeroSectionDto>();
    FieldKindsSyncTest.walk(increment.fragments().get(0).component(), HeroSectionDto.class, heroes);
    assertThat(heroes).hasSize(1);
    return heroes.get(0);
  }

  @Test
  void theBannerRendersAsACenteredHeroSectionWithTheConfiguredTexts() {
    var hero = heroOf("/bannered-form");
    assertThat(hero.title()).isEqualTo("Find your flow");
    assertThat(hero.subtitle()).isEqualTo("Three steps and you are done");
    assertThat(hero.centered()).isTrue();
  }

  @Test
  void theBannerTitleFallsBackToThePageTitle() {
    assertThat(heroOf("/titled-banner").title()).isEqualTo("The page title");
  }
}
