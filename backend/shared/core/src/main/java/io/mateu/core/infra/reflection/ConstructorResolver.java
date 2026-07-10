package io.mateu.core.infra.reflection;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;

final class ConstructorResolver {

  static Constructor<?> getConstructor(Class<?> type) {
    Constructor<?> con = null;
    int minParams = Integer.MAX_VALUE;
    for (Constructor<?> x : type.getConstructors()) {
      if (Modifier.isPublic(x.getModifiers()) && x.getParameterCount() < minParams) {
        con = x;
        minParams = con.getParameterCount();
      }
    }
    if (con == null) {
      for (Constructor<?> x : type.getDeclaredConstructors()) {
        if (Modifier.isProtected(x.getModifiers()) && x.getParameterCount() < minParams) {
          con = x;
          minParams = con.getParameterCount();
        }
      }
    }
    if (con == null) {
      for (Constructor<?> x : type.getDeclaredConstructors()) {
        if (x.getParameterCount() < minParams) {
          con = x;
          minParams = con.getParameterCount();
        }
      }
    }
    if (con != null
        && (!Modifier.isPublic(con.getModifiers())
            || !Modifier.isPublic(con.getDeclaringClass().getModifiers()))) {
      // a public constructor on a package-private class is still inaccessible reflectively
      con.setAccessible(true);
    }
    return con;
  }

  static Object[] buildConstructorParams(
      Constructor<?> con,
      java.util.Map<String, Object> data,
      InstanceFactory factory,
      HttpRequest httpRequest)
      throws Exception {
    List<Object> params = new ArrayList<>();
    for (Parameter parameter : con.getParameters()) {
      params.add(
          ReflectionTypeCoercer.coerce(
              parameter.getType(),
              data.get(parameter.getName()),
              httpRequest,
              getGenericClass(parameter.getParameterizedType()),
              (ReflectionInstanceFactory) factory));
    }
    return params.toArray();
  }
}
