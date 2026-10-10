package io.mateu.core.infra.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.junit.jupiter.api.Test;

/** The cached lookup answers exactly what the uncached walk did, every time it is asked. */
class MetaAnnotationsCacheTest {

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
  @Label("Total amount")
  @interface Amount {}

  static class Form {
    @Amount String total;

    @ReadOnly String locked;

    String plain;
  }

  @Test
  void composedDirectAndAbsentAnswersAreStableAcrossCalls() throws Exception {
    var total = Form.class.getDeclaredField("total");
    var locked = Form.class.getDeclaredField("locked");
    var plain = Form.class.getDeclaredField("plain");
    for (int i = 0; i < 3; i++) {
      assertThat(MetaAnnotations.find(total, Label.class).value()).isEqualTo("Total amount");
      assertThat(MetaAnnotations.isPresent(locked, ReadOnly.class)).isTrue();
      assertThat(MetaAnnotations.find(locked, Label.class)).isNull();
      assertThat(MetaAnnotations.find(plain, Label.class)).isNull();
      assertThat(MetaAnnotations.find(Form.class, ReadOnly.class)).isNull();
    }
    // the same element asked for another annotation type is its own entry
    assertThat(MetaAnnotations.isPresent(total, ReadOnly.class)).isFalse();
    assertThat(MetaAnnotations.find(null, Label.class)).isNull();
  }
}
