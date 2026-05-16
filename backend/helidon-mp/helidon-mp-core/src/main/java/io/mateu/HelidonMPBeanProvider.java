package io.mateu;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.inject.spi.CDI;
import jakarta.inject.Singleton;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Singleton
public class HelidonMPBeanProvider implements BeanProvider {

  @PostConstruct
  public void init() {
    MateuBeanProvider.setBeanProvider(this);
  }

  @Override
  public <T> T getBean(Class<T> clazz) {
    try {
      return CDI.current().select(clazz).get();
    } catch (Exception ignored) {
      return null;
    }
  }

  @Override
  public <T> Collection<T> getBeans(Class<T> clazz) {
    try {
      var list = new ArrayList<T>();
      CDI.current().select(clazz).forEach(list::add);
      return list;
    } catch (Exception ignored) {
      return List.of();
    }
  }
}
