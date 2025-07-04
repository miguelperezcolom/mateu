package io.mateu.core.domain.reflection;

import static io.mateu.core.domain.reflection.TypeProvider.getType;

import io.mateu.uidl.annotations.GenericClass;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.util.ArrayList;
import java.util.List;

public class GenericClassProvider {

  // @Cacheable(initialValue = "generic-class-per-class")
  public static Class<?> getGenericClass(Class type) {
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

  // @Cacheable(initialValue = "generic-class-per-method")
  public static Class<?> getGenericClass(Method m) {
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

  // @Cacheable(initialValue = "generic-class-per-type")
  public static Class<?> getGenericClass(Type type) {
    Class<?> gc = null;
    if (type instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) type;
      gc = (Class<?>) pt.getActualTypeArguments()[0];
    } else {
      gc = (Class<?>) type;
    }
    return gc;
  }

  // @Cacheable(initialValue = "generic-class-per-field")
  public static Class getGenericClass(
      Field field, Class asClassOrInterface, String genericArgumentName) {
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

  public static Class getGenericClass(
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

  public static Class getGenericClass(
      ParameterizedType parameterizedType, Class asClassOrInterface, String genericArgumentName) {
    return getGenericClass(
        parameterizedType,
        (Class) parameterizedType.getRawType(),
        asClassOrInterface,
        genericArgumentName);
  }

  public static Class getGenericClass(
      Class sourceClass, Class asClassOrInterface, String genericArgumentName) {
    return getGenericClass(null, sourceClass, asClassOrInterface, genericArgumentName);
  }

  public static Class getGenericClass(
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

      if (sourceClass.isInterface()) {
        List<Type> jerarquiaInterfaces = buscarInterfaz(sourceClass, asClassOrInterface);
        if (asClassOrInterface.equals(sourceClass))
          jerarquiaInterfaces = List.of(asClassOrInterface);

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

  private static Class buscarHaciaAbajo(
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

  private static List<Type> buscarInterfaz(Type tipo, Class interfaz) {
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

  private static List<Type> buscarSuperInterfaz(Type tipo, Class interfaz) {
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

  private static Type getSuper(Type tipoEnCurso) {
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

  private static int getArgPos(Type asClassOrInterface, String genericArgumentName) {
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

  private static Type getGenericType(AnnotatedElement f) {
    if (f instanceof Field) {
      return ((Field) f).getGenericType();
    } else if (f instanceof Method) {
      return ((Method) f).getGenericReturnType();
    } else {
      return Object.class;
    }
  }
}
