package io.mateu.core.infra.declarative;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/** Mateu's own words: every language of the catalogue says every one, placeholders kept. */
class BuiltInTextsTest {

  private static final Pattern HOLE = Pattern.compile("\\{\\d+}");

  @Test
  void everyLanguageHasEveryWordWithItsPlaceholders() {
    assertThat(BuiltInTexts.CATALOGUE.keySet())
        .containsExactlyInAnyOrder("es", "fr", "de", "pt", "it");
    var english = BuiltInTexts.CATALOGUE.get("es").keySet();
    BuiltInTexts.CATALOGUE.forEach(
        (lang, words) -> {
          assertThat(words.keySet()).as(lang).isEqualTo(english);
          words.forEach(
              (en, translated) -> {
                assertThat(translated).as(lang + " " + en).isNotBlank();
                assertThat(HOLE.matcher(translated).results().count())
                    .as(lang + " " + en)
                    .isEqualTo(HOLE.matcher(en).results().count());
              });
        });
  }

  @Test
  void ownWordsFollowTheLanguageAndOthersStayAsWritten() {
    assertThat(BuiltInTexts.ownWord("Save", "fr")).isEqualTo("Enregistrer");
    assertThat(BuiltInTexts.ownWord("Cancel", "de")).isEqualTo("Abbrechen");
    assertThat(BuiltInTexts.ownWord("Delete", "pt")).isEqualTo("Excluir");
    assertThat(BuiltInTexts.ownWord("{0} records deleted", "it")).isEqualTo("{0} record eliminati");
    assertThat(BuiltInTexts.ownWord("Save", "nl")).isEqualTo("Save");
    assertThat(BuiltInTexts.ownWord("Save", null)).isEqualTo("Save");
    assertThat(BuiltInTexts.ownWord("My label", "fr")).isEqualTo("My label");
  }
}
