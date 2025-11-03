package io.mateu.core.infra.reflection;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.InstanceFactory;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.lang.reflect.InvocationTargetException;
import java.util.Map;

@Named
@Singleton
public class DefaultInstanceFactory implements InstanceFactory {

  private final ReflectionInstanceFactory reflectionInstanceFactory;
  private static DefaultInstanceFactory _instance;

  public DefaultInstanceFactory(ReflectionInstanceFactory reflectionInstanceFactory) {
    this.reflectionInstanceFactory = reflectionInstanceFactory;
    MateuInstanceFactory.setInstanceFactory(this);
    _instance = this;
  }

  static ReflectionInstanceFactory getReflectionInstanceFactory() {
    return _instance.reflectionInstanceFactory;
  }

  @Override
  public <T> T newInstance(Class<T> type, HttpRequest httpRequest)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    return getReflectionInstanceFactory().newInstance(type, httpRequest);
  }

  public <T> T newInstance(Class<T> type, Map<String, Object> data, HttpRequest httpRequest) {
    return getReflectionInstanceFactory().newInstance(type, data, httpRequest);
  }
}
