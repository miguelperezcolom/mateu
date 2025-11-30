package io.mateu.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class HumanizerTest {

  @Test
  void returnsCapitalized() {
    var capitalised = Humanizer.toUpperCaseFirst("hello    world");
    assertEquals("Hello world", capitalised);

    capitalised = Humanizer.toUpperCaseFirst("");
    assertEquals("", capitalised);

    capitalised = Humanizer.toUpperCaseFirst("", true);
    assertEquals("", capitalised);

    capitalised = Humanizer.toUpperCaseFirst("", false);
    assertEquals("", capitalised);

    capitalised = Humanizer.toUpperCaseFirst("hola", true);
    assertEquals("Hola", capitalised);

    capitalised = Humanizer.toUpperCaseFirst("hola", false);
    assertEquals("hola", capitalised);

    capitalised = Humanizer.toUpperCaseFirst(null);
    assertNull(capitalised);
  }

  @Test
  void returnsCapitalizedNotStartingWithUppercase() {
    var capitalised = Humanizer.toUpperCaseFirst("hello   WORLD", false);
    assertEquals("hello world", capitalised);
  }

  @Test
  void returnsCamelcase() {
    var camelcasized = Humanizer.toCamelCase("hello   WORLD");
    assertEquals("helloWorld", camelcasized);

    camelcasized = Humanizer.toCamelCase("hola palma de mallorcs");
    assertEquals("holaPalmaDeMallorcs", camelcasized);

    camelcasized = Humanizer.toCamelCase("a");
    assertEquals("a", camelcasized);

    camelcasized = Humanizer.toCamelCase("");
    assertEquals("", camelcasized);

    camelcasized = Humanizer.toCamelCase(null);
    assertNull(camelcasized);
  }

  @Test
  void returnsPlural() {
    var plural = Humanizer.toPlural("hello world");
    assertEquals("hello worlds", plural);

    plural = Humanizer.toPlural("hello class");
    assertEquals("hello classes", plural);

    plural = Humanizer.toPlural("hello spy");
    assertEquals("hello spies", plural);

    plural = Humanizer.toPlural("");
    assertEquals("", plural);

    plural = Humanizer.toPlural(null);
    assertNull(plural);
  }
}
