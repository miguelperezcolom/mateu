package io.mateu.core.infra.reflection.read;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.ports.BeanProvider;
import java.util.Collection;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Field value reads: getter precedence, direct field access, defaults, and lazy instantiation. */
class ValueProviderTest {

  @SuppressWarnings("unused")
  static class Holder {
    String plain = "direct";
    String withGetter = "raw";
    Payload payload;
    Payload initialized = new Payload();

    public String getWithGetter() {
      return "via-getter";
    }
  }

  public static class Payload {
    public Payload() {}
  }

  static class EmptyBeanProvider implements BeanProvider {
    @Override
    public <T> T getBean(Class<T> clazz) {
      return null;
    }

    @Override
    public <T> Collection<T> getBeans(Class<T> clazz) {
      return List.of();
    }
  }

  private static java.lang.reflect.Field field(String name) throws Exception {
    return Holder.class.getDeclaredField(name);
  }

  @Test
  void gettersTakePrecedenceOverTheField() throws Exception {
    assertThat(ValueProvider.getValue(field("withGetter"), new Holder())).isEqualTo("via-getter");
  }

  @Test
  void plainFieldsReadDirectly() throws Exception {
    assertThat(ValueProvider.getValue(field("plain"), new Holder())).isEqualTo("direct");
  }

  @Test
  void defaultValueAppliesWhenNull() throws Exception {
    assertThat(ValueProvider.getValue(field("payload"), new Holder(), "fallback"))
        .isEqualTo("fallback");
    assertThat(ValueProvider.getValue(field("plain"), new Holder(), "fallback"))
        .isEqualTo("direct");
  }

  @Test
  void getValueOrNewInstanceInstantiatesWhenNullAndNoBean() throws Exception {
    var value =
        ValueProvider.getValueOrNewInstance(
            new EmptyBeanProvider(), field("payload"), new Holder());
    assertThat(value).isInstanceOf(Payload.class);
  }

  @Test
  void getValueOrNewInstanceKeepsExistingValues() throws Exception {
    var holder = new Holder();
    var value =
        ValueProvider.getValueOrNewInstance(new EmptyBeanProvider(), field("initialized"), holder);
    assertThat(value).isSameAs(holder.initialized);
  }
}
