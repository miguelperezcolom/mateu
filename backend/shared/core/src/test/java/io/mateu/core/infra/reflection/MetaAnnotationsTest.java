package io.mateu.core.infra.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Label;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Field;
import org.junit.jupiter.api.Test;

/** Verifies semantic (composed) annotation resolution used across the framework. */
class MetaAnnotationsTest {

  // A domain annotation that bundles @Label — the semantic-annotation pattern.
  // ANNOTATION_TYPE in the target lets it compose into other annotations (e.g. @Sku).
  @Label("Product name")
  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
  @interface ProductName {}

  // Two levels of composition: @Sku -> @ProductName -> @Label.
  @ProductName
  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
  @interface Sku {}

  static class Holder {
    @ProductName String composed;
    @Sku String nested;

    @Label("Direct")
    String direct;

    String plain;
  }

  private static Field field(String name) {
    try {
      return Holder.class.getDeclaredField(name);
    } catch (NoSuchFieldException e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  void resolvesDirectAnnotation() {
    Label l = MetaAnnotations.find(field("direct"), Label.class);
    assertThat(l).isNotNull();
    assertThat(l.value()).isEqualTo("Direct");
  }

  @Test
  void resolvesComposedAnnotation() {
    Label l = MetaAnnotations.find(field("composed"), Label.class);
    assertThat(l).isNotNull();
    assertThat(l.value()).isEqualTo("Product name");
  }

  @Test
  void resolvesNestedComposedAnnotation() {
    Label l = MetaAnnotations.find(field("nested"), Label.class);
    assertThat(l).isNotNull();
    assertThat(l.value()).isEqualTo("Product name");
  }

  @Test
  void returnsNullWhenAbsent() {
    assertThat(MetaAnnotations.find(field("plain"), Label.class)).isNull();
    assertThat(MetaAnnotations.isPresent(field("plain"), Label.class)).isFalse();
  }

  @Test
  void isPresentReportsComposed() {
    assertThat(MetaAnnotations.isPresent(field("composed"), Label.class)).isTrue();
    assertThat(MetaAnnotations.isPresent(field("direct"), Label.class)).isTrue();
  }
}
