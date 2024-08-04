package io.mateu.core.domain.model.reflection.usecases;

import java.lang.reflect.Method;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class MethodProvider {

  private final AllMethodsProvider allMethodsProvider;

  public MethodProvider(AllMethodsProvider allMethodsProvider) {
    this.allMethodsProvider = allMethodsProvider;
  }

  @Cacheable(value = "method-per-class-and-name")
  public Method getMethod(Class<?> c, String methodName) {
    Method m = null;
    if (c != null)
      for (Method q : allMethodsProvider.getAllMethods(c)) {
        if (methodName.equals(q.getName())) {
          m = q;
          break;
        }
      }
    return m;
  }
}
