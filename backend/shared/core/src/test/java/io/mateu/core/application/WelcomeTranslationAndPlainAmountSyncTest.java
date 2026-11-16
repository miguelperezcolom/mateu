package io.mateu.core.application;

import static io.mateu.core.application.FieldKindsSyncTest.collect;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.HeroSectionDto;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Two readings that skipped what the page declared: a {@code Welcome}'s overridden hero texts
 * reached the wire without going through the app's translator ({@code ${i18n.home.title}} showed as
 * the key), and a class-level {@code @PlainText} left an {@link Amount} field an editable currency
 * + number pair while the field-level one rendered it as text.
 */
class WelcomeTranslationAndPlainAmountSyncTest {

  @UI("/translated-welcome")
  public static class TranslatedWelcome extends Welcome {
    Button start = Button.builder().label("Start").actionId("start").build();

    @Override
    protected String heroTitle() {
      return "${i18n.home.title}";
    }

    @Override
    protected String heroSubtitle() {
      return "home.subtitle";
    }

    @Override
    protected String heroOverline() {
      return "home.overline";
    }
  }

  @UI("/plain-amounts")
  @PlainText
  public static class PlainAmounts {
    Amount balance = new Amount("EUR", 1234.56, null);
    String holder = "Ana";
  }

  static class KeysTranslator implements Translator {
    @Override
    public String translate(String text, HttpRequest httpRequest) {
      if (text == null) return null;
      return switch (text) {
        case "${i18n.home.title}" -> "Willkommen";
        case "home.subtitle" -> "Schön, dass Sie da sind";
        case "home.overline" -> "Guten Morgen";
        default -> text;
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new KeysTranslator()), TranslatedWelcome.class, PlainAmounts.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theWelcomeHeroGoesThroughTheTranslator() {
    var hero =
        collect(
                mateu.sync("/translated-welcome").fragments().get(0).component(),
                HeroSectionDto.class)
            .get(0);
    assertThat(hero.title()).isEqualTo("Willkommen");
    assertThat(hero.subtitle()).isEqualTo("Schön, dass Sie da sind");
    assertThat(hero.overline()).isEqualTo("Guten Morgen");
  }

  @Test
  void aClassLevelPlainTextCoversAmountFields() {
    var fields =
        collect(mateu.sync("/plain-amounts").fragments().get(0).component(), FormFieldDto.class);
    var balance = fields.stream().filter(f -> "balance".equals(f.fieldId())).findFirst().get();
    assertThat(balance.stereotype()).isEqualTo("plainText");
    assertThat(balance.dataType()).isEqualTo("money");
  }
}
