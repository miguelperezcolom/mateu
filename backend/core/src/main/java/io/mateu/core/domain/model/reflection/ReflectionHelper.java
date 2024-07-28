package io.mateu.core.domain.model.reflection;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import io.mateu.core.domain.model.i18n.Translator;
import io.mateu.core.domain.uidefinition.shared.SlimHelper;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import io.mateu.core.domain.model.util.Helper;
import io.mateu.core.domain.model.util.data.Pair;
import io.mateu.core.infra.MateuConfiguratorBean;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.lang.reflect.Parameter;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.beanutils.BeanUtilsBean;
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
public class ReflectionHelper extends BaseReflectionHelper {

  final Translator translator;
  final MateuConfiguratorBean beanProvider;
  final FieldInterfacedFactory fieldInterfacedFactory;

  Map<Class, List<FieldInterfaced>> allFieldsCache = new HashMap<>();
  Map<Class, List<Method>> allMethodsCache = new HashMap<>();
  Map<String, Method> methodCache = new HashMap<>();
  List<Class> notFromString = new ArrayList<>();
  private ObjectMapper mapper = new ObjectMapper();

  public ReflectionHelper(
      Translator translator,
      MateuConfiguratorBean beanProvider,
      FieldInterfacedFactory fieldInterfacedFactory) {
    this.translator = translator;
    this.beanProvider = beanProvider;
    this.fieldInterfacedFactory = fieldInterfacedFactory;
    BeanUtilsBean beanUtilsBean = BeanUtilsBean.getInstance();
    beanUtilsBean.getConvertUtils().register(new IntegerConverter(null), Integer.class);
    beanUtilsBean.getConvertUtils().register(new LongConverter(null), Long.class);
    beanUtilsBean.getConvertUtils().register(new DoubleConverter(null), Double.class);
    beanUtilsBean.getConvertUtils().register(new BooleanConverter(null), Boolean.class);
  }

  public Object getValue(Field f, Object o) {
    if (f == null) {
      return null;
    }
    Method getter = null;
    try {
      getter = o.getClass().getMethod(getGetter(f));
    } catch (Exception ignored) {

    }
    Object v = null;
    try {
      if (getter != null) v = getter.invoke(o);
      else {
        if (!Modifier.isPublic(f.getModifiers())) f.setAccessible(true);
        v = f.get(o);
      }
    } catch (IllegalAccessException | InvocationTargetException e) {
      log.error("when getting value for field " + f.getName(), e);
    }
    return v;
  }

  public void setValue(FieldInterfaced f, Object o, Object v)
      throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
    if (f == null) {
      return;
    }
    if (f instanceof FieldInterfacedForCheckboxColumn) {
      f.setValue(o, v);
    } else if (f instanceof FieldInterfacedFromField) {
      Method setter = null;
      try {
        setter = o.getClass().getMethod(getSetter(f), f.getType());
      } catch (Exception ignored) {
      }
      try {
        if (setter != null) {
          setter.invoke(o, v);
          //                        BeanUtils.setProperty(o, fn, v);
        } else {
          if (!Modifier.isPublic(f.getField().getModifiers())) f.getField().setAccessible(true);
          f.getField().set(o, v);
        }
      } catch (IllegalAccessException | InvocationTargetException e) {
        log.error("when setting value for field " + f.getName(), e);
      }
    } else setValue(f.getId(), o, v);
  }

  public void setValue(String fn, Object o, Object v)
      throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
    if (Map.class.isAssignableFrom(o.getClass())) {
      ((Map) o).put(fn, v);
    } else {
      if (fn.contains(".")) {
        o = getInstance(o, fn.substring(0, fn.indexOf(".")));
        setValue(fn.substring(fn.indexOf(".") + 1), o, v);
      } else {
        if (v instanceof Collection) {
          if (v instanceof List) v = new ArrayList((Collection) v);
          else if (v instanceof Set) v = new HashSet((Collection) v);
        }

        FieldInterfaced f = getFieldByName(o.getClass(), fn);

        setValue(f, o, v);
      }
    }
  }

  public Object getValue(FieldInterfaced f, Object o, Object valueIfNull) {
    Object v = null;
    try {
      v = getValue(f, o);
    } catch (NoSuchMethodException e) {
      e.printStackTrace();
    } catch (IllegalAccessException e) {
      e.printStackTrace();
    } catch (InvocationTargetException e) {
      e.printStackTrace();
    }
    return v != null ? v : valueIfNull;
  }

  public Object getValue(FieldInterfaced f, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

    if (o == null) return null;

    if (Map.class.isAssignableFrom(o.getClass())) {
      return ((Map) o).get(f.getName());
    } else if (f instanceof FieldInterfacedForCheckboxColumn) {
      return f.getValue(o);
    } else {
      return getValue(f.getId(), o);
    }
  }

  public Object getValue(AnnotatedElement e, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

    if (o == null) return null;

    if (e instanceof FieldInterfaced f) {
      if (Map.class.isAssignableFrom(o.getClass())) {
        return ((Map<?, ?>) o).get(f.getName());
      } else if (f instanceof FieldInterfacedForCheckboxColumn) {
        return f.getValue(o);
      } else {
        return getValue(f.getId(), o);
      }
    } else if (e instanceof Method m) {
      return m.invoke(o);
    } else {
      return null;
    }
  }

  public Object getValue(String id, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    Object v = null;

    if (id.contains(".")) {
      String firstId = id.substring(0, id.indexOf("."));
      String path = id.substring(id.indexOf(".") + 1);

      Method getter = null;
      try {
        FieldInterfaced f = getFieldByName(o.getClass(), firstId);

        if (f != null) {

          try {
            getter = o.getClass().getMethod(getGetter(f.getType(), firstId));
          } catch (Exception e) {

          }

          if (getter != null) v = getter.invoke(o);
          else {
            try {
              if (f instanceof FieldInterfacedFromField) {
                Field field = f.getField();
                if (!Modifier.isPublic(field.getModifiers())) {
                  field.setAccessible(true);
                }
                v = field.get(o);
              }
            } catch (Exception e) {
              e.printStackTrace();
            }
          }

          if (v != null) {
            v = getValue(path, v);
          }
        }

      } catch (Exception e) {
      }

    } else {
      FieldInterfaced f = getFieldByName(o.getClass(), id);

      if (f != null) {

        Method getter = null;
        try {
          getter = o.getClass().getMethod(getGetter(f.getType(), id));
        } catch (Exception e) {

        }
        try {
          if (getter != null) v = getter.invoke(o);
          else {
            try {
              if (f instanceof FieldInterfacedFromField) {
                Field field = f.getField();
                if (!Modifier.isPublic(field.getModifiers())) {
                  field.setAccessible(true);
                }
                v = field.get(o);
              }
            } catch (Exception e) {
              e.printStackTrace();
            }
          }
        } catch (IllegalAccessException e) {
          e.printStackTrace();
        } catch (InvocationTargetException e) {
          e.printStackTrace();
        }
      }
    }

    return v;
  }

  private Object getInstance(Object o, String fn)
      throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    Object x = null;
    if (o != null) {
      if (fn.contains(".")) {
        o = getInstance(o, fn.substring(0, fn.indexOf(".")));
        x = getInstance(o, fn.substring(fn.indexOf(".") + 1));
      } else {
        x = o.getClass().getMethod(getGetter(fn)).invoke(o);
      }
    }
    return x;
  }

  public Method getMethod(Class<?> c, String methodName) {
    if (c == null) {
      log.debug("getMethod(" + null + ", " + methodName + ") devolverá null!");
      return null;
    }
    Method l = methodCache.get(c.getName() + "-" + methodName);
    if (l == null) {
      methodCache.put(c.getName() + "-" + methodName, l = buildMethod(c, methodName));
    }
    return l;
  }

  public Method buildMethod(Class<?> c, String methodName) {
    Method m = null;
    if (c != null)
      for (Method q : getAllMethods(c)) {
        if (methodName.equals(q.getName())) {
          m = q;
          break;
        }
      }
    return m;
  }

  public String getGetter(Field f) {
    return getGetter(f.getType(), f.getName());
  }

  public String getGetter(FieldInterfaced f) {
    return getGetter(f.getType(), f.getName());
  }

  public String getGetter(Class c, String fieldName) {
    return (boolean.class.equals(c) ? "is" : "get") + getFirstUpper(fieldName);
  }

  public String getGetter(String fn) {
    return "get" + getFirstUpper(fn);
  }

  public String getSetter(Field f) {
    return getSetter(f.getType(), f.getName());
  }

  public String getSetter(FieldInterfaced f) {
    return getSetter(f.getType(), f.getName());
  }

  public String getSetter(Class c, String fieldName) {
    return "set" + getFirstUpper(fieldName);
  }

  public List<Method> getAllMethods(Class c) {
    List<Method> l = _getAllMethods(c);

    List<Method> r = new ArrayList<>();

    for (Method m : l) {
      if (check(m)) r.add(m);
    }

    return r;
  }

  public List<Method> _getAllMethods(Class c) {
    List<Method> l = allMethodsCache.get(c);

    if (l == null) {
      allMethodsCache.put(c, l = buildAllMethods(c));
    }

    return l;
  }

  public List<Method> buildAllMethods(Class c) {
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

  private Method getMethod(Class c, String methodName, Class<?>... parameterTypes)
      throws NoSuchMethodException {
    Method m = c.getClass().getDeclaredMethod(methodName, parameterTypes);

    if (m == null
        && c.getSuperclass() != null
        && (!c.isAnnotationPresent(Entity.class)
            || c.getSuperclass().isAnnotationPresent(Entity.class)
            || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class)))
      m = getMethod(c.getSuperclass(), methodName, parameterTypes);

    return m;
  }

  public List<FieldInterfaced> getAllFields(Class c) {
    List<FieldInterfaced> l = allFieldsCache.get(c);

    if (l == null) {
      l = buildAllFields(c);
      allFieldsCache.put(c, l);
    }

    return new ArrayList<>(l);
  }

  private List<FieldInterfaced> buildAllFields(Class c) {
    List<String> vistos = new ArrayList<>();
    Map<String, Field> originales = new HashMap<>();
    for (Field f : c.getDeclaredFields())
      if (!Logger.class.isAssignableFrom(f.getType())) {
        if (!f.getName().contains("$")
            && !"_proxied".equalsIgnoreCase(f.getName())
            && !"_possibleValues".equalsIgnoreCase(f.getName())
            && !"_binder".equalsIgnoreCase(f.getName())
            && !"_field".equalsIgnoreCase(f.getName())) originales.put(f.getName(), f);
      }

    List<FieldInterfaced> l = new ArrayList<>();

    if (c.getSuperclass() != null
        && (!c.isAnnotationPresent(Entity.class)
            || c.getSuperclass().isAnnotationPresent(Entity.class)
            || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class))) {
      for (FieldInterfaced f : getAllFields(c.getSuperclass())) {
        if (!originales.containsKey(f.getId())) l.add(f);
        else
          l.add(
              fieldInterfacedFactory.getFieldInterfacedFromField(
                  originales.get(f.getName()), this));
        vistos.add(f.getName());
      }
    }

    for (Field f : c.getDeclaredFields())
      if (!Modifier.isStatic(f.getModifiers()))
        if (!f.isAnnotationPresent(Version.class))
          if (!Logger.class.isAssignableFrom(f.getType()))
            if (!vistos.contains(f.getName()))
              if (!f.getName().contains("$")
                  && !"_proxied".equalsIgnoreCase(f.getName())
                  && !"_possibleValues".equalsIgnoreCase(f.getName())
                  && !"_binder".equalsIgnoreCase(f.getName())
                  && !"_field".equalsIgnoreCase(f.getName())) {
                l.add(fieldInterfacedFactory.getFieldInterfacedFromField(f, this));
              }

    return l;
  }

  public boolean hasGetter(FieldInterfaced f) {
    return getMethod(f.getDeclaringClass(), getGetter(f)) != null;
  }

  public boolean hasSetter(FieldInterfaced f) {
    return getMethod(f.getDeclaringClass(), getSetter(f)) != null;
  }

  public List<FieldInterfaced> getAllFields(Method m) {

    List<FieldInterfaced> l = new ArrayList<>();

    for (Parameter p : m.getParameters())
      if (!isInjectable(m, p)) {
        l.add(fieldInterfacedFactory.getFieldInterfacedFromParameter(m, p, this));
      }

    return l;
  }

  public boolean isInjectable(Executable m, Parameter p) {
    boolean injectable = true;
    if (EntityManager.class.equals(p.getType())) {
    } else {
      injectable = false;
    }
    return injectable;
  }

  private Map<String, FieldInterfaced> getAllFieldsMap(Class c) {
    return getAllFieldsMap(getAllFields(c));
  }

  private Map<String, FieldInterfaced> getAllFieldsMap(List<FieldInterfaced> l) {

    Map<String, FieldInterfaced> m = new HashMap<>();

    for (FieldInterfaced f : l) m.put(f.getName(), f);

    return m;
  }

  public Object getId(Object model) {
    if (model instanceof Object[]) return ((Object[]) model)[0];
    if (model instanceof Pair) return ((Pair) model).getKey();
    if (model.getClass().isAnnotationPresent(Entity.class)) {
      Object id = null;
      try {
        FieldInterfaced idField = getIdField(model.getClass());
        id = getValue(idField, model);
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
      return id;
    } else if (model.getClass().isEnum()) {
      return ((Enum) model).ordinal();
    } else return model;
  }

  public FieldInterfaced getIdField(Class type) {
    if (type.isAnnotationPresent(Entity.class)) {
      FieldInterfaced idField = null;

      for (FieldInterfaced f : getAllFields(type)) {
        if (f.isAnnotationPresent(Id.class)) {
          idField = f;
          break;
        }
      }

      return idField;
    } else return null;
  }

  public Field getVersionField(Class c) {
    if (c.isAnnotationPresent(Entity.class)) {
      Field idField = null;

      if (c.getSuperclass() != null
          && (!c.isAnnotationPresent(Entity.class)
              || c.getSuperclass().isAnnotationPresent(Entity.class)
              || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class))) {
        idField = getVersionField(c.getSuperclass());
      }

      if (idField == null) {
        for (Field f : c.getDeclaredFields())
          if (f.isAnnotationPresent(Version.class)) {
            idField = f;
          }
      }

      return idField;
    } else return null;
  }

  public FieldInterfaced getNameField(Class entityClass, boolean toStringPreferred) {
    FieldInterfaced fName = null;
    Method toStringMethod = getMethod(entityClass, "toString");
    boolean toStringIsOverriden =
        toStringMethod != null && toStringMethod.getDeclaringClass().equals(entityClass);
    if (!toStringPreferred || !toStringIsOverriden) {
      boolean hayName = false;
      for (FieldInterfaced ff : getAllFields(entityClass))
        if (ff.isAnnotationPresent(LabelFieldForLists.class)) {
          fName = ff;
          hayName = true;
        }
      if (!hayName) {
        for (FieldInterfaced ff : getAllFields(entityClass))
          if ("name".equalsIgnoreCase(ff.getName()) || "nombre".equalsIgnoreCase(ff.getName())) {
            fName = ff;
            hayName = true;
          }
      }
      if (!hayName) {
        for (FieldInterfaced ff : getAllFields(entityClass))
          if ("value".equalsIgnoreCase(ff.getName())
              || "title".equalsIgnoreCase(ff.getName())
              || "titulo".equalsIgnoreCase(ff.getName())
              || "description".equalsIgnoreCase(ff.getName())
              || "descripcion".equalsIgnoreCase(ff.getName())) {
            fName = ff;
            hayName = true;
          }
      }
      if (!hayName) {
        for (FieldInterfaced ff : getAllFields(entityClass))
          if ("description".equalsIgnoreCase(ff.getName())
              || "descripcion".equalsIgnoreCase(ff.getName())) {
            fName = ff;
            hayName = true;
          }
      }
      if (!hayName) {
        for (FieldInterfaced ff : getAllFields(entityClass))
          if (ff.isAnnotationPresent(Id.class)) {
            fName = ff;
          }
      }
    }
    return fName;
  }

  public FieldInterfaced getFieldByName(Class sourceClass, String fieldName) {
    FieldInterfaced field = null;
    String fn = fieldName.split("\\.")[0];
    for (FieldInterfaced f : getAllFields(sourceClass)) {
      if (fn.equals(f.getName())) {
        if (fn.equals(fieldName)) {
          field = f;
        } else {
          field = getFieldByName(f.getType(), fieldName.substring(fn.length() + 1));
        }
        break;
      }
    }
    // if (field == null) log.warn("No field " + fieldName + " at " + sourceClass);
    return field;
  }

  public FieldInterfaced getMapper(FieldInterfaced field) {

    // field es el campo original

    // mapper será la contraparte en el destino
    FieldInterfaced mapper = null;

    // buscamos el nombre del campo mapper en el campo original
    String mfn = null;
    if (field.isAnnotationPresent(OneToOne.class))
      mfn = field.getAnnotation(OneToOne.class).mappedBy();
    else if (field.isAnnotationPresent(OneToMany.class))
      mfn = field.getAnnotation(OneToMany.class).mappedBy();
    else if (field.isAnnotationPresent(ManyToMany.class))
      mfn = field.getAnnotation(ManyToMany.class).mappedBy();
    else if (field.isAnnotationPresent(ManyToOne.class)) {

      // si es un campo many to one, entonces no tenemos atributo mappedBy en el origen y debemos
      // buscar un campo en la contraparte con el atributo mappedBy

      for (FieldInterfaced f : getAllFields(field.getType())) {
        String z = null;
        if (f.isAnnotationPresent(OneToOne.class)) z = f.getAnnotation(OneToOne.class).mappedBy();
        else if (f.isAnnotationPresent(OneToMany.class))
          z = f.getAnnotation(OneToMany.class).mappedBy();
        else if (f.isAnnotationPresent(ManyToMany.class))
          z = f.getAnnotation(ManyToMany.class).mappedBy();
        // debe coincidir el nombre y el tipo
        if (field.getName().equals(z)
            && (field.getDeclaringClass().equals(f.getType())
                || field.getDeclaringClass().equals(getGenericClass(f.getGenericType())))) {
          mfn = f.getName();
          break;
        }
      }
    }

    Class targetClass = null;
    if (Collection.class.isAssignableFrom(field.getType())
        || Set.class.isAssignableFrom(field.getType())) {
      targetClass = field.getGenericClass();
    } else if (Map.class.isAssignableFrom(field.getType())) {
      targetClass = getGenericClass(field, Map.class, "V");
    } else {
      targetClass = field.getType();
    }

    if (!Strings.isNullOrEmpty(mfn)) {
      mapper = getFieldByName(targetClass, mfn);

    } else {

      if (targetClass.isAnnotationPresent(Entity.class))
        for (FieldInterfaced f : getAllFields(targetClass)) {
          mfn = null;
          if (f.isAnnotationPresent(OneToOne.class))
            mfn = f.getAnnotation(OneToOne.class).mappedBy();
          else if (f.isAnnotationPresent(OneToMany.class))
            mfn = f.getAnnotation(OneToMany.class).mappedBy();
          else if (f.isAnnotationPresent(ManyToMany.class))
            mfn = f.getAnnotation(ManyToMany.class).mappedBy();

          if (field.getName().equals(mfn)) {

            Class reverseClass = null;
            if (Collection.class.isAssignableFrom(f.getType())
                || Set.class.isAssignableFrom(f.getType())) {
              reverseClass = f.getGenericClass();
            } else if (Map.class.isAssignableFrom(field.getType())) {
              reverseClass = getGenericClass(f, Map.class, "V");
            } else {
              reverseClass = f.getType();
            }

            if (reverseClass != null && field.getDeclaringClass().isAssignableFrom(reverseClass)) {
              mapper = f;
              break;
            }
          }
        }
    }

    return mapper;
  }

  public Class getGenericClass(
      FieldInterfaced field, Class asClassOrInterface, String genericArgumentName) {
    Type t = field.getGenericType();
    if (field.isAnnotationPresent(GenericClass.class))
      return field.getAnnotation(GenericClass.class).clazz();
    else
      return getGenericClass(
          (t instanceof ParameterizedType) ? (ParameterizedType) t : null,
          field.getType(),
          asClassOrInterface,
          genericArgumentName);
  }

  public Class getGenericClass(
      AnnotatedElement field, Class asClassOrInterface, String genericArgumentName) {
    Type t = getGenericType(field);
    if (field.isAnnotationPresent(GenericClass.class))
      return field.getAnnotation(GenericClass.class).clazz();
    else
      return getGenericClass(
          (t instanceof ParameterizedType) ? (ParameterizedType) t : null,
          getType(field),
          asClassOrInterface,
          genericArgumentName);
  }

  public Class getGenericClass(
      ParameterizedType parameterizedType, Class asClassOrInterface, String genericArgumentName) {
    return getGenericClass(
        parameterizedType,
        (Class) parameterizedType.getRawType(),
        asClassOrInterface,
        genericArgumentName);
  }

  public Class getGenericClass(
      Class sourceClass, Class asClassOrInterface, String genericArgumentName) {
    return getGenericClass(null, sourceClass, asClassOrInterface, genericArgumentName);
  }

  public Class getGenericClass(
      ParameterizedType parameterizedType,
      Class sourceClass,
      Class asClassOrInterface,
      String genericArgumentName) {
    Class c = null;

    if (asClassOrInterface.isInterface()) {

      // buscamos la clase (entre ella misma y las superclases) que implementa la interfaz o un
      // derivado
      // vamos bajando por las interfaces hasta encontrar una clase
      // si no tenemos la clase, vamos bajando por las subclases hasta encontrarla

      Class baseInterface = null;

      if (sourceClass.isInterface()) {
        baseInterface = sourceClass;

        List<Type> jerarquiaInterfaces = buscarInterfaz(sourceClass, asClassOrInterface);
        if (asClassOrInterface.equals(sourceClass))
          jerarquiaInterfaces = Lists.newArrayList(asClassOrInterface);

        boolean laImplementa = jerarquiaInterfaces != null;

        if (laImplementa) {

          jerarquiaInterfaces.add((parameterizedType != null) ? parameterizedType : sourceClass);

          // localizamos el parámetro y bajamos por las interfaces
          c = buscarHaciaAbajo(asClassOrInterface, genericArgumentName, jerarquiaInterfaces);
        }

      } else {

        // buscamos hasta la clase que implemente la interfaz o una subclase de la misma

        boolean laImplementa = false;

        List<Type> jerarquia = new ArrayList<>();
        List<Type> jerarquiaInterfaces = null;

        Type tipoEnCurso = (parameterizedType != null) ? parameterizedType : sourceClass;
        while (tipoEnCurso != null && !laImplementa) {

          jerarquiaInterfaces = buscarInterfaz(tipoEnCurso, asClassOrInterface);

          laImplementa = jerarquiaInterfaces != null;

          if (!laImplementa) { // si no la implementa subimos por las superclases

            Type genericSuperclass = getSuper(tipoEnCurso);

            if (genericSuperclass != null && genericSuperclass instanceof ParameterizedType) {
              ParameterizedType pt = (ParameterizedType) genericSuperclass;
              if (pt.getRawType() instanceof Class) {

                genericSuperclass = pt.getRawType();

                if (Object.class.equals(genericSuperclass)) {
                  // hemos llegado a Object. sourceClass no extiende asClassOrInterface.
                  // Devolveremos null
                  tipoEnCurso = null;
                } else {
                  jerarquia.add(tipoEnCurso);
                  tipoEnCurso = pt;
                }
              }
            } else if (genericSuperclass != null && genericSuperclass instanceof Class) {

              if (Object.class.equals(genericSuperclass)) {
                // hemos llegado a Object. sourceClass no extiende asClassOrInterface. Devolveremos
                // null
                tipoEnCurso = null;
              } else {
                jerarquia.add(tipoEnCurso);
                tipoEnCurso = (Class) genericSuperclass;
              }

            } else {
              // todo: puede no ser una clase?
              tipoEnCurso = null;
            }
          }
        }

        if (laImplementa) {

          // añadimos la clase en cuestión
          jerarquia.add(tipoEnCurso);

          // localizamos el parámetro y bajamos por las interfaces
          jerarquia.addAll(jerarquiaInterfaces);
          c = buscarHaciaAbajo(asClassOrInterface, genericArgumentName, jerarquia);
        }
      }

    } else {

      // una interfaz no puede extender una clase
      if (sourceClass.isInterface()) return null;

      // buscamos la clase (entre ella misma y las superclases)
      // localizamos la posición del argumento
      // vamos bajando hasta que encontramos una clase

      List<Type> jerarquia = new ArrayList<>();

      Type tipoEnCurso = (parameterizedType != null) ? parameterizedType : sourceClass;
      while (tipoEnCurso != null
          && !(asClassOrInterface.equals(tipoEnCurso)
              || (tipoEnCurso instanceof ParameterizedType
                  && asClassOrInterface.equals(((ParameterizedType) tipoEnCurso).getRawType())))) {
        Type genericSuperclass = getSuper(tipoEnCurso);

        if (genericSuperclass != null && genericSuperclass instanceof ParameterizedType) {
          ParameterizedType pt = (ParameterizedType) genericSuperclass;
          if (pt.getRawType() instanceof Class) {

            genericSuperclass = pt.getRawType();

            if (Object.class.equals(genericSuperclass)) {
              // hemos llegado a Object. sourceClass no extiende asClassOrInterface. Devolveremos
              // null
              tipoEnCurso = null;
            } else {
              jerarquia.add(tipoEnCurso);
              tipoEnCurso = pt;
            }
          }
        } else if (genericSuperclass != null && genericSuperclass instanceof Class) {

          if (Object.class.equals(genericSuperclass)) {
            // hemos llegado a Object. sourceClass no extiende asClassOrInterface. Devolveremos null
            tipoEnCurso = null;
          } else {
            jerarquia.add(tipoEnCurso);
            tipoEnCurso = (Class) genericSuperclass;
          }

        } else {
          // todo: puede no ser una clase?
          tipoEnCurso = null;
        }
      }

      if (tipoEnCurso != null) {

        // añadimos la clase en cuestión
        jerarquia.add(tipoEnCurso);

        c = buscarHaciaAbajo(asClassOrInterface, genericArgumentName, jerarquia);

      } else {

        // no hemos encontrado la clase entre las superclases. devolveremos null

      }
    }

    return c;
  }

  private Class buscarHaciaAbajo(
      Type asClassOrInterface, String genericArgumentName, List<Type> jerarquia) {

    Class c = null;

    // localizamos la posición del argumento
    int argPos = getArgPos(asClassOrInterface, genericArgumentName);

    // vamos bajando hasta que encontremos una clase en la posición indicada (y vamos actualizando
    // la posición en cada escalón)
    int escalon = jerarquia.size() - 1;
    while (escalon >= 0 && c == null) {

      Type tipoEnCurso = jerarquia.get(escalon);

      if (tipoEnCurso instanceof Class) {

        if (((Class) tipoEnCurso).getTypeParameters().length > argPos) {
          TypeVariable t = ((Class) tipoEnCurso).getTypeParameters()[argPos];

          genericArgumentName = t.getName();
          asClassOrInterface = (Class) tipoEnCurso;

          argPos = getArgPos(asClassOrInterface, genericArgumentName);
        } else {
          c = Object.class;
        }

      } else if (tipoEnCurso instanceof ParameterizedType) {
        ParameterizedType pt = (ParameterizedType) tipoEnCurso;
        Type t = pt.getActualTypeArguments()[argPos];

        if (t instanceof Class) { // lo hemos encontrado
          c = (Class) t;
        } else if (t instanceof TypeVariable) {
          genericArgumentName = ((TypeVariable) t).getName();
          asClassOrInterface = tipoEnCurso;

          argPos = getArgPos(asClassOrInterface, genericArgumentName);
        }
      }

      escalon--;
    }

    return c;
  }

  private List<Type> buscarInterfaz(Type tipo, Class interfaz) {
    List<Type> jerarquia = null;

    Class clase = null;
    if (tipo instanceof Class) clase = (Class) tipo;
    else if (tipo instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) tipo;
      if (pt.getRawType() instanceof Class) clase = (Class) pt.getRawType();
    }

    if (clase != null)
      for (Type t : clase.getGenericInterfaces()) {
        jerarquia = buscarSuperInterfaz(t, interfaz);
        if (jerarquia != null) break;
      }

    return jerarquia;
  }

  private List<Type> buscarSuperInterfaz(Type tipo, Class interfaz) {
    List<Type> jerarquia = null;

    Class clase = null;
    if (tipo instanceof Class) clase = (Class) tipo;
    else if (tipo instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) tipo;
      if (pt.getRawType() instanceof Class) clase = (Class) pt.getRawType();
    }

    if (clase != null) {

      // buscar en superclases y rellenar jerarquía
      Type tipoEnCurso = clase;

      List<Type> tempJerarquia = new ArrayList<>();
      tempJerarquia.add(tipo);

      while (tipoEnCurso != null
          && !(interfaz.equals(tipoEnCurso)
              || (tipoEnCurso instanceof ParameterizedType
                  && interfaz.equals(((ParameterizedType) tipoEnCurso).getRawType())))) {
        Type genericSuperclass = getSuper(tipoEnCurso);
        if (genericSuperclass != null && genericSuperclass instanceof ParameterizedType) {
          ParameterizedType pt = (ParameterizedType) genericSuperclass;
          if (pt.getRawType() instanceof Class) {

            genericSuperclass = pt.getRawType();

            if (Object.class.equals(genericSuperclass)) {
              // hemos llegado a Object. sourceClass no extiende asClassOrInterface. Devolveremos
              // null
              tipoEnCurso = null;
            } else {
              tempJerarquia.add(tipoEnCurso);
              tipoEnCurso = pt;
            }
          }
        } else if (genericSuperclass != null && genericSuperclass instanceof Class) {

          if (Object.class.equals(genericSuperclass)) {
            // hemos llegado a Object. sourceClass no extiende asClassOrInterface. Devolveremos null
            tipoEnCurso = null;
          } else {
            tempJerarquia.add(tipoEnCurso);
            tipoEnCurso = (Class) genericSuperclass;
          }

        } else {
          // todo: puede no ser una clase?
          tipoEnCurso = null;
        }
      }

      if (tipoEnCurso != null) {
        jerarquia = tempJerarquia;
      }
    }

    return jerarquia;
  }

  private Type getSuper(Type tipoEnCurso) {
    Type genericSuperclass = null;
    if (tipoEnCurso instanceof Class) {
      if (((Class) tipoEnCurso).isInterface()) {
        Class[] is = ((Class) tipoEnCurso).getInterfaces();
        if (is != null && is.length > 0) genericSuperclass = is[0];
      } else genericSuperclass = ((Class) tipoEnCurso).getGenericSuperclass();
    } else if (tipoEnCurso instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) tipoEnCurso;
      if (pt.getRawType() instanceof Class)
        genericSuperclass = ((Class) pt.getRawType()).getGenericSuperclass();
    }
    return genericSuperclass;
  }

  private int getArgPos(Type asClassOrInterface, String genericArgumentName) {
    int argPos = 0;

    Type[] types = null;
    if (asClassOrInterface instanceof Class) {
      types = ((Class) asClassOrInterface).getTypeParameters();
    } else if (asClassOrInterface instanceof ParameterizedType) {
      types = ((ParameterizedType) asClassOrInterface).getActualTypeArguments();
    }

    int argPosAux = 0;
    if (types != null)
      for (int pos = 0; pos < types.length; pos++) {
        if (types[pos] instanceof TypeVariable) {
          TypeVariable t = (TypeVariable) types[pos];
          if (t.getName().equals(genericArgumentName)) {
            argPos = argPosAux;
            break;
          }
          argPosAux++;
        }
      }
    return argPos;
  }

  public <T> T fillQueryResult(List<FieldInterfaced> fields, Object[] o, T t)
      throws IllegalAccessException,
          InstantiationException,
          NoSuchMethodException,
          InvocationTargetException {
    int pos = 0;
    for (FieldInterfaced f : fields) {
      if (pos < o.length) {
        if (o[pos] != null) {
          if (f instanceof FieldInterfacedFromField) f.getField().set(t, o[pos]);
          else set(t, f, o[pos]);
        }
      } else break;
      pos++;
    }
    return t;
  }

  private void set(Object o, FieldInterfaced f, Object v)
      throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    Method m = null;
    try {
      m = o.getClass().getMethod(getSetter(f), v.getClass());
    } catch (Exception e) {
    }
    if (m == null) m = getMethod(o.getClass(), getSetter(f));
    if (m != null) {
      try {
        m.invoke(o, v);
      } catch (Exception e) {
        log.error("Exception when setting value " + v + " for field " + f.getName());
        throw e;
      }
    }
  }

  public List<FieldInterfaced> getKpiFields(Class modelType) {
    List<FieldInterfaced> allFields = getAllFields(modelType);

    allFields =
        allFields.stream()
            .filter((f) -> f.isAnnotationPresent(KPI.class))
            .collect(Collectors.toList());

    return allFields;
  }

  public List<FieldInterfaced> getAllTransferrableFields(Class modelType) {
    List<FieldInterfaced> allFields = getAllFields(modelType);

    allFields = filterAccesible(allFields);

    allFields = filterInjected(allFields);

    return allFields;
  }

  public List<FieldInterfaced> getAllEditableFields(Class modelType) {
    return getAllEditableFilteredFields(modelType, null, null);
  }

  public List<FieldInterfaced> getAllEditableFilteredFields(
      Class modelType, String fieldsFilter, List<FieldInterfaced> editableFields) {
    List<FieldInterfaced> l =
        editableFields != null ? editableFields : getAllEditableFields(modelType, null, true);
    if (!Strings.isNullOrEmpty(fieldsFilter)) {
      List<FieldInterfaced> borrar = new ArrayList<>();
      List<String> ts = Arrays.asList(fieldsFilter.replaceAll(" ", "").split(","));
      for (FieldInterfaced f : l) if (!ts.contains(f.getName())) borrar.add(f);
      l.removeAll(borrar);
    }
    return l;
  }

  public List<FieldInterfaced> getAllEditableFields(
      Class modelType, Class superType, boolean includeReverseMappers) {
    return getAllEditableFields(modelType, superType, includeReverseMappers, null);
  }

  public List<FieldInterfaced> getAllEditableFields(
      Class modelType, Class superType, boolean includeReverseMappers, FieldInterfaced field) {
    List<FieldInterfaced> allFields = getAllFields(modelType);

    if (field != null && field.isAnnotationPresent(FieldsFilter.class)) {

      List<String> fns = Arrays.asList(field.getAnnotation(FieldsFilter.class).value().split(","));

      List<FieldInterfaced> borrar = new ArrayList<>();
      for (FieldInterfaced f : allFields) {
        if (!fns.contains(f.getName())) {
          borrar.add(f);
        }
      }
      allFields.removeAll(borrar);
    }

    allFields = filterAccesible(allFields);

    allFields = filterMenuFields(allFields);

    allFields = filterAuthorized(allFields);

    allFields = filterInjected(allFields);

    // todo: ver como resolvemos esto
    boolean isEditingNewRecord = false;

    allFields =
        allFields.stream()
            .filter(
                (f) ->
                    !(f.isAnnotationPresent(Version.class)
                        || f.isAnnotationPresent(Ignored.class)
                        || f.isAnnotationPresent(KPI.class)
                        || f.isAnnotationPresent(NotInEditor.class)
                        || (f.isAnnotationPresent(Id.class)
                            && f.isAnnotationPresent(GeneratedValue.class))
                        || (f.isAnnotationPresent(NotWhenCreating.class) && isEditingNewRecord)
                        || (f.isAnnotationPresent(NotWhenEditing.class) && !isEditingNewRecord)))
            .collect(Collectors.toList());

    if (superType != null && !includeReverseMappers) {

      List<FieldInterfaced> manytoones =
          allFields.stream()
              .filter(f -> f.isAnnotationPresent(ManyToOne.class))
              .collect(Collectors.toList());

      for (FieldInterfaced manytoonefield : manytoones)
        if (superType.equals(manytoonefield.getType())) {

          for (FieldInterfaced parentField : getAllFields(manytoonefield.getType())) {
            // quitamos el campo mappedBy de las columnas, ya que se supone que siempre seremos
            // nosotros
            OneToMany aa;
            if ((aa = parentField.getAnnotation(OneToMany.class)) != null) {

              String mb = parentField.getAnnotation(OneToMany.class).mappedBy();

              if (!Strings.isNullOrEmpty(mb)) {
                FieldInterfaced mbf = null;
                for (FieldInterfaced f : allFields) {
                  if (f.getName().equals(mb)) {
                    mbf = f;
                    break;
                  }
                }
                if (mbf != null) {
                  allFields.remove(mbf);
                  break;
                }
              }
            }
          }
        }
    }

    for (FieldInterfaced f : new ArrayList<>(allFields))
      if (f.isAnnotationPresent(Position.class)) {
        allFields.remove(f);
        allFields.add(f.getAnnotation(Position.class).value(), f);
      }

    return allFields;
  }

  private List<FieldInterfaced> filterMenuFields(List<FieldInterfaced> allFields) {
    List<FieldInterfaced> r = new ArrayList<>();
    for (FieldInterfaced f : allFields) {
      if (!f.isAnnotationPresent(MenuOption.class) && !f.isAnnotationPresent(Submenu.class))
        r.add(f);
    }
    return r;
  }

  private List<FieldInterfaced> filterInjected(List<FieldInterfaced> allFields) {
    List<FieldInterfaced> r = new ArrayList<>();
    for (FieldInterfaced f : allFields) {
      if (!f.isAnnotationPresent(Autowired.class) && !Modifier.isFinal(f.getModifiers())) r.add(f);
    }
    return r;
  }

  private List<FieldInterfaced> getAllInjectedFields(Class<?> type) {
    List<FieldInterfaced> r = new ArrayList<>();
    var allFields = getAllFields(type);
    for (FieldInterfaced f : allFields) {
      if (f.isAnnotationPresent(Autowired.class) || Modifier.isFinal(f.getModifiers())) r.add(f);
    }
    return r;
  }

  private List<FieldInterfaced> filterAccesible(List<FieldInterfaced> allFields) {
    List<FieldInterfaced> r = new ArrayList<>();
    for (FieldInterfaced f : allFields) {
      if (hasGetter(f)) r.add(f);
    }
    return r;
  }

  private List<FieldInterfaced> filterAuthorized(List<FieldInterfaced> allFields) {
    List<FieldInterfaced> r = new ArrayList<>();
    for (FieldInterfaced f : allFields) {
      if (check(f)) r.add(f);
    }
    return r;
  }

  private boolean check(FieldInterfaced f) {
    boolean r = false;
    boolean annotated = false;
    if (f.isAnnotationPresent(ReadOnly.class)) {
      annotated = true;
      ReadOnly a = f.getAnnotation(ReadOnly.class);
      r |= check(a);
    }
    if (f.isAnnotationPresent(ReadWrite.class)) {
      annotated = true;
      ReadWrite a = f.getAnnotation(ReadWrite.class);
      r |= check(a);
    }
    if (f.isAnnotationPresent(Forbidden.class)) {
      annotated = true;
      Forbidden a = f.getAnnotation(Forbidden.class);
      r &= !check(a);
    }
    return !annotated || r;
  }

  private boolean check(Annotation a) {
    return true;
  }

  private boolean check(Method m) {
    boolean r = false;
    boolean annotated = false;
    if (m.isAnnotationPresent(ReadOnly.class)) {
      annotated = true;
      ReadOnly a = m.getAnnotation(ReadOnly.class);
      r |= check(a);
    }
    if (m.isAnnotationPresent(ReadWrite.class)) {
      annotated = true;
      ReadWrite a = m.getAnnotation(ReadWrite.class);
      r |= check(a);
    }
    if (m.isAnnotationPresent(Forbidden.class)) {
      annotated = true;
      Forbidden a = m.getAnnotation(Forbidden.class);
      r &= !check(a);
    }
    return !annotated || r;
  }

  private FieldInterfaced getInterfaced(Parameter p) {
    return new FieldInterfaced() {
      @Override
      public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
        return p.isAnnotationPresent(annotationClass);
      }

      @Override
      public Class<?> getType() {
        return p.getType();
      }

      @Override
      public AnnotatedType getAnnotatedType() {
        return p.getAnnotatedType();
      }

      @Override
      public Class<?> getGenericClass() {
        if (p.getParameterizedType() instanceof ParameterizedType) {
          ParameterizedType genericType = (ParameterizedType) p.getParameterizedType();
          Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
          return genericClass;
        } else return null;
      }

      @Override
      public Class<?> getDeclaringClass() {
        return null;
      }

      @Override
      public Type getGenericType() {
        return p.getParameterizedType();
      }

      @Override
      public String getName() {
        return p.getName();
      }

      @Override
      public String getId() {
        return p.getName();
      }

      @Override
      public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
        return p.getAnnotation(annotationClass);
      }

      @Override
      public Annotation[] getAnnotations() {
        return p.getAnnotations();
      }

      @Override
      public Object getValue(Object o)
          throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        return null;
      }

      @Override
      public Field getField() {
        return null;
      }

      @Override
      public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
        return getDeclaredAnnotationsByType(annotationClass);
      }

      @Override
      public void setValue(Object o, Object v)
          throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {}

      @Override
      public int getModifiers() {
        return p.getModifiers();
      }

      @Override
      public Annotation[] getDeclaredAnnotations() {
        return p.getDeclaredAnnotations();
      }
    };
  }

  public String getCaption(Object o) {
    if (o.getClass().isAnnotationPresent(Caption.class)) {
      return translator.translate(o.getClass().getAnnotation(Caption.class).value());
    }
    if (o instanceof Listing) {
      return ((Listing) o).getCaption();
    }
    String caption = "";
    try {
      if (!o.getClass().getMethod("toString").getDeclaringClass().equals(Object.class)) {
        caption = o.toString();
      }
    } catch (NoSuchMethodException e) {
      e.printStackTrace();
    }
    if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(o.getClass().getSimpleName());
    return translator.translate(caption);
  }

  public String getCaption(FieldInterfaced f) {
    if (f.isAnnotationPresent(Caption.class)) {
      return translator.translate(f.getAnnotation(Caption.class).value());
    } else {
      String caption = "";
      if (f.isAnnotationPresent(Submenu.class)) caption = f.getAnnotation(Submenu.class).value();
      if (f.isAnnotationPresent(Action.class)) f.getAnnotation(Action.class).value();
      if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(f.getName());
      return translator.translate(caption);
    }
  }

  public String getCaption(Method f) {
    if (f.isAnnotationPresent(Caption.class)) {
      return translator.translate(f.getAnnotation(Caption.class).value());
    } else {
      String caption = "";
      if (f.isAnnotationPresent(Submenu.class)) caption = f.getAnnotation(Submenu.class).value();
      if (f.isAnnotationPresent(Action.class)) caption = f.getAnnotation(Action.class).value();
      if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(f.getName());
      return translator.translate(caption);
    }
  }

  public Collection addToCollection(FieldInterfaced field, Object bean)
      throws NoSuchMethodException,
          IllegalAccessException,
          InvocationTargetException,
          InstantiationException {

    Method m = getMethod(bean.getClass(), "create" + getFirstUpper(field.getName()) + "Instance");

    Object i = null;

    if (m != null) {
      i = m.invoke(bean);
    } else {
      i = createChild(bean, field);
    }

    return addToCollection(field, bean, i);
  }

  public Collection addToCollection(FieldInterfaced field, Object bean, Object i)
      throws NoSuchMethodException,
          IllegalAccessException,
          InvocationTargetException,
          InstantiationException {
    Object v = getValue(field, bean);
    if (v != null) v = extend((Collection) v, i);
    else if (ImmutableList.class.isAssignableFrom(field.getType())) v = ImmutableList.of(i);
    else if (ImmutableSet.class.isAssignableFrom(field.getType())) v = ImmutableSet.of(i);
    else if (Set.class.isAssignableFrom(field.getType())) v = Set.of(i);
    else v = List.of(i);

    setValue(field, bean, v);

    return (Collection) v;
  }

  private Object createChild(Object parent, FieldInterfaced collectionField)
      throws IllegalAccessException,
          InstantiationException,
          NoSuchMethodException,
          InvocationTargetException {
    Class c = collectionField.getGenericClass();
    return newInstance(c, parent);
  }

  public void addToMap(FieldInterfaced field, Object bean, Object k, Object v)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    Map m = (Map) getValue(field, bean);

    if (m == null) {
      if (ImmutableMap.class.isAssignableFrom(field.getType())) v = ImmutableMap.of(k, v);
      else m = Map.of(k, v);
      setValue(field, bean, m);
    } else setValue(field, bean, extend(m, k, v));
  }

  public void removeFromMap(FieldInterfaced field, Object bean, Set l)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

    final Object v = getValue(field, bean);

    if (v != null) l.forEach(e -> ((Map) v).remove(((MapEntry) e).getKey()));
  }

  public Class<?> getGenericClass(Class type) {
    Class<?> gc = null;
    if (type.getGenericInterfaces() != null)
      for (Type gi : type.getGenericInterfaces()) {
        if (gi instanceof ParameterizedType) {
          ParameterizedType pt = (ParameterizedType) gi;
          gc = (Class<?>) pt.getActualTypeArguments()[0];
        } else {
          gc = (Class<?>) gi;
        }
        break;
      }
    return gc;
  }

  public Class<?> getGenericClass(Type type) {
    Class<?> gc = null;
    if (type instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) type;
      gc = (Class<?>) pt.getActualTypeArguments()[0];
    } else {
      gc = (Class<?>) type;
    }
    return gc;
  }

  public Set<Class> getSubclasses(Class c) {
    String pkg = c.getPackage().getName();
    String[] ts = pkg.split("\\.");
    if (ts.length > 3) {
      pkg = ts[0] + "." + ts[1] + "." + ts[2];
    }
    Reflections reflections = new Reflections(pkg);

    Set<Class> subs = reflections.getSubTypesOf(c);

    Set<Class> subsFiltered =
        new TreeSet<>((a, b) -> a.getSimpleName().compareTo(b.getSimpleName()));
    subsFiltered.addAll(
        subs.stream()
            .filter(s -> !Modifier.isAbstract(s.getModifiers()))
            .collect(Collectors.toSet()));

    return subsFiltered;
  }

  public Class<?> getGenericClass(Method m) {
    Type gi = m.getGenericReturnType();
    Class<?> gc = null;
    if (gi instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) gi;
      gc = (Class<?>) pt.getActualTypeArguments()[0];
    } else {
      gc = (Class<?>) gi;
    }
    return gc;
  }

  public boolean isOwner(FieldInterfaced field) {
    OneToOne oo = field.getAnnotation(OneToOne.class);
    OneToMany aa = field.getAnnotation(OneToMany.class);
    ManyToMany mm = field.getAnnotation(ManyToMany.class);

    boolean owner = false;

    if (oo != null) owner = checkCascade(oo.cascade());
    else if (aa != null) owner = checkCascade(aa.cascade());
    else if (mm != null) owner = checkCascade(mm.cascade());

    return owner;
  }

  private boolean checkCascade(CascadeType[] cascade) {
    boolean owned = false;
    for (CascadeType ct : cascade) {
      if (CascadeType.ALL.equals(ct) || CascadeType.PERSIST.equals(ct)) {
        owned = true;
        break;
      }
    }
    return owned;
  }

  public boolean puedeBorrar(FieldInterfaced field) {
    if (field.isAnnotationPresent(ModifyValuesOnly.class)) return false;
    boolean puede = true;
    CascadeType[] cascades = null;
    if (field.isAnnotationPresent(OneToMany.class))
      cascades = field.getAnnotation(OneToMany.class).cascade();
    else if (field.isAnnotationPresent(ManyToMany.class))
      cascades = field.getAnnotation(ManyToMany.class).cascade();
    if (cascades != null) {
      puede = false;
      for (CascadeType ct : cascades) {
        if (CascadeType.ALL.equals(ct) || CascadeType.REMOVE.equals(ct)) {
          puede = true;
          break;
        }
      }
    }
    return puede;
  }

  public boolean puedeAnadir(FieldInterfaced field) {
    if (field.isAnnotationPresent(ModifyValuesOnly.class)) return false;
    boolean puede = true;
    CascadeType[] cascades = null;
    if (field.isAnnotationPresent(OneToMany.class))
      cascades = field.getAnnotation(OneToMany.class).cascade();
    else if (field.isAnnotationPresent(ManyToMany.class))
      cascades = field.getAnnotation(ManyToMany.class).cascade();
    if (cascades != null) {
      puede = false;
      for (CascadeType ct : cascades) {
        if (CascadeType.ALL.equals(ct) || CascadeType.PERSIST.equals(ct)) {
          puede = true;
          break;
        }
      }
    }
    return puede;
  }

  public void main(String[] args) throws Exception {

    /*
    ClassPool cpool = ClassPool.getDefault();
    cpool.appendClassPath(new ClassClassPath(Persona.class));
    MDD.setClassPool(cpool);

    Class c = createClass("test.TestXX", getAllFields(Persona.class), false);
    try {

        Field f = c.getDeclaredField("nombre");

        for (Annotation a : f.getDeclaredAnnotations()) {
            log.debug(a.toString());
        }

        log.debug("" + f.isAnnotationPresent(FullWidth.class));
        log.debug("" + f.isAnnotationPresent(NotEmpty.class));

        Object i = c.newInstance();
        log.debug(Helper.toJson(i));
    } catch (Exception e) {
        e.printStackTrace();
    }


    c = createClass("test.TestXX", getAllFields(Persona.class), false);
    try {
        Object i = c.newInstance();
        log.debug(Helper.toJson(i));
    } catch (Exception e) {
        e.printStackTrace();
    }
     */

  }

  public String getFirstUpper(String fieldName) {
    return fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
  }

  public Object clone(Object original)
      throws IllegalAccessException,
          InstantiationException,
          NoSuchMethodException,
          InvocationTargetException {
    if (original == null) return null;
    else {

      Method m = getMethod(original.getClass(), "cloneAsConverted");
      if (m != null) return m.invoke(original);
      else {

        Object copy = null;

        Constructor con = getConstructor(original.getClass());
        if (con != null && con.getParameterCount() == 0) copy = con.newInstance();
        else {
          con =
              Arrays.stream(original.getClass().getDeclaredConstructors())
                  .filter(x -> x.getParameterCount() == 0)
                  .findFirst()
                  .orElse(null);
          if (!Modifier.isPublic(con.getModifiers())) con.setAccessible(true);
          copy = con.newInstance();
        }

        for (FieldInterfaced f : getAllFields(original.getClass()))
          if (!f.isAnnotationPresent(Id.class)) {
            setValue(f, copy, getValue(f, original));
          }

        return copy;
      }
    }
  }

  public void delete(EntityManager em, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    if (o != null) {
      // no quitamos las relaciones, por precaución. Así saltará a nivel de base de datos si
      // queremos borrar un objeto que esté referenciado
      for (FieldInterfaced f : getAllFields(o.getClass())) {

        Object t = getValue(f, o);

        if (t != null) {

          boolean owner = false;

          if (f.isAnnotationPresent(ManyToOne.class)) {
            CascadeType[] c = f.getAnnotation(ManyToOne.class).cascade();
            if (c != null)
              for (CascadeType cx : c)
                if (CascadeType.ALL.equals(cx) || CascadeType.REMOVE.equals(cx)) {
                  owner = true;
                  break;
                }
          }

          if (f.isAnnotationPresent(OneToMany.class)) {
            CascadeType[] c = f.getAnnotation(OneToMany.class).cascade();
            if (c != null)
              for (CascadeType cx : c)
                if (CascadeType.ALL.equals(cx) || CascadeType.REMOVE.equals(cx)) {
                  owner = true;
                  break;
                }
          }

          if (f.isAnnotationPresent(ManyToMany.class)) {
            CascadeType[] c = f.getAnnotation(ManyToMany.class).cascade();
            if (c != null)
              for (CascadeType cx : c)
                if (CascadeType.ALL.equals(cx) || CascadeType.REMOVE.equals(cx)) {
                  owner = true;
                  break;
                }
          }

          if (!owner
              && (f.isAnnotationPresent(OneToMany.class)
                  || f.isAnnotationPresent(ManyToMany.class))) {

            FieldInterfaced mbf = getMapper(f);

            if (Collection.class.isAssignableFrom(t.getClass())) {
              Collection col = (Collection) t;
              if (col.size() > 0) {
                t = col.iterator().next();
              } else t = null;
            }

            if (mbf != null && t != null) {

              throw new Error("" + o + " is referenced from " + t);
            }
          }
        }
      }
      em.remove(o);
    }
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
                  + SlimHelper.capitalize(f.getName())
                  + ":</td><td>");
          if (i != null) {
            if (isBasico(i)) {
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
    if (f instanceof FieldInterfaced) {
      return ((FieldInterfaced) f).getType();
    } else if (f instanceof Method) {
      return ((Method) f).getReturnType();
    } else {
      return null;
    }
  }

  private Type getGenericType(AnnotatedElement f) {
    if (f instanceof FieldInterfaced) {
      return ((FieldInterfaced) f).getGenericType();
    } else if (f instanceof Method) {
      return ((Method) f).getGenericReturnType();
    } else {
      return Object.class;
    }
  }
}
