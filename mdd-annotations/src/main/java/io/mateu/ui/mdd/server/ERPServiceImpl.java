package io.mateu.ui.mdd.server;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.mateu.ui.core.client.components.Component;
import io.mateu.ui.core.client.components.Tabs;
import io.mateu.ui.core.client.components.fields.*;
import io.mateu.ui.core.client.views.AbstractForm;
import io.mateu.ui.core.client.views.RPCView;
import io.mateu.ui.core.shared.*;
import io.mateu.ui.mdd.server.annotations.*;
import io.mateu.ui.mdd.server.annotations.Action;
import io.mateu.ui.mdd.server.annotations.CellStyleGenerator;
import io.mateu.ui.mdd.server.interfaces.*;
import io.mateu.ui.mdd.server.interfaces.SupplementOrPositive;
import io.mateu.ui.mdd.server.util.DatesRange;
import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;
import io.mateu.ui.mdd.server.util.XMLSerializable;
import io.mateu.ui.mdd.server.workflow.WorkflowEngine;
import io.mateu.ui.mdd.shared.ERPService;
import io.mateu.ui.mdd.shared.MDDLink;
import io.mateu.ui.mdd.shared.MetaData;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.BeanUtilsBean;
import org.reflections.Reflections;

import javax.persistence.*;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.constraints.NotNull;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.lang.reflect.Parameter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by miguel on 11/1/17.
 */
public class ERPServiceImpl implements ERPService {

    private static Map<Class, List<Class>> cacheSubclases = new HashMap<>();

    public static MemorizadorRegistroEditado memorizadorRegistrosEditados;

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


    public static Object[][] staticSelect(String jpql) throws Throwable {
        System.out.println("jpql: " + jpql);

        List<Object[]> r = new ArrayList<>();

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Exception {
                Query q = em.createQuery(jpql);
                List rs = q.getResultList();
                for (Object o : rs) {
                    if (o != null && o.getClass().isArray()) r.add((Object[]) o);
                    else r.add(new Object[] { o });
                }

            }
        });

        return r.toArray(new Object[0][]);
    }

    @Override
    public Object[][] select(String jpql) throws Throwable {
        return staticSelect(jpql);
    }

    @Override
    public Object selectSingleValue(String jpql) throws Throwable {
        System.out.println("jpql: " + jpql);

        Object[] r = new Object[1];

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Exception {
                Query q = em.createQuery(jpql);
                r[0] = q.getSingleResult();
            }
        });


        return r[0];
    }

    @Override
    public Data selectPaginated(Data parameters) throws Throwable {
        Data d = new Data();

        long t0 = new Date().getTime();

        int rowsPerPage = parameters.getInt("_rowsperpage");
        int fromRow = rowsPerPage * parameters.getInt("_data_currentpageindex");
        String jpql = parameters.getString("_sql");

        d.getList("_data");

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                Query q = em.createQuery(jpql);
                q.setFirstResult(fromRow);
                q.setMaxResults(rowsPerPage);
                List rs = q.getResultList();
                for (Object o : rs) {
                    Data r;
                    d.getList("_data").add(r = new Data());
                    if (o.getClass().isArray()) {
                        Object[] l = (Object[]) o;
                        if (l != null) for (int i = 0; i < l.length; i++) {
                            r.set((i == 0)?"_id":"col" + i, l[i]);
                        }
                    } else {
                        r.set("_id", "" + o);
                    }
                }

                String jpqlx = jpql.substring(jpql.toLowerCase().indexOf(" from "));
                if (jpqlx.toLowerCase().contains(" order by ")) jpqlx = jpqlx.substring(0, jpqlx.toLowerCase().indexOf(" order by "));
                String sumsQl = "";
                for (Data d : parameters.getList("_sums")) {
                    sumsQl += ", ";
                    sumsQl += d.get("jpql");
                }
                jpqlx = "select count(x) " + sumsQl + jpqlx;
                Object[][] r = select(jpqlx);
                int pos = 0;
                int numRows = new Integer("" + r[0][pos++]);
                List<Data> sums = new ArrayList<>();
                for (Data d : parameters.getList("_sums")) {
                    Object v = r[0][pos++];
                    if (v != null && v instanceof Double) {
                        v = Math.round(100d * (Double) v) / 100d;
                    }
                    sums.add(new Data("name", d.get("name"), "value", v));
                }
                long t = new Date().getTime() - t0;
                d.set("_subtitle", "" + numRows + " records found in " + t + "ms.");
                d.set("_data_currentpageindex", fromRow / rowsPerPage);
                d.set("_data_totalrows", numRows);
                d.set("_data_pagecount", numRows / rowsPerPage + ((numRows % rowsPerPage == 0)?0:1));
                d.set("_data_sums", sums);
            }
        });


        return d;

    }

    @Override
    public int executeUpdate(String jpaql) throws Throwable {
        final int[] r = {0};
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                if (jpaql.startsWith("delete")) {
                    for (Object o : em.createQuery(jpaql.replaceFirst("delete", "select x")).getResultList()) {

                        for (FieldInterfaced f : getAllFields(o.getClass())) {
                            if (f.getType().isAnnotationPresent(Entity.class)) {
                                Object v = o.getClass().getMethod(getGetter(f)).invoke(o);
                                if (v != null) {
                                    FieldInterfaced parentField = null;
                                    for (FieldInterfaced ff : getAllFields(f.getType())) {
                                        try {
                                            if (ff.isAnnotationPresent(OneToMany.class)) System.out.println("el campo " + ff.getName() + " es onetomany");
                                            if (ff.isAnnotationPresent(OneToMany.class)) {
                                                for (Type t : ((ParameterizedType) ff.getGenericType()).getActualTypeArguments()) {
                                                    System.out.println("mirando tipo generico " + t.getTypeName());
                                                    if (t.getTypeName().equals(o.getClass().getName())) {
                                                        System.out.println("*******COINCIDEN*******");
                                                        OneToMany a = ff.getAnnotation(OneToMany.class);
                                                        if (f.getName().equals(a.mappedBy())) parentField = ff;
                                                    }
                                                }
                                            }
                                        } catch (Throwable e) {

                                        }
                                    }
                                    if (parentField != null) {
                                        System.out.println("hay parentField!!!!!!");
                                        if (parentField.isAnnotationPresent(MapKey.class)) {
                                            System.out.println("es MapKey ;)");
                                            String keyFieldName = parentField.getAnnotation(MapKey.class).name();
                                            Field keyField = o.getClass().getDeclaredField(keyFieldName);
                                            Object key = o.getClass().getMethod(getGetter(keyField)).invoke(o);
                                            Map m = (Map) v.getClass().getMethod(getGetter(parentField)).invoke(v);
                                            if (m.containsKey(key)) m.remove(key);
                                        } else {
                                            System.out.println("no es MapKey :(");
                                            List l = (List) v.getClass().getMethod(getGetter(parentField)).invoke(v);
                                            l.remove(o);
                                        }

                                    }
                                }
                            }
                        }


                        em.remove(o);
                    }
                } else {
                    r[0] = em.createQuery(jpaql).executeUpdate();
                }
            }
        });
        return r[0];
    }

    @Override
    public Data set(UserData user, String entityClassName, String viewClassName, Data data) throws Throwable {

        WorkflowEngine.activateLocalRunner();

        try {


            Object[] o = new Object[1];

            System.out.println("data=" + data);

            boolean isNew = data.get("_id") == null;

            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Class cl = Class.forName(entityClassName);
                    Class vcl = Class.forName((viewClassName != null)?viewClassName:entityClassName);

                    List<Object> persistPending = new ArrayList<>();

                    o[0] = fillEntity(em, persistPending, user, cl, vcl, data);

                    for (Object x : persistPending) em.persist(x);

                }
            });


            FieldInterfaced idField = null;
            boolean generated = false;
            for (FieldInterfaced f : getAllFields(Class.forName(entityClassName))) {
                if (f.isAnnotationPresent(Id.class)) {
                    idField = f;
                    if (f.isAnnotationPresent(GeneratedValue.class)) {
                        generated = true;
                    }
                    break;
                }
            }

            Method m = o[0].getClass().getMethod(getGetter(idField));
            Object id = m.invoke(o[0]);


            String name = "Record of type " + o.getClass().getName() + " with id " + id;

            try {
                name = Helper.capitalize(
                        (o[0].getClass().isAnnotationPresent(Entity.class) && !Strings.isNullOrEmpty(((Entity)o[0].getClass().getAnnotation(Entity.class)).name()))?
                                ((Entity)o[0].getClass().getAnnotation(Entity.class)).name()
                                :o[0].getClass().getSimpleName()) + " " + ((data.isEmpty("_tostring"))?id:data.get("_tostring")
                );
            } catch (Throwable e) {
                e.printStackTrace();
            }


            rememberEditedRecord(user, isNew, name, data.getString("_sourceuri"), id);

            //Object id = data.get("_id");
            if (id instanceof Long) return get(user, entityClassName, viewClassName, (long) id);
            else if (id instanceof Integer) return get(user, entityClassName, viewClassName, (int) id);
            else if (id instanceof String) return get(user, entityClassName, viewClassName, (String) id);
            else return null;
        } catch (Throwable throwable) {

            if (throwable instanceof ConstraintViolationException) {
                ConstraintViolationException cve = (ConstraintViolationException) throwable;
                StringBuffer sb = new StringBuffer();
                for (ConstraintViolation cv : cve.getConstraintViolations()) {
                    if (sb.length() > 0) sb.append("\n");
                    sb.append(cv.toString());
                }
                System.out.println(sb.toString());
                throw new Exception(sb.toString());
            } else throw throwable;
        }
    }

    private void rememberEditedRecord(UserData user, boolean isNew, String name, String sourceurl, Object id) {

        if (memorizadorRegistrosEditados != null) memorizadorRegistrosEditados.recordar(user, isNew, name, sourceurl, id);

    }

    @Override
    public Data get(UserData user, String entityClassName, String viewClassName, long id) throws Throwable {
        return _get(user, entityClassName, viewClassName, id);
    }

    @Override
    public Data get(UserData user, String entityClassName, String viewClassName, int id) throws Throwable {
        return _get(user, entityClassName, viewClassName, id);
    }

    @Override
    public Data get(UserData user, String entityClassName, String viewClassName, String id) throws Throwable {
        return _get(user, entityClassName, viewClassName, id);
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
            FieldInterfaced idField = null;
            boolean generated = false;
            for (FieldInterfaced f : getAllFields(cl)) {
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
                if (vcl != null && !vcl.equals(cl)) o = ((View)vcl.newInstance()).newInstance(em, user);
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

        fillEntity(em, persistPending, user, o, data, newInstance, vcl, (o instanceof CalendarLimiter)? (CalendarLimiter) o :null);

        if (newInstance) {
            persistPending.add(o);
        }

        return o;
    }

    public static void fillEntity(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, boolean newInstance) throws Throwable {
        fillEntity(em, persistPending, user, o, data, newInstance, o.getClass(), (o instanceof CalendarLimiter)? (CalendarLimiter) o :null);
    }

    public static void fillEntity(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, boolean newInstance, Class viewClass, CalendarLimiter calendarLimiter) throws Throwable {
        fillEntity(em, persistPending, user, o, data, null, newInstance, viewClass, calendarLimiter);
    }

    public static void fillEntity(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, String prefix, boolean newInstance, Class viewClass, CalendarLimiter calendarLimiter) throws Throwable {

        if (prefix == null) prefix = "";

        BeanUtilsBean.getInstance().getConvertUtils().register(false, false, 0);

        View view = null;
        if (viewClass != null && !viewClass.equals(o.getClass())) {
            view = (View) viewClass.newInstance();
        }

        //auditoría
        for (FieldInterfaced f : getAllFields(o.getClass())) if (AuditRecord.class.isAssignableFrom(f.getType())) {
            AuditRecord a = (AuditRecord) o.getClass().getMethod(getGetter(f)).invoke(o);
            if (a == null) {
                BeanUtils.setProperty(o, f.getName(), a = (AuditRecord) f.getType().newInstance());
            }
            a.touch(em, data.getString("_user"));
        }


        List<String> fl = new ArrayList<>();
        List<String> nfl = new ArrayList<>();

        if (view != null) {
            addToList(fl, nfl, view.getFields());
        }


        for (FieldInterfaced f : getAllFields(o.getClass(), view != null && view.isFieldsListedOnly(), fl, nfl)) {

            boolean updatable = true;
            if (AuditRecord.class.isAssignableFrom(f.getType()) || f.isAnnotationPresent(Output.class) || f.isAnnotationPresent(Ignored.class) || f.isAnnotationPresent(NotInEditor.class) || (!newInstance && f.isAnnotationPresent(Unmodifiable.class))) {
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
                    fillEntity(em, persistPending, user, z, (f.isAnnotationPresent(UseGridToSelect.class))?data.getData(f.getId()):data, (f.isAnnotationPresent(UseGridToSelect.class))?"":prefix + f.getId() + "_", recienCreado, z.getClass(), (z instanceof CalendarLimiter)? (CalendarLimiter) z : calendarLimiter);
                } else if (f.isAnnotationPresent(Owned.class)) {
                    if (f.getType().isAnnotationPresent(Entity.class)) {
                        Object z = o.getClass().getMethod(getGetter(f)).invoke(o);
                        boolean recienCreado = false;
                        if (z == null) {
                            recienCreado = true;
                            z = f.getType().newInstance();
                            BeanUtils.setProperty(o, f.getName(), z);
                        }
                        fillEntity(em, persistPending, user, z, data, prefix, recienCreado, z.getClass(), (z instanceof CalendarLimiter)? (CalendarLimiter) z : calendarLimiter);
                        if (recienCreado) persistPending.add(z);
                    } else {
                        System.out.println("owned y no es una entity");
                    }
                } else if (data != null && data.containsKey(prefix + f.getId())) {

                    Object v = extractValue(em, persistPending, user, o, data, f, prefix);

                    if (File.class.isAssignableFrom(f.getType())) {
                        File current = (File) o.getClass().getMethod(getGetter(f)).invoke(o);
                        if (v == null) {
                            if (current != null) {
                                em.remove(current);
                                v = null;
                                BeanUtils.setProperty(o, f.getName(), v);
                            }
                        } else {
                            FileLocator l = (FileLocator) v;
                            if (current == null) {
                                current = (File) f.getType().newInstance();
                                BeanUtils.setProperty(o, f.getName(), current);
                                persistPending.add(current);
                            }
                            if (l.isModified()) {
                                current.set(l.getFileName(), l.getTmpPath());
                            }
                        }
                    } else if (Translated.class.isAssignableFrom(f.getType())) {
                        Object current = o.getClass().getMethod(getGetter(f)).invoke(o);
                        if (current == null) {
                            current = f.getType().newInstance();
                            BeanUtils.setProperty(o, f.getName(), current);
                            persistPending.add(current);
                        }
                        ((Translated) current).set((Data) v);
                    } else if (!f.isAnnotationPresent(OwnedList.class)) { // en este caso ya hemos añadido el valor dentro del método exractValue()

                        Object old = f.getValue(o);

                        if (old != null && !old.equals(v)) {

                            if (f.isAnnotationPresent(ManyToOne.class)) {
                                // buscamos la relación inversa
                                for (FieldInterfaced ff : getAllFields(f.getType())) {
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
                                for (FieldInterfaced ff : getAllFields(f.getGenericClass())) {
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
                                for (FieldInterfaced ff : getAllFields(f.getType())) {
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
                                for (FieldInterfaced ff : getAllFields(f.getGenericClass())) {
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

    private static Object extractValue(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, FieldInterfaced f) throws Throwable {
        return extractValue(em, persistPending, user, o, data, f, "");
    }

    private static Object extractValue(EntityManager em, List<Object> persistPending, UserData user, Object o, Data data, FieldInterfaced f, String prefix) throws Throwable {

        Object v = data.get(prefix + f.getId());
        if (v != null && v instanceof Pair) v = ((Pair) v).getValue();

        if (File.class.isAssignableFrom(f.getType()) || Translated.class.isAssignableFrom(f.getType())) return v;

        Class<?> genericClass = null;
        if (f.getGenericType() instanceof ParameterizedType) {
            ParameterizedType genericType = (ParameterizedType) f.getGenericType();
            genericClass = (genericType != null && genericType.getActualTypeArguments().length > 0)?(Class<?>) genericType.getActualTypeArguments()[0]:null;
        }

        if (DataSerializable.class.isAssignableFrom(f.getType())) {
            DataSerializable ds = (DataSerializable) f.getType().newInstance();
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
        } if (genericClass != null && UseCalendarToEdit.class.isAssignableFrom(genericClass)) {

            List<UseCalendarToEdit> l = new ArrayList<>();

            if (v != null) {

                Data dv = (Data) v;

                Map<String, UseCalendarToEdit> m = new HashMap<>();
                for (Data d : dv.getList("_options")) {
                    UseCalendarToEdit x = (UseCalendarToEdit) genericClass.newInstance();
                    fillEntity(em, persistPending, user, x, d, false);
                    l.add(x);
                    m.put(d.get("__id"), x);
                }

                UseCalendarToEdit x = null;
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
            FieldInterfaced parentField = null;
            for (FieldInterfaced ff : getAllFields(f.getType())) {
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

            if (f.isAnnotationPresent(OwnedList.class) || f.isAnnotationPresent(Owned.class)) {
                String idfieldatx = "id";
                for (FieldInterfaced fx : getAllFields(genericClass))
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
                    } else if (f.isAnnotationPresent(ValueClass.class) || f.isAnnotationPresent(ValueQL.class)) {

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

            if (f.isAnnotationPresent(OwnedList.class) || f.isAnnotationPresent(Owned.class)) {

                String idfieldatx = "id";
                for (FieldInterfaced fx : getAllFields(genericClass))
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

    private static Method getMethod(Class<?> c, String methodName) {
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

    private static String getGetter(FieldInterfaced f) {
        return (("boolean".equals(f.getType().getName()) || Boolean.class.equals(f.getType()))?"is":"get") + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }

    private static String getGetter(String fn) {
        return "get" + fn.substring(0, 1).toUpperCase() + fn.substring(1);
    }

    private static String getSetter(Field f) {
        return "set" + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }
    private static String getSetter(FieldInterfaced f) {
        return "set" + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }

    private Data _get(UserData user, String entityClassName, String viewClassName, Object id) throws Throwable {
        Data data = new Data();

        Helper.notransact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                Class viewClass = Class.forName((viewClassName != null)?viewClassName:entityClassName);
                View v = null;
                if (!viewClass.equals(Class.forName(entityClassName))) v = (View) viewClass.newInstance();


                Object o = null;
                if (id != null) o = em.find(Class.forName(entityClassName), (id instanceof Integer)?new Long((Integer)id):id);
                else {
                    if (v != null) o = v.newInstance(em, user);
                    if (o == null) o = Class.forName(entityClassName).newInstance();
                }


                fillData(user, em, viewClass, id, data, o, (o instanceof CalendarLimiter)? (CalendarLimiter) o :null);

                for (Method m : viewClass.getDeclaredMethods()) {
                    if ("toString".equals(m.getName())) {
                        data.set("_tostring", (v == null)?m.invoke(o):m.invoke(v, o));
                    }

                    if (m.isAnnotationPresent(Subtitle.class)) {
                        data.set("_subtitle", (v == null)?m.invoke(o):m.invoke(v, o));
                    }

                    if (m.isAnnotationPresent(Badges.class)) {
                        data.set("_badges", (v == null)?m.invoke(o):m.invoke(v, o));
                    }

                    if (m.isAnnotationPresent(Links.class)) {
                        data.set("_links", (v == null)?m.invoke(o):m.invoke(v, o));
                    }
                }

                if (data.isEmpty("_badges")) for (Method m : getAllMethods(viewClass)) {
                    if (m.isAnnotationPresent(Badges.class)) {
                        data.set("_badges", (v == null)?m.invoke(o):m.invoke(v, o));
                    }
                }

                if (data.isEmpty("_links")) for (Method m : getAllMethods(viewClass)) {
                    if (m.isAnnotationPresent(Links.class)) {
                        data.set("_links", (v == null)?m.invoke(o):m.invoke(v, o));
                    }
                }

                if (data.isEmpty("_links")) {
                    List<MDDLink> l = new ArrayList<>();
                    for (FieldInterfaced f : getAllFields(viewClass)) {
                        if (f.isAnnotationPresent(OneToMany.class)) {
                            /*
                            l.add(new MDDLink("Booking", Booking.class, ActionType.OPENEDITOR, new Data("_id", getBooking().getId())));
                            l.add(new MDDLink("Tasks", AbstractTask.class, ActionType.OPENLIST, new Data("services.id", getId())));
                            l.add(new MDDLink("Purchase orders", PurchaseOrder.class, ActionType.OPENLIST, new Data("services.id", getId())));
                            */
                        }
                    }
                    if (l.size() > 0) data.set("_links", l);
                }

                if (id == null) {
                    data.set("_title", "New " + Helper.capitalize(
                            (o.getClass().isAnnotationPresent(Entity.class) && !Strings.isNullOrEmpty(((Entity)o.getClass().getAnnotation(Entity.class)).name()))?
                                    ((Entity)o.getClass().getAnnotation(Entity.class)).name()
                                    :o.getClass().getSimpleName())
                    );
                } else {
                    data.set("_title",
                            Helper.capitalize(
                                    (o.getClass().isAnnotationPresent(Entity.class) && !Strings.isNullOrEmpty(((Entity)o.getClass().getAnnotation(Entity.class)).name()))?
                                            ((Entity)o.getClass().getAnnotation(Entity.class)).name()
                                            :o.getClass().getSimpleName()) + " " + ((data.isEmpty("_tostring"))?id:data.get("_tostring")
                            )
                    );
                }

            }
        });

        return data;
    }

    private static void fillData(UserData user, EntityManager em, Class viewClass, Object id, Data data, Object o, CalendarLimiter calendarLimiter) throws Throwable {
        fillData(user, em, viewClass, id, data, "", o, calendarLimiter);
    }

    public static void fillData(UserData user, EntityManager em, Data data, Object o, CalendarLimiter calendarLimiter) throws Throwable {
        fillData(user, em, null, null, data, "", o, calendarLimiter);
    }

    private static void fillData(UserData user, EntityManager em, Class viewClass, Object id, Data data, String prefix, Object o, CalendarLimiter calendarLimiter) throws Throwable {

        if (id != null) data.set(prefix + "_id", id);

        ListView v = null;
        List<String> fl = new ArrayList<>();
        List<String> nfl = new ArrayList<>();

        if (viewClass == null) viewClass = o.getClass();

        if (View.class.isAssignableFrom(viewClass)) {
            v = (View) viewClass.newInstance();

            if (v != null && v instanceof View) {
                addToList(fl, nfl, ((View)v).getFields());
            }
        }

        if (v == null) {
            for (FieldInterfaced f : getAllFields(o.getClass())) fillData(user, em, viewClass, data, prefix, o, f, calendarLimiter);
        } else {
            for (FieldInterfaced f : getAllFields(o.getClass(), v != null && v instanceof View && ((View)v).isFieldsListedOnly(), fl, nfl)) fillData(user, em, viewClass, data, prefix, o, f, calendarLimiter);
        }

        for (Method m : getAllMethods(o.getClass())) {
            if (!Modifier.isStatic(m.getModifiers())) {
                if (m.isAnnotationPresent(Show.class) || m.isAnnotationPresent(ShowAsHtml.class)) {

                    if (v == null || !(v instanceof View) || !((View)v).isFieldsListedOnly() || fl.contains(m.getName())) fillData(user, em, viewClass, data, prefix, o, getInterfaced(m), calendarLimiter);

                }
            }
        }
    }

    private static List<String> asList(String s) {
        List<String> l = new ArrayList<>();
        if (s != null) for (String t : s.split(",")) {
            t = t.trim();
            if (!"".equals(t)) l.add(t);
        }
        return l;
    }

    private static FieldInterfaced getInterfaced(Method m) {
        return new FieldInterfaced() {
            @Override
            public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                return m.isAnnotationPresent(annotationClass);
            }

            @Override
            public Class<?> getType() {
                return m.getReturnType();
            }

            @Override
            public Class<?> getGenericClass() {
                if (m.getGenericReturnType() instanceof ParameterizedType) {
                    ParameterizedType genericType = (ParameterizedType) m.getGenericReturnType();
                    Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                    return genericClass;
                } else return null;
            }

            @Override
            public Class<?> getDeclaringClass() {
                return m.getDeclaringClass();
            }

            @Override
            public Type getGenericType() {
                return m.getGenericReturnType();
            }

            @Override
            public String getName() {
                String n = m.getName();
                if (n.startsWith("is")) n = n.replaceFirst("is", "");
                else if (n.startsWith("get")) n = n.replaceFirst("get", "");
                else if (m.isAnnotationPresent(Show.class) && !Strings.isNullOrEmpty(m.getAnnotation(Show.class).value())) n = m.getAnnotation(Show.class).value();
                else if (m.isAnnotationPresent(ShowAsHtml.class) && !Strings.isNullOrEmpty(m.getAnnotation(ShowAsHtml.class).value())) n = m.getAnnotation(ShowAsHtml.class).value();
                return n;
            }

            @Override
            public String getId() {
                return m.getName();
            }

            @Override
            public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                return m.getAnnotation(annotationClass);
            }

            @Override
            public Class<?> getOptionsClass() {
                return null;
            }

            @Override
            public String getOptionsQL() {
                return null;
            }

            @Override
            public Object getValue(Object o) {
                return ERPServiceImpl.getValue(m, o);
            }

            @Override
            public String toString() {
                return m.toString();
            }

            @Override
            public Field getField() {
                return null;
            }

            @Override
            public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
                return m.getDeclaredAnnotationsByType(annotationClass);
            }

            @Override
            public void setValue(Object o, Object v) {

            }
        };
    }

    public static Object getValue(Method m, Object o) {
        Object v = null;

        try {
            v = execute(null, m, null, o, null, null);
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return v;
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

    public static Object getValue(FieldInterfaced f, Object o) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

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

    private static void fillData(UserData user, EntityManager em, Class viewClass, Data data, String prefix, Object o, FieldInterfaced f, CalendarLimiter calendarLimiter) throws Throwable {
        if (!f.isAnnotationPresent(Ignored.class) && !(f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class))) {
            boolean uneditable = false;
            if (f.isAnnotationPresent(Output.class) || f.isAnnotationPresent(Unmodifiable.class)) {
                uneditable = false;
            }

            Object v = f.getValue(o);
            if (!uneditable) {
                boolean ok = false;

                Class genericClass = null;
                if (f.getGenericType() instanceof ParameterizedType) {
                    ParameterizedType genericType = (ParameterizedType) f.getGenericType();
                    genericClass = (genericType != null && genericType.getActualTypeArguments().length > 0)?(Class<?>) genericType.getActualTypeArguments()[0]:null;
                }

                if (DataSerializable.class.isAssignableFrom(f.getType())) {
                    if (v != null) {
                        v = ((DataSerializable)v).toData(em, user);
                        ok = true;
                    }
                } else if (f.getType().isPrimitive() || basicos.contains(f.getType())) {
                    if (v != null) ok = true;
                } else if (v instanceof Date) {
                    if (v != null) {
                        v = LocalDateTime.ofInstant(((Date)v).toInstant(), ZoneId.systemDefault());
                        ok = true;
                    }
                } else if (f.getType().isAnnotationPresent(Embeddable.class)) {
                    if (v != null) {

                        Method mts;
                        if ((mts = f.getType().getMethod("toString")) != null) {
                            v = mts.invoke(v);
                        }
                    }
                    ok = true;
                } else if (f.isAnnotationPresent(OptionsClass.class)) {
                    if (v != null) {
                        v = getEntityPair(em, v, f.getAnnotation(OptionsClass.class).value());
                        ok = true;
                    }
                } else if (f.isAnnotationPresent(OptionsQL.class)) {
                    if (v != null) {
                        v = getQLPair(em, v, f.getAnnotation(OptionsQL.class).value());
                        ok = true;
                    }
                } else if (v instanceof File) {
                    if (v != null) {
                        v = ((File)v).toFileLocator();
                        ok = true;
                    }
                } else if (Translated.class.isAssignableFrom(f.getType())) {
                    if (v != null) {
                        v = ((Translated) v).get();
                        ok = true;
                    }
                } else if (f.getType().isArray()) {
                    if (v!= null) {
                        StringBuffer sb = new StringBuffer();
                        for (int i = 0; i < Array.getLength(v); i++) {
                            if (i > 0) sb.append(",");
                            sb.append(Array.get(v, i));
                        }
                        v = sb.toString();
                        ok = true;
                    }
                } else if (f.getType().isAnnotationPresent(Entity.class)) {
                    if (v != null) {
                        if (f.isAnnotationPresent(Owned.class)) {
                            fillData(user, em, viewClass, em.getEntityManagerFactory().getPersistenceUnitUtil().getIdentifier(v), data, f.getName() + "_", v, calendarLimiter);
                            ok = false; // no añadimos el objeto tal cual
                        } else {
                            String n = v.toString();
                            boolean toStringIsOverriden = f.getType().getMethod("toString").getDeclaringClass().equals(f.getType());
                            if (!toStringIsOverriden) {
                                boolean hayName = false;
                                for (FieldInterfaced ff : getAllFields(f.getType()))
                                    if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                        n = "" + f.getType().getMethod(getGetter(ff)).invoke(v);
                                        hayName = true;
                                    }
                                if (!hayName) {
                                    for (FieldInterfaced ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            n = "" + f.getType().getMethod(getGetter(ff)).invoke(v);
                                        }
                                }
                            }
                            v = new Pair(em.getEntityManagerFactory().getPersistenceUnitUtil().getIdentifier(v), n);
                        }
                        ok = true;
                    }
                } else if (f.getType().isEnum()) {
                    for (Object x : f.getType().getEnumConstants()) {
                        if (x.equals(v)) {
                            v = new Pair("" + x, "" + x);
                            ok = true;
                            break;
                        }
                    }
                } else if (List.class.isAssignableFrom(f.getType())) {
                    if (v != null) {
                        if (genericClass != null && UseCalendarToEdit.class.isAssignableFrom(genericClass)) {
                            Data d = new Data();
                            List<Data> values = new ArrayList<>();
                            List<Data> options = new ArrayList<>();
                            LocalDate first = (calendarLimiter != null)?calendarLimiter.getBegining():null;
                            LocalDate last = (calendarLimiter != null)?calendarLimiter.getEnding():null;
                            List<LocalDate> vistas = new ArrayList<>();
                            for (UseCalendarToEdit x : (List<UseCalendarToEdit>) v) {
                                String uuid;
                                Data option = new Data("__id", uuid = UUID.randomUUID().toString());
                                fillData(user, em, option, x, calendarLimiter);
                                option.set("_nameproperty", x.getNamePropertyName());
                                options.add(option);

                                List<LocalDate> fechas = x.getCalendarDates();

                                if (x.getDatesRangesPropertyName() != null) {
                                    List<DatesRange> l = (List<DatesRange>) x.getClass().getMethod(getGetter(x.getDatesRangesPropertyName())).invoke(x);
                                    fechas = new ArrayList<>();
                                    for (DatesRange r : l) {
                                        LocalDate del = LocalDate.from(r.getStart());
                                        LocalDate al = LocalDate.from(r.getEnd());
                                        if (del != null && al != null && !del.isAfter(al)) {
                                            while (!del.isAfter(al)) {
                                                fechas.add(del);
                                                del = del.plusDays(1);
                                            }
                                        }
                                    }
                                }

                                for (LocalDate dx : fechas) {
                                    values.add(new Data("_key", dx, "_value", uuid));
                                    vistas.add(dx);
                                    if (first == null || first.isAfter(dx)) first = LocalDate.from(dx);
                                    if (last == null || last.isBefore(dx)) last = LocalDate.from(dx);
                                }

                            }

                            if (first == null) {
                                first = LocalDate.now();
                                last = first.plusYears(1);
                            }

                            for (LocalDate dx = LocalDate.from(first); !dx.isAfter(last); dx = dx.plusDays(1)) {
                                if (!vistas.contains(dx)) values.add(new Data("_key", dx, "_value", null));
                            }

                            values.sort((d0, d1) -> d0.getLocalDate("_key").compareTo(d1.getLocalDate("_key")));

                            d.set("_values", values);
                            d.set("_options", options);
                            d.set("_fromdate", first);
                            d.set("_todate", last);
                            v = d;
                        } else if (genericClass.isAnnotationPresent(Entity.class)) {

                            Method m = null;

                            if (f.isAnnotationPresent(OwnedList.class)) {

                                List<Data> dl = new ArrayList<>();

                                List l = (List) v;
                                for (Object x : l) {
                                    Data dx = new Data();
                                    fillData(user, em, o.getClass(), getId(x), dx, x, calendarLimiter);
                                    dl.add(dx);
                                }

                                v = dl;

                            } else {

                                boolean toStringIsOverriden = genericClass.getMethod("toString").getDeclaringClass().equals(genericClass);
                                if (!toStringIsOverriden) {
                                    boolean hayName = false;
                                    for (FieldInterfaced ff : getAllFields(genericClass))
                                        if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                            m = genericClass.getMethod(getGetter(ff));
                                            hayName = true;
                                        }
                                    if (!hayName) {
                                        for (FieldInterfaced ff : getAllFields(genericClass))
                                            if (ff.isAnnotationPresent(Id.class)) {
                                                m = genericClass.getMethod(getGetter(ff));
                                            }
                                    }
                                }


                                List<Pair> dl = new ArrayList<>();

                                List l = (List) v;
                                for (Object x : l) {

                                    String n = x.toString();

                                    if (m != null) n = "" + m.invoke(x);

                                    dl.add(new Pair(getId(x), n));

                                }

                                PairList pl = new PairList();
                                pl.setValues(dl);
                                v = pl;

                            }

                        } else if (String.class.equals(genericClass) || Integer.class.equals(genericClass)
                                || Long.class.equals(genericClass) || Double.class.equals(genericClass)) {


                            if (f.isAnnotationPresent(ValueClass.class) || f.isAnnotationPresent(ValueQL.class)) {

                                List<Data> dl = new ArrayList<>();

                                List l = (List) v;
                                for (Object x : l) {
                                    Data dx = new Data();
                                    if (f.isAnnotationPresent(ValueClass.class)) dx.set("_value", getEntityPair(em, x, f.getAnnotation(ValueClass.class).value()));
                                    else if (f.isAnnotationPresent(ValueQL.class)) dx.set("_value", getQLPair(em, x, f.getAnnotation(ValueQL.class).value()));
                                    dl.add(dx);
                                }

                                v = dl;

                            } else {

                                StringBuffer sb = new StringBuffer();
                                boolean primero = true;
                                for (Object x : (List<Object>) v) {
                                    if (primero) primero = false;
                                    else sb.append("\n");
                                    sb.append(x);
                                }
                                v = sb.toString();

                            }

                        } else {
                            List<Data> dl = new ArrayList<>();

                            List l = (List) v;
                            for (Object x : l) {
                                Data dx = new Data();
                                fillData(user, em, o.getClass(), getId(x), dx, x, calendarLimiter);
                                dl.add(dx);
                            }

                            v = dl;
                        }

                        ok = true;
                    }

                } else if (Map.class.isAssignableFrom(f.getType())) {


                    if (v != null) {

                        List<Data> dl = new ArrayList<>();

                        Map l = (Map) v;
                        for (Object k : l.keySet()) {
                            Object z = l.get(k);

                            if (k != null) {

                                if (k.getClass().isAnnotationPresent(Entity.class)) {

                                    String n = k.toString();

                                    Method m = null;
                                    boolean toStringIsOverriden = k.getClass().getMethod("toString").getDeclaringClass().equals(k.getClass());
                                    if (!toStringIsOverriden) {
                                        boolean hayName = false;
                                        for (FieldInterfaced ff : getAllFields(k.getClass()))
                                            if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                                m = k.getClass().getMethod(getGetter(ff));
                                                hayName = true;
                                            }
                                        if (!hayName) {
                                            for (FieldInterfaced ff : getAllFields(k.getClass()))
                                                if (ff.isAnnotationPresent(Id.class)) {
                                                    m = k.getClass().getMethod(getGetter(ff));
                                                }
                                        }
                                    }

                                    if (m != null) n = "" + m.invoke(k);

                                    k = new Pair(getId(k), n);

                                } else if (f.isAnnotationPresent(KeyClass.class)) {
                                    if (k != null) k = getEntityPair(em, k, f.getAnnotation(KeyClass.class).value());
                                } else if (f.isAnnotationPresent(KeyQL.class)) {
                                    if (k != null) k = getQLPair(em, k, f.getAnnotation(KeyQL.class).value());
                                }
                            }

                            if (f.isAnnotationPresent(OwnedList.class)) {

                                Data dx = new Data("_key", k);
                                fillData(user, em, o.getClass(), getId(z), dx, z, calendarLimiter);
                                dl.add(dx);

                            } else {

                                if (z != null) {

                                    if (z != null && z.getClass().isAnnotationPresent(Entity.class)) {
                                        String n = z.toString();

                                        Method m = null;
                                        boolean toStringIsOverriden = z.getClass().getMethod("toString").getDeclaringClass().equals(z.getClass());
                                        if (!toStringIsOverriden) {
                                            boolean hayName = false;
                                            for (FieldInterfaced ff : getAllFields(z.getClass()))
                                                if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                                    m = z.getClass().getMethod(getGetter(ff));
                                                    hayName = true;
                                                }
                                            if (!hayName) {
                                                for (FieldInterfaced ff : getAllFields(z.getClass()))
                                                    if (ff.isAnnotationPresent(Id.class)) {
                                                        m = z.getClass().getMethod(getGetter(ff));
                                                    }
                                            }

                                            if (m != null) n = "" + m.invoke(z);

                                        }

                                        z = new Pair(getId(z), n);
                                    } else if (f.isAnnotationPresent(ValueClass.class)) {
                                        if (z != null) z = getEntityPair(em, z, f.getAnnotation(ValueClass.class).value());
                                    } else if (f.isAnnotationPresent(ValueQL.class)) {
                                        if (z != null) z = getQLPair(em, z, f.getAnnotation(ValueQL.class).value());
                                    }
                                }

                                Data dx = new Data("_key", k, "_value", z);
                                dl.add(dx);

                            }

                        }

                        v = dl;

                        ok = true;
                    }


                } else {
                    data.set(prefix + f.getName() + "____object", true);
                    if (v != null) {
                        fillData(user, em,  viewClass,null, data, f.getName() + "_", v, calendarLimiter);
                        ok = false; // no añadimos el objeto tal cual
                    }
                }

                if (v != null) {
                    if (ok) data.set(prefix + f.getId(), v);
                    else if (XMLSerializable.class.isAssignableFrom(f.getType())) {
                        data.set(prefix + f.getName(), v.toString());
                    }
                }
            }
        }
    }

    private static Object getQLPair(EntityManager em, Object v, String ql) throws Throwable {
        if (v == null) return null;
        Pair p = new Pair(v, "Not found");
        for (Object[] l : staticSelect(ql)) {
            if (v.equals(l[0])) {
                p = new Pair(v, "" + l[1]);
                break;
            }
        }
        return p;
    }

    private static Object getEntityPair(EntityManager em, Object v, Class c) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {

        if (v == null) return null;

        Object o = em.find(c, v);

        Pair p = null;
        if (o != null) {
            FieldInterfaced fieldForName = null;
            boolean hayName = false;
            for (FieldInterfaced ff : getAllFields(c))
                if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                    fieldForName = ff;
                    hayName = true;
                }
            if (!hayName) {
                for (FieldInterfaced ff : getAllFields(c))
                    if (ff.isAnnotationPresent(Id.class)) {
                        fieldForName = ff;
                    }
            }

            Object n = o.getClass().getMethod(getGetter(fieldForName)).invoke(o);
            if (Translated.class.isAssignableFrom(n.getClass())) {
                n = n.getClass().getMethod("getEs").invoke(n);
            }

            p = new Pair(v, "" + n);

        } else {
            p = new Pair(v, "Not found");
        }

        return p;

    }

    private static Object getId(Object o) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        Object id = null;
        for (FieldInterfaced f : getAllFields(o.getClass())) {
            if (f.isAnnotationPresent(Id.class)) {
                id = o.getClass().getMethod(getGetter(f)).invoke(o);
                break;
            }
        }
        return id;
    }

    public static Data getMetadaData(UserData user, EntityManager em, Class c, String queryFilters) throws Exception {
        return getMetadaData(user, em, null, c, queryFilters, false);
    }

    public static Data getMetadaData(UserData user, EntityManager em, String parentFieldName, Class c, String queryFilters, boolean doNotIncludeSeparator) throws Exception {
        Data data = new Data();

        if (RPCView.class.isAssignableFrom(c)) {

            return getMetaDataForRpcView(em, user, c, queryFilters, doNotIncludeSeparator);

        } else {

            ListView v = null;

            List<String> viewParamFields = new ArrayList<>();
            List<String> viewColumnFields = new ArrayList<>();
            List<String> viewColumnHeaders = new ArrayList<>();
            List<String> viewSumFields = new ArrayList<>();
            List<String> viewOrderFields = new ArrayList<>();
            List<String> viewFormFields = new ArrayList<>();
            List<String> negatedViewFormFields = new ArrayList<>();

            if (ListView.class.isAssignableFrom(c)) {
                System.out.println(c.getName() + " is a view");
                v = (ListView) c.newInstance();
                for (Type t : c.getGenericInterfaces()) {
                    if (t.getTypeName().startsWith(View.class.getName()) || t.getTypeName().startsWith(ListView.class.getName()) || t.getTypeName().startsWith(CompositeView.class.getName())) c = (Class) ((ParameterizedType)t).getActualTypeArguments()[0];
                }

                addToList(viewParamFields, v.getParams());
                addToList(viewSumFields, v.getSums());
                addToList(viewColumnFields, v.getCols());
                addToList(viewColumnHeaders, v.getColHeaders());
                addToList(viewOrderFields, v.getOrderCriteria());
                if (v instanceof View) addToList(viewFormFields, negatedViewFormFields, ((View)v).getFields());

            } else {
                System.out.println(c.getName() + " is an entity");
            }
            System.out.println("entity=" + c.getName());

            Class viewClass = c;
            if (v != null) viewClass = v.getClass();

            data.set("_entityClassName", c.getName());

            for (FieldInterfaced f : getAllFields(c)) if (f.isAnnotationPresent(Id.class)) {
                data.set("_idFieldName", f.getName());
            }

            data.set("_viewClassName", viewClass.getName());
            if (CompositeView.class.isAssignableFrom(viewClass)) {
                Type t = viewClass.getGenericInterfaces()[0];
                Class ccomposite = (Class) ((ParameterizedType) t).getActualTypeArguments()[1];
                data.set("_compositeClassName", ccomposite.getName());

                for (FieldInterfaced f : getAllFields(ccomposite)) {
                    if (f.getType().equals(c)) {

                        data.set("_compositeFieldName", f.getName());
                        break;

                    }
                }

                data.set("_compositeActionName", ((CompositeView)viewClass.newInstance()).getActionName());

            }
            data.set("_queryFilters", queryFilters);
            data.set("_rawtitle", Helper.capitalize(Helper.pluralize((c.isAnnotationPresent(Entity.class) && !Strings.isNullOrEmpty(((Entity)c.getAnnotation(Entity.class)).name()))?((Entity)c.getAnnotation(Entity.class)).name():c.getSimpleName())));

            if (ListView.class.isAssignableFrom(viewClass) && v != null && v.getViewTitle() != null) data.set("_rawtitle", v.getViewTitle());

            if (viewClass.isAnnotationPresent(Indelible.class)) data.set("_indelible", true);
            if (viewClass.isAnnotationPresent(NewNotAllowed.class) || (v != null && CompositeView.class.isAssignableFrom(viewClass))) data.set("_newnotallowed", true);

            String [] qf = {queryFilters};

            if (Filtered.class.isAssignableFrom(viewClass)) {
                try {
                    Class finalViewClass = viewClass;
                    Helper.transact(new JPATransaction() {
                        @Override
                        public void run(EntityManager em) throws Throwable {
                            String f = ((Filtered) finalViewClass.newInstance()).getAdditionalCriteria(em, user);
                            if (!Strings.isNullOrEmpty(f)) {
                                if (!Strings.isNullOrEmpty(qf[0])) qf[0] += " and ";
                                else qf[0] = "";
                                qf[0] += f;
                            }
                        }
                    });
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }

            if (!Strings.isNullOrEmpty(qf[0])) data.set("_additionalcriteria", qf[0]);

            // buscamos subclases

            if (!c.isArray() && !c.isPrimitive() && c.getProtectionDomain() != null && c.getProtectionDomain().getCodeSource() != null && c.getProtectionDomain().getCodeSource().getLocation() != null) {

            /*
            Reflections reflections = new Reflections(new ConfigurationBuilder()
                    .filterInputsBy(new FilterBuilder()
                            .add((s) -> {
                                //System.out.println(s);
                                return s.endsWith(".class");
                            })
                            //.include("\\.class")
                    )
                    .setScanners(new SubTypesScanner()).setUrls(c.getProtectionDomain().getCodeSource().getLocation())); //c.getPackage().getName());
                    */

                Reflections reflections = new Reflections(c.getPackage().getName());

                Set<Class> subTypes = getSubtypes(reflections, c);

                List<Data> subclases = new ArrayList<>();
                for (Class s : subTypes) {
                    if (s.getCanonicalName() != null) subclases.add(new Data("_name", Helper.capitalize(s.getSimpleName()), "_type", s.getCanonicalName(), "_editorform", getEditorForm(user, em, (v instanceof View)? (View) v :null, viewFormFields, negatedViewFormFields, viewClass, s)));
                }
                if (subclases.size() > 0) data.set("_subclasses", subclases);


            }


            // seguimos...

            List<Data> searchFormFields = new ArrayList<>();
            List<Data> sums = new ArrayList<>();
            List<Data> listColumns = new ArrayList<>();
            List<Data> staticActions = new ArrayList<>();

            for (FieldInterfaced f : getAllFields(c, (v instanceof View)? ((View) v).isFieldsListedOnly() :false, viewParamFields, null)) {
                if (f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(SearchFilters.class)) {
                    for (SearchFilter sf : f.getDeclaredAnnotationsByType(SearchFilter.class)) {
                        addField(user, em, (v instanceof View)? (View) v :null, searchFormFields, f, null, sf, null, true, false);
                    }
                } else if (f.isAnnotationPresent(SearchFilterIsNull.class)) {
                    addField(user, em, (v instanceof View)? (View) v :null, searchFormFields, new FieldInterfacedFromField(f) {

                        @Override
                        public Class<?> getType() {
                            return Boolean.class;
                        }

                        @Override
                        public String getId() {
                            return f.getName() + "_isnull";
                        }

                    }, null, null, f.getAnnotation(SearchFilterIsNull.class), true, false);
                } else if (v != null && viewParamFields.contains(f.getName())) {
                    addField(user, em, (v instanceof View)? (View) v :null, searchFormFields, f, null, null, null, true, false);
                }

            }

            boolean hayListColumns = false;
            if (v == null || Strings.isNullOrEmpty(v.getCols())) for (FieldInterfaced f : getAllFields(c)) {
                if (f.isAnnotationPresent(Id.class) || f.isAnnotationPresent(ListColumn.class) || f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(ListColumns.class) || f.isAnnotationPresent(SearchFilters.class)) {
                    if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(NotInList.class))) {
                        hayListColumns |= f.isAnnotationPresent(ListColumn.class) || f.isAnnotationPresent(ListColumns.class);
                        addColumn(user, em, v, listColumns, f);
                    }
                }
            }

            if (!hayListColumns) {
                listColumns.clear();
                for (FieldInterfaced f : getAllFields(c, (v == null || Strings.isNullOrEmpty(v.getCols()))?false:true, viewColumnFields, null)) {
                    if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(NotInList.class)))
                        addColumn(user, em, v, listColumns, f);
                }
            }

            if (viewColumnHeaders.size() > 0) {
                for (int pos = 0; pos < viewColumnHeaders.size(); pos++) {
                    if (listColumns.size() > pos + 1) listColumns.get(pos + 1).set("_label", viewColumnHeaders.get(pos));
                }
            }


            for (FieldInterfaced f : getAllFields(c, (v == null || Strings.isNullOrEmpty(v.getSums()))?false:true, viewSumFields, null)) {
                if (f.isAnnotationPresent(Sum.class))
                    sums.add(new Data("name", Helper.capitalize(f.getName()), "jpql", "sum(x." + f.getId() + ")"));
            }


            boolean ordered = false;
            for (Data d : listColumns) if (!d.isEmpty("_order")) {
                ordered = true;
                break;
            }
            if (!ordered && listColumns.size() >= 2) {
                listColumns.get(1).set("_order", 0);
                listColumns.get(1).set("_ordercol", listColumns.get(1).getString("_qlname"));
            }




            for (Method m : getAllMethods(viewClass)) {
                if (Modifier.isStatic(m.getModifiers())) {
                    addMethod(user, em, v, staticActions, m, viewClass);
                }
            }




            Data dsf;
            data.set("_searchform", dsf = new Data());
            dsf.set("_fields", searchFormFields);
            dsf.set("_columns", listColumns);
            data.set("_sums", sums);
            data.set("_actions", staticActions);
            data.set("_editorform", getEditorForm(user, em, (v != null && v instanceof View)? (View) v :null, viewFormFields, negatedViewFormFields, viewClass, c));

            if (!Strings.isNullOrEmpty(parentFieldName) && !doNotIncludeSeparator) {
                parentFieldName = Helper.capitalize(parentFieldName);
                int pos = 0;
                for (Data x : data.getData("_editorform").getList("_fields")) {
                    if (pos == 0) {
                        x.set("_separator", Helper.capitalize(parentFieldName));
                        break;
                    }
                }
            }

            return data;

        }

    }

    private static Data getMetaDataForRpcView(EntityManager em, UserData user, Class c, String queryFilters, boolean doNotIncludeSeparator) throws Exception {

        Data data = new Data();

        Class lc = Class.forName(((ParameterizedType)c.getGenericInterfaces()[0]).getActualTypeArguments()[0].getTypeName());
        Class ec = Class.forName(((ParameterizedType)c.getGenericInterfaces()[0]).getActualTypeArguments()[1].getTypeName());

        List<Data> searchFormFields = new ArrayList<>();
        List<Data> listColumns = new ArrayList<>();
        List<Data> staticActions = new ArrayList<>();

        for (FieldInterfaced f : getAllFields(c)) {
            if (f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(SearchFilters.class)) {
                for (SearchFilter sf : f.getDeclaredAnnotationsByType(SearchFilter.class)) {
                    addField(user, em, null, searchFormFields, f, null, sf, null, true, false);
                }
            } else if (f.isAnnotationPresent(SearchFilterIsNull.class)) {
                addField(user, em, null, searchFormFields, new FieldInterfacedFromField(f) {

                    @Override
                    public Class<?> getType() {
                        return Boolean.class;
                    }

                    @Override
                    public String getId() {
                        return f.getName() + "_isnull";
                    }

                }, null, null, f.getAnnotation(SearchFilterIsNull.class), true, false);
             } else {
                addField(user, em, null, searchFormFields, f);
            }

        }

        boolean hayListColumns = false;
        for (FieldInterfaced f : getAllFields(lc)) {
            if (f.isAnnotationPresent(Id.class) || f.isAnnotationPresent(ListColumn.class) || f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(ListColumns.class) || f.isAnnotationPresent(SearchFilters.class)) {
                if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(NotInList.class))) {
                    hayListColumns |= f.isAnnotationPresent(ListColumn.class) || f.isAnnotationPresent(ListColumns.class);
                    addColumn(user, em, null, listColumns, f);
                }
            }
        }

        if (!hayListColumns) {
            listColumns.clear();
            for (FieldInterfaced f : getAllFields(lc, false, null, null)) {
                if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(NotInList.class)))
                    addColumn(user, em, null, listColumns, f);
            }
        }

        boolean ordered = false;
        for (Data d : listColumns) if (!d.isEmpty("_order")) {
            ordered = true;
            break;
        }
        if (!ordered && listColumns.size() >= 2) {
            listColumns.get(1).set("_order", 0);
            listColumns.get(1).set("_ordercol", listColumns.get(1).getString("_qlname"));
        }




        for (Method m : getAllMethods(c)) {
            if (true || Modifier.isStatic(m.getModifiers())) {
                addMethod(user, em, null, staticActions, m, c);
            }
        }


        data.set("_indelible", true);
        data.set("_newnotallowed", true);

        data.set("_rpcViewClassName", c.getName());
        data.set("_entityClassName", ec.getName());
        data.set("_viewClassName", ec.getName());
        data.set("_queryFilters", queryFilters);
        data.set("_rawtitle", Helper.capitalize(Helper.pluralize(c.getSimpleName())));

        RPCView v = (RPCView) c.newInstance();
        if (v.getViewTitle() != null) data.set("_rawtitle", v.getViewTitle());


        Data dsf;
        data.set("_searchform", dsf = new Data());
        dsf.set("_fields", searchFormFields);
        dsf.set("_columns", listColumns);
        data.set("_actions", staticActions);
        data.set("_editorform", getEditorForm(user, em, null, null, null, ec, ec));

        return data;

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

    private static Set<Class> getSubtypes(Reflections reflections, Class c) {

        List<Class> l = cacheSubclases.get(c);

        if (l == null) {

            System.out.println("lista subclases de " + c.getName() + " no está en caché. Recorremos el jar...");

            l = new ArrayList<>();
            Set<Class> s = reflections.getSubTypesOf(c);
            l.addAll(s);
            for (Class sc : s) {
                l.addAll(getSubtypes(reflections, sc));
            }
            cacheSubclases.put(c, l);

        } else {

            System.out.println("lista subclases de " + c.getName() + " está en caché.");

        }

        return new HashSet<>(l);
    }


    @Override
    public Data getMetaData(UserData user, String entityClassName, String viewClassName, String queryFilters) throws Exception {
        if (viewClassName == null) viewClassName = entityClassName;
        Class c = Class.forName(viewClassName);

        Data[] data = new Data[1];

        try {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    data[0] = getMetadaData(user, em, c, queryFilters);
                }
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return data[0];
    }

    private Data getMetaData(UserData user, EntityManager em, Class entity, String queryFilters) throws Throwable {
        return getMetadaData(user, em, entity, queryFilters);
    }

    private static Data getEditorForm(UserData user, EntityManager em, View v, List<String> viewFormFields, List<String> negatedFormFields, Class viewClass, Class c) throws Exception {
        if (viewClass != null && CompositeView.class.isAssignableFrom(viewClass)) return null;
        List<Data> editorFormFields = new ArrayList<>();
        for (FieldInterfaced f : getAllFields(c, v != null && v.isFieldsListedOnly(), viewFormFields, negatedFormFields)) {
            if ((v != null && v.isFieldsListedOnly()) || (!f.isAnnotationPresent(Ignored.class) && !f.isAnnotationPresent(NotInEditor.class) && !(f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))) {
                addField(user, em, v, editorFormFields, (v == null || !v.isFieldsListedOnly())?f:new FieldInterfacedFromField(f) {

                    @Override
                    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                        if (Tab.class.equals(annotationClass)) return false;
                        else if (NotInEditor.class.equals(annotationClass)) return false;
                        else if (Ignored.class.equals(annotationClass)) return false;
                        else return super.isAnnotationPresent(annotationClass);
                    }

                });
            }
        }

        for (Method m : getAllMethods(c)) {
            if (!Modifier.isStatic(m.getModifiers())) {
                if (m.isAnnotationPresent(Show.class) || m.isAnnotationPresent(ShowAsHtml.class)) {
                            addField(user, em, v, editorFormFields, getInterfaced(m));
                }
            }
        }

        Data def = new Data();
        def.set("_fields", editorFormFields);
        List<Data> actions = new ArrayList<>();
        List<Method> visited = new ArrayList<>();
        for (Method m : getAllMethods(viewClass)) {
            if (!Modifier.isStatic(m.getModifiers())) {
                addMethod(user, em, v, actions, m, viewClass);
                visited.add(m);
            }
        }
        for (Method m : getAllMethods(c)) if (!visited.contains(m)) {
            if (!Modifier.isStatic(m.getModifiers())) {
                addMethod(user, em, v, actions, m, viewClass);
            }
        }
        def.set("_actions", actions);
        def.set("_rawtitle", Helper.capitalize(c.getSimpleName()));
        return def;
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

    private static List<FieldInterfaced> getAllFields(Class c) {

        List<String> vistos = new ArrayList<>();
        Map<String, Field> originales = new HashMap<>();
        for (Field f : c.getDeclaredFields()) {
            originales.put(f.getName(), f);
        }

        List<FieldInterfaced> l = new ArrayList<>();

        if (c.getSuperclass() != null && (!c.isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class))) {
            for (FieldInterfaced f : getAllFields(c.getSuperclass())) {
                if (!originales.containsKey(f.getId())) l.add(f);
                else l.add(new FieldInterfacedFromField(originales.get(f.getName())));
                vistos.add(f.getName());
            }
        }

        for (Field f : c.getDeclaredFields()) if (!vistos.contains(f.getName())) {
            l.add(new FieldInterfacedFromField(f));
        }

        return l;
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

    @Override
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
            if (View.class.isAssignableFrom(entityClass)) {
                viewClass = entityClass;
                for (Type t : entityClass.getGenericInterfaces()) {
                    if (entityClass.getGenericInterfaces()[0].getTypeName().startsWith(View.class.getName())) entityClass = (Class) ((ParameterizedType)t).getActualTypeArguments()[0];
                }
                calledFromView = true;
            } else if (RPCView.class.isAssignableFrom(entityClass)) {
                viewClass = entityClass;
                for (Type t : entityClass.getGenericInterfaces()) {
                    if (entityClass.getGenericInterfaces()[0].getTypeName().startsWith(View.class.getName())) entityClass = (Class) ((ParameterizedType)t).getActualTypeArguments()[0];
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
                            } else if (p.isAnnotationPresent(Selection.class)) {
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
                            } else if (p.isAnnotationPresent(Wizard.class)) {
                                vs.add(parameters);
                            } else if (AbstractServerSideWizard.class.isAssignableFrom(p.getType())) {
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
                if (EntityManager.class.equals(p.getType()) || AbstractServerSideWizard.class.isAssignableFrom(p.getType())) needsEM = true;
            }
            if (needsEM) {
                Method finalM1 = m;
                Helper.transact(new JPATransaction() {
                    @Override
                    public void run(EntityManager em) throws Throwable {

                        List<Object> persistPending = new ArrayList<>();

                        List<Object> vs = new ArrayList<>();
                        for (Parameter p : finalM1.getParameters()) {
                            if (p.isAnnotationPresent(Selection.class)) {
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
                            } else if (p.isAnnotationPresent(Wizard.class)) {
                                vs.add(parameters);
                            } else if (AbstractServerSideWizard.class.isAssignableFrom(p.getType())) {
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
                    if (p.isAnnotationPresent(Selection.class)) {
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




        if (o instanceof BaseServerSideWizard) {
            BaseServerSideWizard w = (BaseServerSideWizard) o;

            List<Object> persistPending = new ArrayList<>();

            for (Object p : w.getPages()) {
                fillEntity(em, persistPending, user, p, data, false);
            }

            for (Object x : persistPending) em.persist(x);

            return (T) w;
        } else throw new Exception("" + type.getName() + " must extend " + BaseServerSideWizard.class.getName());
    }

    @Override
    public WizardPageVO execute(UserData user, String wizardClassName, String action, Data data) throws Throwable {
        WizardPageVO[] vo = new WizardPageVO[1];

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                vo[0] = ((AbstractServerSideWizard)fillWizard(user, em, Class.forName(wizardClassName), null)).execute(user, em, action, data);
            }
        });

        return vo[0];
    }



    private static void addMethod(UserData user, EntityManager em, ListView view, List<Data> actions, Method m, Class viewClass) throws Exception {
        if (m.isAnnotationPresent(Action.class)) {
            List<Data> parameters = new ArrayList<>();
            Class entityClass = viewClass;
            if (View.class.isAssignableFrom(viewClass)) {
                for (Type t : viewClass.getGenericInterfaces()) {
                    if (t.getTypeName().startsWith(View.class.getName())) {
                        entityClass = (Class) ((ParameterizedType)t).getActualTypeArguments()[0];
                    }
                }
            }
            for (Parameter p : m.getParameters()) {
                boolean anadir = !EntityManager.class.isAssignableFrom(p.getType());
                anadir = anadir && !entityClass.isAssignableFrom(p.getType());
                if (anadir) addField(user, em, view, parameters, new FieldInterfaced() {
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
                        return (Class<?>) ((ParameterizedType)p.getParameterizedType()).getActualTypeArguments()[0];
                    }

                    @Override
                    public Class<?> getDeclaringClass() {
                        return m.getDeclaringClass();
                    }

                    @Override
                    public Type getGenericType() {
                        return null;
                    }

                    @Override
                    public String getName() {
                        return (p.isAnnotationPresent(io.mateu.ui.mdd.server.annotations.Parameter.class))?p.getAnnotation(io.mateu.ui.mdd.server.annotations.Parameter.class).name():p.getName();
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
                        return null;
                    }

                    @Override
                    public String getOptionsQL() {
                        return null;
                    }

                    @Override
                    public Object getValue(Object o) {
                        return ERPServiceImpl.getValue(m, o);
                    }

                    @Override
                    public String toString() {
                        return m.toString();
                    }

                    @Override
                    public Field getField() {
                        return null;
                    }

                    @Override
                    public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
                        return p.getDeclaredAnnotationsByType(annotationClass);
                    }

                    @Override
                    public void setValue(Object o, Object v) {

                    }
                });
            }
            Data a = new Data();
            a.set("_entityClassName", m.getDeclaringClass().getName());
            a.set("_name", m.getAnnotation(Action.class).name());
            a.set("_confirmationmessage", m.getAnnotation(Action.class).confirmationMessage());
            if (m.getAnnotation(Action.class).callOnEnterKeyPressed()) a.set("_callonenterkeypressed", true);
            if (m.getAnnotation(Action.class).addAsButton()) a.set("_addasbutton", true);
            if (m.getAnnotation(Action.class).keepOpened()) a.set("_keepopened", true);
            a.set("_methodname", m.getName());
            a.set("_parameters", parameters);
            Data def;
            a.set("_form", def = new Data());
            def.set("_fields", parameters);
            if (Void.class.equals(m.getReturnType())) a.set("_returntype", "void");
            else a.set("_returntype", m.getReturnType().getCanonicalName());
            actions.add(a);
        }
    }

    private static void addColumn(UserData user, EntityManager em, ListView view, List<Data> listColumns, FieldInterfaced f) throws Exception {
        List<ListColumn> lcs = new ArrayList<>();
        for (ListColumn lc : f.getDeclaredAnnotationsByType(ListColumn.class)) lcs.add(lc);
        if (lcs.size() == 0) lcs.add(null);
        for (ListColumn lc : lcs) {
            addField(user, em, view, listColumns, f, lc, null, null, false, true);
        }
    }

    private static void addField(UserData user, EntityManager em, ListView view, List<Data> _fields, FieldInterfaced f) throws Exception {
        addField(user, em, view, _fields, f, null, null, null, false, false);
    }

    private static void addField(UserData user, EntityManager em, ListView view, List<Data> _fields, FieldInterfaced f, ListColumn listColumnAnnotation, SearchFilter searchFilterAnnotation, SearchFilterIsNull searchFilterIsNullAnnotation, boolean buildingSearchForm, boolean buildingColumns) throws Exception {
        if (!f.isAnnotationPresent(Ignored.class)) {

            Data d = new Data();
            boolean upload = false;

            if (f.getType().isAnnotationPresent(Entity.class) && !f.isAnnotationPresent(NotNull.class)) d.set("_leftjoin", f.getId());

            if (f.isAnnotationPresent(CellStyleGenerator.class)) d.set("_cellstylegenerator", f.getAnnotation(CellStyleGenerator.class).value().getName());

            if (listColumnAnnotation != null) {
                if (!Strings.isNullOrEmpty(listColumnAnnotation.value())) {
                    d.set("_label", listColumnAnnotation.value());
                }
                if (!Strings.isNullOrEmpty(listColumnAnnotation.field())) {
                    d.set("_qlname", ((d.containsKey("_leftjoin"))?"":f.getId() + ".") + listColumnAnnotation.field());
                    for (FieldInterfaced ff : getAllFields(f.getType())) {
                        if (ff.getName().equals(listColumnAnnotation.field())) {
                            f = ff;
                            break;
                        }
                    }
                } else if (!Strings.isNullOrEmpty(listColumnAnnotation.ql()))
                d.set("_colql", listColumnAnnotation.ql());
                else d.set("_qlname", f.getId());

                if (listColumnAnnotation.order()) {
                    d.set("_order", 0);
                    d.set("_ordercol", d.getString("_qlname"));
                }
                if (listColumnAnnotation.width() >= 0) d.set("_colwidth", listColumnAnnotation.width());

            } else if (searchFilterIsNullAnnotation != null) {
                d.set("_isnull", true);
                if (!Strings.isNullOrEmpty(searchFilterIsNullAnnotation.value())) {
                    d.set("_label", searchFilterIsNullAnnotation.value());
                }
                if (!Strings.isNullOrEmpty(searchFilterIsNullAnnotation.field())) {
                    d.set("_qlname", f.getId() + "." + searchFilterIsNullAnnotation.field());
                    for (FieldInterfaced ff : getAllFields(f.getType())) {
                        if (ff.getName().equals(searchFilterIsNullAnnotation.field())) {
                            f = ff;
                            break;
                        }
                    }
                } else if (!Strings.isNullOrEmpty(searchFilterIsNullAnnotation.ql()))
                    d.set("_qlname", searchFilterIsNullAnnotation.ql());
                else d.set("_qlname", f.getId().replaceAll("_isnull", ""));
            } else if (searchFilterAnnotation != null) {
                if (!Strings.isNullOrEmpty(searchFilterAnnotation.value())) {
                    d.set("_label", searchFilterAnnotation.value());
                }
                if (searchFilterAnnotation.exactMatch()) d.set("_exactmatch", true);
                if (!Strings.isNullOrEmpty(searchFilterAnnotation.field())) {
                    d.set("_qlname", f.getId() + "." + searchFilterAnnotation.field());
                    Class aux = f.getGenericClass();
                    if (aux == null || Class.class.equals(aux)) aux = f.getType();
                    else {
                        d.set("_innerjoin", f.getId());
                        d.set("_qlname", searchFilterAnnotation.field());
                    }
                    for (FieldInterfaced ff : getAllFields(aux)) {
                        if (ff.getName().equals(searchFilterAnnotation.field())) {
                            FieldInterfaced finalF = f;
                            f = new FieldInterfacedFromField(ff) {
                                @Override
                                public String getId() {
                                    return finalF.getName() + "." + ff.getName();
                                }
                            };
                            break;
                        }
                    }
                } else if (!Strings.isNullOrEmpty(searchFilterAnnotation.ql()))
                    d.set("_qlname", searchFilterAnnotation.ql());
                else d.set("_qlname", f.getId());
            } else if (Translated.class.isAssignableFrom(f.getType())) {
                d.set("_translation", true);
                d.set("_qlname", "es");
            } else {
                d.set("_qlname", f.getId());
            }



            if (List.class.isAssignableFrom(f.getType()) || Map.class.isAssignableFrom(f.getType()) || f.isAnnotationPresent(NotInList.class)) {
                d.set("_notinlist", true);
            }


            if (f.isAnnotationPresent(FullWidth.class)) {
                d.set("_fullwidth", true);
            }
            if ((searchFilterAnnotation == null && f.isAnnotationPresent(NotNull.class)) || (searchFilterAnnotation != null && searchFilterAnnotation.required())) {
                d.set("_required", true);
            }

            if (f.isAnnotationPresent(Help.class)) {
                d.set("_help", f.getAnnotation(Help.class).value());
            }

            if (f.isAnnotationPresent(Order.class)) {
                Order o = f.getAnnotation(Order.class);
                d.set("_order", o.priority());
                d.set("_orderdesc", o.desc());
                d.set("_ordercol", d.getString("_qlname"));
            }



            if (f.isAnnotationPresent(StartTabs.class)) {
                d.set("_starttabs", true);
            }

            if (f.isAnnotationPresent(Tab.class)) {
                d.set("_starttab", f.getAnnotation(Tab.class).value());
            }

            if (f.isAnnotationPresent(EndTabs.class)) {
                d.set("_endtabs", true);
            }

            if (f.isAnnotationPresent(Unmodifiable.class)) {
                d.set("_unmodifiable", true);
            }

            if (f.isAnnotationPresent(Show.class)) {
                d.set("_type", MetaData.FIELDTYPE_OUTPUT);
                upload = true;
            } else if (f.isAnnotationPresent(ShowAsHtml.class)) {
                d.set("_type", MetaData.FIELDTYPE_HTML);
                upload = true;
            } else if (SupplementOrPositive.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_SUPPLEMENTORPOSITIVE);
                upload = true;
            } else if (Translated.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_MULTILANGUAGETEXT);
                if (f.isAnnotationPresent(TextArea.class)) d.set("_type", MetaData.FIELDTYPE_MULTILANGUAGETEXTAREA);
                upload = true;
            } else if (UseCalendarToEdit.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_CALENDAR);

                Class genericClass = null;
                if (f.getGenericType() instanceof ParameterizedType) {
                    ParameterizedType genericType = (ParameterizedType) f.getGenericType();
                    genericClass = (genericType != null && genericType.getActualTypeArguments().length > 0)?(Class<?>) genericType.getActualTypeArguments()[0]:null;
                }
                if (genericClass != null) {
                    UseCalendarToEdit i = ((UseCalendarToEdit) genericClass.newInstance());
                    d.set("_nameproperty", i.getNamePropertyName());
                    d.set("_datesproperty", i.getDatesRangesPropertyName());
                };

                Data ef = toMetaData(((UseCalendarToEdit)f.getType().newInstance()).getForm(em, user));

                if (!Strings.isNullOrEmpty(d.get("_datesproperty"))) {
                    List<Data> l = ef.getList("_fields");
                    List<Data> ll = new ArrayList<>();
                    for (Data dx : l) if (!dx.get("_id").equals(d.get("_datesproperty"))) ll.add(dx);
                    ef.set("_fields", ll);
                }

                d.set("_editorform", ef);
            } else if (f.isAnnotationPresent(UseGridToSelect.class)) {
                d.set("_type", MetaData.FIELDTYPE_SELECTFROMGRID);
                UseGridToSelect a = f.getAnnotation(UseGridToSelect.class);
                if (!Strings.isNullOrEmpty(a.data())) d.set("_dataproperty", a.data());
                else if (!Strings.isNullOrEmpty(a.ql())) d.set("_ql", a.ql());

                List<Data> cols = new ArrayList<>();
                Class c = f.getType();
                if (List.class.isAssignableFrom(f.getType())) c = f.getGenericClass();
                for (Field ff : c.getDeclaredFields()) {
                    if (!ff.isAnnotationPresent(Id.class) && !ff.getType().equals(f.getDeclaringClass()))
                        addColumn(user, em, view, cols, new FieldInterfacedFromField(ff));
                }
                d.set("_cols", cols);

                upload = true;
            } else if (f.isAnnotationPresent(Wizard.class)) {
                d.set("_type", MetaData.FIELDTYPE_WIZARD);
                Class<? extends BaseServerSideWizard> wc = f.getAnnotation(Wizard.class).value();
                try {
                    d.set("_pagevo", fillWizard(user, em, wc, null).execute(user, em,null, null));
                    d.set("_initialdata", getInitialData(user, em, wc));
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
                upload = true;
            } else if (AbstractServerSideWizard.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_WIZARD);
                Class<? extends BaseServerSideWizard> wc = (Class<? extends BaseServerSideWizard>) f.getType();
                try {
                    d.set("_pagevo", fillWizard(user, em, wc, null).execute(user, em,null, null));
                    d.set("_initialdata", getInitialData(user, em, wc));
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
                upload = true;
            } else if (f.isAnnotationPresent(OptionsClass.class)) {
                d.set("_type", MetaData.FIELDTYPE_WEEKDAYS);
                upload = true;
            } else if (f.getType().isArray()) {
                d.set("_type", MetaData.FIELDTYPE_STRING);
                upload = true;
            } else if (f.isAnnotationPresent(OptionsClass.class)) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", getQlForEntityField(em, user, view, f.getAnnotation(OptionsClass.class).value(), f.getId(), f.getAnnotation(QLFilter.class)));
                upload = true;
            } else if (f.isAnnotationPresent(OptionsQL.class)) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", f.getAnnotation(OptionsQL.class).value());
                upload = true;
            } else if (f.getOptionsClass() != null) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", getQlForEntityField(em, user, view, f.getOptionsClass(), f.getId(), f.getAnnotation(QLFilter.class)));
                upload = true;
            } else if (f.getOptionsQL() != null) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", f.getOptionsQL());
                upload = true;
            } else if (searchFilterIsNullAnnotation != null) {
                d.set("_type", MetaData.FIELDTYPE_BOOLEAN);
                upload = true;
            } else if (f.isAnnotationPresent(Output.class) && searchFilterAnnotation == null && !buildingColumns) {
                if (f.getType().isAnnotationPresent(Entity.class)) {
                    d.set("_type", MetaData.FIELDTYPE_OUTPUTENTITY);
                } else {
                    d.set("_type", MetaData.FIELDTYPE_OUTPUT);
                }
                upload = true;
            } else if (f.isAnnotationPresent(TextArea.class)) {
                d.set("_type", MetaData.FIELDTYPE_TEXTAREA);
                upload = true;
            } else if (f.isAnnotationPresent(Id.class) && !buildingSearchForm) {
                if (f.isAnnotationPresent(GeneratedValue.class)) {
                    d.set("_type", MetaData.FIELDTYPE_ID);
                    upload = true;
                } else {
                    d.set("_type", MetaData.FIELDTYPE_PK);
                    upload = true;
                }
            } else if ("int".equals(f.getType().getName()) || Integer.class.equals(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_INTEGER);
                upload = true;
            } else if ("long".equals(f.getType().getName()) || Long.class.equals(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_LONG);
                upload = true;
            } else if (String.class.equals(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_STRING);
                upload = true;
            } else if (LocalDate.class.equals(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_DATE);
                upload = true;
            } else if (Date.class.equals(f.getType()) || LocalDateTime.class.equals(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_DATETIME);
                upload = true;
            } else if ("double".equals(f.getType().getName()) || Double.class.equals(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_DOUBLE);
                upload = true;
            } else if ("boolean".equals(f.getType().getName()) || Boolean.class.equals(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_BOOLEAN);
                upload = true;
            } else if (Translated.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_STRING);
                upload = true;
            } else if (Data.class.equals(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_DATA);
                upload = true;
            } else if (UserData.class.equals(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_USERDATA);
                upload = true;
            } else {
                if (f.getType().isEnum()) {
                    d.set("_type", MetaData.FIELDTYPE_ENUM);
                    List<Pair> values = new ArrayList<>();
                    for (Object x : f.getType().getEnumConstants()) {
                        values.add(new Pair("" + x, "" + x));
                    }
                    d.set("_values", values);
                    d.set("_enumtype", f.getType().getCanonicalName());

                    d.set("_leftjoinql", f.getId());

                    upload = true;
                } else if (List.class.isAssignableFrom(f.getType())) {
                    if (buildingSearchForm && f.getGenericClass().isAnnotationPresent(Entity.class)) {
                        d.set("_type", MetaData.FIELDTYPE_ENTITY);
                        d.set("_entityClassName", f.getType().getCanonicalName());
                        d.set("_innerjoin", f.getId());
                        d.set("_qlname", getIdFieldName(f.getGenericClass()));
                        d.set("_ql", getQlForEntityField(em, user, view, f.getGenericClass(), f.getId(), f.getAnnotation(QLFilter.class)));
                    } else {

                        Class gc = f.getGenericClass();

                        if (gc != null && UseCalendarToEdit.class.isAssignableFrom(gc)) {
                            d.set("_type", MetaData.FIELDTYPE_CALENDAR);
                            AbstractForm form = ((UseCalendarToEdit) gc.newInstance()).getForm(em, user);
                            Data ef = null;
                            if (form != null) {
                                ef = toMetaData(form);
                            } else {
                                ef = getMetadaData(user, em, gc, null).getData("_editorform");
                            }

                            if (gc != null) {
                                UseCalendarToEdit i = ((UseCalendarToEdit) gc.newInstance());
                                d.set("_nameproperty", i.getNamePropertyName());
                                d.set("_datesproperty", i.getDatesRangesPropertyName());
                            };

                            if (!Strings.isNullOrEmpty(d.get("_datesproperty"))) {
                                List<Data> l = ef.getList("_fields");
                                List<Data> ll = new ArrayList<>();
                                for (Data dx : l) if (!dx.get("_id").equals(d.get("_datesproperty"))) ll.add(dx);
                                ef.set("_fields", ll);
                            }

                            d.set("_editorform", ef);

                                    upload = true;
                        } else if (f.isAnnotationPresent(OwnedList.class) || !f.getGenericClass().isAnnotationPresent(Entity.class)) {

                            if (gc.isPrimitive() || gc.equals(Long.class) || gc.equals(Integer.class) || gc.equals(Double.class) || gc.equals(String.class)) {
                                d.set("_type", MetaData.FIELDTYPE_TEXTAREA);

                                if (f.isAnnotationPresent(ValueClass.class) || f.isAnnotationPresent(ValueQL.class)) {

                                    d.set("_type", MetaData.FIELDTYPE_GRID);
                                    List<Data> cols = new ArrayList<>();

                                    Class<?> finalGenericClass = gc;
                                    final FieldInterfaced finalF1 = f;
                                    addField(user, em, view, cols, new FieldInterfacedFromField(f) {
                                        @Override
                                        public Class<?> getType() {
                                            return finalGenericClass;
                                        }

                                        @Override
                                        public String getName() {
                                            return (finalF1.isAnnotationPresent(MapLabels.class) && !Strings.isNullOrEmpty(finalF1.getAnnotation(MapLabels.class).labelForValue()))?finalF1.getAnnotation(MapLabels.class).labelForValue():"Value";
                                        }

                                        @Override
                                        public String getId() {
                                            return "_value";
                                        }



                                    }, null, null, null, false, true);

                                    d.set("_cols", cols);

                                }

                            } else {
                                d.set("_type", MetaData.FIELDTYPE_GRID);
                                List<Data> cols = new ArrayList<>();
                                for (Field ff : f.getGenericClass().getDeclaredFields()) {
                                    if (!ff.isAnnotationPresent(Id.class) && !ff.getType().equals(f.getDeclaringClass()))
                                        addColumn(user, em, view, cols, new FieldInterfacedFromField(ff));
                                }
                                d.set("_cols", cols);
                            }

                        } else {
                            d.set("_type", MetaData.FIELDTYPE_LIST);
                            d.set("_entityClassName", f.getGenericClass().getCanonicalName());

                            String ql = getQlForEntityField(em, user, view, f);

                            d.set("_ql", ql);
                        }
                    }
                    upload = true;
                } else if (Map.class.isAssignableFrom(f.getType())) {

                        Class<?> genericKeyClass = null;
                        Class<?> genericClass = null;
                        if (f.getGenericType() instanceof ParameterizedType) {
                            ParameterizedType genericType = (ParameterizedType) f.getGenericType();
                            genericKeyClass = (genericType != null && genericType.getActualTypeArguments().length > 0)?(Class<?>) genericType.getActualTypeArguments()[0]:null;
                            genericClass = (genericType != null && genericType.getActualTypeArguments().length > 1)?(Class<?>) genericType.getActualTypeArguments()[1]:null;
                        }

                        d.set("_type", MetaData.FIELDTYPE_GRID);
                        List<Data> cols = new ArrayList<>();

                    Class<?> finalGenericKeyClass = genericKeyClass;

                    FieldInterfaced finalF1 = f;
                    addField(user, em, view, cols, new FieldInterfacedFromField(f) {

                        @Override
                        public Class<?> getType() {
                            return finalGenericKeyClass;
                        }

                        @Override
                        public String getName() {
                            return (finalF1.isAnnotationPresent(MapLabels.class) && !Strings.isNullOrEmpty(finalF1.getAnnotation(MapLabels.class).labelForKey()))?finalF1.getAnnotation(MapLabels.class).labelForKey():"Key";
                        }

                        @Override
                        public String getId() {
                            return "_key";
                        }

                        @Override
                        public Class<?> getOptionsClass() {
                            return (finalF1.isAnnotationPresent(KeyClass.class))?finalF1.getAnnotation(KeyClass.class).value():null;
                        }

                        @Override
                        public String getOptionsQL() {
                            return (finalF1.isAnnotationPresent(KeyQL.class))?finalF1.getAnnotation(KeyQL.class).value():null;
                        }

                    }, null, null, null, false, true);


                    if (f.isAnnotationPresent(OwnedList.class)) {

                        for (Field ff : genericClass.getDeclaredFields()) {
                            if (!ff.isAnnotationPresent(Id.class) && !ff.getType().equals(genericClass))
                                addColumn(user, em, view, cols, new FieldInterfacedFromField(ff));
                        }


                    } else {

                        Class<?> finalGenericClass = genericClass;
                        addField(user, em, view, cols, new FieldInterfacedFromField(f) {

                            @Override
                            public Class<?> getType() {
                                return finalGenericClass;
                            }

                            @Override
                            public String getName() {
                                return (finalF1.isAnnotationPresent(MapLabels.class) && !Strings.isNullOrEmpty(finalF1.getAnnotation(MapLabels.class).labelForValue()))?finalF1.getAnnotation(MapLabels.class).labelForValue():"Value";
                            }

                            @Override
                            public String getId() {
                                return "_value";
                            }

                        }, null, null, null, false, true);

                    }

                    d.set("_cols", cols);

                    upload = true;

                } else {

                    if (File.class.isAssignableFrom(f.getType())) {
                        d.set("_type", MetaData.FIELDTYPE_FILE);
                        if (!buildingColumns) upload = true;
                    } else {

                        boolean isEntity = false;
                        for (Annotation a : f.getType().getAnnotations()) {
                            if (a.annotationType().equals(Entity.class)) {
                                isEntity = true;
                            }
                        }
                        if (isEntity) {

                            d.set("_type", MetaData.FIELDTYPE_ENTITY);
                            d.set("_entityClassName", f.getType().getCanonicalName());

                            if (f.isAnnotationPresent(Owned.class)) {
                                d.set("_owned", true);

                                d.set("_metadata", getMetadaData(user, em, f.getType(), null).getData("_editorform"));

                            } else {

                                String nombreCampoId = "id";
                                for (FieldInterfaced ff : getAllFields(f.getType()))
                                    if (ff.isAnnotationPresent(Id.class)) {
                                        nombreCampoId = ff.getName();
                                    }


                                String defaultQl = "select x." + nombreCampoId + ", x.name from " + f.getType().getName() + " x order by x.name";

                                boolean hayName = false;
                                for (FieldInterfaced ff : getAllFields(f.getType()))
                                    if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                        if (!buildingSearchForm) d.set("_qlname", d.get("_qlname") + "." + ff.getName());
                                        defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());

                                        if (Translated.class.isAssignableFrom(ff.getType())) {
                                            d.set("_translation", true);
                                            d.set("_qlname", d.getString("_qlname") + ".es");

                                            defaultQl = "select x." + nombreCampoId + ", x." + ff.getName() + ".es from " + f.getType().getName() + " x order by x." + ff.getName() + ".es";
                                        }
                                        hayName = true;
                                    }
                                if (!hayName) {
                                    for (FieldInterfaced ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            d.set("_qlname", d.getString("_qlname") + "." + ff.getName());

                                            defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());
                                        }
                                }

                                if (buildingSearchForm) {
                                    for (FieldInterfaced ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            d.set("_qlname", d.get("_qlname") + "." + ff.getName());
                                        }
                                }

                                if (!d.isEmpty("_leftjoin")) {
                                    for (FieldInterfaced ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            d.set("_leftjoinql", ff.getName());
                                        }
                                }

                                if (f.getType().isAnnotationPresent(UseIdToSelect.class)) {
                                    d.set("_useidtoselect", true);
                                    for (FieldInterfaced fid : getAllFields(f.getType())) {
                                        if (fid.isAnnotationPresent(Id.class)) {
                                            d.set("_idtype", fid.getType().getName());
                                            break;
                                        }
                                    }
                                    defaultQl = "select x.id, x.name from " + f.getType().getName() + " x where x.id = xxxx";

                                    hayName = false;
                                    for (FieldInterfaced ff : getAllFields(f.getType()))
                                        if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                            defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());

                                            if (Translated.class.isAssignableFrom(ff.getType())) {
                                                defaultQl = "select x." + nombreCampoId + ", x." + ff.getName() + ".es from " + f.getType().getName() + " x where x.id = xxxx order by x." + ff.getName() + ".es";
                                            }
                                            hayName = true;
                                        }
                                    if (!hayName) {
                                        for (FieldInterfaced ff : getAllFields(f.getType()))
                                            if (ff.isAnnotationPresent(Id.class)) {
                                                defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());
                                            }
                                    }

                                    String ql = f.getType().getAnnotation(UseIdToSelect.class).ql();
                                    if (ql != null && !"".equals(ql.trim())) defaultQl = ql;
                                } else if (f.getType().isAnnotationPresent(UseAutocompleteToSelect.class)) {
                                    d.set("_useautocompletetoselect", true);
                                    String ql = f.getType().getAnnotation(UseAutocompleteToSelect.class).ql();
                                    if (ql != null && !"".equals(ql.trim())) defaultQl = ql;
                                } else if (f.getType().isAnnotationPresent(QLForCombo.class)) {
                                    String ql = f.getType().getAnnotation(QLForCombo.class).ql();
                                    if (ql != null && !"".equals(ql.trim())) defaultQl = ql;
                                } else {
                                    // dejamos defaultQl como está
                                }


                                if (f.isAnnotationPresent(QLFilter.class)) {

                                    String w = f.getAnnotation(QLFilter.class).value();

                                    if (!Strings.isNullOrEmpty(w)) {
                                        int pos = defaultQl.indexOf(" where ");
                                        if (pos > 0) {
                                            pos = pos + " where".length();
                                            defaultQl = defaultQl.substring(0, pos) + " " + w + defaultQl.substring(pos);
                                        } else {
                                            pos = defaultQl.indexOf(" order ");
                                            if (pos > 0) {
                                                defaultQl = defaultQl.substring(0, pos) + " where " + w + defaultQl.substring(pos);
                                            } else {
                                                defaultQl += " where " + w;
                                            }
                                        }

                                    }

                                }


                                if (view != null) {

                                    String w = view.getQLFilter(em, user, f.getId());

                                    if (!Strings.isNullOrEmpty(w)) {
                                        int pos = defaultQl.indexOf(" where ");
                                        if (pos > 0) {
                                            pos = pos + " where".length();
                                            defaultQl = defaultQl.substring(0, pos) + " " + w + defaultQl.substring(pos);
                                        } else {
                                            pos = defaultQl.indexOf(" order ");
                                            if (pos > 0) {
                                                defaultQl = defaultQl.substring(0, pos) + " where " + w + defaultQl.substring(pos);
                                            } else {
                                                defaultQl += " where " + w;
                                            }
                                        }

                                    }

                                }

                                d.set("_ql", defaultQl);

                            }

                            upload = true;


                        } else {

                            d.set("_type", MetaData.FIELDTYPE_OBJECT);

                            if (buildingColumns) {
                                d.set("_notinlist", true);
                            }

                            upload = true;

                            System.out.println("adding field " +f.getId());

                            d.set("_metadata", getMetadaData(user, em, f.getId(), f.getType(), null, f.isAnnotationPresent(DoNotIncludeSeparator.class)).getData("_editorform"));


                        }




                    }
                }

            }
            if (upload) {
                d.set("_id", f.getId());
                if (f.isAnnotationPresent(Selection.class)) {
                    d.set("_id", "_selection");
                    d.set("_type", MetaData.FIELDTYPE_LISTDATA);
                }

                //ancho columna y alineado
                int ancho = 200;
                String alineado = "left";
                if ("int".equals(f.getType().getName()) || "long".equals(f.getType().getName()) || Integer.class.equals(f.getType())) {
                    ancho = 80;
                    alineado = "right";
                } else if (Date.class.equals(f.getType()) || LocalDate.class.equals(f.getType())) {
                    ancho = 122;
                } else if ("double".equals(f.getType().getName()) || Double.class.equals(f.getType())) {
                    ancho = 80;
                    alineado = "right";
                } else if ("boolean".equals(f.getType().getName()) || Boolean.class.equals(f.getType())) {
                    ancho = 60;
                }
                d.set("_width", ancho);
                d.set("_align", alineado);

                if (f.isAnnotationPresent(Separator.class)) {
                    d.set("_separator", f.getAnnotation(Separator.class).value());
                }
                if (!buildingSearchForm && !f.isAnnotationPresent(SameLine.class)) d.set("_startsline", true);

                if (d.isEmpty("_label")) {
                    if (f.isAnnotationPresent(Caption.class)) {
                        d.set("_label", f.getAnnotation(Caption.class).value());
                    } else d.set("_label", Helper.capitalize(f.getName()));
                }
                _fields.add(d);
            }

        }
    }

    private static Data toMetaData(AbstractForm form) {
        Data d = new Data();
        List<Data> l = new ArrayList<>();
        List<Component> carga = new ArrayList<>();
        for (Component c : form.getComponentsSequence()) {
            addMetaData(l, c, carga);
        }
        d.set("_fields", l);
        return d;
    }

    private static void addMetaData(List<Data> l, Component c, List<Component> carga) {
        Data d = null;
        if (c instanceof WeekDaysField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_WEEKDAYS));
        } else if (c instanceof SupplementOrPositiveField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_SUPPLEMENTORPOSITIVE));
        } else if (c instanceof FileField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_FILE));
        } else if (c instanceof SqlComboBoxField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_COMBO, "_ql", ((SqlComboBoxField) c).getSql()));
        } else if (c instanceof ComboBoxField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_COMBO, "_values", ((ComboBoxField) c).getValues()));
        } else if (c instanceof HtmlField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_HTML));
        } else if (c instanceof ShowTextField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_OUTPUTENTITY));
        } else if (c instanceof ShowEntityField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_OUTPUTENTITY));
        } else if (c instanceof ShowEntityField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_OUTPUTENTITY));
        } else if (c instanceof PKField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_PK));
        } else if (c instanceof MultilanguageTextField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_MULTILANGUAGETEXT));
        } else if (c instanceof MultilanguageTextAreaField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_MULTILANGUAGETEXTAREA));
        } else if (c instanceof DateTimeField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_DATETIME));
        } else if (c instanceof DateField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_DATE));
        } else if (c instanceof CheckBoxField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_BOOLEAN));
        } else if (c instanceof DoubleField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_DOUBLE));
        } else if (c instanceof LongField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_LONG));
        } else if (c instanceof IntegerField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_INTEGER));
        } else if (c instanceof TextAreaField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_TEXTAREA));
        } else if (c instanceof TextField) {
            l.add(d = new Data("_type", MetaData.FIELDTYPE_STRING));
        }


        //todo: acabar

        /*

                } else if (MetaData.FIELDTYPE_OBJECT.equals(d.getString("_type"))) {
                    buildFromMetadata(container, prefix + d.getString("_id"), d.getData("_metadata"), buildingSearchForm);

         */

                /*
    public static final String FIELDTYPE_ENTITY = "entity";
    public static final String FIELDTYPE_ID = "id";
    public static final String FIELDTYPE_LIST = "list";
    public static final String FIELDTYPE_GRID = "grid";
    public static final String FIELDTYPE_DATA = "data";
    public static final String FIELDTYPE_USERDATA = "userdata";
    public static final String FIELDTYPE_LISTDATA = "listdata";
    public static final String FIELDTYPE_OBJECT = "object";
    public static final String FIELDTYPE_WIZARD = "wizard";
    public static final String FIELDTYPE_SELECTFROMGRID = "selectfromgrid";
         */

        if (c instanceof  AbstractField) {
            AbstractField f = (AbstractField) c;
            d.set("_label", f.getLabel());
            d.set("_id", f.getId());
            if (f.isRequired()) d.set("_required", true);
            if (f.isBeginingOfLine()) d.set("_startsline", true);
            if (!Strings.isNullOrEmpty(f.getHelp())) d.set("_help", f.getHelp());
            if (f.isUnmodifiable()) d.set("_unmodifiable", true);

            for (Component cx : carga) {
                if (cx instanceof io.mateu.ui.core.client.components.Separator) {
                    d.set("_separator", ((io.mateu.ui.core.client.components.Separator) cx).getText());
                } else if (cx instanceof io.mateu.ui.core.client.components.Tab) {
                    d.set("_starttab", ((io.mateu.ui.core.client.components.Tab) cx).getCaption());
                } else if (cx instanceof io.mateu.ui.core.client.components.Tabs) {
                    d.set("_starttabs", ((io.mateu.ui.core.client.components.Tabs) cx).getId());
                    if (((io.mateu.ui.core.client.components.Tabs) cx).isFullWidth()) d.set("_fullwidth", true);
                }
            }

            carga.clear();
        } else if (c instanceof Tabs) {
            List<Data> ll = new ArrayList<>();
            boolean primerapestanya = true;
            for (io.mateu.ui.core.client.components.Tab t : ((Tabs) c).getTabs()) {
                List<Component> cc = Lists.newArrayList(t);
                if (primerapestanya) {
                    cc.add(c);
                    primerapestanya = false;
                }
                for (Component x : t.getComponentsSequence()) addMetaData(ll, x, cc);
            }
            if (ll.size() > 0) ll.get(ll.size() - 1).set("_endtabs", true);
        } else if (c instanceof Separator) carga.add(c);

    }

    private static Data getInitialData(UserData user, EntityManager em, Class<? extends BaseServerSideWizard> wc) throws Throwable {
        Data d = new Data();

        BaseServerSideWizard w = fillWizard(user, em, wc, d);
        for (AbstractServerSideWizardPage p : w.getPages()) {
            fillData(user, em, d, p, null);
        }

        return d;
    }

    private static String getIdFieldName(Class<?> c) {
        String nombreCampoId = "id";
        for (FieldInterfaced ff : getAllFields(c))
            if (ff.isAnnotationPresent(Id.class)) {
                nombreCampoId = ff.getName();
                break;
            }
            return nombreCampoId;
    }

    private static String getQlForEntityField(EntityManager em, UserData user, ListView view, FieldInterfaced f) {
        return getQlForEntityField(em, user, view, f.getGenericClass(), f.getId(), null);
    }

    private static String getQlForEntityField(EntityManager em, UserData user, ListView view, Class<?> c, String fieldId, QLFilter qlFilter) {

        String nombreCampoId = "id";
        for (FieldInterfaced ff : getAllFields(c))
            if (ff.isAnnotationPresent(Id.class)) {
                nombreCampoId = ff.getName();
                break;
            }


        String defaultQl = "select x." + nombreCampoId + ", x.name from " + c.getName() + " x order by x.name";

        boolean hayName = false;
        for (FieldInterfaced ff : getAllFields(c))
            if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());

                if (Translated.class.isAssignableFrom(ff.getType())) {

                    defaultQl = "select x." + nombreCampoId + ", x." + ff.getName() + ".es from " + c.getName() + " x order by x." + ff.getName() + ".es";
                }
                hayName = true;
            }
        if (!hayName) {
            for (FieldInterfaced ff : getAllFields(c))
                if (ff.isAnnotationPresent(Id.class)) {
                    defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());
                }
        }


        if (c.isAnnotationPresent(QLForCombo.class)) {
            String ql = c.getAnnotation(QLForCombo.class).ql();
            if (ql != null && !"".equals(ql.trim())) defaultQl = ql;
        }

        if (view != null) {

            String w = (qlFilter != null)?qlFilter.value():null;
            String z = view.getQLFilter(em, user, fieldId);
            if (!Strings.isNullOrEmpty(z)) {
                if (!Strings.isNullOrEmpty(w)) {
                    w += " and " + w;
                } else w = z;
            }

            if (!Strings.isNullOrEmpty(w)) {
                int pos = defaultQl.indexOf(" where ");
                if (pos > 0) {
                    pos = pos + " where".length();
                    defaultQl = defaultQl.substring(0, pos) + " " + w + defaultQl.substring(pos);
                } else {
                    pos = defaultQl.indexOf(" order ");
                    if (pos > 0) {
                        defaultQl = defaultQl.substring(0, pos) + " where " + w + defaultQl.substring(pos);
                    } else {
                        defaultQl += " where " + w;
                    }
                }

            }

        }

        return defaultQl;
    }


    public static void main(String... args) throws Exception {
        //System.out.println(new ERPServiceImpl().getMetaData(Actor.class.getCanonicalName()));
    }

    public static WizardPageVO getWizardPageVO(UserData user, EntityManager em, BaseServerSideWizard w, AbstractServerSideWizardPage p, Data data) throws Throwable {
        if (p == null) {
            return null;
        } else {
            WizardPageVO vo = new WizardPageVO();

            vo.setTitle(p.getTitle());
            vo.setWizardClassName(w.getClass().getName());
            vo.setMetaData(getMetadaData(user, em, p.getClass(), null));
            vo.setFirstPage(w.getPages().indexOf(p) == 0);
            vo.setLastPage(w.getPages().indexOf(p) == w.getPages().size() - 1);
            if (!vo.isFirstPage()) vo.setGoBackAction("gotopage_" + (w.getPages().indexOf(p) - 1));
            if (!vo.isLastPage()) vo.setGoNextAction("gotopage_" + (w.getPages().indexOf(p) + 1));

            vo.setData(p.getData(user, em, data));

            return vo;
        }
    }

    @Override
    public GridData rpc(UserData user, String rpcViewClassName, Data parameters) throws Throwable {

        GridData[] gd = new GridData[1];

        Helper.transact((JPATransaction) (em) -> {

            RPCView v = (RPCView) ERPServiceImpl.fillEntity(em, user, Class.forName(rpcViewClassName), parameters);

            gd[0] = v.rpc();

        });

        return gd[0];
    }

    @Override
    public Data getInitialData(UserData user, String entityClassName, String viewClassName, Data parentData) throws Throwable {
        Data data = _get(user, entityClassName, viewClassName, null);
        return data;
    }
}
