package oldengine;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.CellStyleGenerator;
import io.mateu.mdd.core.annotations.Table;
import io.mateu.mdd.core.app.MDDLink;
import io.mateu.mdd.core.data.WizardPageVO;
import io.mateu.mdd.core.interfaces.DataSerializable;
import io.mateu.mdd.core.interfaces.ListView;
import io.mateu.mdd.core.interfaces.SupplementOrPositive;
import io.mateu.mdd.core.nose.MemorizadorRegistroEditado;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.FieldInterfacedFromField;
import io.mateu.mdd.core.util.DatesRange;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.XMLSerializable;
import io.mateu.mdd.core.views.AbstractServerSideWizard;
import io.mateu.mdd.core.views.AbstractServerSideWizardPage;
import io.mateu.mdd.core.views.BaseServerSideWizard;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.ui.core.client.components.Component;
import io.mateu.ui.core.client.components.Tabs;
import io.mateu.ui.core.client.components.fields.*;
import io.mateu.ui.core.client.views.AbstractForm;
import io.mateu.ui.core.client.views.RPCView;
import io.mateu.mdd.core.data.*;
import io.mateu.ui.mdd.server.util.JPATransaction;
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
public class MDDEngine {

    private static Map<Class, List<Class>> cacheSubclases = new HashMap<>();

    public static MemorizadorRegistroEditado memorizadorRegistrosEditados;



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

    public Object[][] select(String jpql) throws Throwable {
        return staticSelect(jpql);
    }

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

    public int executeUpdate(String jpaql) throws Throwable {
        final int[] r = {0};
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                if (jpaql.startsWith("delete")) {
                    for (Object o : em.createQuery(jpaql.replaceFirst("delete", "select x")).getResultList()) {

                        for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(o.getClass())) {
                            if (f.getType().isAnnotationPresent(Entity.class)) {
                                Object v = o.getClass().getMethod(getGetter(f)).invoke(o);
                                if (v != null) {
                                    io.mateu.mdd.core.reflection.FieldInterfaced parentField = null;
                                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType())) {
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


            io.mateu.mdd.core.reflection.FieldInterfaced idField = null;
            boolean generated = false;
            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(Class.forName(entityClassName))) {
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

    public Data get(UserData user, String entityClassName, String viewClassName, long id) throws Throwable {
        return _get(user, entityClassName, viewClassName, id);
    }

    public Data get(UserData user, String entityClassName, String viewClassName, int id) throws Throwable {
        return _get(user, entityClassName, viewClassName, id);
    }

    public Data get(UserData user, String entityClassName, String viewClassName, String id) throws Throwable {
        return _get(user, entityClassName, viewClassName, id);
    }




    private Data _get(UserData user, String entityClassName, String viewClassName, Object id) throws Throwable {
        Data data = new Data();

        Helper.notransact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                Class viewClass = Class.forName((viewClassName != null)?viewClassName:entityClassName);
                io.mateu.mdd.core.interfaces.View v = null;
                if (!viewClass.equals(Class.forName(entityClassName))) v = (io.mateu.mdd.core.interfaces.View) viewClass.newInstance();


                Object o = null;
                if (id != null) o = em.find(Class.forName(entityClassName), (id instanceof Integer)?new Long((Integer)id):id);
                else {
                    if (v != null) o = v.newInstance(em, user);
                    if (o == null) o = Class.forName(entityClassName).newInstance();
                }


                fillData(user, em, viewClass, id, data, o, (o instanceof io.mateu.mdd.core.interfaces.CalendarLimiter)? (io.mateu.mdd.core.interfaces.CalendarLimiter) o :null);

                for (Method m : viewClass.getDeclaredMethods()) {
                    if ("toString".equals(m.getName())) {
                        data.set("_tostring", (v == null)?m.invoke(o):m.invoke(v, o));
                    }

                    if (m.isAnnotationPresent(io.mateu.mdd.core.annotations.Subtitle.class)) {
                        data.set("_subtitle", (v == null)?m.invoke(o):m.invoke(v, o));
                    }

                    if (m.isAnnotationPresent(io.mateu.mdd.core.annotations.Badges.class)) {
                        data.set("_badges", (v == null)?m.invoke(o):m.invoke(v, o));
                    }

                    if (m.isAnnotationPresent(io.mateu.mdd.core.annotations.Links.class)) {
                        data.set("_links", (v == null)?m.invoke(o):m.invoke(v, o));
                    }
                }

                if (data.isEmpty("_badges")) for (Method m : getAllMethods(viewClass)) {
                    if (m.isAnnotationPresent(io.mateu.mdd.core.annotations.Badges.class)) {
                        data.set("_badges", (v == null)?m.invoke(o):m.invoke(v, o));
                    }
                }

                if (data.isEmpty("_links")) for (Method m : getAllMethods(viewClass)) {
                    if (m.isAnnotationPresent(io.mateu.mdd.core.annotations.Links.class)) {
                        data.set("_links", (v == null)?m.invoke(o):m.invoke(v, o));
                    }
                }

                if (data.isEmpty("_links")) {
                    List<MDDLink> l = new ArrayList<>();
                    for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(viewClass)) {
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

    private static void fillData(UserData user, EntityManager em, Class viewClass, Object id, Data data, Object o, io.mateu.mdd.core.interfaces.CalendarLimiter calendarLimiter) throws Throwable {
        fillData(user, em, viewClass, id, data, "", o, calendarLimiter);
    }

    public static void fillData(UserData user, EntityManager em, Data data, Object o, io.mateu.mdd.core.interfaces.CalendarLimiter calendarLimiter) throws Throwable {
        fillData(user, em, null, null, data, "", o, calendarLimiter);
    }

    private static void fillData(UserData user, EntityManager em, Class viewClass, Object id, Data data, String prefix, Object o, io.mateu.mdd.core.interfaces.CalendarLimiter calendarLimiter) throws Throwable {

        if (id != null) data.set(prefix + "_id", id);

        io.mateu.mdd.core.interfaces.ListView v = null;
        List<String> fl = new ArrayList<>();
        List<String> nfl = new ArrayList<>();

        if (viewClass == null) viewClass = o.getClass();

        if (io.mateu.mdd.core.interfaces.View.class.isAssignableFrom(viewClass)) {
            v = (io.mateu.mdd.core.interfaces.View) viewClass.newInstance();

            if (v != null && v instanceof io.mateu.mdd.core.interfaces.View) {
                addToList(fl, nfl, ((io.mateu.mdd.core.interfaces.View)v).getFields());
            }
        }

        if (v == null) {
            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(o.getClass())) fillData(user, em, viewClass, data, prefix, o, f, calendarLimiter);
        } else {
            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(o.getClass(), v != null && v instanceof io.mateu.mdd.core.interfaces.View && ((io.mateu.mdd.core.interfaces.View)v).isFieldsListedOnly(), fl, nfl)) fillData(user, em, viewClass, data, prefix, o, f, calendarLimiter);
        }

        for (Method m : getAllMethods(o.getClass())) {
            if (!Modifier.isStatic(m.getModifiers())) {
                if (m.isAnnotationPresent(io.mateu.mdd.core.annotations.Show.class) || m.isAnnotationPresent(io.mateu.mdd.core.annotations.ShowAsHtml.class)) {

                    if (v == null || !(v instanceof io.mateu.mdd.core.interfaces.View) || !((io.mateu.mdd.core.interfaces.View)v).isFieldsListedOnly() || fl.contains(m.getName())) fillData(user, em, viewClass, data, prefix, o, getInterfaced(m), calendarLimiter);

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

    private static io.mateu.mdd.core.reflection.FieldInterfaced getInterfaced(Method m) {
        return new io.mateu.mdd.core.reflection.FieldInterfaced() {
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
                else if (m.isAnnotationPresent(io.mateu.mdd.core.annotations.Show.class) && !Strings.isNullOrEmpty(m.getAnnotation(io.mateu.mdd.core.annotations.Show.class).value())) n = m.getAnnotation(io.mateu.mdd.core.annotations.Show.class).value();
                else if (m.isAnnotationPresent(io.mateu.mdd.core.annotations.ShowAsHtml.class) && !Strings.isNullOrEmpty(m.getAnnotation(io.mateu.mdd.core.annotations.ShowAsHtml.class).value())) n = m.getAnnotation(io.mateu.mdd.core.annotations.ShowAsHtml.class).value();
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
                return MDDEngine.getValue(m, o);
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





    private static void fillData(UserData user, EntityManager em, Class viewClass, Data data, String prefix, Object o, io.mateu.mdd.core.reflection.FieldInterfaced f, io.mateu.mdd.core.interfaces.CalendarLimiter calendarLimiter) throws Throwable {
        if (!f.isAnnotationPresent(io.mateu.mdd.core.annotations.Ignored.class) && !(f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class))) {
            boolean uneditable = false;
            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Output.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.Unmodifiable.class)) {
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

                if (io.mateu.mdd.core.interfaces.DataSerializable.class.isAssignableFrom(f.getType())) {
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
                } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OptionsClass.class)) {
                    if (v != null) {
                        v = getEntityPair(em, v, f.getAnnotation(io.mateu.mdd.core.annotations.OptionsClass.class).value());
                        ok = true;
                    }
                } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OptionsQL.class)) {
                    if (v != null) {
                        v = getQLPair(em, v, f.getAnnotation(io.mateu.mdd.core.annotations.OptionsQL.class).value());
                        ok = true;
                    }
                } else if (v instanceof io.mateu.mdd.core.interfaces.File) {
                    if (v != null) {
                        v = ((io.mateu.mdd.core.interfaces.File)v).toFileLocator();
                        ok = true;
                    }
                } else if (io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(f.getType())) {
                    if (v != null) {
                        v = ((io.mateu.mdd.core.interfaces.Translated) v).get();
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
                        if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Owned.class)) {
                            fillData(user, em, viewClass, em.getEntityManagerFactory().getPersistenceUnitUtil().getIdentifier(v), data, f.getName() + "_", v, calendarLimiter);
                            ok = false; // no añadimos el objeto tal cual
                        } else {
                            String n = v.toString();
                            boolean toStringIsOverriden = f.getType().getMethod("toString").getDeclaringClass().equals(f.getType());
                            if (!toStringIsOverriden) {
                                boolean hayName = false;
                                for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType()))
                                    if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                        n = "" + f.getType().getMethod(getGetter(ff)).invoke(v);
                                        hayName = true;
                                    }
                                if (!hayName) {
                                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType()))
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
                        if (genericClass != null && io.mateu.mdd.core.interfaces.UseCalendarToEdit.class.isAssignableFrom(genericClass)) {
                            Data d = new Data();
                            List<Data> values = new ArrayList<>();
                            List<Data> options = new ArrayList<>();
                            LocalDate first = (calendarLimiter != null)?calendarLimiter.getBegining():null;
                            LocalDate last = (calendarLimiter != null)?calendarLimiter.getEnding():null;
                            List<LocalDate> vistas = new ArrayList<>();
                            for (io.mateu.mdd.core.interfaces.UseCalendarToEdit x : (List<io.mateu.mdd.core.interfaces.UseCalendarToEdit>) v) {
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

                            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OwnedList.class)) {

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
                                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(genericClass))
                                        if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                            m = genericClass.getMethod(getGetter(ff));
                                            hayName = true;
                                        }
                                    if (!hayName) {
                                        for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(genericClass))
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


                            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueClass.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueQL.class)) {

                                List<Data> dl = new ArrayList<>();

                                List l = (List) v;
                                for (Object x : l) {
                                    Data dx = new Data();
                                    if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueClass.class)) dx.set("_value", getEntityPair(em, x, f.getAnnotation(io.mateu.mdd.core.annotations.ValueClass.class).value()));
                                    else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueQL.class)) dx.set("_value", getQLPair(em, x, f.getAnnotation(io.mateu.mdd.core.annotations.ValueQL.class).value()));
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
                                        for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(k.getClass()))
                                            if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                                m = k.getClass().getMethod(getGetter(ff));
                                                hayName = true;
                                            }
                                        if (!hayName) {
                                            for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(k.getClass()))
                                                if (ff.isAnnotationPresent(Id.class)) {
                                                    m = k.getClass().getMethod(getGetter(ff));
                                                }
                                        }
                                    }

                                    if (m != null) n = "" + m.invoke(k);

                                    k = new Pair(getId(k), n);

                                } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.KeyClass.class)) {
                                    if (k != null) k = getEntityPair(em, k, f.getAnnotation(io.mateu.mdd.core.annotations.KeyClass.class).value());
                                } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.KeyQL.class)) {
                                    if (k != null) k = getQLPair(em, k, f.getAnnotation(io.mateu.mdd.core.annotations.KeyQL.class).value());
                                }
                            }

                            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OwnedList.class)) {

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
                                            for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(z.getClass()))
                                                if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                                    m = z.getClass().getMethod(getGetter(ff));
                                                    hayName = true;
                                                }
                                            if (!hayName) {
                                                for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(z.getClass()))
                                                    if (ff.isAnnotationPresent(Id.class)) {
                                                        m = z.getClass().getMethod(getGetter(ff));
                                                    }
                                            }

                                            if (m != null) n = "" + m.invoke(z);

                                        }

                                        z = new Pair(getId(z), n);
                                    } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueClass.class)) {
                                        if (z != null) z = getEntityPair(em, z, f.getAnnotation(io.mateu.mdd.core.annotations.ValueClass.class).value());
                                    } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueQL.class)) {
                                        if (z != null) z = getQLPair(em, z, f.getAnnotation(io.mateu.mdd.core.annotations.ValueQL.class).value());
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
            io.mateu.mdd.core.reflection.FieldInterfaced fieldForName = null;
            boolean hayName = false;
            for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(c))
                if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                    fieldForName = ff;
                    hayName = true;
                }
            if (!hayName) {
                for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(c))
                    if (ff.isAnnotationPresent(Id.class)) {
                        fieldForName = ff;
                    }
            }

            Object n = o.getClass().getMethod(getGetter(fieldForName)).invoke(o);
            if (io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(n.getClass())) {
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
        for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(o.getClass())) {
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

            io.mateu.mdd.core.interfaces.ListView v = null;

            List<String> viewParamFields = new ArrayList<>();
            List<String> viewColumnFields = new ArrayList<>();
            List<String> viewColumnHeaders = new ArrayList<>();
            List<String> viewSumFields = new ArrayList<>();
            List<String> viewOrderFields = new ArrayList<>();
            List<String> viewFormFields = new ArrayList<>();
            List<String> negatedViewFormFields = new ArrayList<>();

            if (io.mateu.mdd.core.interfaces.ListView.class.isAssignableFrom(c)) {
                System.out.println(c.getName() + " is a view");
                v = (io.mateu.mdd.core.interfaces.ListView) c.newInstance();
                for (Type t : c.getGenericInterfaces()) {
                    if (t.getTypeName().startsWith(io.mateu.mdd.core.interfaces.View.class.getName()) || t.getTypeName().startsWith(io.mateu.mdd.core.interfaces.ListView.class.getName()) || t.getTypeName().startsWith(io.mateu.mdd.core.interfaces.CompositeView.class.getName())) c = (Class) ((ParameterizedType)t).getActualTypeArguments()[0];
                }

                addToList(viewParamFields, v.getParams());
                addToList(viewSumFields, v.getSums());
                addToList(viewColumnFields, v.getCols());
                addToList(viewColumnHeaders, v.getColHeaders());
                addToList(viewOrderFields, v.getOrderCriteria());
                if (v instanceof io.mateu.mdd.core.interfaces.View) addToList(viewFormFields, negatedViewFormFields, ((io.mateu.mdd.core.interfaces.View)v).getFields());

            } else {
                System.out.println(c.getName() + " is an entity");
            }
            System.out.println("entity=" + c.getName());

            Class viewClass = c;
            if (v != null) viewClass = v.getClass();

            data.set("_entityClassName", c.getName());

            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(c)) if (f.isAnnotationPresent(Id.class)) {
                data.set("_idFieldName", f.getName());
            }

            data.set("_viewClassName", viewClass.getName());
            if (io.mateu.mdd.core.interfaces.CompositeView.class.isAssignableFrom(viewClass)) {
                Type t = viewClass.getGenericInterfaces()[0];
                Class ccomposite = (Class) ((ParameterizedType) t).getActualTypeArguments()[1];
                data.set("_compositeClassName", ccomposite.getName());

                for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(ccomposite)) {
                    if (f.getType().equals(c)) {

                        data.set("_compositeFieldName", f.getName());
                        break;

                    }
                }

                data.set("_compositeActionName", ((io.mateu.mdd.core.interfaces.CompositeView)viewClass.newInstance()).getActionName());

            }
            data.set("_queryFilters", queryFilters);
            data.set("_rawtitle", Helper.capitalize(Helper.pluralize((c.isAnnotationPresent(Entity.class) && !Strings.isNullOrEmpty(((Entity)c.getAnnotation(Entity.class)).name()))?((Entity)c.getAnnotation(Entity.class)).name():c.getSimpleName())));

            if (io.mateu.mdd.core.interfaces.ListView.class.isAssignableFrom(viewClass) && v != null && v.getViewTitle() != null) data.set("_rawtitle", v.getViewTitle());

            if (viewClass.isAnnotationPresent(io.mateu.mdd.core.annotations.Indelible.class)) data.set("_indelible", true);
            if (viewClass.isAnnotationPresent(io.mateu.mdd.core.annotations.NewNotAllowed.class) || (v != null && io.mateu.mdd.core.interfaces.CompositeView.class.isAssignableFrom(viewClass))) data.set("_newnotallowed", true);

            String [] qf = {queryFilters};

            if (io.mateu.mdd.core.interfaces.Filtered.class.isAssignableFrom(viewClass)) {
                try {
                    Class finalViewClass = viewClass;
                    Helper.transact(new JPATransaction() {
                        @Override
                        public void run(EntityManager em) throws Throwable {
                            String f = ((io.mateu.mdd.core.interfaces.Filtered) finalViewClass.newInstance()).getAdditionalCriteria(em, user);
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
                    if (s.getCanonicalName() != null) subclases.add(new Data("_name", Helper.capitalize(s.getSimpleName()), "_type", s.getCanonicalName(), "_editorform", getEditorForm(user, em, (v instanceof io.mateu.mdd.core.interfaces.View)? (io.mateu.mdd.core.interfaces.View) v :null, viewFormFields, negatedViewFormFields, viewClass, s)));
                }
                if (subclases.size() > 0) data.set("_subclasses", subclases);


            }


            // seguimos...

            List<Data> searchFormFields = new ArrayList<>();
            List<Data> sums = new ArrayList<>();
            List<Data> listColumns = new ArrayList<>();
            List<Data> staticActions = new ArrayList<>();

            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(c, (v instanceof io.mateu.mdd.core.interfaces.View)? ((io.mateu.mdd.core.interfaces.View) v).isFieldsListedOnly() :false, viewParamFields, null)) {
                if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilter.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilters.class)) {
                    for (io.mateu.mdd.core.annotations.SearchFilter sf : f.getDeclaredAnnotationsByType(io.mateu.mdd.core.annotations.SearchFilter.class)) {
                        addField(user, em, (v instanceof io.mateu.mdd.core.interfaces.View)? (io.mateu.mdd.core.interfaces.View) v :null, searchFormFields, f, null, sf, null, true, false);
                    }
                } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilterIsNull.class)) {
                    addField(user, em, (v instanceof io.mateu.mdd.core.interfaces.View)? (io.mateu.mdd.core.interfaces.View) v :null, searchFormFields, new io.mateu.mdd.core.reflection.FieldInterfacedFromField(f) {

                        @Override
                        public Class<?> getType() {
                            return Boolean.class;
                        }

                        @Override
                        public String getId() {
                            return f.getName() + "_isnull";
                        }

                    }, null, null, f.getAnnotation(io.mateu.mdd.core.annotations.SearchFilterIsNull.class), true, false);
                } else if (v != null && viewParamFields.contains(f.getName())) {
                    addField(user, em, (v instanceof io.mateu.mdd.core.interfaces.View)? (io.mateu.mdd.core.interfaces.View) v :null, searchFormFields, f, null, null, null, true, false);
                }

            }

            boolean hayListColumns = false;
            if (v == null || Strings.isNullOrEmpty(v.getCols())) for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(c)) {
                if (f.isAnnotationPresent(Id.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.ListColumn.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilter.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.ListColumns.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilters.class)) {
                    if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.NotInList.class))) {
                        hayListColumns |= f.isAnnotationPresent(io.mateu.mdd.core.annotations.ListColumn.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.ListColumns.class);
                        addColumn(user, em, v, listColumns, f);
                    }
                }
            }

            if (!hayListColumns) {
                listColumns.clear();
                for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(c, (v == null || Strings.isNullOrEmpty(v.getCols()))?false:true, viewColumnFields, null)) {
                    if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.NotInList.class)))
                        addColumn(user, em, v, listColumns, f);
                }
            }

            if (viewColumnHeaders.size() > 0) {
                for (int pos = 0; pos < viewColumnHeaders.size(); pos++) {
                    if (listColumns.size() > pos + 1) listColumns.get(pos + 1).set("_label", viewColumnHeaders.get(pos));
                }
            }


            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(c, (v == null || Strings.isNullOrEmpty(v.getSums()))?false:true, viewSumFields, null)) {
                if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Sum.class))
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
            data.set("_editorform", getEditorForm(user, em, (v != null && v instanceof io.mateu.mdd.core.interfaces.View)? (io.mateu.mdd.core.interfaces.View) v :null, viewFormFields, negatedViewFormFields, viewClass, c));

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

        for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(c)) {
            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilter.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilters.class)) {
                for (io.mateu.mdd.core.annotations.SearchFilter sf : f.getDeclaredAnnotationsByType(io.mateu.mdd.core.annotations.SearchFilter.class)) {
                    addField(user, em, null, searchFormFields, f, null, sf, null, true, false);
                }
            } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilterIsNull.class)) {
                addField(user, em, null, searchFormFields, new io.mateu.mdd.core.reflection.FieldInterfacedFromField(f) {

                    @Override
                    public Class<?> getType() {
                        return Boolean.class;
                    }

                    @Override
                    public String getId() {
                        return f.getName() + "_isnull";
                    }

                }, null, null, f.getAnnotation(io.mateu.mdd.core.annotations.SearchFilterIsNull.class), true, false);
             } else {
                addField(user, em, null, searchFormFields, f);
            }

        }

        boolean hayListColumns = false;
        for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(lc)) {
            if (f.isAnnotationPresent(Id.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.ListColumn.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilter.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.ListColumns.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.SearchFilters.class)) {
                if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.NotInList.class))) {
                    hayListColumns |= f.isAnnotationPresent(io.mateu.mdd.core.annotations.ListColumn.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.ListColumns.class);
                    addColumn(user, em, null, listColumns, f);
                }
            }
        }

        if (!hayListColumns) {
            listColumns.clear();
            for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(lc, false, null, null)) {
                if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.NotInList.class)))
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

    private static Data getEditorForm(UserData user, EntityManager em, io.mateu.mdd.core.interfaces.View v, List<String> viewFormFields, List<String> negatedFormFields, Class viewClass, Class c) throws Exception {
        if (viewClass != null && io.mateu.mdd.core.interfaces.CompositeView.class.isAssignableFrom(viewClass)) return null;
        List<Data> editorFormFields = new ArrayList<>();
        for (io.mateu.mdd.core.reflection.FieldInterfaced f : getAllFields(c, v != null && v.isFieldsListedOnly(), viewFormFields, negatedFormFields)) {
            if ((v != null && v.isFieldsListedOnly()) || (!f.isAnnotationPresent(io.mateu.mdd.core.annotations.Ignored.class) && !f.isAnnotationPresent(io.mateu.mdd.core.annotations.NotInEditor.class) && !(f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))) {
                addField(user, em, v, editorFormFields, (v == null || !v.isFieldsListedOnly())?f:new io.mateu.mdd.core.reflection.FieldInterfacedFromField(f) {

                    @Override
                    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                        if (io.mateu.mdd.core.annotations.Tab.class.equals(annotationClass)) return false;
                        else if (io.mateu.mdd.core.annotations.NotInEditor.class.equals(annotationClass)) return false;
                        else if (io.mateu.mdd.core.annotations.Ignored.class.equals(annotationClass)) return false;
                        else return super.isAnnotationPresent(annotationClass);
                    }

                });
            }
        }

        for (Method m : getAllMethods(c)) {
            if (!Modifier.isStatic(m.getModifiers())) {
                if (m.isAnnotationPresent(io.mateu.mdd.core.annotations.Show.class) || m.isAnnotationPresent(io.mateu.mdd.core.annotations.ShowAsHtml.class)) {
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

    public WizardPageVO execute(UserData user, String wizardClassName, String action, Data data) throws Throwable {
        WizardPageVO[] vo = new WizardPageVO[1];

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                vo[0] = ((io.mateu.mdd.core.views.AbstractServerSideWizard)fillWizard(user, em, Class.forName(wizardClassName), null)).execute(user, em, action, data);
            }
        });

        return vo[0];
    }



    private static void addMethod(UserData user, EntityManager em, ListView view, List<Data> actions, Method m, Class viewClass) throws Exception {
        if (m.isAnnotationPresent(Action.class)) {
            List<Data> parameters = new ArrayList<>();
            Class entityClass = viewClass;
            if (io.mateu.mdd.core.interfaces.View.class.isAssignableFrom(viewClass)) {
                for (Type t : viewClass.getGenericInterfaces()) {
                    if (t.getTypeName().startsWith(io.mateu.mdd.core.interfaces.View.class.getName())) {
                        entityClass = (Class) ((ParameterizedType)t).getActualTypeArguments()[0];
                    }
                }
            }
            for (Parameter p : m.getParameters()) {
                boolean anadir = !EntityManager.class.isAssignableFrom(p.getType());
                anadir = anadir && !entityClass.isAssignableFrom(p.getType());
                if (anadir) addField(user, em, view, parameters, new io.mateu.mdd.core.reflection.FieldInterfaced() {
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
                        return (p.isAnnotationPresent(io.mateu.mdd.core.annotations.Parameter.class))?p.getAnnotation(io.mateu.mdd.core.annotations.Parameter.class).name():p.getName();
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
                        return MDDEngine.getValue(m, o);
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

    private static void addColumn(UserData user, EntityManager em, io.mateu.mdd.core.interfaces.ListView view, List<Data> listColumns, io.mateu.mdd.core.reflection.FieldInterfaced f) throws Exception {
        List<io.mateu.mdd.core.annotations.ListColumn> lcs = new ArrayList<>();
        for (io.mateu.mdd.core.annotations.ListColumn lc : f.getDeclaredAnnotationsByType(io.mateu.mdd.core.annotations.ListColumn.class)) lcs.add(lc);
        if (lcs.size() == 0) lcs.add(null);
        for (io.mateu.mdd.core.annotations.ListColumn lc : lcs) {
            addField(user, em, view, listColumns, f, lc, null, null, false, true);
        }
    }

    private static void addField(UserData user, EntityManager em, io.mateu.mdd.core.interfaces.ListView view, List<Data> _fields, io.mateu.mdd.core.reflection.FieldInterfaced f) throws Exception {
        addField(user, em, view, _fields, f, null, null, null, false, false);
    }

    private static void addField(UserData user, EntityManager em, io.mateu.mdd.core.interfaces.ListView view, List<Data> _fields, io.mateu.mdd.core.reflection.FieldInterfaced f, io.mateu.mdd.core.annotations.ListColumn listColumnAnnotation, io.mateu.mdd.core.annotations.SearchFilter searchFilterAnnotation, io.mateu.mdd.core.annotations.SearchFilterIsNull searchFilterIsNullAnnotation, boolean buildingSearchForm, boolean buildingColumns) throws Exception {
        if (!f.isAnnotationPresent(io.mateu.mdd.core.annotations.Ignored.class)) {

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
                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType())) {
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
                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType())) {
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
                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(aux)) {
                        if (ff.getName().equals(searchFilterAnnotation.field())) {
                            io.mateu.mdd.core.reflection.FieldInterfaced finalF = f;
                            f = new io.mateu.mdd.core.reflection.FieldInterfacedFromField(ff) {
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
            } else if (io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(f.getType())) {
                d.set("_translation", true);
                d.set("_qlname", "es");
            } else {
                d.set("_qlname", f.getId());
            }



            if (List.class.isAssignableFrom(f.getType()) || Map.class.isAssignableFrom(f.getType()) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.NotInList.class)) {
                d.set("_notinlist", true);
            }


            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.FullWidth.class)) {
                d.set("_fullwidth", true);
            }
            if ((searchFilterAnnotation == null && f.isAnnotationPresent(NotNull.class)) || (searchFilterAnnotation != null && searchFilterAnnotation.required())) {
                d.set("_required", true);
            }

            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Help.class)) {
                d.set("_help", f.getAnnotation(io.mateu.mdd.core.annotations.Help.class).value());
            }

            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Order.class)) {
                io.mateu.mdd.core.annotations.Order o = f.getAnnotation(io.mateu.mdd.core.annotations.Order.class);
                d.set("_order", o.priority());
                d.set("_orderdesc", o.desc());
                d.set("_ordercol", d.getString("_qlname"));
            }



            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.StartTabs.class)) {
                d.set("_starttabs", true);
            }

            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Tab.class)) {
                d.set("_starttab", f.getAnnotation(io.mateu.mdd.core.annotations.Tab.class).value());
            }

            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.EndTabs.class)) {
                d.set("_endtabs", true);
            }

            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Unmodifiable.class)) {
                d.set("_unmodifiable", true);
            }

            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Show.class)) {
                d.set("_type", MetaData.FIELDTYPE_OUTPUT);
                upload = true;
            } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.ShowAsHtml.class)) {
                d.set("_type", MetaData.FIELDTYPE_HTML);
                upload = true;
            } else if (SupplementOrPositive.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_SUPPLEMENTORPOSITIVE);
                upload = true;
            } else if (io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_MULTILANGUAGETEXT);
                if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.TextArea.class)) d.set("_type", MetaData.FIELDTYPE_MULTILANGUAGETEXTAREA);
                upload = true;
            } else if (io.mateu.mdd.core.interfaces.UseCalendarToEdit.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_CALENDAR);

                Class genericClass = null;
                if (f.getGenericType() instanceof ParameterizedType) {
                    ParameterizedType genericType = (ParameterizedType) f.getGenericType();
                    genericClass = (genericType != null && genericType.getActualTypeArguments().length > 0)?(Class<?>) genericType.getActualTypeArguments()[0]:null;
                }
                if (genericClass != null) {
                    io.mateu.mdd.core.interfaces.UseCalendarToEdit i = ((io.mateu.mdd.core.interfaces.UseCalendarToEdit) genericClass.newInstance());
                    d.set("_nameproperty", i.getNamePropertyName());
                    d.set("_datesproperty", i.getDatesRangesPropertyName());
                };

                Data ef = toMetaData(((io.mateu.mdd.core.interfaces.UseCalendarToEdit)f.getType().newInstance()).getForm(em, user));

                if (!Strings.isNullOrEmpty(d.get("_datesproperty"))) {
                    List<Data> l = ef.getList("_fields");
                    List<Data> ll = new ArrayList<>();
                    for (Data dx : l) if (!dx.get("_id").equals(d.get("_datesproperty"))) ll.add(dx);
                    ef.set("_fields", ll);
                }

                d.set("_editorform", ef);
            } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.UseGridToSelect.class)) {
                d.set("_type", MetaData.FIELDTYPE_SELECTFROMGRID);
                io.mateu.mdd.core.annotations.UseGridToSelect a = f.getAnnotation(io.mateu.mdd.core.annotations.UseGridToSelect.class);
                if (!Strings.isNullOrEmpty(a.data())) d.set("_dataproperty", a.data());
                else if (!Strings.isNullOrEmpty(a.ql())) d.set("_ql", a.ql());

                List<Data> cols = new ArrayList<>();
                Class c = f.getType();
                if (List.class.isAssignableFrom(f.getType())) c = f.getGenericClass();
                for (Field ff : c.getDeclaredFields()) {
                    if (!ff.isAnnotationPresent(Id.class) && !ff.getType().equals(f.getDeclaringClass()))
                        addColumn(user, em, view, cols, new io.mateu.mdd.core.reflection.FieldInterfacedFromField(ff));
                }
                d.set("_cols", cols);

                upload = true;
            } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Wizard.class)) {
                d.set("_type", MetaData.FIELDTYPE_WIZARD);
                Class<? extends io.mateu.mdd.core.views.BaseServerSideWizard> wc = f.getAnnotation(io.mateu.mdd.core.annotations.Wizard.class).value();
                try {
                    d.set("_pagevo", fillWizard(user, em, wc, null).execute(user, em,null, null));
                    d.set("_initialdata", getInitialData(user, em, wc));
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
                upload = true;
            } else if (AbstractServerSideWizard.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_WIZARD);
                Class<? extends io.mateu.mdd.core.views.BaseServerSideWizard> wc = (Class<? extends io.mateu.mdd.core.views.BaseServerSideWizard>) f.getType();
                try {
                    d.set("_pagevo", fillWizard(user, em, wc, null).execute(user, em,null, null));
                    d.set("_initialdata", getInitialData(user, em, wc));
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
                upload = true;
            } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OptionsClass.class)) {
                d.set("_type", MetaData.FIELDTYPE_WEEKDAYS);
                upload = true;
            } else if (f.getType().isArray()) {
                d.set("_type", MetaData.FIELDTYPE_STRING);
                upload = true;
            } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OptionsClass.class)) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", getQlForEntityField(em, user, view, f.getAnnotation(io.mateu.mdd.core.annotations.OptionsClass.class).value(), f.getId(), f.getAnnotation(io.mateu.mdd.core.annotations.QLFilter.class)));
                upload = true;
            } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OptionsQL.class)) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", f.getAnnotation(io.mateu.mdd.core.annotations.OptionsQL.class).value());
                upload = true;
            } else if (f.getOptionsClass() != null) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", getQlForEntityField(em, user, view, f.getOptionsClass(), f.getId(), f.getAnnotation(io.mateu.mdd.core.annotations.QLFilter.class)));
                upload = true;
            } else if (f.getOptionsQL() != null) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", f.getOptionsQL());
                upload = true;
            } else if (searchFilterIsNullAnnotation != null) {
                d.set("_type", MetaData.FIELDTYPE_BOOLEAN);
                upload = true;
            } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Output.class) && searchFilterAnnotation == null && !buildingColumns && !List.class.isAssignableFrom(f.getType())) {
                if (f.getType().isAnnotationPresent(Entity.class)) {
                    d.set("_type", MetaData.FIELDTYPE_OUTPUTENTITY);
                } else {
                    d.set("_type", MetaData.FIELDTYPE_OUTPUT);
                }
                upload = true;
            } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.TextArea.class)) {
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
            } else if (io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(f.getType())) {
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
                        d.set("_ql", getQlForEntityField(em, user, view, f.getGenericClass(), f.getId(), f.getAnnotation(io.mateu.mdd.core.annotations.QLFilter.class)));
                    } else {

                        Class gc = f.getGenericClass();

                        if (gc != null && io.mateu.mdd.core.interfaces.UseCalendarToEdit.class.isAssignableFrom(gc)) {
                            d.set("_type", MetaData.FIELDTYPE_CALENDAR);
                            AbstractForm form = ((io.mateu.mdd.core.interfaces.UseCalendarToEdit) gc.newInstance()).getForm(em, user);
                            Data ef = null;
                            if (form != null) {
                                ef = toMetaData(form);
                            } else {
                                ef = getMetadaData(user, em, gc, null).getData("_editorform");
                            }

                            if (gc != null) {
                                io.mateu.mdd.core.interfaces.UseCalendarToEdit i = ((io.mateu.mdd.core.interfaces.UseCalendarToEdit) gc.newInstance());
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
                        } else if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OwnedList.class) || !f.getGenericClass().isAnnotationPresent(Entity.class) || f.isAnnotationPresent(Table.class)  || f.isAnnotationPresent(io.mateu.mdd.core.annotations.Output.class)) {

                            if (f.isAnnotationPresent(Table.class)  || f.isAnnotationPresent(io.mateu.mdd.core.annotations.Output.class)) {
                                d.set("_type", MetaData.FIELDTYPE_GRID_TABLE);
                                List<Data> cols = new ArrayList<>();
                                for (Field ff : f.getGenericClass().getDeclaredFields()) {
                                    if (!ff.isAnnotationPresent(Id.class) && !ff.getType().equals(f.getDeclaringClass())) {
                                        addColumn(user, em, view, cols, new io.mateu.mdd.core.reflection.FieldInterfacedFromField(ff));
                                    }
                                }
                                d.set("_cols", cols);
                            } else if (gc.isPrimitive() || gc.equals(Long.class) || gc.equals(Integer.class) || gc.equals(Double.class) || gc.equals(String.class)) {
                                d.set("_type", MetaData.FIELDTYPE_TEXTAREA);

                                if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueClass.class) || f.isAnnotationPresent(io.mateu.mdd.core.annotations.ValueQL.class)) {

                                    d.set("_type", MetaData.FIELDTYPE_GRID);
                                    d.set("_gridtype", MetaData.FIELDTYPE_GRID_INLINE);
                                    List<Data> cols = new ArrayList<>();

                                    Class<?> finalGenericClass = gc;
                                    final io.mateu.mdd.core.reflection.FieldInterfaced finalF1 = f;
                                    addField(user, em, view, cols, new io.mateu.mdd.core.reflection.FieldInterfacedFromField(f) {
                                        @Override
                                        public Class<?> getType() {
                                            return finalGenericClass;
                                        }

                                        @Override
                                        public String getName() {
                                            return (finalF1.isAnnotationPresent(io.mateu.mdd.core.annotations.MapLabels.class) && !Strings.isNullOrEmpty(finalF1.getAnnotation(io.mateu.mdd.core.annotations.MapLabels.class).labelForValue()))?finalF1.getAnnotation(io.mateu.mdd.core.annotations.MapLabels.class).labelForValue():"Value";
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
                                boolean tieneCamposComplejos = false;
                                int numCols = 0;
                                List<Data> cols = new ArrayList<>();
                                for (Field ff : f.getGenericClass().getDeclaredFields()) {
                                    if (!ff.isAnnotationPresent(Id.class) && !ff.getType().equals(f.getDeclaringClass())) {
                                        if (!(gc.isPrimitive() || gc.equals(Long.class) || gc.equals(Integer.class) || gc.equals(Double.class) || gc.equals(String.class))) tieneCamposComplejos = true;
                                        addColumn(user, em, view, cols, new io.mateu.mdd.core.reflection.FieldInterfacedFromField(ff));
                                        numCols++;
                                    }
                                }
                                //todo: comprobar con la relación inversa, y con el cascade
                                if (tieneCamposComplejos) d.set("_gridtype", MetaData.FIELDTYPE_GRID_POPUP);
                                else if (numCols > 4) d.set("_gridtype", MetaData.FIELDTYPE_GRID_ASIDE);
                                else d.set("_gridtype", MetaData.FIELDTYPE_GRID_INLINE);
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

                    io.mateu.mdd.core.reflection.FieldInterfaced finalF1 = f;
                    addField(user, em, view, cols, new io.mateu.mdd.core.reflection.FieldInterfacedFromField(f) {

                        @Override
                        public Class<?> getType() {
                            return finalGenericKeyClass;
                        }

                        @Override
                        public String getName() {
                            return (finalF1.isAnnotationPresent(io.mateu.mdd.core.annotations.MapLabels.class) && !Strings.isNullOrEmpty(finalF1.getAnnotation(io.mateu.mdd.core.annotations.MapLabels.class).labelForKey()))?finalF1.getAnnotation(io.mateu.mdd.core.annotations.MapLabels.class).labelForKey():"Key";
                        }

                        @Override
                        public String getId() {
                            return "_key";
                        }

                        @Override
                        public Class<?> getOptionsClass() {
                            return (finalF1.isAnnotationPresent(io.mateu.mdd.core.annotations.KeyClass.class))?finalF1.getAnnotation(io.mateu.mdd.core.annotations.KeyClass.class).value():null;
                        }

                        @Override
                        public String getOptionsQL() {
                            return (finalF1.isAnnotationPresent(io.mateu.mdd.core.annotations.KeyQL.class))?finalF1.getAnnotation(io.mateu.mdd.core.annotations.KeyQL.class).value():null;
                        }

                    }, null, null, null, false, true);


                    if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.OwnedList.class)) {

                        for (Field ff : genericClass.getDeclaredFields()) {
                            if (!ff.isAnnotationPresent(Id.class) && !ff.getType().equals(genericClass))
                                addColumn(user, em, view, cols, new io.mateu.mdd.core.reflection.FieldInterfacedFromField(ff));
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
                                return (finalF1.isAnnotationPresent(io.mateu.mdd.core.annotations.MapLabels.class) && !Strings.isNullOrEmpty(finalF1.getAnnotation(io.mateu.mdd.core.annotations.MapLabels.class).labelForValue()))?finalF1.getAnnotation(io.mateu.mdd.core.annotations.MapLabels.class).labelForValue():"Value";
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

                    if (io.mateu.mdd.core.interfaces.File.class.isAssignableFrom(f.getType())) {
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

                            if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Owned.class)) {
                                d.set("_owned", true);

                                d.set("_metadata", getMetadaData(user, em, f.getType(), null).getData("_editorform"));

                            } else {

                                String nombreCampoId = "id";
                                for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType()))
                                    if (ff.isAnnotationPresent(Id.class)) {
                                        nombreCampoId = ff.getName();
                                    }


                                String defaultQl = "select x." + nombreCampoId + ", x.name from " + f.getType().getName() + " x order by x.name";

                                boolean hayName = false;
                                for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType()))
                                    if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                        if (!buildingSearchForm) d.set("_qlname", d.get("_qlname") + "." + ff.getName());
                                        defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());

                                        if (io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(ff.getType())) {
                                            d.set("_translation", true);
                                            d.set("_qlname", d.getString("_qlname") + ".es");

                                            defaultQl = "select x." + nombreCampoId + ", x." + ff.getName() + ".es from " + f.getType().getName() + " x order by x." + ff.getName() + ".es";
                                        }
                                        hayName = true;
                                    }
                                if (!hayName) {
                                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            d.set("_qlname", d.getString("_qlname") + "." + ff.getName());

                                            defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());
                                        }
                                }

                                if (buildingSearchForm) {
                                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            d.set("_qlname", d.get("_qlname") + "." + ff.getName());
                                        }
                                }

                                if (!d.isEmpty("_leftjoin")) {
                                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            d.set("_leftjoinql", ff.getName());
                                        }
                                }

                                if (f.getType().isAnnotationPresent(io.mateu.mdd.core.annotations.UseIdToSelect.class)) {
                                    d.set("_useidtoselect", true);
                                    for (io.mateu.mdd.core.reflection.FieldInterfaced fid : getAllFields(f.getType())) {
                                        if (fid.isAnnotationPresent(Id.class)) {
                                            d.set("_idtype", fid.getType().getName());
                                            break;
                                        }
                                    }
                                    defaultQl = "select x.id, x.name from " + f.getType().getName() + " x where x.id = xxxx";

                                    hayName = false;
                                    for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType()))
                                        if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                            defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());

                                            if (io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(ff.getType())) {
                                                defaultQl = "select x." + nombreCampoId + ", x." + ff.getName() + ".es from " + f.getType().getName() + " x where x.id = xxxx order by x." + ff.getName() + ".es";
                                            }
                                            hayName = true;
                                        }
                                    if (!hayName) {
                                        for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(f.getType()))
                                            if (ff.isAnnotationPresent(Id.class)) {
                                                defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());
                                            }
                                    }

                                    String ql = f.getType().getAnnotation(io.mateu.mdd.core.annotations.UseIdToSelect.class).ql();
                                    if (ql != null && !"".equals(ql.trim())) defaultQl = ql;
                                } else if (f.getType().isAnnotationPresent(io.mateu.mdd.core.annotations.UseAutocompleteToSelect.class)) {
                                    d.set("_useautocompletetoselect", true);
                                    String ql = f.getType().getAnnotation(io.mateu.mdd.core.annotations.UseAutocompleteToSelect.class).ql();
                                    if (ql != null && !"".equals(ql.trim())) defaultQl = ql;
                                } else if (f.getType().isAnnotationPresent(io.mateu.mdd.core.annotations.QLForCombo.class)) {
                                    String ql = f.getType().getAnnotation(io.mateu.mdd.core.annotations.QLForCombo.class).ql();
                                    if (ql != null && !"".equals(ql.trim())) defaultQl = ql;
                                } else {
                                    // dejamos defaultQl como está
                                }


                                if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.QLFilter.class)) {

                                    String w = f.getAnnotation(io.mateu.mdd.core.annotations.QLFilter.class).value();

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

                            d.set("_metadata", getMetadaData(user, em, f.getId(), f.getType(), null, f.isAnnotationPresent(io.mateu.mdd.core.annotations.DoNotIncludeSeparator.class)).getData("_editorform"));


                        }




                    }
                }

            }
            if (upload) {
                d.set("_id", f.getId());
                if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Selection.class)) {
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

                if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Separator.class)) {
                    d.set("_separator", f.getAnnotation(io.mateu.mdd.core.annotations.Separator.class).value());
                }
                if (!buildingSearchForm && !f.isAnnotationPresent(io.mateu.mdd.core.annotations.SameLine.class)) d.set("_startsline", true);

                if (d.isEmpty("_label")) {
                    if (f.isAnnotationPresent(io.mateu.mdd.core.annotations.Caption.class)) {
                        d.set("_label", f.getAnnotation(io.mateu.mdd.core.annotations.Caption.class).value());
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
        } else if (c instanceof io.mateu.mdd.core.annotations.Separator) carga.add(c);

    }

    private static Data getInitialData(UserData user, EntityManager em, Class<? extends io.mateu.mdd.core.views.BaseServerSideWizard> wc) throws Throwable {
        Data d = new Data();

        io.mateu.mdd.core.views.BaseServerSideWizard w = fillWizard(user, em, wc, d);
        for (io.mateu.mdd.core.views.AbstractServerSideWizardPage p : w.getPages()) {
            fillData(user, em, d, p, null);
        }

        return d;
    }

    private static String getIdFieldName(Class<?> c) {
        String nombreCampoId = "id";
        for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(c))
            if (ff.isAnnotationPresent(Id.class)) {
                nombreCampoId = ff.getName();
                break;
            }
            return nombreCampoId;
    }

    private static String getQlForEntityField(EntityManager em, UserData user, io.mateu.mdd.core.interfaces.ListView view, io.mateu.mdd.core.reflection.FieldInterfaced f) {
        return getQlForEntityField(em, user, view, f.getGenericClass(), f.getId(), null);
    }

    private static String getQlForEntityField(EntityManager em, UserData user, io.mateu.mdd.core.interfaces.ListView view, Class<?> c, String fieldId, io.mateu.mdd.core.annotations.QLFilter qlFilter) {

        String nombreCampoId = "id";
        for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(c))
            if (ff.isAnnotationPresent(Id.class)) {
                nombreCampoId = ff.getName();
                break;
            }


        String defaultQl = "select x." + nombreCampoId + ", x.name from " + c.getName() + " x order by x.name";

        boolean hayName = false;
        for (io.mateu.mdd.core.reflection.FieldInterfaced ff : getAllFields(c))
            if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());

                if (io.mateu.mdd.core.interfaces.Translated.class.isAssignableFrom(ff.getType())) {

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


        if (c.isAnnotationPresent(io.mateu.mdd.core.annotations.QLForCombo.class)) {
            String ql = c.getAnnotation(io.mateu.mdd.core.annotations.QLForCombo.class).ql();
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
        //System.out.println(new MDDEngine().getMetaData(Actor.class.getCanonicalName()));
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


    public GridData rpc(UserData user, String rpcViewClassName, Data parameters) throws Throwable {

        GridData[] gd = new GridData[1];

        Helper.transact((JPATransaction) (em) -> {

            RPCView v = (RPCView) MDDEngine.fillEntity(em, user, Class.forName(rpcViewClassName), parameters);

            gd[0] = v.rpc();

        });

        return gd[0];
    }


    public Data getInitialData(UserData user, String entityClassName, String viewClassName, Data parentData) throws Throwable {
        Data data = _get(user, entityClassName, viewClassName, null);
        return data;
    }
}
