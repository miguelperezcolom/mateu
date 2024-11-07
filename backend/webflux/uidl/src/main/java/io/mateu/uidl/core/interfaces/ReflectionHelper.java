package io.mateu.uidl.core.interfaces;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.util.List;

public interface ReflectionHelper {

  List<Method> getAllMethods(Class c);

  Class getGenericClass(
      ParameterizedType parameterizedType, Class asClassOrInterface, String genericArgumentName);

  Method getMethod(Class<?> c, String methodName);
}
