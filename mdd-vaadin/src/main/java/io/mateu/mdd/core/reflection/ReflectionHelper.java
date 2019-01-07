package io.mateu.mdd.core.reflection;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.Binder;
import com.vaadin.data.provider.DataProvider;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.data.*;
import io.mateu.mdd.core.interfaces.PushWriter;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.tests.Persona;
import javassist.*;
import javassist.bytecode.AnnotationsAttribute;
import javassist.bytecode.ClassFile;
import javassist.bytecode.ConstPool;
import javassist.bytecode.annotation.*;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.UserData;
import org.apache.commons.beanutils.BeanUtils;
import org.reflections.Reflections;

import javax.persistence.*;
import javax.servlet.ServletContext;
import javax.tools.*;
import javax.validation.constraints.NotEmpty;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import static java.util.Collections.singletonList;
import static javax.tools.JavaFileObject.Kind.SOURCE;

public class ReflectionHelper {

    static List<Class> basicos = new ArrayList<>();

    static {
        basicos.add(String.class);
        basicos.add(Integer.class);
        basicos.add(Long.class);
        basicos.add(Double.class);
        basicos.add(Boolean.class);
        basicos.add(LocalDate.class);
        basicos.add(LocalDateTime.class);
        basicos.add(int.class);
        basicos.add(long.class);
        basicos.add(double.class);
        basicos.add(boolean.class);
    }


    public static boolean isBasico(Class c) {
        return basicos.contains(c);
    }

    public static boolean isBasico(Object o) {
        return isBasico(o.getClass());
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

    public static void setValue(FieldInterfaced f, Object o, Object v) throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
        if (f instanceof FieldInterfacedForCheckboxColumn) {
            f.setValue(o, v);
        } else setValue(f.getId(), o, v);
    }

    public static void setValue(String fn, Object o, Object v) throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
        if (Map.class.isAssignableFrom(o.getClass())) {
            ((Map)o).put(fn, v);
        } else {
            if (fn.contains(".")) {
                o = getInstance(o, fn.substring(0, fn.indexOf(".")));
                setValue(fn.substring(fn.indexOf(".") + 1), o, v);
            } else {
                if (v instanceof Collection) {
                    if (v instanceof List) v = new ArrayList((Collection) v);
                    else if (v instanceof  Set) v = new HashSet((Collection) v);
                }
                BeanUtils.setProperty(o, fn, v);
            }
        }
    }

    public static Object getValue(FieldInterfaced f, Object o) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        if (o == null) return null;

        if (Map.class.isAssignableFrom(o.getClass())) {
            return ((Map) o).get(f.getName());
        } else if (f instanceof FieldInterfacedForCheckboxColumn) {
            return f.getValue(o);
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
        if (c != null) for (Method q : getAllMethods(c)) {
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
        return getGetter(f.getType(), f.getName());
    }

    public static String getGetter(FieldInterfaced f) {
        return getGetter(f.getType(), f.getName());
    }

    public static String getGetter(Class c, String fieldName) {
        return (boolean.class.equals(c)?"is":"get") + getFirstUpper(fieldName);
    }

    public static String getGetter(String fn) {
        return "get" + getFirstUpper(fn);
    }

    public static String getSetter(Field f) {
        return getSetter(f.getType(), f.getName());
    }
    public static String getSetter(FieldInterfaced f) {
        return getSetter(f.getType(), f.getName());
    }


    public static String getSetter(Class c, String fieldName) {
        return "set" + getFirstUpper(fieldName);
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

    public static List<FieldInterfaced> getAllFields(Class c) {

        List<String> vistos = new ArrayList<>();
        Map<String, Field> originales = new HashMap<>();
        for (Field f : c.getDeclaredFields()) {
            if (!f.getName().contains("$") && !"_proxied".equalsIgnoreCase(f.getName()) && !"_possibleValues".equalsIgnoreCase(f.getName()) && !"_binder".equalsIgnoreCase(f.getName()) && !"_field".equalsIgnoreCase(f.getName())) originales.put(f.getName(), f);
        }

        List<FieldInterfaced> l = new ArrayList<>();

        if (c.getSuperclass() != null && (!c.isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class))) {
            for (FieldInterfaced f : getAllFields(c.getSuperclass())) {
                if (!originales.containsKey(f.getId())) l.add(f);
                else l.add(new FieldInterfacedFromField(originales.get(f.getName())));
                vistos.add(f.getName());
            }
        }

        for (Field f : c.getDeclaredFields()) if (!vistos.contains(f.getName())) if (!f.getName().contains("$") && !"_proxied".equalsIgnoreCase(f.getName()) && !"_possibleValues".equalsIgnoreCase(f.getName()) && !"_binder".equalsIgnoreCase(f.getName()) && !"_field".equalsIgnoreCase(f.getName())) {
            l.add(new FieldInterfacedFromField(f));
        }

        return l;
    }

    public static List<FieldInterfaced> getAllFields(Method m) {

        List<FieldInterfaced> l = new ArrayList<>();

        for (Parameter p : m.getParameters()) if (!isInjectable(p)) {
            l.add(new FieldInterfacedFromParameter(m, p));
        }

        return l;
    }

    public static boolean isInjectable(Parameter p) {
        boolean injectable = true;
        if (EntityManager.class.equals(p.getType())) {
        } else if (UserData.class.equals(p.getType())) {
        } else if (Set.class.isAssignableFrom(p.getType())) {
        } else if (PushWriter.class.equals(p.getType())) {
        } else {
            injectable = false;
        }
        return injectable;
    }

    private static Map<String, FieldInterfaced> getAllFieldsMap(Class c) {
        return getAllFieldsMap(getAllFields(c));
    }

    private static Map<String, FieldInterfaced> getAllFieldsMap(List<FieldInterfaced> l) {

        Map<String, FieldInterfaced> m = new HashMap<>();

        for (FieldInterfaced f : l) m.put(f.getName(), f);

        return m;
    }

    private static List<FieldInterfaced> getAllFields(Class entityClass, boolean fieldsInFilterOnly, List<String> fieldsFilter, List<String> negatedFormFields) {
        List<FieldInterfaced> fs = getAllFields(entityClass);
        Map<String, FieldInterfaced> m = getAllFieldsMap(fs);

        List<FieldInterfaced> l = new ArrayList<>();

        if (fieldsInFilterOnly) {
            if (fieldsFilter != null) for (String fn : fieldsFilter) {
                boolean soloSalida = false;
                if (fn.startsWith("-")) {
                    soloSalida = true;
                    fn = fn.substring(1);
                }
                if (fn.contains(".")) {
                    FieldInterfaced f = null;
                    String finalFn = fn;
                    boolean finalSoloSalida = soloSalida;
                    l.add(f = new FieldInterfacedFromField(getField(entityClass, finalFn, m)) {
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
                            if (finalSoloSalida && Output.class.equals(annotationClass)) return true;
                            else return super.isAnnotationPresent(annotationClass);
                        }
                    });

                } else {
                    if (m.containsKey(fn)) {
                        boolean finalSoloSalida1 = soloSalida;
                        l.add((soloSalida)?new FieldInterfacedFromField(m.get(fn)) {
                            @Override
                            public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                                if (finalSoloSalida1 && Output.class.equals(annotationClass)) return true;
                                else return super.isAnnotationPresent(annotationClass);
                            }
                        }:m.get(fn));
                    }
                }
            }
        } else {
            for (FieldInterfaced f : fs) {
                if (negatedFormFields == null || !negatedFormFields.contains(f.getId())) {
                    boolean soloSalida = fieldsFilter != null && fieldsFilter.contains("-" + f.getId());
                    boolean forzarEditable = fieldsFilter != null && fieldsFilter.contains("+" + f.getId());

                    l.add((soloSalida || forzarEditable)?new FieldInterfacedFromField(f) {
                        @Override
                        public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                            if (Output.class.equals(annotationClass)) return soloSalida || !forzarEditable || super.isAnnotationPresent(annotationClass);
                            else return super.isAnnotationPresent(annotationClass);
                        }
                    }:f);
                }
            }
        }

        return l.stream().filter((f) -> f != null).collect(Collectors.toList());
    }

    private static FieldInterfaced getField(Class entityClass, String fn, Map<String, FieldInterfaced> m) {
        FieldInterfaced f = null;
        if (fn.contains(".")) {
            String flfn = fn.substring(0, fn.indexOf("."));
            FieldInterfaced flf = m.get(flfn);
            if (flf != null) f = getField(flf.getType(), fn.substring(flfn.length() + 1), getAllFieldsMap(flf.getType()));
        } else {
            if (m.containsKey(fn)) f = m.get(fn);
        }
        return f;
    }

    public static Object getId(Object model) {
        if (model instanceof Object[]) return ((Object[]) model)[0];
        else if (model instanceof io.mateu.mdd.core.util.Pair) return ((io.mateu.mdd.core.util.Pair)model).getA();
        else if (model instanceof Pair) return ((Pair)model).getKey();
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

    public static FieldInterfaced getIdField(Class type) {
        if (type.isAnnotationPresent(Entity.class)) {
            FieldInterfaced idField = null;

            for (FieldInterfaced f : ReflectionHelper.getAllFields(type)) {
                if (f.isAnnotationPresent(Id.class)) {
                    idField = f;
                    break;
                }
            }

            return idField;
        } else return null;
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
        return field;
    }

    public static FieldInterfaced getMapper(FieldInterfaced field) {

        // field es el campo original


        // mapper será la contraparte en el destino
        FieldInterfaced mapper = null;

        // buscamos el nombre del campo mapper en el campo original
        String mfn = null;
        if (field.isAnnotationPresent(OneToOne.class)) mfn = field.getAnnotation(OneToOne.class).mappedBy();
        else if (field.isAnnotationPresent(OneToMany.class)) mfn = field.getAnnotation(OneToMany.class).mappedBy();
        else if (field.isAnnotationPresent(ManyToMany.class)) mfn = field.getAnnotation(ManyToMany.class).mappedBy();
        else if (field.isAnnotationPresent(ManyToOne.class)) {

            // si es un campo many to one, entonces no tenemos atributo mappedBy en el origen y debemos buscar un campo en la contraparte con el atributo mappedBy

            for (FieldInterfaced f : ReflectionHelper.getAllFields(field.getType())) {
                String z = null;
                if (f.isAnnotationPresent(OneToOne.class)) z = f.getAnnotation(OneToOne.class).mappedBy();
                else if (f.isAnnotationPresent(OneToMany.class)) z = f.getAnnotation(OneToMany.class).mappedBy();
                else if (f.isAnnotationPresent(ManyToMany.class)) z = f.getAnnotation(ManyToMany.class).mappedBy();
                // debe coincidir el nombre y el tipo
                if (field.getName().equals(z) && (field.getDeclaringClass().equals(f.getType()) || field.getDeclaringClass().equals(ReflectionHelper.getGenericClass(f.getGenericType())))) {
                    mfn = f.getName();
                    break;
                }
            }
        }

        Class targetClass = null;
        if (Collection.class.isAssignableFrom(field.getType()) || Set.class.isAssignableFrom(field.getType())) {
            targetClass = field.getGenericClass();
        } else if (Map.class.isAssignableFrom(field.getType())) {
            targetClass = ReflectionHelper.getGenericClass(field, Map.class, "V");
        } else {
            targetClass = field.getType();
        }

        if (!Strings.isNullOrEmpty(mfn)) {
            mapper = getFieldByName(targetClass, mfn);

        } else {

            if (targetClass.isAnnotationPresent(Entity.class)) for (FieldInterfaced f : ReflectionHelper.getAllFields(targetClass)) {
                mfn = null;
                if (f.isAnnotationPresent(OneToOne.class)) mfn = f.getAnnotation(OneToOne.class).mappedBy();
                else if (f.isAnnotationPresent(OneToMany.class)) mfn = f.getAnnotation(OneToMany.class).mappedBy();
                else if (f.isAnnotationPresent(ManyToMany.class)) mfn = f.getAnnotation(ManyToMany.class).mappedBy();

                if (field.getName().equals(mfn)) {

                    Class reverseClass = null;
                    if (Collection.class.isAssignableFrom(f.getType()) || Set.class.isAssignableFrom(f.getType())) {
                        reverseClass = f.getGenericClass();
                    } else if (Map.class.isAssignableFrom(field.getType())) {
                        reverseClass = ReflectionHelper.getGenericClass(f, Map.class, "V");
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

    public static List<FieldInterfaced> getKpiFields(Class modelType) {
        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(modelType);

        allFields = allFields.stream().filter((f) ->
                f.isAnnotationPresent(KPI.class)
        ).collect(Collectors.toList());

        return allFields;
    }


    public static List<FieldInterfaced> getAllEditableFields(Class modelType) {
        return getAllEditableFilteredFields(modelType, null, null);
    }

    public static List<FieldInterfaced> getAllEditableFilteredFields(Class modelType, String fieldsFilter, List<FieldInterfaced> editableFields) {
        List<FieldInterfaced> l = editableFields != null?editableFields:getAllEditableFields(modelType, null, true);
        if (!Strings.isNullOrEmpty(fieldsFilter)) {
            List<FieldInterfaced> borrar = new ArrayList<>();
            List<String> ts = Arrays.asList(fieldsFilter.replaceAll(" ", "").split(","));
            for (FieldInterfaced f : l) if (!ts.contains(f.getName())) borrar.add(f);
            l.removeAll(borrar);
        }
        return l;
    }

    public static List<FieldInterfaced> getAllEditableFields(Class modelType, Class superType) {
        return getAllEditableFields(modelType, superType, true);
    }

    public static List<FieldInterfaced> getAllEditableFields(Class modelType, Class superType, boolean includeReverseMappers) {
        return getAllEditableFields(modelType, superType, includeReverseMappers, null);
    }

    public static List<FieldInterfaced> getAllEditableFields(Class modelType, Class superType, boolean includeReverseMappers, FieldInterfaced field) {
        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(modelType);


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


        boolean isEditingNewRecord = MDDUI.get().isEditingNewRecord();


        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || f.isAnnotationPresent(KPI.class) || f.isAnnotationPresent(NotInEditor.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class))
                || (f.isAnnotationPresent(NotWhenCreating.class) && isEditingNewRecord)
                        || (f.isAnnotationPresent(NotWhenEditing.class) && !isEditingNewRecord))
        ).collect(Collectors.toList());


        if (superType != null && !includeReverseMappers) {

            List<FieldInterfaced> manytoones = allFields.stream().filter(f -> f.isAnnotationPresent(ManyToOne.class)).collect(Collectors.toList());

            for (FieldInterfaced manytoonefield : manytoones) if (superType.equals(manytoonefield.getType())) {

                for (FieldInterfaced parentField : ReflectionHelper.getAllFields(manytoonefield.getType())) {
                    // quitamos el campo mappedBy de las columnas, ya que se supone que siempre seremos nosotros
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


        for (FieldInterfaced f : new ArrayList<>(allFields)) if (f.isAnnotationPresent(Position.class)) {
            allFields.remove(f);
            allFields.add(f.getAnnotation(Position.class).value(), f);
        }


        return allFields;
    }


    public static Object invokeInjectableParametersOnly(Method method, Object instance) throws Throwable {
        return execute(MDD.getUserData(), method, new MDDBinder(new ArrayList<>()), instance, null);
    }


    public static Object execute(UserData user, Method m, MDDBinder parameters, Object instance, Set pendingSelection) throws Throwable {
        Map<String, Object> params = (Map<String, Object>) parameters.getBean();

        int posEM = -1;

        List<Object> vs = new ArrayList<>();
        int pos = 0;
        for (Parameter p : m.getParameters()) {
            Class<?> pgc = ReflectionHelper.getGenericClass(p.getParameterizedType());

            if (UserData.class.equals(p.getType())) {
                vs.add(user);
            } else if (EntityManager.class.equals(p.getType())) {
                posEM = pos;
            } else if (PushWriter.class.equals(p.getType())) {
                vs.add(new PushWriter() {
                    @Override
                    public void push(String message) {
                        MDD.getPort().push(message);
                    }

                    @Override
                    public void done(String message) {
                        MDD.getPort().pushDone(message);
                    }
                });
            } else if (Modifier.isStatic(m.getModifiers()) && Set.class.isAssignableFrom(p.getType()) && (m.getDeclaringClass().equals(pgc) || (instance instanceof RpcView && ReflectionHelper.getGenericClass(instance.getClass(), RpcView.class, "C").equals(pgc)))) {
                vs.add(pendingSelection);
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
            pos++;
        }

        if (posEM >= 0) {

            Object[] r = {null};

            int finalPosEM = posEM;

            Helper.transact(em -> {

                vs.add(finalPosEM, em);

                Object[] args = vs.toArray();

                r[0] = m.invoke(instance, args);

                if (r[0] != null && r[0] instanceof Query) r[0] = ((Query)r[0]).getResultList();

            });

            return r[0];

        } else {

            Object[] args = vs.toArray();

            return m.invoke(instance, args);

        }

    }


    private static FieldInterfaced getInterfaced(Parameter p) {
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
                return (p.isAnnotationPresent(ValueClass.class))?p.getAnnotation(ValueClass.class).value():null;
            }

            @Override
            public String getOptionsQL() {
                return (p.isAnnotationPresent(ValueQL.class))?p.getAnnotation(ValueQL.class).value():null;
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

            @Override
            public Annotation[] getDeclaredAnnotations() {
                return p.getDeclaredAnnotations();
            }
        };
    }


    public static String getCaption(FieldInterfaced f) {
        if (f.isAnnotationPresent(Caption.class)) {
            return f.getAnnotation(Caption.class).value();
        } else return Helper.capitalize(f.getName());
    }


    public static void addToCollection(MDDBinder binder, FieldInterfaced field, Object bean) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException {

        Method m = ReflectionHelper.getMethod(bean.getClass(), "create" + getFirstUpper(field.getName()) + "Instance");

        Object i = null;

        if (m != null) {
            i = m.invoke(bean);
        } else {
            i = field.getGenericClass().newInstance();
        }

        addToCollection(binder, field, bean, i);
    }

    public static void addToCollection(MDDBinder binder, FieldInterfaced field, Object bean, Object i) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        Object v = ReflectionHelper.getValue(field, bean);

        boolean added = false;

        if (Collection.class.isAssignableFrom(field.getType())) {

            if (v == null) {
                ReflectionHelper.setValue(field, bean, v = new ArrayList());
            }

            if (!((Collection)v).contains(i)) {
                ((Collection)v).add(i);
                added = true;
            }

        } else if (Set.class.isAssignableFrom(field.getType())) {

            if (v == null) {
                ReflectionHelper.setValue(field, bean, v = new HashSet());
            }

            if (!((Set)v).contains(i)) {
                ((Set)v).add(i);
                added = true;
            }

        }

        if (added) {
            reverseMap(binder, field, bean, i);
            ReflectionHelper.setValue(field, bean, ReflectionHelper.getValue(field, bean));
            Object finalV = v;
            binder.getBinding(field.getName()).ifPresent(b -> ((Binder.Binding)b).getField().setValue(finalV));
        }

    }

    public static void removeFromCollection(MDDBinder binder, FieldInterfaced field, Object bean, Collection l) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        removeFromCollection(binder, field, bean, l, true);
    }

    public static void removeFromCollection(MDDBinder binder, FieldInterfaced field, Object bean, Collection l, boolean unreverseMap) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

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


        if (unreverseMap) {
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

        ReflectionHelper.setValue(field, bean, ReflectionHelper.getValue(field, bean));
        Object finalV = v;
        binder.getBinding(field.getName()).ifPresent(b -> ((Binder.Binding)b).getField().setValue(finalV));


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


    /**
     *
     * @param binder el binder del objeto padre
     * @param field el campo en el objeto padre
     * @param bean el objeto padre
     * @param i el tercero que queremos actualizar
     * @throws IllegalAccessException
     * @throws NoSuchMethodException
     * @throws InvocationTargetException
     */
    public static void unReverseMap(MDDBinder binder, FieldInterfaced field, Object bean, Object i) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {

        final FieldInterfaced mbf = ReflectionHelper.getMapper(field);
        if (mbf != null) {
            unReverseMap(binder, field, bean, i, mbf);
        }

    }

    public static void unReverseMap(MDDBinder binder, FieldInterfaced field, Object bean, Object i, FieldInterfaced mbf) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {

        if (Collection.class.isAssignableFrom(mbf.getType())) {
            Collection col = (Collection) ReflectionHelper.getValue(mbf, i);
            col.remove(bean);
        } else if (Set.class.isAssignableFrom(mbf.getType())) {
            Set col = (Set) ReflectionHelper.getValue(mbf, i);
            col.remove(bean);
        } else {
            ReflectionHelper.setValue(mbf, i, null);
        }
        binder.getMergeables().add(i);

    }


    /**
     *
     * @param binder el binder del objeto padre
     * @param field el campo en el objeto padre
     * @param bean el objeto padre
     * @param i el tercero que queremos actualizar
     * @throws IllegalAccessException
     * @throws NoSuchMethodException
     * @throws InvocationTargetException
     */
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

    public static Set<Class> getSubclasses(Class c) {
        Reflections reflections = new Reflections(c.getPackage().getName());

        Set<Class> subs = reflections.getSubTypesOf(c);

        Set<Class> subsFiltered = new TreeSet<>((a,b) -> a.getSimpleName().compareTo(b.getSimpleName()));
        subsFiltered.addAll(subs.stream().filter(s -> !Modifier.isAbstract(s.getModifiers())).collect(Collectors.toSet()));

        return subsFiltered;
    }

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

    public static Method getMethod(Consumer methodReference) {
        //todo: pendiente!!!!
        return ReflectionHelper.getMethod(methodReference.getClass(), methodReference.toString());
    }

    public static boolean isOwnedCollection(FieldInterfaced field) {
        boolean owned = false;

        if (Collection.class.isAssignableFrom(field.getType())) {

            OneToMany aa = field.getAnnotation(OneToMany.class);
            ManyToMany mm = field.getAnnotation(ManyToMany.class);

            if (aa != null && aa.cascade() != null) for (CascadeType ct : aa.cascade()) {
                if (CascadeType.ALL.equals(ct) || CascadeType.REMOVE.equals(ct)) {
                    owned = true;
                    break;
                }
            } else if (mm != null && mm.cascade() != null) for (CascadeType ct : mm.cascade()) {
                if (CascadeType.ALL.equals(ct) || CascadeType.REMOVE.equals(ct)) {
                    owned = true;
                    break;
                }
            } else if (field.isAnnotationPresent(ElementCollection.class)) owned = true;
            else if (!ReflectionHelper.getGenericClass(field.getGenericType()).isAnnotationPresent(Entity.class)) owned = true;


            if (owned) {

                io.mateu.mdd.core.annotations.DataProvider dpa = (field.isAnnotationPresent(io.mateu.mdd.core.annotations.DataProvider.class)) ? field.getAnnotation(io.mateu.mdd.core.annotations.DataProvider.class) : null;

                if (dpa == null) {

                    Method mdp = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "DataProvider");

                    owned = mdp == null;

                } else owned = false;

            }
        }

        return owned;
    }


    public static Class createClassUsingJavac(String fullClassName, List<FieldInterfaced> fields) throws CannotCompileException, IOException, NoSuchFieldException, IllegalAccessException, ClassNotFoundException {

        String java = "public class " + fullClassName + " {\n";
        for (FieldInterfaced f : fields) {

            java += "\n";
            java += "\n";

            java += "  private " + f.getType().getName() + " " + f.getName()+ ";";

            java += "\n";
            java += "\n";

            java += "  private " + f.getType().getName() + " " + getGetter(f) + "() {\n";
            java += "    return this." + f.getName() + ";\n";
            java += "  }";

        }

        java += "\n";
        java += "\n";

        java += "}";

        System.out.println(java);

        final ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();

        String finalJava = java;
        final SimpleJavaFileObject simpleJavaFileObject = new SimpleJavaFileObject(URI.create(fullClassName + ".java"), SOURCE) {

            @Override
            public CharSequence getCharContent(boolean ignoreEncodingErrors) {
                return finalJava;
            }

            @Override
            public OutputStream openOutputStream() throws IOException{
                return byteArrayOutputStream;
            }
        };

        final JavaFileManager javaFileManager = new ForwardingJavaFileManager(
                ToolProvider.getSystemJavaCompiler().
                        getStandardFileManager(null, null, null)) {

            @Override
            public JavaFileObject getJavaFileForOutput(
                    Location location,String className,
                    JavaFileObject.Kind kind,
                    FileObject sibling) throws IOException {
                return simpleJavaFileObject;
            }
        };

        ToolProvider.getSystemJavaCompiler().getTask(null, javaFileManager, null, null, null, singletonList(simpleJavaFileObject)).call();


        return Class.forName(fullClassName);

    }

    public static Class createClassUsingJavassist(String fullClassName, List<FieldInterfaced> fields) throws CannotCompileException, IOException, NoSuchFieldException, IllegalAccessException, ClassNotFoundException, NotFoundException {
        ClassPool pool = ClassPool.getDefault();
        CtClass cc = pool.get(FakeClass.class.getName());
        cc.setName(fullClassName);




        for (FieldInterfaced f : fields) {

            CtField ctf;
            cc.addField(ctf = new CtField(pool.get(f.getType().getName()), f.getName(), cc));
            ctf.setModifiers(Modifier.PRIVATE);

            CtMethod ctm;
            cc.addMethod(ctm = new CtMethod(ctf.getType(), getGetter(f), new CtClass[0], cc));
            ctm.setModifiers(Modifier.PUBLIC);
            ctm.setBody(" return this."+ f.getName() + "; ");

        }

        cc.writeFile();
        cc.detach();

        cc.toClass(ReflectionHelper.class.getClassLoader(), ReflectionHelper.class.getProtectionDomain());
        return Class.forName(fullClassName);
    }

    public static Class createClassUsingJavassist2(String fullClassName, List<FieldInterfaced> fields, boolean forFilters) throws Exception {
        return createClassUsingJavassist2(fullClassName, fields, forFilters, false, null, null);
    }

    public static Class createClassUsingJavassist2(String fullClassName, List<FieldInterfaced> fields, boolean forFilters, boolean forInlineEditing, FieldInterfaced collectionField, Object owner) throws Exception {

        System.out.println("creating class " + fullClassName);

        List<String> avoidedAnnotationNames = Lists.newArrayList("NotNull", "NotEmpty", "SameLine", "Unmodifiable");

        ClassPool pool = MDD.getClassPool();

        CtClass cc = pool.makeClass(fullClassName);
        cc.setModifiers(Modifier.PUBLIC);

        if (forInlineEditing) {

            cc.addInterface(pool.get(ProxyClass.class.getName()));


            CtField ctf;
            cc.addField(ctf = new CtField(pool.get(collectionField.getGenericClass().getName()), "_proxied", cc));
            ctf.setModifiers(Modifier.PRIVATE);


            cc.addField(ctf = new CtField(pool.get(Map.class.getName()), "_possibleValues", cc));
            ctf.setModifiers(Modifier.PRIVATE);

            cc.addField(ctf = new CtField(pool.get(MDDBinder.class.getName()), "_binder", cc));
            ctf.setModifiers(Modifier.PRIVATE);


            CtConstructor cons;
            cc.addConstructor(cons = new CtConstructor(new CtClass[] {pool.get(collectionField.getGenericClass().getName())}, cc));
            //cons.setBody("{super();this._proxied = $1;}");
            cons.setBody("this._proxied = $1;");


            cc.addConstructor(cons = new CtConstructor(new CtClass[] {pool.get(collectionField.getGenericClass().getName()), pool.get(Map.class.getName())}, cc));
            cons.setBody("{super();this._proxied = $1;this._possibleValues = $2;}");

            cc.addConstructor(cons = new CtConstructor(new CtClass[] {pool.get(collectionField.getGenericClass().getName()), pool.get(Map.class.getName()), pool.get(MDDBinder.class.getName())}, cc));
            cons.setBody("{super();this._proxied = $1;this._possibleValues = $2;this._binder = $3;}");

            cc.addMethod(CtNewMethod.make("public Object toObject() { return this._proxied; }", cc));
        }

        ClassFile cfile = cc.getClassFile();
        ConstPool cpool = cfile.getConstPool();

        for (FieldInterfaced f : fields) {


            Class t = f.getType();

            if (forFilters) {

                if (forFilters && boolean.class.equals(t)) t = Boolean.class;


                if (LocalDate.class.equals(t) || LocalDateTime.class.equals(t) || Date.class.equals(t)) {
                    addField(avoidedAnnotationNames, pool, cfile, cpool, cc, forFilters, t, f.getName() + "From", f.getDeclaredAnnotations(), false);
                    addField(avoidedAnnotationNames, pool, cfile, cpool, cc, forFilters, t, f.getName() + "To", f.getDeclaredAnnotations(), true);
                } else addField(avoidedAnnotationNames, pool, cfile, cpool, cc, forFilters, t, f.getName(), f.getDeclaredAnnotations(), false);

            } else if (forInlineEditing) {

                if (f.isAnnotationPresent(UseCheckboxes.class) && f.getAnnotation(UseCheckboxes.class).editableInline()) {

                    Collection possibleValues = null;

                    String vmn = ReflectionHelper.getGetter(collectionField.getName() + getFirstUpper(f.getName())) + "Values";

                    Method mdp = ReflectionHelper.getMethod(collectionField.getDeclaringClass(), vmn);

                    if (mdp != null) {
                        possibleValues = (Collection) mdp.invoke(owner);
                    } else {
                        MDD.alert("Missing " + vmn + " method at " + collectionField.getDeclaringClass().getName());
                    }


                    int pos = 0;
                    if (possibleValues != null) for (Object v : possibleValues) if (v != null) {
                        addField(avoidedAnnotationNames, pool, cfile, cpool, cc, forFilters, boolean.class, f.getName() + "" + pos, f.getDeclaredAnnotations(), false, true, "" + v, pos, f);
                        pos++;
                    }


                } else addField(avoidedAnnotationNames, pool, cfile, cpool, cc, forFilters, t, f.getName(), f.getDeclaredAnnotations(), false, forInlineEditing, null, -1, null);

            } else {
                addField(avoidedAnnotationNames, pool, cfile, cpool, cc, forFilters, t, f.getName(), f.getDeclaredAnnotations(), false);
            }


        }

        return cc.toClass();
    }

    private static void addField(List<String> avoidedAnnotationNames, ClassPool pool, ClassFile cfile, ConstPool cpool, CtClass cc, boolean forFilters, Class t, String fieldName, Annotation[] declaredAnnotations, boolean forceSameLine) throws Exception {
        addField(avoidedAnnotationNames, pool, cfile, cpool, cc, forFilters, t, fieldName, declaredAnnotations, forceSameLine, false, null, -1, null);
    }

    private static void addField(List<String> avoidedAnnotationNames, ClassPool pool, ClassFile cfile, ConstPool cpool, CtClass cc, boolean forFilters, Class t, String fieldName, Annotation[] declaredAnnotations, boolean forceSameLine, boolean forInlineEditing, String caption, int valueKey, FieldInterfaced collectionField) throws Exception {

        CtField ctf;


        cc.addField(ctf = new CtField(pool.get(t.getName()), fieldName, cc));
        ctf.setModifiers(Modifier.PRIVATE);

        if (forceSameLine) {

            boolean yaEsta = false;
            for (Annotation a : declaredAnnotations) if (SameLine.class.equals(a.annotationType())) {
                yaEsta = true;
                break;
            }

            if (!yaEsta) {
                declaredAnnotations = Arrays.copyOf(declaredAnnotations, declaredAnnotations.length + 1);
                declaredAnnotations[declaredAnnotations.length - 1] = new SameLine() {

                    @Override
                    public Class<? extends Annotation> annotationType() {
                        return SameLine.class;
                    }
                };
            }
        }

        if (caption != null) {

            boolean yaEsta = false;
            for (Annotation a : declaredAnnotations) if (Caption.class.equals(a.annotationType())) {
                yaEsta = true;
                break;
            }

            if (!yaEsta) {
                declaredAnnotations = Arrays.copyOf(declaredAnnotations, declaredAnnotations.length + 1);
                declaredAnnotations[declaredAnnotations.length - 1] = new Caption() {

                    @Override
                    public String value() {
                        return caption;
                    }

                    @Override
                    public Class<? extends Annotation> annotationType() {
                        return Caption.class;
                    }
                };
            }

        }


        if (declaredAnnotations.length > 0) {

            boolean hay = !forFilters;

            if (!hay) {
                for (Annotation a : declaredAnnotations) {
                    String n = a.annotationType().getSimpleName();
                    if (!avoidedAnnotationNames.contains(n) || (forceSameLine && "SameLine".equals(n)) || (caption != null && "Caption".equals(n))) {
                        hay = true;
                        break;
                    }
                }
            }

            if (hay) {
                AnnotationsAttribute attr = new AnnotationsAttribute(cpool, AnnotationsAttribute.visibleTag);
                for (Annotation a : declaredAnnotations) {
                    String n = a.annotationType().getSimpleName();
                    if (!forFilters || !avoidedAnnotationNames.contains(n) || (forceSameLine && "SameLine".equals(n)) || (caption != null && "Caption".equals(n))) {
                        addAnnotation(cc, cfile, cpool, ctf, a, attr);
                    }
                }
                ctf.getFieldInfo().addAttribute(attr);
            }

        }

        if (forInlineEditing) {
            CtMethod g;
            cc.addMethod(g = CtNewMethod.getter(getGetter(t, fieldName), ctf));
            if (valueKey >= 0) {
                String b = "return this._proxied." + getGetter(collectionField) + "().contains(((" + Map.class.getName() + ")this._possibleValues.get(\"" + collectionField.getName() + "\")).get(new Integer(" + valueKey + ")));";
                //g.setBody("{System.out.println(\"Hola getter!!! " + b.replaceAll("\"", "'") + "\");" + b + "}");
                g.setBody("{" + b + "}");
            } else g.setBody("return this._proxied." + g.getName() + "();");
            CtMethod s;
            cc.addMethod(s = CtNewMethod.setter(getSetter(t, fieldName), ctf));
            if (valueKey >= 0) {
                String b = "if ($1) {" +
                        "Object tercero = ((" + Map.class.getName() + ")this._possibleValues.get(\"" + collectionField.getName() + "\")).get(new Integer(" + valueKey + "));" +
                        "this._proxied." + getGetter(collectionField) + "().add(tercero); " +
                        "this._binder.getMergeables().add(tercero);" +
                        FieldInterfaced.class.getName() + " field = " + ReflectionHelper.class.getName() + ".getFieldByName(this._proxied.getClass(), \"" + collectionField.getName() + "\");" +
                        "this._binder.getMergeables().add(tercero);" +
                        "" + ReflectionHelper.class.getName() + ".reverseMap(this._binder, field, this._proxied, tercero);" +
                        "} else {" +
                        "Object tercero = ((" + Map.class.getName() + ")this._possibleValues.get(\"" + collectionField.getName() + "\")).get(new Integer(" + valueKey + "));" +
                        "this._proxied." + getGetter(collectionField) + "().remove(tercero);" +
                        FieldInterfaced.class.getName() + " field = " + ReflectionHelper.class.getName() + ".getFieldByName(this._proxied.getClass(), \"" + collectionField.getName() + "\");" +
                        "this._binder.getMergeables().add(tercero);" +
                        "" + ReflectionHelper.class.getName() + ".unReverseMap(this._binder, field, this._proxied, tercero);" +
                        "}";
                System.out.println(b);
                //s.setBody("{System.out.println(\"Hola setter!!! " + b.replaceAll("\"", "'") + "\");" + b + "}");
                s.setBody("{" + b + "}");
            } else s.setBody("this._proxied." + s.getName() + "($1);");
        } else {
            cc.addMethod(CtNewMethod.getter(getGetter(t, fieldName), ctf));
            cc.addMethod(CtNewMethod.setter(getSetter(t, fieldName), ctf));
        }


    }

    private static void addAnnotation(CtClass cc, ClassFile cfile, ConstPool cpool, CtField ctf, Annotation a, AnnotationsAttribute attr) throws InvocationTargetException, IllegalAccessException {
        javassist.bytecode.annotation.Annotation annot = new javassist.bytecode.annotation.Annotation(a.annotationType().getName(), cpool);
        for (Method m : a.annotationType().getDeclaredMethods()) {
            System.out.println("" + m.getName());
            Object v = m.invoke(a);
            if (v != null) {
                MemberValue mv = getAnnotationMemberValue(cpool, m.getReturnType(), v);
                if (mv != null) annot.addMemberValue(m.getName(), mv);
            }
        }
        attr.addAnnotation(annot);
    }

    private static MemberValue getAnnotationMemberValue(ConstPool cpool, Class t, Object v) {
        MemberValue mv = null;
        if (v != null) {
            if (int.class.equals(t)) mv = new IntegerMemberValue(cpool, (Integer) v);
            else if (long.class.equals(t)) mv = new LongMemberValue((Long) v, cpool);
            else if (double.class.equals(t)) mv = new DoubleMemberValue((Double) v, cpool);
            else if (boolean.class.equals(t)) mv = new BooleanMemberValue((Boolean) v, cpool);
            else if (t.isEnum()) {
                EnumMemberValue emv;
                mv = emv = new EnumMemberValue(cpool);
                emv.setType(t.getName());
                emv.setValue(v.toString());
            }
            else if (String.class.equals(t)) mv = new StringMemberValue((String) v, cpool);
            else if (Class.class.equals(t)) mv = new ClassMemberValue(((Class)v).getName(), cpool);
            else if (v instanceof javassist.bytecode.annotation.Annotation) mv = new AnnotationMemberValue((javassist.bytecode.annotation.Annotation) v, cpool);
            else if (byte.class.equals(t)) mv = new ByteMemberValue((Byte) v, cpool);
            else if (float.class.equals(t)) mv = new FloatMemberValue((Float) v, cpool);
            else if (short.class.equals(t)) mv = new ShortMemberValue((Short) v, cpool);
            else if (t.isArray()) {
                ArrayMemberValue amv;
                mv = amv = new ArrayMemberValue(cpool);

                List<MemberValue> mvs = new ArrayList<>();

                for (Object c : (Object[])v) {

                    MemberValue mvx = getAnnotationMemberValue(cpool, c.getClass(), c);
                    if (mvx != null) mvs.add(mvx);

                }

                amv.setValue(mvs.toArray(new MemberValue[0]));
            } else {
                System.out.println("ups");
            }
        }
        return mv;
    }

    public static Class createClass(String fullClassName, List<FieldInterfaced> fields, boolean forFilters) throws Exception {

        try {
            Class c = Class.forName(fullClassName);
            System.out.println("class " + fullClassName + " already exists");
            return c;
        } catch (ClassNotFoundException e) {
            Class c = createClassUsingJavassist2(fullClassName, fields, forFilters);
            return c;
        }
    }


    public static Class createClass(String fullClassName, List<FieldInterfaced> fields, boolean forFilters, boolean forInlineEditing, FieldInterfaced collectionField, Object owner) throws Exception {

        if (forInlineEditing) {
            Class c = createClassUsingJavassist2(fullClassName, fields, forFilters, forInlineEditing, collectionField, owner);
            return c;
        } else {
            try {
                Class c = Class.forName(fullClassName);
                System.out.println("class " + fullClassName + " already exists");
                return c;
            } catch (ClassNotFoundException e) {
                Class c = createClassUsingJavassist2(fullClassName, fields, forFilters, forInlineEditing, collectionField, owner);
                return c;
            }
        }
    }

    public static void main(String[] args) throws Exception {

        ClassPool cpool = ClassPool.getDefault();
        cpool.appendClassPath(new ClassClassPath(Persona.class));
        MDD.setClassPool(cpool);

        Class c = createClass("test.TestXX", getAllFields(Persona.class), false);
        try {

            Field f = c.getDeclaredField("nombre");

            for (Annotation a : f.getDeclaredAnnotations()) {
                System.out.println(a.toString());
            }

            System.out.println(f.isAnnotationPresent(FullWidth.class));
            System.out.println(f.isAnnotationPresent(NotEmpty.class));

            Object i = c.newInstance();
            System.out.println(Helper.toJson(i));
        } catch (Exception e) {
            e.printStackTrace();
        }


        c = createClass("test.TestXX", getAllFields(Persona.class), false);
        try {
            Object i = c.newInstance();
            System.out.println(Helper.toJson(i));
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public static ClassPool createClassPool(ServletContext servletContext) {
        ClassPool pool = new ClassPool();
        //pool.appendClassPath(new URLClassPath());
        pool.appendClassPath(new ClassClassPath(MDD.getApp().getClass()));
        return pool;
    }

    public static String getFirstUpper(String fieldName) {
        return fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
    }

    public static Object clone(Object original) throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        if (original == null) return null;
        else {

            Method m = ReflectionHelper.getMethod(original.getClass(), "cloneAsConverted");
            if (m != null) return m.invoke(original);
            else {
                Object copy = original.getClass().newInstance();

                for (FieldInterfaced f : ReflectionHelper.getAllFields(original.getClass())) if (!f.isAnnotationPresent(Id.class)) {
                    ReflectionHelper.setValue(f, copy, ReflectionHelper.getValue(f, original));
                }

                return copy;
            }

        }
    }

    public static void delete(EntityManager em, Object o) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        if (o != null) {
            // no quitamos las relaciones, por precaución. Así saltará a nivel de base de datos si queremos borrar un objeto que esté referenciado
            for (FieldInterfaced f : ReflectionHelper.getAllFields(o.getClass())) {

                Object t = ReflectionHelper.getValue(f, o);

                if (t != null) {

                    boolean owner = false;

                    if (f.isAnnotationPresent(ManyToOne.class)) {
                        CascadeType[] c = f.getAnnotation(ManyToOne.class).cascade();
                        if (c != null) for (CascadeType cx : c) if (CascadeType.ALL.equals(cx) || CascadeType.REMOVE.equals(cx)) {
                            owner = true;
                            break;
                        }
                    }

                    if (f.isAnnotationPresent(OneToMany.class)) {
                        CascadeType[] c = f.getAnnotation(OneToMany.class).cascade();
                        if (c != null) for (CascadeType cx : c) if (CascadeType.ALL.equals(cx) || CascadeType.REMOVE.equals(cx)) {
                            owner = true;
                            break;
                        }
                    }


                    if (f.isAnnotationPresent(ManyToMany.class)) {
                        CascadeType[] c = f.getAnnotation(ManyToMany.class).cascade();
                        if (c != null) for (CascadeType cx : c) if (CascadeType.ALL.equals(cx) || CascadeType.REMOVE.equals(cx)) {
                            owner = true;
                            break;
                        }
                    }


                    if (!owner && (f.isAnnotationPresent(ManyToOne.class) || f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class))) {


                        FieldInterfaced mbf = ReflectionHelper.getMapper(f);

                        if (Collection.class.isAssignableFrom(t.getClass())) {
                            Collection col = (Collection) t;
                            if (col.size() >  0) {
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

    public static Class getProxy(String fieldsFilter, Class sourceClass, FieldInterfaced collectionField, Object owner, List<FieldInterfaced> editableFields) {
        try {
            return ReflectionHelper.createClass(sourceClass.getName() + "000EditableInline" + UUID.randomUUID().toString(), getAllEditableFilteredFields(sourceClass, fieldsFilter, editableFields), false, true, collectionField, owner);
        } catch (Exception e) {
            MDD.alert(e);
        }
        return null;
    }
}
