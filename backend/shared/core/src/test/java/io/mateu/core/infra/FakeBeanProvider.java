package io.mateu.core.infra;

import io.mateu.core.domain.ActionRunner;
import io.mateu.core.domain.BeanProvider;
import io.mateu.core.domain.FragmentMapper;
import io.mateu.core.domain.InstanceFactory;
import io.mateu.core.domain.ReflectionUiIncrementMapper;
import io.mateu.core.domain.ReflectionUiMapper;
import io.mateu.core.domain.UiIncrementMapper;
import io.mateu.core.domain.UiMapper;
import io.mateu.core.domain.fragmentmapper.ComponentFragmentMapper;
import io.mateu.core.domain.fragmentmapper.ReflectionFragmentMapper;
import io.mateu.core.domain.reflection.ReflectionInstanceFactory;
import io.mateu.core.domain.reflection.RunMethodActionRunner;
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
                  new ComponentFragmentMapper(), new ReflectionFragmentMapper()));
    }
    if (UiMapper.class.equals(clazz)) {
      return (Collection<T>) List.of(new ReflectionUiMapper());
    }
    if (FragmentMapper.class.equals(clazz)) {
      return (Collection<T>)
          List.of(
              new ReflectionUiIncrementMapper(
                  new ComponentFragmentMapper(), new ReflectionFragmentMapper()));
    }
    if (ActionRunner.class.equals(clazz)) {
      return (Collection<T>) List.of(new RunMethodActionRunner());
    }
    return List.of();
  }
}
