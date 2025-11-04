package io.mateu.core.infra;

import io.mateu.core.domain.act.ActionRunner;
import io.mateu.core.domain.out.FragmentMapper;
import io.mateu.core.domain.out.UiIncrementMapper;
import io.mateu.core.domain.out.UiMapper;
import io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper;
import io.mateu.core.domain.out.fragmentmapper.ComponentFragmentMapper;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.core.infra.reflection.mappers.ReflectionUiIncrementMapper;
import io.mateu.core.infra.reflection.mappers.ReflectionUiMapper;
import io.mateu.core.infra.reflection.write.RunMethodActionRunner;
import jakarta.inject.Named;
import java.util.Collection;
import java.util.List;

@Named
public class FakeBeanProvider implements BeanProvider {

  @Override
  public <T> T getBean(Class<T> clazz) {
    return null;
  }

  @Override
  public <T> Collection<T> getBeans(Class<T> clazz) {
    if (InstanceFactory.class.equals(clazz)) {
      return (Collection<T>) List.of(new ReflectionInstanceFactory(new FakeBeanProvider()));
    }
    if (UiIncrementMapper.class.equals(clazz)) {
      return (Collection<T>)
          List.of(
              new ReflectionUiIncrementMapper(
                  new ComponentFragmentMapper(), new ReflectionObjectToComponentMapper()));
    }
    if (UiMapper.class.equals(clazz)) {
      return (Collection<T>) List.of(new ReflectionUiMapper());
    }
    if (FragmentMapper.class.equals(clazz)) {
      return (Collection<T>)
          List.of(
              new ReflectionUiIncrementMapper(
                  new ComponentFragmentMapper(), new ReflectionObjectToComponentMapper()));
    }
    if (ActionRunner.class.equals(clazz)) {
      return (Collection<T>) List.of(new RunMethodActionRunner());
    }
    return List.of();
  }
}
