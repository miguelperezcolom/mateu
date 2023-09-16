package io.mateu.mdd.shared.reflection;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.*;

public class CoreReflectionHelper {

  public static Object invokeInjectableParametersOnly(Method method, Object instance)
      throws Throwable {
    return execute(method, new Object(), instance, null);
  }

  public static Object execute(Method m, Object parameters, Object instance, Set pendingSelection)
      throws Throwable {
    Object o = parameters;
    Map<String, Object> params = null;
    if (o != null && Map.class.isAssignableFrom(o.getClass())) {
      params = (Map<String, Object>) o;
    } else if (o != null) {
      params = new HashMap<>();
      for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(o.getClass())) {
        params.put(f.getName(), ReflectionHelper.getValue(f, o));
      }
    }

    List<Object> vs = new ArrayList<>();
    int pos = 0;
    for (Parameter p : m.getParameters()) {
      Class<?> pgc = ReflectionHelper.getGenericClass(p.getParameterizedType());

      if (((instance instanceof Listing || Modifier.isStatic(m.getModifiers()))
              && Set.class.isAssignableFrom(p.getType())
              && (m.getDeclaringClass().equals(pgc)
                  || (instance instanceof Listing
                      && ReflectionHelper.getGenericClass(instance.getClass(), Listing.class, "C")
                          .equals(pgc))))
          || (pendingSelection != null && Set.class.isAssignableFrom(p.getType()))) {
        vs.add(pendingSelection);
      } else if (params != null && params.containsKey(p.getName())) {
        vs.add(params.get(p.getName()));
      } else if (o != null && ReflectionHelper.getFieldByName(o.getClass(), p.getName()) != null) {
        vs.add(
            ReflectionHelper.getValue(
                ReflectionHelper.getFieldByName(o.getClass(), p.getName()), o));
      } else {
        Object v = null;
        if (int.class.equals(p.getType())) v = 0;
        if (long.class.equals(p.getType())) v = 0l;
        if (float.class.equals(p.getType())) v = 0f;
        if (double.class.equals(p.getType())) v = 0d;
        if (boolean.class.equals(p.getType())) v = false;
        vs.add(v);
      }
      pos++;
    }

    {
      Object[] args = vs.toArray();
      if (!Modifier.isStatic(m.getModifiers()) && instance == null)
        instance = ReflectionHelper.newInstance(m.getDeclaringClass());
      if (instance != null && !Modifier.isPublic(instance.getClass().getModifiers()))
        m.setAccessible(true);
      else if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);
      return m.invoke(instance, args);
    }
  }
}
