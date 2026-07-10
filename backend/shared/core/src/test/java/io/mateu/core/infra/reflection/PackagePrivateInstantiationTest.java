package io.mateu.core.infra.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.ports.BeanProvider;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * A public constructor on a PACKAGE-PRIVATE class is still inaccessible reflectively — the crud
 * filter semantics construct a fresh instance of the (often package-private) entity class to diff
 * default values, which used to blow up with IllegalAccessException and break every search on such
 * cruds (the ItemsCatalog e2e regression that failed releases alpha.228..232).
 */
class PackagePrivateInstantiationTest {

  static class NoBeans implements BeanProvider {
    @Override
    public <T> T getBean(Class<T> clazz) {
      return null;
    }

    @Override
    public <T> java.util.Collection<T> getBeans(Class<T> clazz) {
      return java.util.List.of();
    }
  }

  @Test
  void packagePrivateClassWithPublicConstructorInstantiates() {
    var factory = new ReflectionInstanceFactory(new NoBeans());
    PackagePrivateFixture instance =
        factory.newInstance(PackagePrivateFixture.class, Map.of(), null);
    assertThat(instance).isNotNull();
  }
}

/** Package-private on purpose — mirrors an entity declared next to its AutoCrud in one file. */
class PackagePrivateFixture {
  public PackagePrivateFixture() {}
}
