package io.mateu;

import io.helidon.common.context.Contexts;
import io.mateu.core.domain.ports.BeanProvider;
import jakarta.inject.Singleton;
import java.util.Collection;
import java.util.List;

@Singleton
public class HelidonMPBeanProvider implements BeanProvider {

  @Override
  public <T> T getBean(Class<T> clazz) {
    try {
      return Contexts.globalContext().get(clazz).get();
    } catch (Exception ignored) {
      return null;
    }
  }

  @Override
  public <T> Collection<T> getBeans(Class<T> clazz) {
    try {
      return List.of(Contexts.globalContext().get(clazz).get());
    } catch (Exception ignored) {
      System.out.println(ignored);
      return List.of();
    }
  }
}
