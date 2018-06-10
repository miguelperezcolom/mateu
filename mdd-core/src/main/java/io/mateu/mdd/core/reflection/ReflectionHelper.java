package io.mateu.mdd.core.reflection;

import com.google.common.base.Strings;
import io.mateu.mdd.core.data.*;
import io.mateu.mdd.core.util.DatesRange;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.core.views.RPCView;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.BeanUtilsBean;

import javax.persistence.*;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.lang.reflect.Parameter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
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
        if (fn.contains(".")) {
            o = getInstance(o, fn.substring(0, fn.indexOf(".")));
            setValue(fn.substring(fn.indexOf(".") + 1), o, v);
        } else {
            BeanUtils.setProperty(o, fn, v);
        }
    }

    public static Object getValue(io.mateu.mdd.core.reflection.FieldInterfaced f, Object o) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        if (f.getId().contains(".")) {
            o = getInstance(o, f.getId().substring(0, f.getId().lastIndexOf(".")));
        }

        Method getter = null;
        try {
            getter = o.getClass().getMethod(getGetter(f.getField()));
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
        while (m == null) {
            try {
                m = c.getDeclaredMethod(methodName);
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

    private static String getGetter(Field f) {
        return (("boolean".equals(f.getType().getName()) || Boolean.class.equals(f.getType()))?"is":"get") + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }

    private static String getGetter(io.mateu.mdd.core.reflection.FieldInterfaced f) {
        return (("boolean".equals(f.getType().getName()) || Boolean.class.equals(f.getType()))?"is":"get") + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }

    private static String getGetter(String fn) {
        return "get" + fn.substring(0, 1).toUpperCase() + fn.substring(1);
    }

    private static String getSetter(Field f) {
        return "set" + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }
    private static String getSetter(io.mateu.mdd.core.reflection.FieldInterfaced f) {
        return "set" + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }




    private static Object fillEntity(EntityManager em, UserData user, Class cl, Data data) throws Throwable {
        List<Object> persistPending = new ArrayList<>();
        Object o = fillEntity(em, persistPending, user, cl, cl, data);
        for (Object x : persistPending) em.persist(x);

        return o;
    }

    private static Object fillEntity(EntityManager em, List<Object> persistPending, UserData user, Class cl, Class vcl, Data data) throws Throwable {
        Object o = null;

        boolean newInstance = false;

        if (cl.isAnnotationPresent(Entity.class)) {
            io.mateu.mdd.core.reflection.FieldInterfaced idField = null;
            boolean generated = false;
            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(cl)) {
                if (f.isAnnotationPresent(Id.class)) {
                    idField = f;
                    if (f.isAnnotationPresent(GeneratedValue.class)) {
                        generated = true;
                    }
                    break;
                }
            }

            Object id = data.get("_id");
            if (id != null) {
                o = em.find(cl, (id instanceof Integer)?new Long((Integer)id):id);
            } else {
                if (vcl != null && !vcl.equals(cl)) o = ((io.mateu.mdd.core.interfaces.View)vcl.newInstance()).newInstance(em, user);
                if (o == null) o = cl.newInstance();
                //em.persist(o);
                /*
                if (generated) {
                    em.flush(); // to get the id
                    Method m = o.getClass().getMethod(getGetter(idField));
                    id = m.invoke(o);
                } else {
                    id = data.get(idField.getName());
                }
                */
                newInstance = true;
            }

            data.set("_id", id);
        } else {
            o = cl.newInstance();
        }

        fillEntity(em, persistPending, user, o, data, newInstance, vcl, (o instanceof io.mateu.mdd.core.interfaces.CalendarLimiter)? (io.mateu.mdd.core.interfaces.CalendarLimiter) o :null);

        if (newInstance) {
            persistPending.add(o);
        }

        return o;
    }

    public static void fillEntity(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, boolean newInstance) throws Throwable {
        fillEntity(em, persistPending, user, o, data, newInstance, o.getClass(), (o instanceof io.mateu.mdd.core.interfaces.CalendarLimiter)? (io.mateu.mdd.core.interfaces.CalendarLimiter) o :null);
    }

    public static void fillEntity(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, boolean newInstance, Class viewClass, io.mateu.mdd.core.interfaces.CalendarLimiter calendarLimiter) throws Throwable {
        fillEntity(em, persistPending, user, o, data, null, newInstance, viewClass, calendarLimiter);
    }

    public static void fillEntity(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, String prefix, boolean newInstance, Class viewClass, io.mateu.mdd.core.interfaces.CalendarLimiter calendarLimiter) throws Throwable {

        if (prefix == null) prefix = "";

        BeanUtilsBean.getInstance().getConvertUtils().register(false, false, 0);

        io.mateu.mdd.core.interfaces.View view = null;
        if (viewClass != null && !viewClass.equals(o.getClass())) {
            view = (io.mateu.mdd.core.interfaces.View) viewClass.newInstance();
        }

        //auditoría
        for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(o.getClass())) if (io.mateu.mdd.core.interfaces.AuditRecord.class.isAssignableFrom(f.getType())) {
            io.mateu.mdd.core.interfaces.AuditRecord a = (io.mateu.mdd.core.interfaces.AuditRecord) o.getClass().getMethod(getGetter(f)).invoke(o);
            if (a == null) {
                BeanUtils.setProperty(o, f.getName(), a = (io.mateu.mdd.core.interfaces.AuditRecord) f.getType().newInstance());
            }
            a.touch(em, data.getString("_user"));
        }


        List<String> fl = new ArrayList<>();
        List<String> nfl = new ArrayList<>();

        if (view != null) {
            addToList(fl, nfl, view.getFields());
        }


        for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(o.getClass(), view != null && view.isFieldsListedOnly(), fl, nfl)) {

            boolean updatable = true;
            if (io.mateu.mdd.core.interfaces.AuditRecord.class.isAssignableFrom(f.getType()) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.Output.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.Ignored.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.NotInEditor.class) || (!newInstance && f.isAnnotationPresent(io.mateu.mdd.core.annotations.Unmodifiable.class))) {
                updatable = false;
            }

            if (updatable) {

                if (data != null && data.containsKey(prefix + f.getId() + "____object")) {
                    Object z = null; //o.getClass().getMethod(getGetter(f)).invoke(o);    SIEMPRE CREAMOS UN OBJETO NUEVO, PARA ASEGURARNOS DE QUE DETECTA EL CAMBIO
                    boolean recienCreado = false;
                    if (z == null) {
                        recienCreado = true;
                        z = f.getType().newInstance();
                        BeanUtils.setProperty(o, f.getName(), z);
                    }
                    fillEntity(em, persistPending, user, z, (f.isAnnotationPresent(io.mateu.mdd.core.annotations.UseGridToSelect.class))?data.getData(f.getId()):data, (f.isAnnotationPresent(io.mateu.mdd.core.annotations.UseGridToSelect.class))?"":prefix + f.getId() + "_", recienCreado, z.getClass(), (z instanceof io.mateu.mdd.core.interfaces.CalendarLimiter)? (io.mateu.mdd.core.interfaces.CalendarLimiter) z : calendarLimiter);
                } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Owned.class)) {
                    if (f.getType().isAnnotationPresent(Entity.class)) {
                        Object z = o.getClass().getMethod(getGetter(f)).invoke(o);
                        boolean recienCreado = false;
                        if (z == null) {
                            recienCreado = true;
                            z = f.getType().newInstance();
                            BeanUtils.setProperty(o, f.getName(), z);
                        }
                        fillEntity(em, persistPending, user, z, data, prefix, recienCreado, z.getClass(), (z instanceof io.mateu.mdd.core.interfaces.CalendarLimiter)? (io.mateu.mdd.core.interfaces.CalendarLimiter) z : calendarLimiter);
                        if (recienCreado) persistPending.add(z);
                    } else {
                        System.out.println("owned y no es una entity");
                    }
                } else if (data != null && data.containsKey(prefix + f.getId())) {

                    Object v = extractValue(em, persistPending, user, o, data, f, prefix);

                    if (io.mateu.mdd.core.interfaces.File.class.isAssignableFrom(f.getType())) {
                        io.mateu.mdd.core.interfaces.File current = (io.mateu.mdd.core.interfaces.File) o.getClass().getMethod(getGetter(f)).invoke(o);
                        if (v == null) {
                            if (current != null) {
                                em.remove(current);
                                v = null;
                                BeanUtils.setProperty(o, f.getName(), v);
                            }
                        } else {
                            FileLocator l = (FileLocator) v;
                            if (current == null) {
                                current = (io.mateu.mdd.core.interfaces.File) f.getType().newInstance();
                                BeanUtils.setProperty(o, f.getName(), current);
                                persistPending.add(current);
                            }
                            if (l.isModified()) {
                                current.set(l.getFileName(), l.getTmpPath());
                            }
                        }
                    } else if (io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(f.getType())) {
                        Object current = o.getClass().getMethod(getGetter(f)).invoke(o);
                        if (current == null) {
                            current = f.getType().newInstance();
                            BeanUtils.setProperty(o, f.getName(), current);
                            persistPending.add(current);
                        }
                        ((io.mateu.mdd.core.interfaces.Translated) current).set((Data) v);
                    } else if (!f.isAnnotationPresent(io.mateu.mdd.core.annotations.OwnedList.class)) { // en este caso ya hemos añadido el valor dentro del método exractValue()

                        Object old = f.getValue(o);

                        if (old != null && !old.equals(v)) {

                            if (f.isAnnotationPresent(ManyToOne.class)) {
                                // buscamos la relación inversa
                                for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType())) {
                                    if (ff.isAnnotationPresent(OneToMany.class) && ff.getGenericClass().isAssignableFrom(o.getClass()) && f.getName().equals(ff.getAnnotation(OneToMany.class).mappedBy())) {
                                        System.out.println("Eliminando la relación onetomany con el inverso de " + o.getClass().getName() + "." + f.getName() + " al cambiar el valor");
                                        System.out.println("El inverso es " + f.getType().getName() + "." + getGetter(ff.getField()) + " ==> " + getMethod(ff.getType(), getGetter(ff.getField())));
                                        List l = (List) getMethod(f.getType(), getGetter(ff.getField())).invoke(v);
                                        if (l.contains(o)) l.remove(o);
                                    }
                                }
                            }

                            if (f.isAnnotationPresent(ManyToMany.class)) {
                                // buscamos la relación inversa
                                for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getGenericClass())) {
                                    if (!Strings.isNullOrEmpty(f.getAnnotation(ManyToMany.class).mappedBy()) && ff.getName().equals(f.getAnnotation(ManyToMany.class).mappedBy())) {
                                        System.out.println("Eliminando la relación manytomany(a) con el inverso de " + o.getClass().getName() + "." + f.getName() + " que es " + f.getGenericClass().getName() + "." + f.getAnnotation(ManyToMany.class).mappedBy() + " al cambiar el valor");
                                        List l = (List) getMethod(f.getType(), getGetter(f.getAnnotation(ManyToMany.class).mappedBy())).invoke(o);
                                        if (l.contains(o)) l.remove(o);
                                    } else if (ff.isAnnotationPresent(ManyToMany.class) && ff.getGenericClass().isAssignableFrom(o.getClass()) && f.getName().equals(ff.getAnnotation(ManyToMany.class).mappedBy())) {
                                        System.out.println("Eliminando la relación manytomany(a) con el inverso de " + o.getClass().getName() + "." + f.getName() + " que es " + f.getGenericClass().getName() + "." + ff.getName() + " al cambiar el valor");
                                        List l = (List) getMethod(ff.getGenericClass(), getGetter(ff.getField())).invoke(old);
                                        if (l.contains(o)) l.remove(o);
                                    }
                                }
                            }

                        }


                        f.setValue(o, v);

                        if (v != null) {

                            if (f.isAnnotationPresent(ManyToOne.class)) {
                                // buscamos la relación inversa
                                for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType())) {
                                    if (ff.isAnnotationPresent(OneToMany.class) && ff.getGenericClass().isAssignableFrom(o.getClass()) && f.getName().equals(ff.getAnnotation(OneToMany.class).mappedBy())) {
                                        //System.out.println("miguel: " + ff.getGenericClass() + " == "  + o.getClass() +"? " + ff.getGenericClass().isAssignableFrom(o.getClass()) + "/" + o.getClass().isAssignableFrom(ff.getGenericClass()));
                                        System.out.println("Seteando la relación onetomany con el inverso de " + o.getClass().getName() + "." + f.getName() + " que es " + f.getType() + "." + ff.getName());
                                        List l = (List) getMethod(f.getType(), getGetter(ff.getField())).invoke(v);
                                        if (!l.contains(o)) l.add(o);
                                    }
                                }
                            }

                            if (f.isAnnotationPresent(ManyToMany.class)) {
                                // buscamos la relación inversa
                                for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getGenericClass())) {
                                    if (!Strings.isNullOrEmpty(f.getAnnotation(ManyToMany.class).mappedBy()) && ff.getName().equals(f.getAnnotation(ManyToMany.class).mappedBy())) {
                                        System.out.println("Seteando la relación manytomany(a) con el inverso de " + o.getClass().getName() + "." + f.getName() + " que es " + f.getGenericClass() + "." + f.getAnnotation(ManyToMany.class).mappedBy());
                                        List l = (List) getMethod(f.getGenericClass(), getGetter(f.getAnnotation(ManyToMany.class).mappedBy())).invoke(v);
                                        if (!l.contains(o)) l.add(o);
                                    } else if (ff.isAnnotationPresent(ManyToMany.class) && ff.getGenericClass().isAssignableFrom(o.getClass()) && f.getName().equals(ff.getAnnotation(ManyToMany.class).mappedBy())) {
                                        System.out.println("Seteando la relación manytomany(b) con el inverso de " + o.getClass().getName() + "." + f.getName() + " que es " + f.getGenericClass() + "." + ff.getName());
                                        List l = (List) getMethod(f.getGenericClass(), getGetter(ff.getField())).invoke(v);
                                        if (!l.contains(o)) l.add(o);
                                    }
                                }
                            }

                        }

                    }
                }
            }
        }

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


    private static Object extractValue(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, io.mateu.mdd.core.reflection.FieldInterfaced f) throws Throwable {
        return extractValue(em, persistPending, user, o, data, f, "");
    }

    private static Object extractValue(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, io.mateu.mdd.core.reflection.FieldInterfaced f, String prefix) throws Throwable {

        Object v = data.get(prefix + f.getId());
        if (v != null && v instanceof Pair) v = ((Pair) v).getValue();

        if (io.mateu.mdd.core.interfaces.File.class.isAssignableFrom(f.getType()) || io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(f.getType())) return v;

        Class<?> genericClass = null;
        if (f.getGenericType() instanceof ParameterizedType) {
            ParameterizedType genericType = (ParameterizedType) f.getGenericType();
            genericClass = (genericType != null && genericType.getActualTypeArguments().length > 0)?(Class<?>) genericType.getActualTypeArguments()[0]:null;
        }

        if (io.mateu.mdd.core.interfaces.DataSerializable.class.isAssignableFrom(f.getType())) {
            io.mateu.mdd.core.interfaces.DataSerializable ds = (io.mateu.mdd.core.interfaces.DataSerializable) f.getType().newInstance();
            ds.fill(em, user, (Data) v);
            v = ds;
        } else if (f.getType().isArray()) {
            if (v != null) {
                List<Object> l = new ArrayList<>();
                Class c = f.getType().getComponentType();
                for (String s : ((String) v).split(","))
                    if (!Strings.isNullOrEmpty(s)) {
                        if (c.isPrimitive()) {
                            if (int.class.equals(c)) {
                                l.add(new Integer(s));
                            } else if (double.class.equals(c)) {
                                l.add(new Double(s));
                            } else if (long.class.equals(c)) {
                                l.add(new Long(s));
                            } else if (boolean.class.equals(c)) {
                                l.add(new Boolean(s));
                            }
                        } else {
                            Constructor<?> cons = c.getConstructor(String.class);
                            Object z = cons.newInstance(s);
                            l.add(z);
                        }
                    }
                v = l.toArray();
            }
        } if (genericClass != null && io.mateu.mdd.core.interfaces.UseCalendarToEdit.class.isAssignableFrom(genericClass)) {

            List<io.mateu.mdd.core.interfaces.UseCalendarToEdit> l = new ArrayList<>();

            if (v != null) {

                Data dv = (Data) v;

                Map<String, io.mateu.mdd.core.interfaces.UseCalendarToEdit> m = new HashMap<>();
                for (Data d : dv.getList("_options")) {
                    io.mateu.mdd.core.interfaces.UseCalendarToEdit x = (io.mateu.mdd.core.interfaces.UseCalendarToEdit) genericClass.newInstance();
                    fillEntity(em, persistPending, user, x, d, false);
                    l.add(x);
                    m.put(d.get("__id"), x);
                }

                io.mateu.mdd.core.interfaces.UseCalendarToEdit x = null;
                for (Data d : dv.getList("_values")) {
                    LocalDate fecha = d.get("_key");
                    if (fecha != null) {
                        String uuid = d.getString("_value");
                        if (x != null && uuid == null) {
                            x = null;
                        } else if (uuid != null) {
                            boolean eraNull = x == null;
                            if (x == null) x = m.get(uuid);
                            if (x != null && x.getDatesRangesPropertyName() != null) {
                                List<DatesRange> ll = (List<DatesRange>) x.getClass().getMethod(getGetter(x.getDatesRangesPropertyName())).invoke(x);
                                if (ll.size() == 0 || eraNull || !x.equals(m.get(uuid))) {
                                    ll.add(new DatesRange(fecha, fecha));
                                } else {
                                    ll.get(ll.size() - 1).setEnd(fecha);
                                }
                            }
                            x = m.get(uuid);
                        }
                    }
                }

            }

            v = l;

        } else if (f.getType().isAnnotationPresent(Entity.class)) {
            io.mateu.mdd.core.reflection.FieldInterfaced parentField = null;
            for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType())) {
                try {
                    if (ff.isAnnotationPresent(OneToMany.class) && ((ParameterizedType)ff.getGenericType()).getActualTypeArguments()[0].equals(o.getClass())) {
                        OneToMany a = ff.getAnnotation(OneToMany.class);
                        if (f.getName().equals(a.mappedBy())) parentField = ff;
                    } else if (ff.isAnnotationPresent(OneToOne.class) && ff.getType().equals(o.getClass())) {
                        OneToOne a = ff.getAnnotation(OneToOne.class);
                        OneToOne b = f.getAnnotation(OneToOne.class);
                        if (f.getName().equals(a.mappedBy()) || ff.getName().equals(b.mappedBy())) parentField = ff;
                    }

                } catch (Exception e) {

                }
            }
            //todo: aclarar esta parte, probar a fondo y comprobar si hace falta eliminar referencias existentes!!!!
            if (parentField != null) {
                Object current = o.getClass().getMethod(getGetter(f)).invoke(o);
                if (current != null && !current.equals(v)) {
                    if (parentField.isAnnotationPresent(MapKey.class)) {
                        String keyFieldName = parentField.getAnnotation(MapKey.class).name();
                        Field keyField = o.getClass().getDeclaredField(keyFieldName);
                        Object key = o.getClass().getMethod(getGetter(keyField)).invoke(o);
                        Map m = (Map) v.getClass().getMethod(getGetter(parentField)).invoke(v);
                        if (m.containsKey(key)) m.remove(key);
                    } else if (parentField.isAnnotationPresent(OneToOne.class)) {
                        Object old = current.getClass().getMethod(getGetter(parentField)).invoke(current);
                        if (old != null) o.getClass().getMethod(getSetter(f), current.getClass()).invoke(old, new Object[]{ null });
                        current.getClass().getMethod(getSetter(parentField), o.getClass()).invoke(current, new Object[]{ null });
                    } else {
                        List l = (List) current.getClass().getMethod(getGetter(parentField)).invoke(current);
                        l.remove(o);
                    }
                }
            }

            if (v != null) {

                v = em.find(f.getType(), v);
                if (parentField != null) {
                                        /*
    @OneToMany(mappedBy="albergue", cascade = CascadeType.ALL)
    @MapKey(name="fecha")
                                         */
                    if (parentField.isAnnotationPresent(MapKey.class)) {
                        String keyFieldName = parentField.getAnnotation(MapKey.class).name();
                        Field keyField = o.getClass().getDeclaredField(keyFieldName);
                        Object key = o.getClass().getMethod(getGetter(keyField)).invoke(o);
                        Map m = (Map) v.getClass().getMethod(getGetter(parentField)).invoke(v);
                        if (!m.containsKey(key)) m.put(key, o);
                    } else if (parentField.isAnnotationPresent(OneToOne.class)) {
                        Object old = v.getClass().getMethod(getGetter(parentField)).invoke(v);
                        if (old != null) o.getClass().getMethod(getSetter(f), v.getClass()).invoke(old, new Object[]{ null });
                        v.getClass().getMethod(getSetter(parentField), o.getClass()).invoke(v, o);
                    } else {
                        List l = (List) v.getClass().getMethod(getGetter(parentField)).invoke(v);
                        if (!l.contains(o)) l.add(o);
                    }
                }
            }
        } else if (v != null && f.getType().isEnum()) {
            for (Object x : f.getType().getEnumConstants()) {
                if (v.equals(x.toString())) {
                    v = x;
                    break;
                }
            }
        } else if (List.class.isAssignableFrom(f.getType())) {

            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OwnedList.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.Owned.class)) {
                String idfieldatx = "id";
                for (io.mateu.mdd.core.reflection.FieldInterfaced fx : getAllFields(genericClass))
                    if (fx.isAnnotationPresent(Id.class)) {
                        idfieldatx = fx.getName();
                        break;
                    }
                List aux = (List) o.getClass().getMethod(getGetter(f)).invoke(o);
                if (aux == null) {
                    o.getClass().getMethod(getSetter(f), List.class).invoke(o, new ArrayList<>());
                    aux = (List) o.getClass().getMethod(getGetter(f)).invoke(o);
                }
                List borrar = new ArrayList();
                for (Object x : aux) {
                    boolean found = false;
                    for (Data d : (List<Data>) v) {
                        if (x.getClass().getMethod(getGetter(x.getClass().getDeclaredField(idfieldatx))).invoke(x).equals(d.get("_id"))) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) borrar.add(x);
                }
                aux.removeAll(borrar);
                for (Object x : borrar) em.remove(x);
                for (Data d : (List<Data>) v) {
                    if (d.isEmpty("_id")) {
                        Object x = fillEntity(em, persistPending, user, genericClass, genericClass, d);
                        if (f.isAnnotationPresent(OneToMany.class)) {
                            String mappedby = f.getAnnotation(OneToMany.class).mappedBy();
                            if (!Strings.isNullOrEmpty(mappedby)) { // seteamos la relación inversa
                                getMethod(x.getClass(), getSetter(getDeclaredField(x.getClass(), mappedby)), o.getClass()).invoke(x, o);
                            }
                        } else if (f.isAnnotationPresent(ManyToMany.class)) {
                            String mappedby = f.getAnnotation(ManyToMany.class).mappedBy();
                            if (!Strings.isNullOrEmpty(mappedby)) {
                                List rl = (List)getMethod(x.getClass(), getGetter(getDeclaredField(x.getClass(), mappedby)), o.getClass()).invoke(x);
                                if (!rl.contains(o)) rl.add(o);
                            }
                        }
                        aux.add(x);
                    } else {
                        fillEntity(em, persistPending, user, em.find(genericClass, d.get("_id")), d, false);
                    }
                }
            } else if (genericClass.isAnnotationPresent(Entity.class)) {
                List<Object> l = new ArrayList<>();
                List<Pair> ll = (v instanceof PairList)?((PairList)v).getValues(): (List<Pair>) v;
                for (Pair p : ll) if (p != null && p.getValue() != null) {
                    //todo: buscar el inverso y actualizar, si en un @ManyToMany
                    Object x;
                    l.add(x = em.find(genericClass, p.getValue()));

                    if (f.isAnnotationPresent(OneToMany.class)) {
                        String mappedby = f.getAnnotation(OneToMany.class).mappedBy();
                        if (!Strings.isNullOrEmpty(mappedby)) {
                            getMethod(x.getClass(), getSetter(getDeclaredField(x.getClass(), mappedby)), o.getClass()).invoke(x, o);
                        }
                    } else if (f.isAnnotationPresent(ManyToMany.class)) {
                        String mappedby = f.getAnnotation(ManyToMany.class).mappedBy();
                        if (!Strings.isNullOrEmpty(mappedby)) {
                            System.out.println("o=" + o);
                            System.out.println("x=" + x);
                            String getter = getGetter(getDeclaredField(x.getClass(), mappedby));
                            Method m = getMethod(x.getClass(), getter);
                            List rl = (List)m.invoke(x);
                            if (!rl.contains(o)) rl.add(o);
                        }
                    }
                }
                v = l;
            } else {
                List<Object> l = new ArrayList<>();
                if (v != null) {
                    if (v instanceof String) {
                        for (String x : ((String) v).split("\n")) {
                            if (String.class.equals(genericClass)) {
                                l.add(x);
                            } else if (!Strings.isNullOrEmpty(x)) {
                                if (Integer.class.equals(genericClass)) l.add(new Integer(x));
                                else if (Long.class.equals(genericClass)) l.add(new Long(x));
                                else if (Double.class.equals(genericClass))
                                    l.add(new Double(x.replaceAll(",", ".")));
                                else {
                                    //todo: instanciar a partir del string y añadir a la lista
                                }
                            }
                        }
                    } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueClass.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueQL.class)) {

                        List<Data> ll = (List<Data>) v;
                        for (Data d : ll) {
                            Object z = d.get("_value");

                            if (z != null && z instanceof Pair) z = ((Pair) z).getValue();

                            l.add(z);
                        }

                    } else {

                        List<Data> ll = (List<Data>) v;
                        for (Data d : ll) {
                            Object z = genericClass.newInstance();
                            fillEntity(em, persistPending, user, z, d, true);
                            l.add(z);
                        }

                    }
                }
                v = l;

            }

        } else if (Map.class.isAssignableFrom(f.getType())) {

            Class<?> genericKeyClass = null;
            if (f.getGenericType() instanceof ParameterizedType) {
                ParameterizedType genericType = (ParameterizedType) f.getGenericType();
                genericKeyClass = (genericType != null && genericType.getActualTypeArguments().length > 0)?(Class<?>) genericType.getActualTypeArguments()[0]:null;
                genericClass = (genericType != null && genericType.getActualTypeArguments().length > 1)?(Class<?>) genericType.getActualTypeArguments()[1]:null;
            }

            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OwnedList.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.Owned.class)) {

                String idfieldatx = "id";
                for (io.mateu.mdd.core.reflection.FieldInterfaced fx : getAllFields(genericClass))
                    if (fx.isAnnotationPresent(Id.class)) {
                        idfieldatx = fx.getName();
                        break;
                    }
                Map aux = (Map) o.getClass().getMethod(getGetter(f)).invoke(o);
                List borrarKeys = new ArrayList();
                List borrar = new ArrayList();
                for (Object rk : aux.keySet()) {
                    Object x = aux.get(rk);
                    boolean found = false;
                    for (Data d : (List<Data>) v) {
                        if (x.getClass().getMethod(getGetter(x.getClass().getDeclaredField(idfieldatx))).invoke(x).equals(d.get("_id"))) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        borrar.add(x);
                        borrarKeys.add(rk);
                    }
                }
                for (Object x : borrar) em.remove(x);
                aux.clear();
                for (Data d : (List<Data>) v) {

                    Object xk = null;
                    Object xv = null;

                    if (basicos.contains(genericKeyClass)) {
                        xk = (Boolean.class.equals(genericKeyClass))?d.getBoolean("_key"):d.get("_key");
                    } else {
                        xk = d.get("_key");
                        if (xk != null && genericKeyClass.isAnnotationPresent(Entity.class)) {
                            xk = em.find(genericKeyClass, ((Data)xk).get("value"));
                        }
                    }
                    if (xk != null && xk instanceof Pair) xk = ((Pair) xk).getValue();


                    if (d.isEmpty("_id")) {
                        Object x = fillEntity(em, user, genericClass, d);
                        if (f.isAnnotationPresent(OneToMany.class)) {
                            String mappedby = f.getAnnotation(OneToMany.class).mappedBy();
                            if (!Strings.isNullOrEmpty(mappedby)) {
                                x.getClass().getMethod(getSetter(x.getClass().getDeclaredField(mappedby)), o.getClass()).invoke(x, o);
                            }
                        } else if (f.isAnnotationPresent(ManyToMany.class)) {
                            String mappedby = f.getAnnotation(ManyToMany.class).mappedBy();
                            if (!Strings.isNullOrEmpty(mappedby)) {
                                List rl = (List)x.getClass().getMethod(getGetter(x.getClass().getDeclaredField(mappedby)), o.getClass()).invoke(x);
                                if (!rl.contains(o)) rl.add(o);
                            }
                        }
                        if (x.getClass().isAnnotationPresent(Entity.class)) persistPending.add(x);
                        xv = x;
                    } else {
                        fillEntity(em, persistPending, user, xv = em.find(genericClass, d.get("_id")), d, false);
                    }
                    aux.put(xk, xv);
                }

                v = aux;

            } else if (v != null) {

                Map m = new HashMap();

                List<Data> ll = (List<Data>) v;
                for (Data d : ll) {
                    Object xk = null;
                    Object xv = null;

                    if (basicos.contains(genericKeyClass)) {
                        xk = (Boolean.class.equals(genericKeyClass))?d.getBoolean("_key"):d.get("_key");
                    } else {
                        xk = d.get("_key");
                        if (xk != null && genericKeyClass.isAnnotationPresent(Entity.class)) {
                            xk = em.find(genericKeyClass, ((Data)xk).get("value"));
                        }
                    }

                    if (basicos.contains(genericClass)) {
                        xv = (Boolean.class.equals(genericClass))?d.getBoolean("_value"):d.get("_value");
                    } else {
                        xv = d.get("_value");
                        if (xv != null && genericClass.isAnnotationPresent(Entity.class)) {
                            xv = em.find(genericClass, ((Data)xv).get("value"));
                        }
                    }

                    if (xk != null && xk instanceof Pair) xk = ((Pair) xk).getValue();
                    if (xv != null && xv instanceof Pair) xv = ((Pair) xv).getValue();

                    if (xk != null) {
                        m.put(xk, xv);
                    }
                }

                v = m;
            }

        }

        if (Date.class.equals(f.getType()) && v != null && v instanceof LocalDateTime) {
            v = ((LocalDateTime)v).atZone(ZoneId.systemDefault()).toInstant();
        }


        //System.out.println("o." + getSetter(f) + "(" + v + ")");
        //m.invoke(o, data.get(n));
        if (v != null && v instanceof Data && !Data.class.equals(f.getType())) {
            Object z = f.getType().newInstance();
            fillEntity(em, persistPending, user, z, (Data) v, false);
            v = z;
        }

        return v;
    }



    private static List<Method> getAllMethods(Class c) {
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
            originales.put(f.getName(), f);
        }

        List<io.mateu.mdd.core.reflection.FieldInterfaced> l = new ArrayList<>();

        if (c.getSuperclass() != null && (!c.isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class))) {
            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(c.getSuperclass())) {
                if (!originales.containsKey(f.getId())) l.add(f);
                else l.add(new io.mateu.mdd.core.reflection.FieldInterfacedFromField(originales.get(f.getName())));
                vistos.add(f.getName());
            }
        }

        for (Field f : c.getDeclaredFields()) if (!vistos.contains(f.getName())) {
            l.add(new io.mateu.mdd.core.reflection.FieldInterfacedFromField(f));
        }

        return l;
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

    public static Object getId(Object model) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        FieldInterfaced idField = null;
        for (FieldInterfaced f : ReflectionHelper.getAllFields(model.getClass())) {
            if (f.isAnnotationPresent(Id.class)) {
                idField = f;
                break;
            }
        }

        return ReflectionHelper.getValue(idField, model);
    }

    public Object runInServer(UserData user, String className, String methodName, Data parameters, String rpcViewClassName, Data rpcViewData) throws Throwable {
        Class c = Class.forName(className);
        Method m = null;
        for (Method x : c.getDeclaredMethods()) if (x.getName().equals(methodName)) {
            m = x;
            break;
        }

        return execute(user, m, parameters, rpcViewClassName, rpcViewData);
    }


    private Object execute(UserData user, Method m, Data parameters, String rpcViewClassName, Data rpcViewData) throws Throwable {
        return execute(user, m, parameters, null, rpcViewClassName, rpcViewData);
    }

    private static Object execute(UserData user, Method m, Data parameters) throws Throwable {
        return execute(user, m, parameters, null, null, null);
    }

    private static Object execute(UserData user, Method m, Data parameters, Object instance, String rpcViewClassName, Data rpcViewData) throws Throwable {
        Object[] r = {null};

        if (!Modifier.isStatic(m.getModifiers())) {

            boolean calledFromView = false;
            Class viewClass = null;
            Class entityClass = m.getDeclaringClass();
            if (io.mateu.mdd.core.interfaces.View.class.isAssignableFrom(entityClass)) {
                viewClass = entityClass;
                for (Type t : entityClass.getGenericInterfaces()) {
                    if (entityClass.getGenericInterfaces()[0].getTypeName().startsWith(io.mateu.mdd.core.interfaces.View.class.getName())) entityClass = (Class) ((ParameterizedType)t).getActualTypeArguments()[0];
                }
                calledFromView = true;
            } else if (RPCView.class.isAssignableFrom(entityClass)) {
                viewClass = entityClass;
                for (Type t : entityClass.getGenericInterfaces()) {
                    if (entityClass.getGenericInterfaces()[0].getTypeName().startsWith(io.mateu.mdd.core.interfaces.View.class.getName())) entityClass = (Class) ((ParameterizedType)t).getActualTypeArguments()[0];
                }
                calledFromView = true;
            }


            Method finalM = m;
            Class finalEntityClass = entityClass;
            boolean finalCalledFromView = calledFromView;
            Class finalViewClass = viewClass;
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    try {
                        List<Object> persistPending = new ArrayList<>();

                        Object o = instance;
                        if (o == null) {
                            if (!Strings.isNullOrEmpty(rpcViewClassName)) {
                                o = Class.forName(rpcViewClassName).newInstance();
                                fillEntity(em, persistPending, user, o, rpcViewData, true);
                            } else {
                                o = (parameters.isEmpty("_id"))?finalEntityClass.newInstance():em.find(finalEntityClass, parameters.get("_id"));
                            }
                        }
                        List<Object> vs = new ArrayList<>();
                        for (Parameter p : finalM.getParameters()) {

                            if (finalCalledFromView && finalEntityClass.isAssignableFrom(p.getType())) {
                                vs.add(o);
                            } else if (p.isAnnotationPresent(io.mateu.mdd.core.annotations.Selection.class)) {
                                vs.add(parameters.get("_selection"));
                            } else if (EntityManager.class.isAssignableFrom(p.getType())) {
                                vs.add(em);
                            } else if (p.getType().isAnnotationPresent(Entity.class)) {
                                Object v = parameters.get(p.getName());
                                if (v != null) {
                                    Pair x = (Pair) v;
                                    if (x.getValue() != null) {
                                        v = em.find(p.getType(), x.getValue());
                                    }
                                }
                                vs.add(v);
                            } else if (p.isAnnotationPresent(io.mateu.mdd.core.annotations.Wizard.class)) {
                                vs.add(parameters);
                            } else if (io.mateu.mdd.core.views.AbstractServerSideWizard.class.isAssignableFrom(p.getType())) {
                                vs.add(fillWizard(user, em, p.getType(), parameters.get(p.getName())));
                            } else if (UserData.class.equals(p.getType())) {
                                vs.add(user);
                            } else {
                                Object v = extractValue(em, persistPending, user, o, parameters, getInterfaced(p));
                                vs.add(v);
                                //vs.add(parameters.get(p.getName()));
                            }
                        }
                        Object[] args = vs.toArray();

                        for (Object x : persistPending) em.persist(x);

                        Object i = o;
                        if (Strings.isNullOrEmpty(rpcViewClassName) && finalCalledFromView && finalViewClass != null) i = finalViewClass.newInstance();

                        r[0] = finalM.invoke(i, args);
                    } catch (InvocationTargetException e) {
                        throw e.getTargetException();
                    }
                }
            });
        } else {
            boolean needsEM = false;
            for (Parameter p : m.getParameters()) {
                if (EntityManager.class.equals(p.getType()) || io.mateu.mdd.core.views.AbstractServerSideWizard.class.isAssignableFrom(p.getType())) needsEM = true;
            }
            if (needsEM) {
                Method finalM1 = m;
                Helper.transact(new JPATransaction() {
                    @Override
                    public void run(EntityManager em) throws Throwable {

                        List<Object> persistPending = new ArrayList<>();

                        List<Object> vs = new ArrayList<>();
                        for (Parameter p : finalM1.getParameters()) {
                            if (p.isAnnotationPresent(io.mateu.mdd.core.annotations.Selection.class)) {
                                vs.add(parameters.get("_selection"));
                            } else if (EntityManager.class.isAssignableFrom(p.getType())) {
                                vs.add(em);
                            } else if (p.getType().isAnnotationPresent(Entity.class)) {
                                Object v = parameters.get(p.getName());
                                if (v != null) {
                                    Pair x = (Pair) v;
                                    if (x.getValue() != null) {
                                        v = em.find(p.getType(), x.getValue());
                                    }
                                }
                                vs.add(v);
                            } else if (p.isAnnotationPresent(io.mateu.mdd.core.annotations.Wizard.class)) {
                                vs.add(parameters);
                            } else if (io.mateu.mdd.core.views.AbstractServerSideWizard.class.isAssignableFrom(p.getType())) {
                                vs.add(fillWizard(user, em, p.getType(), parameters.get(p.getName())));
                            } else if (UserData.class.equals(p.getType())) {
                                vs.add(user);
                            } else {
                                Object v = extractValue(em, persistPending, user, null, parameters, getInterfaced(p));
                                vs.add(v);
                                //vs.add(parameters.get(p.getName()));
                            }
                        }
                        Object[] args = vs.toArray();

                        for (Object x : persistPending) em.persist(x);

                        r[0] = finalM1.invoke(null, args);

                    }
                });
            } else {
                List<Object> vs = new ArrayList<>();
                for (Parameter p : m.getParameters()) {
                    if (p.isAnnotationPresent(io.mateu.mdd.core.annotations.Selection.class)) {
                        vs.add(parameters.get("_selection"));
                    } else {
                        vs.add(parameters.get(p.getName()));
                    }
                }
                Object[] args = vs.toArray();

                r[0] = m.invoke(null, args);
            }
        }

        return r[0];
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
                fillEntity(em, persistPending, user, p, data, false);
            }

            for (Object x : persistPending) em.persist(x);

            return (T) w;
        } else throw new Exception("" + type.getName() + " must extend " + io.mateu.mdd.core.views.BaseServerSideWizard.class.getName());
    }

}
