package io.mateu.core.domain.model.reflection;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.outbound.i18n.Translator;
import io.mateu.core.domain.model.reflection.usecases.*;
import io.mateu.core.domain.model.util.beanutils.MiURLConverter;
import io.mateu.core.domain.model.util.data.Pair;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.infra.MateuConfiguratorBean;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.lang.reflect.Parameter;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.beanutils.converters.BooleanConverter;
import org.apache.commons.beanutils.converters.DoubleConverter;
import org.apache.commons.beanutils.converters.IntegerConverter;
import org.apache.commons.beanutils.converters.LongConverter;
import org.reflections.Reflections;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ReflectionHelper {

  final ValueProvider valueProvider;
  final BasicTypeChecker basicTypeChecker;
  final Translator translator;
  final MateuConfiguratorBean beanProvider;
  final FieldInterfacedFactory fieldInterfacedFactory;
  final Humanizer humanizer;
  private final GetterProvider getterProvider;
  private final SetterProvider setterProvider;
  private final ValueWriter valueWriter;
  private final FieldByNameProvider fieldByNameProvider;
  private final AllFieldsProvider allFieldsProvider;
  private final MethodProvider methodProvider;
  private final AllMethodsProvider allMethodsProvider;
  private final IdFieldProvider idFieldProvider;
  private final IdProvider idProvider;
  private final VersionFieldProvider versionFieldProvider;
  private final NameFieldProvider nameFieldProvider;
  private final MapperFieldProvider mapperFieldProvider;
  private final GenericClassProvider genericClassProvider;
  private final TypeProvider typeProvider;
  private final AllEditableFieldsProvider allEditableFieldsProvider;
  private final AllTransferrableFieldsProvider allTransferrableFieldsProvider;
  private final SubclassProvider subclassProvider;

  Map<Class, List<FieldInterfaced>> allFieldsCache = new HashMap<>();
  Map<Class, List<Method>> allMethodsCache = new HashMap<>();
  Map<String, Method> methodCache = new HashMap<>();
  List<Class> notFromString = new ArrayList<>();
  private ObjectMapper mapper = new ObjectMapper();

  public ReflectionHelper(
          ValueProvider valueProvider, BasicTypeChecker basicTypeChecker, Translator translator,
          MateuConfiguratorBean beanProvider,
          FieldInterfacedFactory fieldInterfacedFactory,
          Humanizer humanizer, GetterProvider getterProvider, SetterProvider setterProvider, ValueWriter valueWriter, FieldByNameProvider fieldByNameProvider, AllFieldsProvider allFieldsProvider, MethodProvider methodProvider, AllMethodsProvider allMethodsProvider, IdFieldProvider idFieldProvider, IdProvider idProvider, VersionFieldProvider versionFieldProvider, NameFieldProvider nameFieldProvider, MapperFieldProvider mapperFieldProvider, GenericClassProvider genericClassProvider, TypeProvider typeProvider, AllEditableFieldsProvider allEditableFieldsProvider, AllTransferrableFieldsProvider allTransferrableFieldsProvider, SubclassProvider subclassProvider) {
      this.valueProvider = valueProvider;
      this.basicTypeChecker = basicTypeChecker;
      this.translator = translator;
    this.beanProvider = beanProvider;
    this.fieldInterfacedFactory = fieldInterfacedFactory;
    this.humanizer = humanizer;
    ConvertUtils.register(new IntegerConverter(null), Integer.class);
    ConvertUtils.register(new LongConverter(null), Long.class);
    ConvertUtils.register(new DoubleConverter(null), Double.class);
    ConvertUtils.register(new BooleanConverter(null), Boolean.class);
    ConvertUtils.register(new MiURLConverter(), URL.class);
    this.getterProvider = getterProvider;
    this.setterProvider = setterProvider;
    this.valueWriter = valueWriter;
    this.fieldByNameProvider = fieldByNameProvider;
    this.allFieldsProvider = allFieldsProvider;
    this.methodProvider = methodProvider;
    this.allMethodsProvider = allMethodsProvider;
    this.idFieldProvider = idFieldProvider;
    this.idProvider = idProvider;
    this.versionFieldProvider = versionFieldProvider;
    this.nameFieldProvider = nameFieldProvider;
    this.mapperFieldProvider = mapperFieldProvider;
    this.genericClassProvider = genericClassProvider;
    this.typeProvider = typeProvider;
    this.allEditableFieldsProvider = allEditableFieldsProvider;
    this.allTransferrableFieldsProvider = allTransferrableFieldsProvider;
    this.subclassProvider = subclassProvider;
  }

  public boolean isBasic(Class c) {
    return basicTypeChecker.isBasic(c);
  }

  public boolean isBasic(Object o) {
    return basicTypeChecker.isBasic(o);
  }


  public Object getValue(Field f, Object o) {
    return valueProvider.getValue(f, o);
  }

  public void setValue(FieldInterfaced f, Object o, Object v)
      throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
    valueWriter.setValue(f, o, v);
  }

  public void setValue(String fn, Object o, Object v)
      throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
    valueWriter.setValue(fn, o, v);
  }

  public Object getValue(FieldInterfaced f, Object o, Object valueIfNull) {
    return valueProvider.getValue(f, o, valueIfNull);
  }

  public Object getValue(FieldInterfaced f, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return valueProvider.getValue(f, o);
  }

  public Object getValue(AnnotatedElement e, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return valueProvider.getValue(e, o);
  }

  public Object getValue(String id, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return valueProvider.getValue(id, o);
  }



  public Method getMethod(Class<?> c, String methodName) {
    return methodProvider.getMethod(c, methodName);
  }

  public List<Method> getAllMethods(Class c) {
    return allMethodsProvider.getAllMethods(c);
  }



  public List<FieldInterfaced> getAllFields(Class c) {
    return allFieldsProvider.getAllFields(c);
  }

  public List<FieldInterfaced> getAllFields(Method m) {
    return allFieldsProvider.getAllFields(m);
  }


  public Object getId(Object model) {
    return idProvider.getId(model);
  }

  public FieldInterfaced getIdField(Class type) {
    return idFieldProvider.getIdField(type);
  }

  public Field getVersionField(Class c) {
    return versionFieldProvider.getVersionField(c);
  }

  public FieldInterfaced getNameField(Class entityClass, boolean toStringPreferred) {
    return nameFieldProvider.getNameField(entityClass, toStringPreferred);
  }

  public FieldInterfaced getFieldByName(Class sourceClass, String fieldName) {
    return fieldByNameProvider.getFieldByName(sourceClass, fieldName);
  }

  public FieldInterfaced getMapper(FieldInterfaced field) {
    return mapperFieldProvider.getMapper(field);
  }

  public Class getGenericClass(
      FieldInterfaced field, Class asClassOrInterface, String genericArgumentName) {
    return genericClassProvider.getGenericClass(field, asClassOrInterface, genericArgumentName);
  }

  public Class getGenericClass(
      AnnotatedElement field, Class asClassOrInterface, String genericArgumentName) {
    return genericClassProvider.getGenericClass(field, asClassOrInterface, genericArgumentName);
  }

  public Class getGenericClass(
      ParameterizedType parameterizedType, Class asClassOrInterface, String genericArgumentName) {
    return genericClassProvider.getGenericClass(parameterizedType, asClassOrInterface, genericArgumentName);
  }

  public Class getGenericClass(
      Class sourceClass, Class asClassOrInterface, String genericArgumentName) {
    return genericClassProvider.getGenericClass(sourceClass, asClassOrInterface, genericArgumentName);
  }

  public Class getGenericClass(
      ParameterizedType parameterizedType,
      Class sourceClass,
      Class asClassOrInterface,
      String genericArgumentName) {
    return genericClassProvider.getGenericClass(parameterizedType, sourceClass, asClassOrInterface, genericArgumentName);
  }

  public List<FieldInterfaced> getAllTransferrableFields(Class modelType) {
    return allTransferrableFieldsProvider.getAllTransferrableFields(modelType);
  }

  public List<FieldInterfaced> getAllEditableFields(Class modelType) {
    return allEditableFieldsProvider.getAllEditableFilteredFields(modelType, null, null);
  }

  public List<FieldInterfaced> getAllEditableFields(
      Class modelType, Class superType, boolean includeReverseMappers) {
    return allEditableFieldsProvider.getAllEditableFields(modelType, superType, includeReverseMappers, null);
  }

  public List<FieldInterfaced> getAllEditableFields(
      Class modelType, Class superType, boolean includeReverseMappers, FieldInterfaced field) {
    return allEditableFieldsProvider.getAllEditableFields(modelType, superType, includeReverseMappers, field);
  }



  private List<FieldInterfaced> getAllInjectedFields(Class<?> type) {
    List<FieldInterfaced> r = new ArrayList<>();
    var allFields = getAllFields(type);
    for (FieldInterfaced f : allFields) {
      if (f.isAnnotationPresent(Autowired.class) || Modifier.isFinal(f.getModifiers())) r.add(f);
    }
    return r;
  }

  public Class<?> getGenericClass(Class type) {
    return genericClassProvider.getGenericClass(type);
  }

  public Class<?> getGenericClass(Type type) {
    return genericClassProvider.getGenericClass(type);
  }

  public Set<Class> getSubclasses(Class c) {
    return subclassProvider.getSubclasses(c);
  }

  public Class<?> getGenericClass(Method m) {
    return genericClassProvider.getGenericClass(m);
  }

  public void copy(Object from, Object to) {
    if (from != null && to != null) {
      if (from.getClass().equals(to.getClass())) {
        for (FieldInterfaced f : getAllTransferrableFields(to.getClass())) {
          try {
            setValue(f, to, getValue(f, from));
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
        for (FieldInterfaced f : getAllInjectedFields(to.getClass())) {
          try {
            copy(getValue(f, from), getValue(f, to));
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      } else {
        for (FieldInterfaced f2 : getAllTransferrableFields(to.getClass())) {
          try {
            FieldInterfaced f1 = getFieldByName(from.getClass(), f2.getName());
            if (f1 != null && f1.getType().equals(f2.getType()))
              setValue(f2, to, getValue(f1, from));
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      }
    }
  }

  public Object newInstance(Constructor c, Object params) throws Throwable {
    List<Object> vs = new ArrayList<>();
    for (Parameter p : c.getParameters()) {
      if (params != null && getFieldByName(params.getClass(), p.getName()) != null) {
        vs.add(getValue(getFieldByName(params.getClass(), p.getName()), params));
      } else {
        Object v = null;
        if (int.class.equals(p.getType())) v = 0;
        if (long.class.equals(p.getType())) v = 0l;
        if (float.class.equals(p.getType())) v = 0f;
        if (double.class.equals(p.getType())) v = 0d;
        if (boolean.class.equals(p.getType())) v = false;
        vs.add(v);
      }
    }
    Object[] args = vs.toArray();
    return c.newInstance(args);
  }

  public <T> T newInstance(Class<T> c)
      throws NoSuchMethodException,
          IllegalAccessException,
          InvocationTargetException,
          InstantiationException {
    Object o = null;
    if (!notFromString.contains(c)) {
      // intentar recuperar del contexto
      o = beanProvider.getBean(c);
    }
    if (o == null) { // no viene de spring
      if (c.getDeclaringClass() != null) { // caso inner class
        Object p = newInstance(c.getDeclaringClass());
        Constructor<?> cons =
            Arrays.stream(c.getDeclaredConstructors())
                .filter(constructor -> constructor.getParameterCount() == 1)
                .findFirst()
                .get();
        cons.setAccessible(true);
        o = cons.newInstance(p);
      } else {
        Constructor con = getConstructor(c);
        if (con != null) {
          o = con.newInstance();
        } else {
          Method builderMethod = null;
          try {
            builderMethod = c.getMethod("builder");
          } catch (Exception ignored) {

          }
          if (builderMethod != null) {
            Object builder = c.getMethod("builder").invoke(null);
            o = builder.getClass().getMethod("build").invoke(builder);
          } else {
            if (c.getDeclaredConstructors().length == 1) {
              Constructor constructor = c.getDeclaredConstructors()[0];
              o = constructor.newInstance(newInstance(constructor.getParameterTypes()[0]));
            }
          }
        }
      }
      notFromString.add(c);
    }
    return (T) o;
  }

  public Object newInstance(Class c, Object parent)
      throws IllegalAccessException,
          InstantiationException,
          InvocationTargetException,
          NoSuchMethodException {
    Object i = null;
    if (parent != null) {
      Constructor con = getConstructor(c, parent.getClass());
      if (con != null) i = con.newInstance(parent);
      else {
        con =
            Arrays.stream(c.getDeclaredConstructors())
                .filter(x -> x.getParameterCount() == 0)
                .findFirst()
                .orElse(null);
        if (!Modifier.isPublic(con.getModifiers())) con.setAccessible(true);
        i = con.newInstance();
        for (FieldInterfaced f : getAllFields(c))
          if (f.getType().equals(parent.getClass()) && f.isAnnotationPresent(NotNull.class)) {
            setValue(f, i, parent);
            break;
          }
      }
    } else {
      Constructor con = getConstructor(c);
      if (con != null) {
        i = con.newInstance();
      } else if (c.getMethod("builder") != null) {
        Object builder = c.getMethod("builder").invoke(null);
        i = builder.getClass().getMethod("build").invoke(builder);
      }
    }
    return i;
  }

  public Constructor getConstructor(Class type) {
    Constructor con = null;
    int minParams = Integer.MAX_VALUE;
    for (Constructor x : type.getConstructors())
      if (Modifier.isPublic(x.getModifiers())) {
        if (x.getParameterCount() < minParams) {
          con = x;
          minParams = con.getParameterCount();
        }
      }
    return con;
  }

  public Constructor getConstructor(Class c, Class parameterClass) {
    Constructor con = null;
    while (con == null && !Object.class.equals(parameterClass)) {
      try {
        con = c.getConstructor(parameterClass);
      } catch (NoSuchMethodException e) {
      }
      if (con == null) {
        parameterClass = parameterClass.getSuperclass();
      }
    }
    return con;
  }

  public String toHtml(Object o) {
    StringWriter sw;
    PrintWriter pw = new PrintWriter(sw = new StringWriter());
    toHtml(pw, o, new ArrayList<>());
    return sw.toString();
  }

  public void toHtml(PrintWriter pw, Object o, List visited) {
    if (o == null) {
    } else {
      if (!visited.contains(o)) {
        visited.add(o);
      }
      pw.println("<table>");
      for (FieldInterfaced f : getAllFields(o.getClass())) {
        try {
          Object i = getValue(f, o);

          pw.println(
              "<tr><td style='text-align:right; font-style:italic;'>"
                  + humanizer.capitalize(f.getName())
                  + ":</td><td>");
          if (i != null) {
            if (basicTypeChecker.isBasic(i)) {
              pw.print("" + i);
            } else {
              // todo: añadir casos collection y map
              toHtml(pw, i, visited);
            }
          }
          pw.println("</td></tr>");

        } catch (Exception e1) {
          e1.printStackTrace();
        }
      }
      pw.println("</table>");
    }
  }

  public String toJson(Object o) {
    if (o == null) return null;
    ObjectWriter ow = mapper.writer().withDefaultPrettyPrinter();
    try {
      String json = ow.writeValueAsString(o);
      return json;
    } catch (JsonProcessingException e) {
      e.printStackTrace();
      return null;
    }
  }

  public Object fromJson(String json) {
    try {
      return mapper.reader().readValue(json);
    } catch (JsonProcessingException e) {
      e.printStackTrace();
      return null;
    }
  }

  public <T> Collection<T> extend(Collection<T> list, T o) {
    if (list == null) return null;
    if (list instanceof ImmutableList) {
      return extend((ImmutableList<T>) list, o);
    } else if (list instanceof ImmutableSet) {
      return extend((ImmutableSet<T>) list, o);
    } else if (Set.class.isAssignableFrom(list.getClass())) {
      return extend((Set) list, o);
    } else {
      return extend((List) list, o);
    }
  }

  public <T> List<T> extend(List<T> list, T o) {
    List<T> l = new ArrayList<T>(list);
    l.add(o);
    return l;
  }

  public <T> ImmutableList<T> extend(ImmutableList<T> list, T o) {
    List<T> l = new ArrayList<>(list);
    l.add(o);
    return ImmutableList.copyOf(l);
  }

  public <T> Set<T> extend(Set<T> list, T o) {
    Set<T> l = new HashSet<>(list);
    l.add(o);
    return l;
  }

  public <T> ImmutableSet<T> extend(ImmutableSet<T> list, T o) {
    Set<T> l = new HashSet<>(list);
    l.add(o);
    return ImmutableSet.copyOf(l);
  }

  public <K, V> Map<K, V> extend(Map<K, V> list, K k, V v) {
    Map<K, V> l = new HashMap<>(list);
    l.put(k, v);
    return l;
  }

  public <K, V> ImmutableMap<K, V> extend(ImmutableMap<K, V> list, K k, V v) {
    Map<K, V> l = new HashMap<>(list);
    l.put(k, v);
    return ImmutableMap.copyOf(l);
  }

  public <T> Collection<T> remove(Collection<T> list, T o) {
    if (list == null) return null;
    if (list instanceof ImmutableList) {
      return remove((ImmutableList<T>) list, o);
    } else if (list instanceof ImmutableSet) {
      return remove((ImmutableSet<T>) list, o);
    } else if (Set.class.isAssignableFrom(list.getClass())) {
      return remove((Set) list, o);
    } else {
      return remove((List) list, o);
    }
  }

  public <T> List<T> remove(List<T> list, T o) {
    if (list == null) return null;
    List<T> l = new ArrayList<T>(list);
    l.remove(o);
    return l;
  }

  public <T> Set<T> remove(Set<T> list, T o) {
    if (list == null) return null;
    Set<T> l = new HashSet<>(list);
    l.remove(o);
    return l;
  }

  public <T> ImmutableList<T> remove(ImmutableList<T> list, T o) {
    if (list == null) return null;
    List<T> l = new ArrayList<>(list);
    l.remove(o);
    return ImmutableList.copyOf(l);
  }

  public <T> ImmutableSet<T> remove(ImmutableSet<T> list, T o) {
    if (list == null) return null;
    Set<T> l = new HashSet<>(list);
    l.remove(o);
    return ImmutableSet.copyOf(l);
  }

  public <K, V> ImmutableMap<K, V> remove(ImmutableMap<K, V> list, K o) {
    if (list == null) return null;
    Map<K, V> l = new HashMap<>(list);
    l.remove(o);
    return ImmutableMap.copyOf(l);
  }

  public <T> Collection<T> removeAll(Collection<T> list, Collection o) {
    if (list == null) return null;
    if (list instanceof ImmutableList) {
      return removeAll((ImmutableList<T>) list, o);
    } else if (list instanceof ImmutableSet) {
      return removeAll((ImmutableSet<T>) list, o);
    } else if (Set.class.isAssignableFrom(list.getClass())) {
      return removeAll((Set) list, o);
    } else {
      return removeAll((List) list, o);
    }
  }

  public <T> List<T> removeAll(List<T> list, Collection o) {
    if (list == null) return null;
    List<T> l = new ArrayList<T>(list);
    l.removeAll(o);
    return l;
  }

  public <T> Set<T> removeAll(Set<T> list, Collection o) {
    if (list == null) return null;
    Set<T> l = new HashSet<>(list);
    l.removeAll(o);
    return l;
  }

  public <T> ImmutableList<T> removeAll(ImmutableList<T> list, Collection o) {
    if (list == null) return null;
    List<T> l = new ArrayList<>(list);
    l.removeAll(o);
    return ImmutableList.copyOf(l);
  }

  public <T> ImmutableSet<T> removeAll(ImmutableSet<T> list, Collection o) {
    if (list == null) return null;
    Set<T> l = new HashSet<>(list);
    l.removeAll(o);
    return ImmutableSet.copyOf(l);
  }

  public boolean isOverridden(Object instance, String methodName) {
    Method m = getMethod(instance.getClass(), methodName);
    return m != null
        && !m.getDeclaringClass().equals(Object.class)
        && !m.getDeclaringClass().isInterface();
  }

  public Object invokeInjectableParametersOnly(Method method, Object instance) throws Throwable {
    return execute(method, new Object(), instance, null);
  }

  public Object execute(Method m, Object parameters, Object instance, Set pendingSelection)
      throws Throwable {
    Object o = parameters;
    Map<String, Object> params = null;
    if (o != null && Map.class.isAssignableFrom(o.getClass())) {
      params = (Map<String, Object>) o;
    } else if (o != null) {
      params = new HashMap<>();
      for (FieldInterfaced f : getAllEditableFields(o.getClass())) {
        params.put(f.getName(), getValue(f, o));
      }
    }

    List<Object> vs = new ArrayList<>();
    int pos = 0;
    for (Parameter p : m.getParameters()) {
      Class<?> pgc = getGenericClass(p.getParameterizedType());

      if (((instance instanceof Listing || Modifier.isStatic(m.getModifiers()))
              && Set.class.isAssignableFrom(p.getType())
              && (m.getDeclaringClass().equals(pgc)
                  || (instance instanceof Listing
                      && getGenericClass(instance.getClass(), Listing.class, "C").equals(pgc))))
          || (pendingSelection != null && Set.class.isAssignableFrom(p.getType()))) {
        vs.add(pendingSelection);
      } else if (params != null && params.containsKey(p.getName())) {
        vs.add(params.get(p.getName()));
      } else if (o != null && getFieldByName(o.getClass(), p.getName()) != null) {
        vs.add(getValue(getFieldByName(o.getClass(), p.getName()), o));
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
        instance = newInstance(m.getDeclaringClass());
      if (instance != null && !Modifier.isPublic(instance.getClass().getModifiers()))
        m.setAccessible(true);
      else if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);
      return m.invoke(instance, args);
    }
  }

  public Class getType(AnnotatedElement f) {
    return typeProvider.getType(f);
  }

}
