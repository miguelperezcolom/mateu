package io.mateu.mdd.core.reflection;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.provider.DataProvider;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.util.Helper;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.beanutils.converters.URLConverter;
import org.reflections.Reflections;

import javax.persistence.*;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.lang.reflect.Parameter;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

public class ReflectionHelper {

    static List<Class> basicos = new ArrayList<>();

    {
        basicos.add(String.class);
        basicos.add(Integer.class);
        basicos.add(Long.class);
        basicos.add(Double.class);
        basicos.add(Boolean.class);
        basicos.add(LocalDate.class);
        basicos.add(LocalDateTime.class);
        basicos.add(String.class);
    }


    public static Object getValue(Field f, Object o) {
        Method getter = null;
        try {
            getter = o.getClass().getMethod(getGetter(f));
        } catch (Exception e) {

        }
        Object v = null;
        try {
            if (getter != null)
                v = getter.invoke(o);
            else v = f.get(o);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
        return v;
    }

    public static void setValue(io.mateu.mdd.core.reflection.FieldInterfaced f, Object o, Object v) throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
        setValue(f.getId(), o, v);
    }

    public static void setValue(String fn, Object o, Object v) throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
        if (Map.class.isAssignableFrom(o.getClass())) {
            ((Map)o).put(fn, v);
        } else {
            if (fn.contains(".")) {
                o = getInstance(o, fn.substring(0, fn.indexOf(".")));
                setValue(fn.substring(fn.indexOf(".") + 1), o, v);
            } else {
                if (v instanceof Collection) v = new ArrayList((Collection) v);
                BeanUtils.setProperty(o, fn, v);
            }
        }
    }

    public static Object getValue(io.mateu.mdd.core.reflection.FieldInterfaced f, Object o) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        if (o == null) return null;

        if (Map.class.isAssignableFrom(o.getClass())) {
            return ((Map) o).get(f.getName());
        } else {

            if (f.getId().contains(".")) {
                o = getInstance(o, f.getId().substring(0, f.getId().lastIndexOf(".")));
            }

            Method getter = null;
            try {
                getter = o.getClass().getMethod(getGetter(f));
            } catch (Exception e) {

            }
            Object v = null;
            try {
                if (getter != null)
                    v = getter.invoke(o);
                else v = null; // no es posible hacer esto con campos interfaced!!!
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
            return v;

        }

    }

    private static Object getInstance(Object o, String fn) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
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

    public static Method getMethod(Class<?> c, String methodName) {
        Method m = null;
        for (Method q : getAllMethods(c)) {
            if (methodName.equals(q.getName())) {
                m = q;
                break;
            }
        }
        return m;
    }

    private static Field getDeclaredField(Class<?> c, String fieldName) {
        Field m = null;
        while (m == null) {
            try {
                m = c.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
            }
            if (m != null) break;
            else {
                if (c.getSuperclass() != null && c.getSuperclass().isAnnotationPresent(Entity.class)) c = c.getSuperclass();
                else break;
            }
        }

        return m;
    }

    private static Method getMethod(Class<?> c, String methodName, Class<?> parameterClass) {
        Method m = null;
        while (m == null) {
            try {
                m = c.getDeclaredMethod(methodName, parameterClass);
            } catch (NoSuchMethodException e) {
            }
            if (m != null) break;
            else {
                if (c.getSuperclass() != null && c.getSuperclass().isAnnotationPresent(Entity.class)) c = c.getSuperclass();
                else break;
            }
        }

        return m;
    }

    public static String getGetter(Field f) {
        return (("boolean".equals(f.getType().getName()) || Boolean.class.equals(f.getType()))?"is":"get") + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }

    public static String getGetter(io.mateu.mdd.core.reflection.FieldInterfaced f) {
        return (("boolean".equals(f.getType().getName()) || Boolean.class.equals(f.getType()))?"is":"get") + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }

    public static String getGetter(String fn) {
        return "get" + fn.substring(0, 1).toUpperCase() + fn.substring(1);
    }

    public static String getSetter(Field f) {
        return "set" + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }
    public static String getSetter(io.mateu.mdd.core.reflection.FieldInterfaced f) {
        return "set" + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }




    private static void addToList(List<String> l, String s) {
        if (s != null) for (String t : s.split(",")) {
            t = t.trim();
            if (!"".equals(t)) l.add(t);
        }
    }

    private static void addToList(List<String> l, List<String> nl, String s) {
        if (s != null) for (String t : s.split(",")) {
            t = t.trim();
            if (!"".equals(t)) {
                if (t.startsWith("¬")) {
                    nl.add(t.replaceAll("¬", ""));
                } else {
                    l.add(t);
                }
            }
        }
    }




    public static List<Method> getAllMethods(Class c) {
        List<Method> l = new ArrayList<>();

        if (c.getSuperclass() != null && (!c.isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class)))
            l.addAll(getAllMethods(c.getSuperclass()));

        for (Method f : c.getDeclaredMethods()) l.add(f);

        return l;
    }

    private static Method getMethod(Class c, String methodName, Class<?>... parameterTypes) throws NoSuchMethodException {
        Method m = c.getClass().getDeclaredMethod(methodName, parameterTypes);

        if (m == null && c.getSuperclass() != null && (!c.isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class)))
            m = getMethod(c.getSuperclass(), methodName, parameterTypes);

        return m;
    }

    public static List<io.mateu.mdd.core.reflection.FieldInterfaced> getAllFields(Class c) {

        List<String> vistos = new ArrayList<>();
        Map<String, Field> originales = new HashMap<>();
        for (Field f : c.getDeclaredFields()) {
            if (!f.getName().contains("$")) originales.put(f.getName(), f);
        }

        List<io.mateu.mdd.core.reflection.FieldInterfaced> l = new ArrayList<>();

        if (c.getSuperclass() != null && (!c.isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class))) {
            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(c.getSuperclass())) {
                if (!originales.containsKey(f.getId())) l.add(f);
                else l.add(new io.mateu.mdd.core.reflection.FieldInterfacedFromField(originales.get(f.getName())));
                vistos.add(f.getName());
            }
        }

        for (Field f : c.getDeclaredFields()) if (!vistos.contains(f.getName())) if (!f.getName().contains("$")) {
            l.add(new io.mateu.mdd.core.reflection.FieldInterfacedFromField(f));
        }

        return l;
    }

    public static List<io.mateu.mdd.core.reflection.FieldInterfaced> getAllFields(Method m) {

        List<FieldInterfaced> l = new ArrayList<>();

        for (Parameter p : m.getParameters()) if (!isInjectable(p)) {
            l.add(new io.mateu.mdd.core.reflection.FieldInterfacedFromParameter(m, p));
        }

        return l;
    }

    private static boolean isInjectable(Parameter p) {
        boolean injectable = true;
        if (EntityManager.class.equals(p.getType())) {
        } else if (UserData.class.equals(p.getType())) {
        } else if (Set.class.isAssignableFrom(p.getType())) {
        } else {
            injectable = false;
        }
        return injectable;
    }

    private static Map<String, io.mateu.mdd.core.reflection.FieldInterfaced> getAllFieldsMap(Class c) {
        return getAllFieldsMap(getAllFields(c));
    }

    private static Map<String, io.mateu.mdd.core.reflection.FieldInterfaced> getAllFieldsMap(List<io.mateu.mdd.core.reflection.FieldInterfaced> l) {

        Map<String, io.mateu.mdd.core.reflection.FieldInterfaced> m = new HashMap<>();

        for (io.mateu.mdd.core.reflection.FieldInterfaced f : l) m.put(f.getName(), f);

        return m;
    }

    private static List<io.mateu.mdd.core.reflection.FieldInterfaced> getAllFields(Class entityClass, boolean fieldsInFilterOnly, List<String> fieldsFilter, List<String> negatedFormFields) {
        List<io.mateu.mdd.core.reflection.FieldInterfaced> fs = getAllFields(entityClass);
        Map<String, io.mateu.mdd.core.reflection.FieldInterfaced> m = getAllFieldsMap(fs);

        List<io.mateu.mdd.core.reflection.FieldInterfaced> l = new ArrayList<>();

        if (fieldsInFilterOnly) {
            if (fieldsFilter != null) for (String fn : fieldsFilter) {
                boolean soloSalida = false;
                if (fn.startsWith("-")) {
                    soloSalida = true;
                    fn = fn.substring(1);
                }
                if (fn.contains(".")) {
                    io.mateu.mdd.core.reflection.FieldInterfaced f = null;
                    String finalFn = fn;
                    boolean finalSoloSalida = soloSalida;
                    l.add(f = new io.mateu.mdd.core.reflection.FieldInterfacedFromField(getField(entityClass, finalFn, m)) {
                        @Override
                        public String getId() {
                            return finalFn;
                        }

                        @Override
                        public String getName() {
                            return Helper.capitalize(getId());
                        }

                        @Override
                        public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                            if (finalSoloSalida && io.mateu.mdd.core.annotations.Output.class.equals(annotationClass)) return true;
                            else return super.isAnnotationPresent(annotationClass);
                        }
                    });

                } else {
                    if (m.containsKey(fn)) {
                        boolean finalSoloSalida1 = soloSalida;
                        l.add((soloSalida)?new io.mateu.mdd.core.reflection.FieldInterfacedFromField(m.get(fn)) {
                            @Override
                            public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                                if (finalSoloSalida1 && io.mateu.mdd.core.annotations.Output.class.equals(annotationClass)) return true;
                                else return super.isAnnotationPresent(annotationClass);
                            }
                        }:m.get(fn));
                    }
                }
            }
        } else {
            for (io.mateu.mdd.core.reflection.FieldInterfaced f : fs) {
                if (negatedFormFields == null || !negatedFormFields.contains(f.getId())) {
                    boolean soloSalida = fieldsFilter != null && fieldsFilter.contains("-" + f.getId());
                    boolean forzarEditable = fieldsFilter != null && fieldsFilter.contains("+" + f.getId());

                    l.add((soloSalida || forzarEditable)?new io.mateu.mdd.core.reflection.FieldInterfacedFromField(f) {
                        @Override
                        public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                            if (io.mateu.mdd.core.annotations.Output.class.equals(annotationClass)) return soloSalida || !forzarEditable || super.isAnnotationPresent(annotationClass);
                            else return super.isAnnotationPresent(annotationClass);
                        }
                    }:f);
                }
            }
        }

        return l.stream().filter((f) -> f != null).collect(Collectors.toList());
    }

    private static io.mateu.mdd.core.reflection.FieldInterfaced getField(Class entityClass, String fn, Map<String, FieldInterfaced> m) {
        io.mateu.mdd.core.reflection.FieldInterfaced f = null;
        if (fn.contains(".")) {
            String flfn = fn.substring(0, fn.indexOf("."));
            io.mateu.mdd.core.reflection.FieldInterfaced flf = m.get(flfn);
            if (flf != null) f = getField(flf.getType(), fn.substring(flfn.length() + 1), getAllFieldsMap(flf.getType()));
        } else {
            if (m.containsKey(fn)) f = m.get(fn);
        }
        return f;
    }

    public static Object getId(Object model) {
        if (model instanceof Object[]) return ((Object[]) model)[0];
        else if (model.getClass().isAnnotationPresent(Entity.class)) {
            Object id = null;
            try {
                FieldInterfaced idField = null;
                for (FieldInterfaced f : ReflectionHelper.getAllFields(model.getClass())) {
                    if (f.isAnnotationPresent(Id.class)) {
                        idField = f;
                        break;
                    }
                }

                id = ReflectionHelper.getValue(idField, model);
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
            return id;
        } else return model;
    }

    public static FieldInterfaced getNameField(Class entityClass) {
        FieldInterfaced fName = null;
        Method toStringMethod = getMethod(entityClass, "toString");
        boolean toStringIsOverriden = toStringMethod != null && toStringMethod.getDeclaringClass().equals(entityClass);
        if (!toStringIsOverriden) {
            boolean hayName = false;
            for (FieldInterfaced ff : getAllFields(entityClass))
                if ("value".equalsIgnoreCase(ff.getName()) || "name".equalsIgnoreCase(ff.getName()) || "title".equalsIgnoreCase(ff.getName())) {
                    fName = ff;
                    hayName = true;
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



    public static FieldInterfaced getFieldByName(Class sourceClass, String fieldName) {
        FieldInterfaced field = null;
        for (FieldInterfaced f : getAllFields(sourceClass)) {
            if (fieldName.equals(f.getName())) {
                field = f;
                break;
            }
        }
        return field;
    }

    public static FieldInterfaced getMapper(FieldInterfaced field) {
        FieldInterfaced mapper = null;

        String mfn = null;
        if (field.isAnnotationPresent(OneToOne.class)) mfn = field.getAnnotation(OneToOne.class).mappedBy();
        else if (field.isAnnotationPresent(OneToMany.class)) mfn = field.getAnnotation(OneToMany.class).mappedBy();
        else if (field.isAnnotationPresent(ManyToMany.class)) mfn = field.getAnnotation(ManyToMany.class).mappedBy();

        if (!Strings.isNullOrEmpty(mfn)) {

            Class targetClass = null;
            if (Collection.class.isAssignableFrom(field.getType()) || Set.class.isAssignableFrom(field.getType())) {
                targetClass = field.getGenericClass();
            } else if (Map.class.isAssignableFrom(field.getType())) {
                targetClass = ReflectionHelper.getGenericClass(field, Map.class, "V");
            } else {
                targetClass = field.getType();
            }

            mapper = getFieldByName(targetClass, mfn);

        }

        return mapper;
    }

    public static Class getGenericClass(FieldInterfaced field, Class asClassOrInterface, String genericArgumentName) {
        Type t = field.getGenericType();
        return getGenericClass((t instanceof ParameterizedType)?(ParameterizedType) t:null, field.getType(), asClassOrInterface, genericArgumentName);
    }

    public static Class getGenericClass(ParameterizedType parameterizedType, Class asClassOrInterface, String genericArgumentName) {
        return getGenericClass(parameterizedType, (Class) parameterizedType.getRawType(), asClassOrInterface, genericArgumentName);
    }

    public static Class getGenericClass(Class sourceClass, Class asClassOrInterface, String genericArgumentName) {
        return getGenericClass(null, sourceClass, asClassOrInterface, genericArgumentName);
    }



    public static Class getGenericClass(ParameterizedType parameterizedType, Class sourceClass, Class asClassOrInterface, String genericArgumentName) {
        Class c = null;

        if (asClassOrInterface.isInterface()) {

            // buscamos la clase (entre ella misma y las superclases) que implementa la interfaz o un derivado
            // vamos bajando por las interfaces hasta encontrar una clase
            // si no tenemos la clase, vamos bajando por las subclases hasta encontrarla

            Class baseInterface = null;

            if (sourceClass.isInterface()) {
                baseInterface = sourceClass;

                List<Type> jerarquiaInterfaces = buscarInterfaz(sourceClass, asClassOrInterface);
                if (asClassOrInterface.equals(sourceClass)) jerarquiaInterfaces = Lists.newArrayList(asClassOrInterface);

                boolean laImplementa = jerarquiaInterfaces != null;

                if (laImplementa) {

                    jerarquiaInterfaces.add((parameterizedType != null)?parameterizedType:sourceClass);

                    // localizamos el parámetro y bajamos por las interfaces
                    c = buscarHaciaAbajo(asClassOrInterface, genericArgumentName, jerarquiaInterfaces);

                }


            } else {

                // buscamos hasta la clase que implemente la interfaz o una subclase de la misma

                boolean laImplementa = false;

                List<Type> jerarquia = new ArrayList<>();
                List<Type> jerarquiaInterfaces = null;

                Type tipoEnCurso = (parameterizedType != null)?parameterizedType:sourceClass;
                while (tipoEnCurso != null && !laImplementa) {

                    jerarquiaInterfaces = buscarInterfaz(tipoEnCurso, asClassOrInterface);

                    laImplementa = jerarquiaInterfaces != null;

                    if (!laImplementa) { // si no la implementa subimos por las superclases

                        Type genericSuperclass = getSuper(tipoEnCurso);

                        if (genericSuperclass != null && genericSuperclass instanceof ParameterizedType) {
                            ParameterizedType pt = (ParameterizedType)genericSuperclass;
                            if (pt.getRawType() instanceof Class) {

                                genericSuperclass = pt.getRawType();

                                if (Object.class.equals(genericSuperclass)) {
                                    // hemos llegado a Object. sourceClass no extiende asClassOrInterface. Devolveremos null
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

            Type tipoEnCurso = (parameterizedType != null)?parameterizedType:sourceClass;
            while (tipoEnCurso != null && !(asClassOrInterface.equals(tipoEnCurso) || (tipoEnCurso instanceof ParameterizedType && asClassOrInterface.equals(((ParameterizedType)tipoEnCurso).getRawType())))) {
                Type genericSuperclass = getSuper(tipoEnCurso);

                if (genericSuperclass != null && genericSuperclass instanceof ParameterizedType) {
                    ParameterizedType pt = (ParameterizedType)genericSuperclass;
                    if (pt.getRawType() instanceof Class) {

                        genericSuperclass = pt.getRawType();

                        if (Object.class.equals(genericSuperclass)) {
                            // hemos llegado a Object. sourceClass no extiende asClassOrInterface. Devolveremos null
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

    private static Class buscarHaciaAbajo(Type asClassOrInterface, String genericArgumentName, List<Type> jerarquia) {

        Class c = null;

        // localizamos la posición del argumento
        int argPos = getArgPos(asClassOrInterface, genericArgumentName);

        // vamos bajando hasta que encontremos una clase en la posición indicada (y vamos actualizando la posición en cada escalón)
        int escalon = jerarquia.size() - 1;
        while (escalon >= 0 && c == null) {

            Type tipoEnCurso = jerarquia.get(escalon);

            if (tipoEnCurso instanceof Class) {

                if (((Class)tipoEnCurso).getTypeParameters().length > argPos) {
                    TypeVariable t = ((Class)tipoEnCurso).getTypeParameters()[argPos];

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
                    genericArgumentName = ((TypeVariable)t).getName();
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
            ParameterizedType pt = (ParameterizedType)tipo;
            if (pt.getRawType() instanceof Class) clase = (Class) pt.getRawType();
        }

        if (clase != null) for (Type t : clase.getGenericInterfaces()) {
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
            ParameterizedType pt = (ParameterizedType)tipo;
            if (pt.getRawType() instanceof Class) clase = (Class) pt.getRawType();
        }

        if (clase != null) {

            //buscar en superclases y rellenar jerarquía
            Type tipoEnCurso = clase;

            List<Type> tempJerarquia = new ArrayList<>();
            tempJerarquia.add(tipo);

            while (tipoEnCurso != null && !(interfaz.equals(tipoEnCurso) || (tipoEnCurso instanceof ParameterizedType && interfaz.equals(((ParameterizedType)tipoEnCurso).getRawType())))) {
                Type genericSuperclass = getSuper(tipoEnCurso);
                if (genericSuperclass != null && genericSuperclass instanceof ParameterizedType) {
                    ParameterizedType pt = (ParameterizedType)genericSuperclass;
                    if (pt.getRawType() instanceof Class) {

                        genericSuperclass = pt.getRawType();

                        if (Object.class.equals(genericSuperclass)) {
                            // hemos llegado a Object. sourceClass no extiende asClassOrInterface. Devolveremos null
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
            }
            else genericSuperclass = ((Class)tipoEnCurso).getGenericSuperclass();
        }
        else if (tipoEnCurso instanceof ParameterizedType) {
            ParameterizedType pt = (ParameterizedType)tipoEnCurso;
            if (pt.getRawType() instanceof Class) genericSuperclass = ((Class)pt.getRawType()).getGenericSuperclass();
        }
        return genericSuperclass;
    }

    private static int getArgPos(Type asClassOrInterface, String genericArgumentName) {
        int argPos = 0;

        Type[] types = null;
        if (asClassOrInterface instanceof Class) {
            types = ((Class)asClassOrInterface).getTypeParameters();
        } else if (asClassOrInterface instanceof ParameterizedType) {
            types = ((ParameterizedType)asClassOrInterface).getActualTypeArguments();
        }

        int argPosAux = 0;
        if (types != null) for (int pos = 0; pos < types.length; pos++) {
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

    public static <T> T fillQueryResult(Object[] o, Class<T> rowClass) throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        T t = null;
        t = (T) ReflectionHelper.newInstance(rowClass);
        int pos = 0;
        for (FieldInterfaced f : getAllFields(rowClass)) {
            if (pos < o.length) rowClass.getMethod(getSetter(f), f.getType()).invoke(t, o[pos]);
            else break;
            pos++;
        }
        return t;
    }

    public static Object newInstance(Class c) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException {
        Object o = null;
        if (c.getDeclaringClass() != null) {
            Object p = newInstance(c.getDeclaringClass());
            Constructor<?> cons = c.getDeclaredConstructors()[0];
            cons.setAccessible(true);
            o = cons.newInstance(p);
        } else {
            o = c.newInstance();
        }
        return o;
    }

    public static List<FieldInterfaced> getAllEditableFields(Class modelType) {
        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(modelType);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).collect(Collectors.toList());

        return allFields;
    }




    public static Object execute(UserData user, Method m, MDDBinder parameters, Object instance) throws Throwable {
        return execute(user, m, parameters, instance, null, null);
    }

    private static Object execute(UserData user, Method m, MDDBinder parameters, Object instance, String rpcViewClassName, Data rpcViewData) throws Throwable {
        Map<String, Object> params = (Map<String, Object>) parameters.getBean();

        List<Object> vs = new ArrayList<>();
        for (Parameter p : m.getParameters()) {
            if (UserData.class.equals(p.getType())) {
                vs.add(user);
            } else if (p.isAnnotationPresent(io.mateu.mdd.core.annotations.Selection.class)) {
                vs.add(params.get("_selection"));
            } else if (p.isAnnotationPresent(io.mateu.mdd.core.annotations.Wizard.class)) {
                vs.add(parameters);
            } else if (io.mateu.mdd.core.views.AbstractServerSideWizard.class.isAssignableFrom(p.getType())) {
                //vs.add(fillWizard(user, em, p.getType(), parameters.get(p.getName())));
            } else if (UserData.class.equals(p.getType())) {
                vs.add(user);
            } else if (params.containsKey(p.getName())) {
                vs.add(params.get(p.getName()));
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

        return m.invoke(instance, args);
    }


    private static io.mateu.mdd.core.reflection.FieldInterfaced getInterfaced(Parameter p) {
        return new io.mateu.mdd.core.reflection.FieldInterfaced() {
            @Override
            public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                return p.isAnnotationPresent(annotationClass);
            }

            @Override
            public Class<?> getType() {
                return p.getType();
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
            public Class<?> getOptionsClass() {
                return (p.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueClass.class))?p.getAnnotation(io.mateu.mdd.core.annotations.ValueClass.class).value():null;
            }

            @Override
            public String getOptionsQL() {
                return (p.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueQL.class))?p.getAnnotation(io.mateu.mdd.core.annotations.ValueQL.class).value():null;
            }


            @Override
            public Object getValue(Object o) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
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
            public void setValue(Object o, Object v) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {

            }

            @Override
            public int getModifiers() {
                return p.getModifiers();
            }

            @Override
            public DataProvider getDataProvider() {
                return null;
            }
        };
    }

    private static <T> T fillWizard(UserData user, EntityManager em, Class<T> type, Data data) throws Throwable {
        T o = null;

        for (Constructor<?> cons : type.getConstructors()) {
            if (cons.getParameterCount() == 0) {
                o = type.newInstance();
                break;
            } else {
                boolean allOk = true;
                List args = new ArrayList<>();

                for (Parameter p : cons.getParameters()) {
                    if (p.getType().equals(UserData.class)) {
                        args.add(user);
                    } else if (p.getType().equals(EntityManager.class)) {
                        args.add(em);
                    } else {
                        allOk = false;
                        break;
                    }
                }

                if (allOk) {
                    o = (T) cons.newInstance(args.toArray());
                    break;
                }
            }
        }

        if (o == null) throw  new Exception("Unable to instantiate wizard of class " + type.getCanonicalName());




        if (o instanceof io.mateu.mdd.core.views.BaseServerSideWizard) {
            io.mateu.mdd.core.views.BaseServerSideWizard w = (io.mateu.mdd.core.views.BaseServerSideWizard) o;

            List<Object> persistPending = new ArrayList<>();

            for (Object p : w.getPages()) {
                //fillEntity(em, persistPending, user, p, data, false);
            }

            for (Object x : persistPending) em.persist(x);

            return (T) w;
        } else throw new Exception("" + type.getName() + " must extend " + io.mateu.mdd.core.views.BaseServerSideWizard.class.getName());
    }

    public static String getCaption(FieldInterfaced f) {
        if (f.isAnnotationPresent(Caption.class)) {
            return f.getAnnotation(Caption.class).value();
        } else return Helper.capitalize(f.getName());
    }

    public static void addToCollection(MDDBinder binder, FieldInterfaced field, Object bean, Object i) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        Object v = ReflectionHelper.getValue(field, bean);

        if (Collection.class.isAssignableFrom(field.getType())) {

            if (v == null) {
                ReflectionHelper.setValue(field, bean, v = new ArrayList());
            }

            ((Collection)v).add(i);

        } else if (Set.class.isAssignableFrom(field.getType())) {

            if (v == null) {
                ReflectionHelper.setValue(field, bean, v = new HashSet());
            }

            ((Set)v).add(i);

        }

        reverseMap(binder, field, bean, i);

    }

    public static void removeFromCollection(MDDBinder binder, FieldInterfaced field, Object bean, Set l) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        Object v = ReflectionHelper.getValue(field, bean);

        if (Collection.class.isAssignableFrom(field.getType())) {

            if (v == null) {
                ReflectionHelper.setValue(field, bean, v = new ArrayList());
            }

            ((Collection)v).removeAll(l);

        } else if (Set.class.isAssignableFrom(field.getType())) {

            if (v == null) {
                ReflectionHelper.setValue(field, bean, v = new HashSet());
            }

            ((Set)v).removeAll(l);

        }


        final FieldInterfaced mbf = ReflectionHelper.getMapper(field);
        if (mbf != null) {
            l.forEach(o -> {
                try {

                    unReverseMap(binder, field, bean, o, mbf);

                } catch (Throwable e1) {
                    MDD.alert(e1);
                }
            });
        }

    }

    public static void addToMap(MDDBinder binder, FieldInterfaced field, Object bean, Object k, Object v) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        Object m = ReflectionHelper.getValue(field, bean);

        if (m == null) {
            ReflectionHelper.setValue(field, bean, m = new HashMap<>());
        }

        ((Map)m).put(k, v);

        reverseMap(binder, field, bean, v);
    }

    public static void removeFromMap(MDDBinder binder, FieldInterfaced field, Object bean, Set l) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        final Object v = ReflectionHelper.getValue(field, bean);

        l.forEach(e -> ((Map)v).remove(((MapEntry)e).getKey()));


        final FieldInterfaced mbf = ReflectionHelper.getMapper(field);
        if (mbf != null) {
            l.forEach(o -> {
                try {

                    unReverseMap(binder, field, bean, ((MapEntry)o).getValue(), mbf);

                } catch (Throwable e1) {
                    MDD.alert(e1);
                }
            });
        }

    }


    public static void unReverseMap(MDDBinder binder, FieldInterfaced field, Object bean, Object i) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {

        final FieldInterfaced mbf = ReflectionHelper.getMapper(field);
        if (mbf != null) {
            unReverseMap(binder, field, bean, i, mbf);
        }

    }

    public static void unReverseMap(MDDBinder binder, FieldInterfaced field, Object bean, Object i, FieldInterfaced mbf) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {

        if (Collection.class.isAssignableFrom(mbf.getType())) {
            Collection col = (Collection) ReflectionHelper.getValue(mbf, i);
            col.remove(i);
        } else if (Set.class.isAssignableFrom(mbf.getType())) {
            Set col = (Set) ReflectionHelper.getValue(mbf, i);
            col.remove(i);
        } else {
            ReflectionHelper.setValue(mbf, i, null);
        }
        binder.getMergeables().add(i);

    }



    public static void reverseMap(MDDBinder binder, FieldInterfaced field, Object bean, Object i) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        FieldInterfaced mbf = ReflectionHelper.getMapper(field);

        if (mbf != null) {

            if (Collection.class.isAssignableFrom(mbf.getType())) {
                Collection col = (Collection) ReflectionHelper.getValue(mbf, i);
                if (!col.contains(i)) col.add(bean);
            } else if (Set.class.isAssignableFrom(mbf.getType())) {
                Set col = (Set) ReflectionHelper.getValue(mbf, i);
                if (!col.contains(i)) col.add(bean);
            } else {
                ReflectionHelper.setValue(mbf, i, bean);
            }
            binder.getMergeables().add(i);

        }

    }

    public static Class<?> getGenericClass(Class type) {
        Class<?> gc = null;
        if (type.getGenericInterfaces() != null) for (Type gi : type.getGenericInterfaces()) {
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

    public static Set<Class> getSubclasses(Class c) {
        Reflections reflections = new Reflections(c.getPackage().getName());

        Set<Class> subs = reflections.getSubTypesOf(c);

        return subs;
    }
}
