package io.mateu.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class HumanizerTest {

  @Test
  void returnsCapitalized() {
    var capitalised = Humanizer.capitalize("hello    world");
    assertEquals("Hello world", capitalised);

    capitalised = Humanizer.capitalize("");
    assertEquals("", capitalised);

    capitalised = Humanizer.capitalize("", true);
    assertEquals("", capitalised);

    capitalised = Humanizer.capitalize("", false);
    assertEquals("", capitalised);

    capitalised = Humanizer.capitalize("hola", true);
    assertEquals("Hola", capitalised);

    capitalised = Humanizer.capitalize("hola", false);
    assertEquals("hola", capitalised);

    capitalised = Humanizer.capitalize(null);
    assertNull(capitalised);
  }

  @Test
  void returnsCapitalizedNotStartingWithUppercase() {
    var capitalised = Humanizer.capitalize("hello   WORLD", false);
    assertEquals("hello world", capitalised);
  }

  @Test
  void returnsCamelcase() {
    var camelcasized = Humanizer.camelcasize("hello   WORLD");
    assertEquals("helloWorld", camelcasized);

    camelcasized = Humanizer.camelcasize("hola palma de mallorcs");
    assertEquals("holaPalmaDeMallorcs", camelcasized);

    camelcasized = Humanizer.camelcasize("a");
    assertEquals("a", camelcasized);

    camelcasized = Humanizer.camelcasize("");
    assertEquals("", camelcasized);

    camelcasized = Humanizer.camelcasize(null);
    assertNull(camelcasized);
  }

  @Test
  void returnsPlural() {
    var plural = Humanizer.pluralize("hello world");
    assertEquals("hello worlds", plural);

    plural = Humanizer.pluralize("hello class");
    assertEquals("hello classes", plural);

    plural = Humanizer.pluralize("hello spy");
    assertEquals("hello spies", plural);

    plural = Humanizer.pluralize("");
    assertEquals("", plural);

    plural = Humanizer.pluralize(null);
    assertNull(plural);
  }
}
