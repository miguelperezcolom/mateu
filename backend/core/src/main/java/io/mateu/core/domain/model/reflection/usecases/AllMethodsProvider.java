package io.mateu.core.domain.model.reflection.usecases;

import jakarta.persistence.Entity;
import jakarta.persistence.MappedSuperclass;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class AllMethodsProvider {

  @Cacheable(value = "all-methods-per-class")
  public List<Method> getAllMethods(Class c) {
    List<Method> l = new ArrayList<>();

    if (c.getSuperclass() != null
        && (!c.isAnnotationPresent(Entity.class)
            || c.getSuperclass().isAnnotationPresent(Entity.class)
            || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class)))
      l.addAll(getAllMethods(c.getSuperclass()));

    for (Method f : c.getDeclaredMethods()) {
      l.removeIf(m -> getSignature(m).equals(getSignature(f)));
      l.add(f);
    }

    return l;
  }

  private String getSignature(Method m) {
    return m.getGenericReturnType().getTypeName()
        + " "
        + m.getName()
        + "("
        + getSignature(m.getParameters())
        + ")";
  }

  private String getSignature(Parameter[] parameters) {
    String s = "";
    if (parameters != null)
      for (Parameter p : parameters) {
        if (!"".equals(s)) s += ", ";
        s += p.getType().getName();
      }
    return s;
  }
}
