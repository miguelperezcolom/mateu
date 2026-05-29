package io.mateu.uidl.reflection;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.util.ArrayList;
import java.util.List;

class GenericTypeHierarchyResolver {

  static Class resolve(
      ParameterizedType parameterizedType,
      Class sourceClass,
      Class asClassOrInterface,
      String genericArgumentName) {
    Class c = null;

    if (asClassOrInterface.isInterface()) {

      if (sourceClass.isInterface()) {
        List<Type> jerarquiaInterfaces = buscarInterfaz(sourceClass, asClassOrInterface);
        if (asClassOrInterface.equals(sourceClass)) {
          jerarquiaInterfaces = new ArrayList<>();
          jerarquiaInterfaces.add(asClassOrInterface);
        }

        boolean laImplementa = jerarquiaInterfaces != null;

        if (laImplementa) {
          jerarquiaInterfaces.add((parameterizedType != null) ? parameterizedType : sourceClass);
          c = buscarHaciaAbajo(asClassOrInterface, genericArgumentName, jerarquiaInterfaces);
        }

      } else {

        boolean laImplementa = false;

        List<Type> jerarquia = new ArrayList<>();
        List<Type> jerarquiaInterfaces = null;

        Type tipoEnCurso = (parameterizedType != null) ? parameterizedType : sourceClass;
        while (tipoEnCurso != null && !laImplementa) {

          jerarquiaInterfaces = buscarInterfaz(tipoEnCurso, asClassOrInterface);

          laImplementa = jerarquiaInterfaces != null;

          if (!laImplementa) {

            Type genericSuperclass = getSuper(tipoEnCurso);

            if (genericSuperclass != null && genericSuperclass instanceof ParameterizedType) {
              ParameterizedType pt = (ParameterizedType) genericSuperclass;
              if (pt.getRawType() instanceof Class) {

                genericSuperclass = pt.getRawType();

                if (Object.class.equals(genericSuperclass)) {
                  tipoEnCurso = null;
                } else {
                  jerarquia.add(tipoEnCurso);
                  tipoEnCurso = pt;
                }
              }
            } else if (genericSuperclass != null && genericSuperclass instanceof Class) {

              if (Object.class.equals(genericSuperclass)) {
                tipoEnCurso = null;
              } else {
                jerarquia.add(tipoEnCurso);
                tipoEnCurso = (Class) genericSuperclass;
              }

            } else {
              tipoEnCurso = null;
            }
          }
        }

        if (laImplementa) {
          jerarquia.add(tipoEnCurso);
          jerarquia.addAll(jerarquiaInterfaces);
          c = buscarHaciaAbajo(asClassOrInterface, genericArgumentName, jerarquia);
        }
      }

    } else {

      if (sourceClass.isInterface()) return null;

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
              tipoEnCurso = null;
            } else {
              jerarquia.add(tipoEnCurso);
              tipoEnCurso = pt;
            }
          }
        } else if (genericSuperclass != null && genericSuperclass instanceof Class) {

          if (Object.class.equals(genericSuperclass)) {
            tipoEnCurso = null;
          } else {
            jerarquia.add(tipoEnCurso);
            tipoEnCurso = (Class) genericSuperclass;
          }

        } else {
          tipoEnCurso = null;
        }
      }

      if (tipoEnCurso != null) {
        jerarquia.add(tipoEnCurso);
        c = buscarHaciaAbajo(asClassOrInterface, genericArgumentName, jerarquia);
      }
    }

    return c;
  }

  static Class buscarHaciaAbajo(
      Type asClassOrInterface, String genericArgumentName, List<Type> jerarquia) {
    Class c = null;
    int argPos = getArgPos(asClassOrInterface, genericArgumentName);

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

        if (t instanceof Class) {
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

  static List<Type> buscarInterfaz(Type tipo, Class interfaz) {
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

  static List<Type> buscarSuperInterfaz(Type tipo, Class interfaz) {
    List<Type> jerarquia = null;

    Class clase = null;
    if (tipo instanceof Class) clase = (Class) tipo;
    else if (tipo instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) tipo;
      if (pt.getRawType() instanceof Class) clase = (Class) pt.getRawType();
    }

    if (clase != null) {
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
              tipoEnCurso = null;
            } else {
              tempJerarquia.add(tipoEnCurso);
              tipoEnCurso = pt;
            }
          }
        } else if (genericSuperclass != null && genericSuperclass instanceof Class) {

          if (Object.class.equals(genericSuperclass)) {
            tipoEnCurso = null;
          } else {
            tempJerarquia.add(tipoEnCurso);
            tipoEnCurso = (Class) genericSuperclass;
          }

        } else {
          tipoEnCurso = null;
        }
      }

      if (tipoEnCurso != null) {
        jerarquia = tempJerarquia;
      }
    }

    return jerarquia;
  }

  static Type getSuper(Type tipoEnCurso) {
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

  static int getArgPos(Type asClassOrInterface, String genericArgumentName) {
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

  private GenericTypeHierarchyResolver() {}
}
