package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.valuegenerators.LocatorValueGenerator;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import org.junit.jupiter.api.Test;

class ValueGeneratorsTest {

  @Test
  void uuidGeneratorProducesNonNullValue() {
    var gen = new UUIDValueGenerator();
    var val = gen.generate();
    assertThat(val).isNotNull();
    assertThat(val.toString()).hasSize(36); // UUID length with hyphens
  }

  @Test
  void uuidGeneratorProducesUniqueValues() {
    var gen = new UUIDValueGenerator();
    var a = gen.generate();
    var b = gen.generate();
    assertThat(a).isNotEqualTo(b);
  }

  @Test
  void locatorGeneratorProducesNonNullValue() {
    var gen = new LocatorValueGenerator();
    var val = gen.generate();
    assertThat(val).isNotNull();
    assertThat(val.toString()).hasSize(6);
  }

  @Test
  void locatorGeneratorProducesUniqueValues() {
    var gen = new LocatorValueGenerator();
    var a = gen.generate();
    var b = gen.generate();
    // Statistically extremely likely to be different
    assertThat(a).isNotNull();
    assertThat(b).isNotNull();
  }

  @Test
  void locatorGeneratorStaticMethodWorks() {
    var loc = LocatorValueGenerator.newLocator(8);
    assertThat(loc).hasSize(8);
    assertThat(loc).matches("[A-Z2-9]+");
  }

  @Test
  void locatorGeneratorCustomLength() {
    assertThat(LocatorValueGenerator.newLocator(4)).hasSize(4);
    assertThat(LocatorValueGenerator.newLocator(12)).hasSize(12);
  }
}
