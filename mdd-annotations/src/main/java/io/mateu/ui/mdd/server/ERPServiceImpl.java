package io.mateu.ui.mdd.server;

import com.google.common.base.Strings;
import io.mateu.erp.model.util.XMLSerializable;
import io.mateu.ui.core.client.views.AbstractWizard;
import io.mateu.ui.core.shared.*;
import io.mateu.ui.mdd.server.annotations.*;
import io.mateu.ui.mdd.server.annotations.CellStyleGenerator;
import io.mateu.ui.mdd.server.interfaces.AuditRecord;
import io.mateu.ui.mdd.server.interfaces.File;
import io.mateu.ui.mdd.server.interfaces.Translated;
import io.mateu.ui.mdd.server.interfaces.WithTriggers;
import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;
import io.mateu.ui.mdd.shared.ERPService;
import io.mateu.ui.mdd.shared.MetaData;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.BeanUtilsBean;
import org.reflections.Reflections;

import javax.persistence.*;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.lang.reflect.Parameter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.*;

/**
 * Created by miguel on 11/1/17.
 */
public class ERPServiceImpl implements ERPService {

    private static Map<Class, List<Class>> cacheSubclases = new HashMap<>();

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
                    r.add((Object[]) o);
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
                jpqlx = "select count(x) " + jpqlx;
                int numRows = ((Long) selectSingleValue(jpqlx)).intValue();
                long t = new Date().getTime() - t0;
                d.set("_subtitle", "" + numRows + " records found in " + t + "ms.");
                d.set("_data_currentpageindex", fromRow / rowsPerPage);
                d.set("_data_totalrows", numRows);
                d.set("_data_pagecount", numRows / rowsPerPage + ((numRows % rowsPerPage == 0)?0:1));
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
                        if (o instanceof WithTriggers) ((WithTriggers)o).beforeDelete(em);

                        for (Field f : getAllFields(o.getClass())) {
                            if (f.getType().isAnnotationPresent(Entity.class)) {
                                Object v = o.getClass().getMethod(getGetter(f)).invoke(o);
                                if (v != null) {
                                    Field parentField = null;
                                    for (Field ff : getAllFields(f.getType())) {
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
                        if (o instanceof WithTriggers) ((WithTriggers)o).afterDelete(em);
                    }
                } else {
                    r[0] = em.createQuery(jpaql).executeUpdate();
                }
            }
        });
        return r[0];
    }

    @Override
    public Data set(String entityClassName, Data data) throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                Class cl = Class.forName(entityClassName);

                fillData(em, cl, data);

            }
        });


        Object id = data.get("_id");
        if (id instanceof Long) return get(entityClassName, (long) id);
        else if (id instanceof Integer) return get(entityClassName, (int) id);
        else if (id instanceof String) return get(entityClassName, (String) id);
        else return null;
    }

    @Override
    public Data get(String entityClassName, long id) throws Throwable {
        return _get(entityClassName, id);
    }

    @Override
    public Data get(String entityClassName, int id) throws Throwable {
        return _get(entityClassName, id);
    }

    @Override
    public Data get(String entityClassName, String id) throws Throwable {
        return _get(entityClassName, id);
    }

    private static Object fillData(EntityManager em, Class cl, Data data) throws Throwable {
        Object o = null;

        boolean newInstance = false;


        if (cl.isAnnotationPresent(Entity.class)) {
            Field idField = null;
            boolean generated = false;
            for (Field f : getAllFields(cl)) {
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
                o = cl.newInstance();
                em.persist(o);
                if (generated) {
                    em.flush(); // to get the id
                    Method m = o.getClass().getMethod(getGetter(idField));
                    id = m.invoke(o);
                } else {
                    id = data.get(idField.getName());
                }
                newInstance = true;
            }

            data.set("_id", id);
        } else {
            o = cl.newInstance();
        }


        if (o instanceof WithTriggers) {
            ((WithTriggers)o).beforeSet(em, newInstance);
        }


        fillEntity(em, o, data, newInstance);

        return o;
    }

    public static void fillEntity(EntityManager em, Object o, Data data, boolean newInstance) throws Throwable {
        BeanUtilsBean.getInstance().getConvertUtils().register(false, false, 0);
        fillEntity(em, o, data, newInstance, "");
    }

    public static void fillEntity(EntityManager em, Object o, Data data, boolean newInstance, String prefix) throws Throwable {
        //auditoría
        for (Field f : getAllFields(o.getClass())) if (AuditRecord.class.isAssignableFrom(f.getType())) {
            AuditRecord a = (AuditRecord) o.getClass().getMethod(getGetter(f)).invoke(o);
            if (a == null) {
                BeanUtils.setProperty(o, f.getName(), a = (AuditRecord) f.getType().newInstance());
            }
            a.touch(em, data.getString("_user"));
        }


        for (Field f : getAllFields(o.getClass())) {
            boolean updatable = true;
            if (AuditRecord.class.isAssignableFrom(f.getType()) || f.isAnnotationPresent(Output.class) || f.isAnnotationPresent(Ignored.class) || f.isAnnotationPresent(NotInEditor.class) || (!newInstance && f.isAnnotationPresent(Unmodifiable.class))) {
                updatable = false;
            }

            if (updatable) {

                if (data.containsKey(prefix + f.getName() + "____object")) {
                    Object z = o.getClass().getMethod(getGetter(f)).invoke(o);
                    boolean recienCreado = false;
                    if (z == null) {
                        recienCreado = true;
                        z = f.getType().newInstance();
                        BeanUtils.setProperty(o, f.getName(), z);
                    }
                    fillEntity(em, z, data, recienCreado, prefix + f.getName() + "_");
                } else if (f.isAnnotationPresent(Owned.class)) {
                    if (f.getType().isAnnotationPresent(Entity.class)) {
                        Object z = o.getClass().getMethod(getGetter(f)).invoke(o);
                        boolean recienCreado = false;
                        if (z == null) {
                            recienCreado = true;
                            z = f.getType().newInstance();
                            em.persist(z);
                            BeanUtils.setProperty(o, f.getName(), z);
                        }
                        fillEntity(em, z, data, recienCreado, prefix + f.getName() + "_");
                    } else {
                        System.out.println("owned y no es una entity");
                    }
                } else if (data.containsKey(prefix + f.getName())) {
                    Object v = data.get(prefix + f.getName());
                    if (v != null && v instanceof Pair) v = ((Pair) v).getValue();
                    
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
                                em.persist(current);
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
                            em.persist(current);
                        }
                        ((Translated) current).set((String) v);
                    } else {

                        Class<?> genericClass = null;
                        if (f.getGenericType() instanceof ParameterizedType) {
                            ParameterizedType genericType = (ParameterizedType) f.getGenericType();
                            genericClass = (genericType != null && genericType.getActualTypeArguments().length > 0)?(Class<?>) genericType.getActualTypeArguments()[0]:null;
                        }

                        if (f.getType().isArray()) {
                            if (v != null) {
                                List<Object> l = new ArrayList<>();
                                Class c = f.getType().getComponentType();
                                for (String s : ((String)v).split(",")) if (!Strings.isNullOrEmpty(s)) {
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
                        } else if (f.getType().isAnnotationPresent(Entity.class)) {
                            Field parentField = null;
                            for (Field ff : getAllFields(f.getType())) {
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

                            if (f.isAnnotationPresent(OwnedList.class)) {
                                String idfieldatx = "id";
                                for (Field fx : getAllFields(genericClass))
                                    if (fx.isAnnotationPresent(Id.class)) {
                                        idfieldatx = fx.getName();
                                        break;
                                    }
                                List aux = (List) o.getClass().getMethod(getGetter(f)).invoke(o);
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
                                        Object x = fillData(em, genericClass, d);
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
                                        fillEntity(em, em.find(genericClass, d.get("_id")), d, false);
                                    }
                                }
                                break; // no hacer el set
                            } else if (genericClass.isAnnotationPresent(Entity.class)) {
                                List<Object> l = new ArrayList<>();
                                List<Pair> ll = (v instanceof PairList)?((PairList)v).getValues(): (List<Pair>) v;
                                for (Pair p : ll) {
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
                                            fillEntity(em, z, d, true, "");
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

                            if (f.isAnnotationPresent(OwnedList.class)) {

                                String idfieldatx = "id";
                                for (Field fx : getAllFields(genericClass))
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
                                        Object x = fillData(em, genericClass, d);
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
                                        if (x.getClass().isAnnotationPresent(Entity.class)) em.persist(x);
                                        xv = x;
                                    } else {
                                        fillEntity(em, xv = em.find(genericClass, d.get("_id")), d, false);
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
                            fillEntity(em, z, (Data) v, false);
                            v = z;
                        }

                        BeanUtils.setProperty(o, f.getName(), v);
                    }
                }
            }
        }

        if (o instanceof WithTriggers) {
            ((WithTriggers)o).afterSet(em, newInstance);
        }
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

    private static String getSetter(Field f) {
        return "set" + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }

    private Data _get(String entityClassName, Object id) throws Throwable {
        Data data = new Data();

        Helper.notransact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                Object o = em.find(Class.forName(entityClassName), (id instanceof Integer)?new Long((Integer)id):id);

                fillData(em, id, data, o);

                for (Method m : o.getClass().getDeclaredMethods()) {
                    if ("toString".equals(m.getName())) {
                        data.set("_tostring", m.invoke(o));
                    }

                    if (m.isAnnotationPresent(Subtitle.class)) {
                        data.set("_subtitle", m.invoke(o));
                    }

                    if (m.isAnnotationPresent(Badges.class)) {
                        data.set("_badges", m.invoke(o));
                    }

                    if (m.isAnnotationPresent(Links.class)) {
                        data.set("_links", m.invoke(o));
                    }
                }

                if (data.isEmpty("_badges")) for (Method m : getAllMethods(o.getClass())) {
                    if (m.isAnnotationPresent(Badges.class)) {
                        data.set("_badges", m.invoke(o));
                    }
                }

                if (data.isEmpty("_links")) for (Method m : getAllMethods(o.getClass())) {
                    if (m.isAnnotationPresent(Links.class)) {
                        data.set("_links", m.invoke(o));
                    }
                }

                data.set("_title", Helper.capitalize((o.getClass().isAnnotationPresent(Entity.class) && !Strings.isNullOrEmpty(((Entity)o.getClass().getAnnotation(Entity.class)).name()))?((Entity)o.getClass().getAnnotation(Entity.class)).name():o.getClass().getSimpleName()) + " " + ((data.isEmpty("_tostring"))?id:data.get("_tostring")));

            }
        });

        return data;
    }

    private static void fillData(EntityManager em, Object id, Data data, Object o) throws Throwable {
        fillData(em, id, data, "", o);
    }

    public static void fillData(Data data, Object o) throws Throwable {
        fillData(null, null, data, "", o);
    }

    private static void fillData(EntityManager em, Object id, Data data, String prefix, Object o) throws Throwable {

        if (id != null) data.set("_id", id);


        for (Field f : getAllFields(o.getClass())) if (!f.isAnnotationPresent(Ignored.class) && !(f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class))) {
            boolean uneditable = false;
            if (f.isAnnotationPresent(Output.class) || f.isAnnotationPresent(Unmodifiable.class)) {
                uneditable = false;
            }

            Method getter = null;
            try {
                getter = o.getClass().getMethod(getGetter(f));
            } catch (Exception e) {

            }
            if (!uneditable && getter != null) {
                Object v = getter.invoke(o);
                //Object v = BeanUtils.getProperty(o,f.getName());
                boolean ok = false;

                Class genericClass = null;
                if (f.getGenericType() instanceof ParameterizedType) {
                    ParameterizedType genericType = (ParameterizedType) f.getGenericType();
                    genericClass = (genericType != null && genericType.getActualTypeArguments().length > 0)?(Class<?>) genericType.getActualTypeArguments()[0]:null;
                }

                if (f.getType().isPrimitive() || basicos.contains(f.getType())) {
                    ok = true;
                } else if (v != null && v instanceof Date) {
                    v = LocalDateTime.ofInstant(((Date)v).toInstant(), ZoneId.systemDefault());
                    ok = true;
                } else if (f.getType().isAnnotationPresent(Embeddable.class)) {
                        if (v != null) {
    
                            Method mts;
                            if ((mts = f.getType().getMethod("toString")) != null) {
                                v = mts.invoke(v);
                            }
                        }
                        ok = true;
                    } else if (f.isAnnotationPresent(OptionsClass.class)) {
                        if (v != null) v = getEntityPair(em, v, f.getAnnotation(OptionsClass.class).value());
                        ok = true;
                    } else if (f.isAnnotationPresent(OptionsQL.class)) {
                        if (v != null) v = getQLPair(em, v, f.getAnnotation(OptionsQL.class).value());
                        ok = true;
                    } else if (v instanceof File) {
                    if (v != null) v = ((File)v).toFileLocator();
                        ok = true;
                    } else if (Translated.class.isAssignableFrom(f.getType())) {
                    if (v != null) v = ((Translated) v).get();
                    ok = true;
                    } else if (f.getType().isArray()) {
                        if (v!= null) {
                            StringBuffer sb = new StringBuffer();
                            for (int i = 0; i < Array.getLength(v); i++) {
                                if (i > 0) sb.append(",");
                                sb.append(Array.get(v, i));
                            }
                            v = sb.toString();
                        }
                        ok = true;
                    } else if (f.getType().isAnnotationPresent(Entity.class)) {
                        if (f.isAnnotationPresent(Owned.class)) {
                            if (v != null) fillData(em, em.getEntityManagerFactory().getPersistenceUnitUtil().getIdentifier(v), data, f.getName() + "_", v);
                            ok = false; // no añadimos el objeto tal cual
                        } else {
                            if (v != null) {
                                String n = v.toString();
                                boolean toStringIsOverriden = f.getType().getMethod("toString").getDeclaringClass().equals(f.getType());
                                if (!toStringIsOverriden) {
                                    boolean hayName = false;
                                    for (Field ff : getAllFields(f.getType()))
                                        if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                            n = "" + f.getType().getMethod(getGetter(ff)).invoke(v);
                                            hayName = true;
                                        }
                                    if (!hayName) {
                                        for (Field ff : getAllFields(f.getType()))
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

                    if (genericClass.isAnnotationPresent(Entity.class)) {

                        Method m = null;

                        if (f.isAnnotationPresent(OwnedList.class)) {

                            List<Data> dl = new ArrayList<>();

                            List l = (List) v;
                            for (Object x : l) {
                                Data dx = new Data();
                                fillData(em, getId(x), dx, x);
                                dl.add(dx);
                            }

                            v = dl;

                        } else {

                            boolean toStringIsOverriden = genericClass.getMethod("toString").getDeclaringClass().equals(genericClass);
                            if (!toStringIsOverriden) {
                                boolean hayName = false;
                                for (Field ff : getAllFields(genericClass))
                                    if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                        m = genericClass.getMethod(getGetter(ff));
                                        hayName = true;
                                    }
                                if (!hayName) {
                                    for (Field ff : getAllFields(genericClass))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            m = genericClass.getMethod(getGetter(ff));
                                        }
                                }
                            }

                            if (v != null) {

                                List<Pair> dl = new ArrayList<>();

                                List l = (List) v;
                                for (Object x : l) {

                                    String n = v.toString();

                                    if (m != null) n = "" + m.invoke(x);

                                    dl.add(new Pair(getId(x), n));

                                }

                                PairList pl = new PairList();
                                pl.setValues(dl);
                                v = pl;

                            }

                        }

                    } else if (String.class.equals(genericClass) || Integer.class.equals(genericClass) || Long.class.equals(genericClass) || Double.class.equals(genericClass)) {

                        if (v != null) {

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

                        }

                    } else {

                        if (v != null) {

                            List<Data> dl = new ArrayList<>();

                            List l = (List) v;
                            for (Object x : l) {
                                Data dx = new Data();
                                fillData(em, getId(x), dx, x);
                                dl.add(dx);
                            }

                            v = dl;
                        }

                    }

                    ok = true;
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
                                        for (Field ff : getAllFields(k.getClass()))
                                            if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                                m = k.getClass().getMethod(getGetter(ff));
                                                hayName = true;
                                            }
                                        if (!hayName) {
                                            for (Field ff : getAllFields(k.getClass()))
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
                                fillData(em, getId(z), dx, z);
                                dl.add(dx);

                            } else {

                                if (z != null) {

                                    if (z != null && z.getClass().isAnnotationPresent(Entity.class)) {
                                        String n = z.toString();

                                        Method m = null;
                                        boolean toStringIsOverriden = z.getClass().getMethod("toString").getDeclaringClass().equals(z.getClass());
                                        if (!toStringIsOverriden) {
                                            boolean hayName = false;
                                            for (Field ff : getAllFields(z.getClass()))
                                                if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                                    m = z.getClass().getMethod(getGetter(ff));
                                                    hayName = true;
                                                }
                                            if (!hayName) {
                                                for (Field ff : getAllFields(z.getClass()))
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
                    }


                    ok = true;


                    } else {
                        data.set(prefix + f.getName() + "____object", true);
                        if (v != null) fillData(em, null, data, f.getName() + "_", v);
                        ok = false; // no añadimos el objeto tal cual
                    }

                    if (v != null) {
                        if (ok) data.set(prefix + f.getName(), v);
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
            Field fieldForName = null;
            boolean hayName = false;
            for (Field ff : getAllFields(c))
                if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                    fieldForName = ff;
                    hayName = true;
                }
            if (!hayName) {
                for (Field ff : getAllFields(c))
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
        for (Field f : getAllFields(o.getClass())) {
            if (f.isAnnotationPresent(Id.class)) {
                id = o.getClass().getMethod(getGetter(f)).invoke(o);
                break;
            }
        }
        return id;
    }

    public static Data getMetadaData(Class c) throws Exception {
        return getMetadaData(null, c);
    }

    public static Data getMetadaData(String parentFieldName, Class c) throws Exception {
        Data data = new Data();
        data.set("_entityClassName", c.getName());
        data.set("_rawtitle", Helper.capitalize(Helper.pluralize((c.isAnnotationPresent(Entity.class) && !Strings.isNullOrEmpty(((Entity)c.getAnnotation(Entity.class)).name()))?((Entity)c.getAnnotation(Entity.class)).name():c.getSimpleName())));

        if (c.isAnnotationPresent(Indelible.class)) data.set("_indelible", true);
        if (c.isAnnotationPresent(NewNotAllowed.class)) data.set("_newnotallowed", true);

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
                if (s.getCanonicalName() != null) subclases.add(new Data("_name", Helper.capitalize(s.getSimpleName()), "_type", s.getCanonicalName(), "_editorform", getEditorForm(s)));
            }
            if (subclases.size() > 0) data.set("_subclasses", subclases);


        }


        // seguimos...

        List<Data> searchFormFields = new ArrayList<>();
        List<Data> listColumns = new ArrayList<>();
        List<Data> staticActions = new ArrayList<>();

        for (Field f : getAllFields(c)) {
            if (f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(SearchFilters.class)) {
                for (SearchFilter sf : f.getDeclaredAnnotationsByType(SearchFilter.class)) {
                    addField(searchFormFields, new FieldInterfaced() {
                        @Override
                        public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                            return f.isAnnotationPresent(annotationClass);
                        }

                        @Override
                        public Class<?> getType() {
                            return f.getType();
                        }

                        @Override
                        public Class<?> getGenericClass() {
                            Type t = f.getGenericType();
                            if (t instanceof ParameterizedType) {
                                ParameterizedType genericType = (ParameterizedType) t;
                                Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                                return genericClass;
                            } else return null;
                        }

                        @Override
                        public Class<?> getDeclaringClass() {
                            return f.getDeclaringClass();
                        }

                        @Override
                        public Type getGenericType() {
                            return f.getGenericType();
                        }

                        @Override
                        public String getName() {
                            return f.getName();
                        }

                        @Override
                        public String getId() {
                            return f.getName();
                        }

                        @Override
                        public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                            return f.getAnnotation(annotationClass);
                        }

                        @Override
                        public Class<?> getOptionsClass() {
                            return null;
                        }

                        @Override
                        public String getOptionsQL() {
                            return null;
                        }
                    }, null, sf, null, true, false);
                }
            }

            if (f.isAnnotationPresent(SearchFilterIsNull.class)) {
                addField(searchFormFields, new FieldInterfaced() {
                    @Override
                    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                        return f.isAnnotationPresent(annotationClass);
                    }

                    @Override
                    public Class<?> getType() {
                        return Boolean.class;
                    }

                    @Override
                    public Class<?> getGenericClass() {
                        return null;
                    }

                    @Override
                    public Class<?> getDeclaringClass() {
                        return f.getDeclaringClass();
                    }

                    @Override
                    public Type getGenericType() {
                        return f.getGenericType();
                    }

                    @Override
                    public String getName() {
                        return f.getName();
                    }

                    @Override
                    public String getId() {
                        return f.getName() + "_isnull";
                    }

                    @Override
                    public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                        return f.getAnnotation(annotationClass);
                    }

                    @Override
                    public Class<?> getOptionsClass() {
                        return null;
                    }

                    @Override
                    public String getOptionsQL() {
                        return null;
                    }
                }, null, null, f.getAnnotation(SearchFilterIsNull.class), true, false);
            }

        }

        boolean hayListColumns = false;
        for (Field f : getAllFields(c)) {
            if (f.isAnnotationPresent(Id.class) || f.isAnnotationPresent(ListColumn.class) || f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(ListColumns.class) || f.isAnnotationPresent(SearchFilters.class)) {
                if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(NotInList.class))) {
                    hayListColumns |= f.isAnnotationPresent(ListColumn.class) || f.isAnnotationPresent(ListColumns.class);
                    addColumn(listColumns, f);
                }
            }
        }

        if (!hayListColumns) {
            listColumns.clear();
            for (Field f : getAllFields(c)) {
                if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(NotInList.class)))
                    addColumn(listColumns, f);
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
            if (Modifier.isStatic(m.getModifiers())) {
                addMethod(staticActions, m);
            }
        }




        Data dsf;
        data.set("_searchform", dsf = new Data());
        dsf.set("_fields", searchFormFields);
        dsf.set("_columns", listColumns);
        data.set("_actions", staticActions);
        data.set("_editorform", getEditorForm(c));

        if (!Strings.isNullOrEmpty(parentFieldName)) {
            parentFieldName = Helper.capitalize(parentFieldName);
            for (Data x : data.getData("_editorform").getList("_fields")) {
                if (x.containsKey("_label")) x.set("_label", parentFieldName + " " + x.get("_label"));
            }
        }

        return data;
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
    public Data getMetaData(String entityClassName) throws Exception {
        Class c = Class.forName(entityClassName);

        return getMetadaData(c);
    }

    private static Data getEditorForm(Class c) throws Exception {
        List<Data> editorFormFields = new ArrayList<>();
        for (Field f : getAllFields(c)) {
            if (!f.isAnnotationPresent(Ignored.class) && !f.isAnnotationPresent(NotInEditor.class) && !(f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class))) {
                addField(editorFormFields, new FieldInterfaced() {
                    @Override
                    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                        return f.isAnnotationPresent(annotationClass);
                    }

                    @Override
                    public Class<?> getType() {
                        return f.getType();
                    }

                    @Override
                    public Class<?> getGenericClass() {
                        if (f.getGenericType() instanceof ParameterizedType) {
                            ParameterizedType genericType = (ParameterizedType) f.getGenericType();
                            Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                            return genericClass;
                        } else return null;
                    }

                    @Override
                    public Class<?> getDeclaringClass() {
                        return f.getDeclaringClass();
                    }

                    @Override
                    public Type getGenericType() {
                        return f.getGenericType();
                    }

                    @Override
                    public String getName() {
                        return f.getName();
                    }

                    @Override
                    public String getId() {
                        return f.getName();
                    }

                    @Override
                    public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                        return f.getAnnotation(annotationClass);
                    }

                    @Override
                    public Class<?> getOptionsClass() {
                        return null;
                    }

                    @Override
                    public String getOptionsQL() {
                        return null;
                    }
                });
            }
        }
        Data def = new Data();
        def.set("_fields", editorFormFields);
        List<Data> actions = new ArrayList<>();
        for (Method m : getAllMethods(c)) {
            if (!Modifier.isStatic(m.getModifiers())) {
                addMethod(actions, m);
            }
        }
        def.set("_actions", actions);
        def.set("_rawtitle", Helper.capitalize(c.getSimpleName()));
        return def;
    }

    private static List<Method> getAllMethods(Class c) {
        List<Method> l = new ArrayList<>();

        if (c.getSuperclass() != null && c.getSuperclass().isAnnotationPresent(Entity.class)) l.addAll(getAllMethods(c.getSuperclass()));

        for (Method f : c.getDeclaredMethods()) l.add(f);

        return l;
    }

    private static List<Field> getAllFields(Class c) {
        List<Field> l = new ArrayList<>();

        if (c.getSuperclass() != null && c.getSuperclass().isAnnotationPresent(Entity.class)) l.addAll(getAllFields(c.getSuperclass()));

        for (Field f : c.getDeclaredFields()) l.add(f);

        return l;
    }

    @Override
    public Object runInServer(String className, String methodName, Data parameters) throws Throwable {
        Class c = Class.forName(className);
        Method m = null;
        for (Method x : c.getDeclaredMethods()) if (x.getName().equals(methodName) && x.isAnnotationPresent(Action.class)) {
            m = x;
            break;
        }

        Object[] r = {null};

        if (!Modifier.isStatic(m.getModifiers())) {
            Method finalM = m;
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    try {
                        Object o = (parameters.isEmpty("_id"))?c.newInstance():em.find(c, parameters.get("_id"));
                        List<Object> vs = new ArrayList<>();
                        for (Parameter p : finalM.getParameters()) {
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
                                vs.add(fillWizard(em, p.getType(), parameters.get(p.getName())));
                            } else {
                                vs.add(parameters.get(p.getName()));
                            }
                        }
                        Object[] args = vs.toArray();

                        r[0] = finalM.invoke(o, args);
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
                                vs.add(fillWizard(em, p.getType(), parameters.get(p.getName())));
                            } else {
                                vs.add(parameters.get(p.getName()));
                            }
                        }
                        Object[] args = vs.toArray();

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

    private <T> T fillWizard(EntityManager em, Class<T> type, Data data) throws Throwable {
        T o = type.newInstance();
        if (o instanceof BaseServerSideWizard) {
            BaseServerSideWizard w = (BaseServerSideWizard) o;

            for (Object p : w.getPages()) {
                fillEntity(em, p, data, false);
            }

            return (T) w;
        } else throw new Exception("" + type.getName() + " must extend " + BaseServerSideWizard.class.getName());
    }

    @Override
    public WizardPageVO execute(String wizardClassName, String action, Data data) throws Throwable {
        return ((AbstractServerSideWizard)Class.forName(wizardClassName).newInstance()).execute(action, data);
    }

    private static void addMethod(List<Data> actions, Method m) throws Exception {
        if (m.isAnnotationPresent(Action.class)) {
            List<Data> parameters = new ArrayList<>();
            for (Parameter p : m.getParameters()) {
                if (!EntityManager.class.isAssignableFrom(p.getType())) addField(parameters, new FieldInterfaced() {
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
                });
            }
            Data a = new Data();
            a.set("_entityClassName", m.getDeclaringClass().getName());
            a.set("_name", m.getAnnotation(Action.class).name());
            if (m.getAnnotation(Action.class).callOnEnterKeyPressed()) a.set("_callonenterkeypressed", true);
            if (m.getAnnotation(Action.class).addAsButton()) a.set("_addasbutton", true);
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

    private static void addColumn(List<Data> listColumns, Field f) throws Exception {
        List<ListColumn> lcs = new ArrayList<>();
        for (ListColumn lc : f.getDeclaredAnnotationsByType(ListColumn.class)) lcs.add(lc);
        if (lcs.size() == 0) lcs.add(null);
        for (ListColumn lc : lcs) {
            addField(listColumns, new FieldInterfaced() {
                @Override
                public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                    return f.isAnnotationPresent(annotationClass);
                }

                @Override
                public Class<?> getType() {
                    return f.getType();
                }

                @Override
                public Class<?> getGenericClass() {
                    ParameterizedType genericType = (ParameterizedType) f.getGenericType();
                    Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                    return genericClass;
                }

                @Override
                public Class<?> getDeclaringClass() {
                    return f.getDeclaringClass();
                }

                @Override
                public Type getGenericType() {
                    return f.getGenericType();
                }

                @Override
                public String getName() {
                    return f.getName();
                }

                @Override
                public String getId() {
                    return f.getName();
                }

                @Override
                public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                    return f.getAnnotation(annotationClass);
                }

                @Override
                public Class<?> getOptionsClass() {
                    return null;
                }

                @Override
                public String getOptionsQL() {
                    return null;
                }
            }, lc, null, null, false, true);
        }
    }

    private static void addField(List<Data> _fields, FieldInterfaced f) throws Exception {
        addField(_fields, f, null, null, null, false, false);
    }

    private static void addField(List<Data> _fields, FieldInterfaced f, ListColumn listColumnAnnotation, SearchFilter searchFilterAnnotation, SearchFilterIsNull searchFilterIsNullAnnotation, boolean buildingSearchForm, boolean buildingColumns) throws Exception {
        if (!f.isAnnotationPresent(Ignored.class)) {

            Data d = new Data();
            boolean upload = false;

            if (f.getType().isAnnotationPresent(Entity.class) && !f.isAnnotationPresent(Required.class)) d.set("_leftjoin",f.getName());

            if (f.isAnnotationPresent(CellStyleGenerator.class)) d.set("_cellstylegenerator", f.getAnnotation(CellStyleGenerator.class).value().getName());

            if (listColumnAnnotation != null) {
                if (!Strings.isNullOrEmpty(listColumnAnnotation.value())) {
                    d.set("_label", listColumnAnnotation.value());
                }
                if (!Strings.isNullOrEmpty(listColumnAnnotation.field())) {
                    d.set("_qlname", f.getName() + "." + listColumnAnnotation.field());
                    for (Field ff : getAllFields(f.getType())) {
                        if (ff.getName().equals(listColumnAnnotation.field())) {
                            f = new FieldInterfaced() {
                                @Override
                                public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                                    return ff.isAnnotationPresent(annotationClass);
                                }

                                @Override
                                public Class<?> getType() {
                                    return ff.getType();
                                }

                                @Override
                                public Class<?> getGenericClass() {
                                    ParameterizedType genericType = (ParameterizedType) ff.getGenericType();
                                    Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                                    return genericClass;
                                }

                                @Override
                                public Class<?> getDeclaringClass() {
                                    return ff.getDeclaringClass();
                                }

                                @Override
                                public Type getGenericType() {
                                    return ff.getGenericType();
                                }

                                @Override
                                public String getName() {
                                    return ff.getName();
                                }

                                @Override
                                public String getId() {
                                    return ff.getName();
                                }

                                @Override
                                public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                                    return ff.getAnnotation(annotationClass);
                                }

                                @Override
                                public Class<?> getOptionsClass() {
                                    return null;
                                }

                                @Override
                                public String getOptionsQL() {
                                    return null;
                                }
                            };
                            break;
                        }
                    }
                } else if (!Strings.isNullOrEmpty(listColumnAnnotation.ql()))
                d.set("_colql", listColumnAnnotation.ql());
                else d.set("_qlname", f.getName());

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
                    d.set("_qlname", f.getName() + "." + searchFilterIsNullAnnotation.field());
                    for (Field ff : getAllFields(f.getType())) {
                        if (ff.getName().equals(searchFilterIsNullAnnotation.field())) {
                            f = new FieldInterfaced() {
                                @Override
                                public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                                    return ff.isAnnotationPresent(annotationClass);
                                }

                                @Override
                                public Class<?> getType() {
                                    return ff.getType();
                                }

                                @Override
                                public Class<?> getGenericClass() {
                                    ParameterizedType genericType = (ParameterizedType) ff.getGenericType();
                                    Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                                    return genericClass;
                                }

                                @Override
                                public Class<?> getDeclaringClass() {
                                    return ff.getDeclaringClass();
                                }

                                @Override
                                public Type getGenericType() {
                                    return ff.getGenericType();
                                }

                                @Override
                                public String getName() {
                                    return ff.getName();
                                }

                                @Override
                                public String getId() {
                                    return ff.getName();
                                }

                                @Override
                                public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                                    return ff.getAnnotation(annotationClass);
                                }

                                @Override
                                public Class<?> getOptionsClass() {
                                    return null;
                                }

                                @Override
                                public String getOptionsQL() {
                                    return null;
                                }
                            };
                            break;
                        }
                    }
                } else if (!Strings.isNullOrEmpty(searchFilterIsNullAnnotation.ql()))
                    d.set("_qlname", searchFilterIsNullAnnotation.ql());
                else d.set("_qlname", f.getName());
            } else if (searchFilterAnnotation != null) {
                if (!Strings.isNullOrEmpty(searchFilterAnnotation.value())) {
                    d.set("_label", searchFilterAnnotation.value());
                }
                if (searchFilterAnnotation.exactMatch()) d.set("_exactmatch", true);
                if (!Strings.isNullOrEmpty(searchFilterAnnotation.field())) {
                    d.set("_qlname", f.getName() + "." + searchFilterAnnotation.field());
                    Class aux = f.getGenericClass();
                    if (aux == null || Class.class.equals(aux)) aux = f.getType();
                    else {
                        d.set("_innerjoin", f.getName());
                        d.set("_qlname", searchFilterAnnotation.field());
                    }
                    for (Field ff : getAllFields(aux)) {
                        if (ff.getName().equals(searchFilterAnnotation.field())) {
                            FieldInterfaced finalF = f;
                            f = new FieldInterfaced() {
                                @Override
                                public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                                    return ff.isAnnotationPresent(annotationClass);
                                }

                                @Override
                                public Class<?> getType() {
                                    return ff.getType();
                                }

                                @Override
                                public Class<?> getGenericClass() {
                                    ParameterizedType genericType = (ParameterizedType) ff.getGenericType();
                                    Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                                    return genericClass;
                                }

                                @Override
                                public Class<?> getDeclaringClass() {
                                    return ff.getDeclaringClass();
                                }

                                @Override
                                public Type getGenericType() {
                                    return ff.getGenericType();
                                }

                                @Override
                                public String getName() {
                                    return ff.getName();
                                }

                                @Override
                                public String getId() {
                                    return finalF.getName() + "." + ff.getName();
                                }

                                @Override
                                public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                                    return ff.getAnnotation(annotationClass);
                                }

                                @Override
                                public Class<?> getOptionsClass() {
                                    return null;
                                }

                                @Override
                                public String getOptionsQL() {
                                    return null;
                                }
                            };
                            break;
                        }
                    }
                } else if (!Strings.isNullOrEmpty(searchFilterAnnotation.ql()))
                    d.set("_qlname", searchFilterAnnotation.ql());
                else d.set("_qlname", f.getName());
            } else if (Translated.class.isAssignableFrom(f.getType())) {
                d.set("_translation", true);
                d.set("_qlname", "es");
            } else {
                d.set("_qlname", f.getName());
            }



            if (List.class.isAssignableFrom(f.getType()) || Map.class.isAssignableFrom(f.getType()) || f.isAnnotationPresent(NotInList.class)) {
                d.set("_notinlist", true);
            }


            if (f.isAnnotationPresent(FullWidth.class)) {
                d.set("_fullwidth", true);
            }
            if (f.isAnnotationPresent(Required.class)) {
                d.set("_required", true);
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

            if (f.isAnnotationPresent(UseGridToSelect.class)) {
                d.set("_type", MetaData.FIELDTYPE_SELECTFROMGRID);
                UseGridToSelect a = f.getAnnotation(UseGridToSelect.class);
                if (!Strings.isNullOrEmpty(a.data())) d.set("_dataproperty", a.data());
                else if (!Strings.isNullOrEmpty(a.ql())) d.set("_ql", a.ql());

                List<Data> cols = new ArrayList<>();
                Class c = f.getType();
                if (List.class.isAssignableFrom(f.getType())) c = f.getGenericClass();
                for (Field ff : c.getDeclaredFields()) {
                    if (!ff.isAnnotationPresent(Id.class) && !ff.getType().equals(f.getDeclaringClass()))
                        addColumn(cols, ff);
                }
                d.set("_cols", cols);

                upload = true;
            } else if (f.isAnnotationPresent(Wizard.class)) {
                d.set("_type", MetaData.FIELDTYPE_WIZARD);
                Class<? extends AbstractServerSideWizard> wc = f.getAnnotation(Wizard.class).value();
                try {
                    d.set("_pagevo", wc.newInstance().execute(null, null));
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
                upload = true;
            } else if (AbstractServerSideWizard.class.isAssignableFrom(f.getType())) {
                d.set("_type", MetaData.FIELDTYPE_WIZARD);
                Class<? extends AbstractServerSideWizard> wc = (Class<? extends AbstractServerSideWizard>) f.getType();
                try {
                    d.set("_pagevo", wc.newInstance().execute(null, null));
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
                d.set("_ql", getQlForEntityField(f.getAnnotation(OptionsClass.class).value()));
                upload = true;
            } else if (f.isAnnotationPresent(OptionsQL.class)) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", f.getAnnotation(OptionsQL.class).value());
                upload = true;
            } else if (f.getOptionsClass() != null) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", getQlForEntityField(f.getOptionsClass()));
                upload = true;
            } else if (f.getOptionsQL() != null) {
                d.set("_type", MetaData.FIELDTYPE_COMBO);
                d.set("_ql", f.getOptionsQL());
                upload = true;
            } else if (searchFilterIsNullAnnotation != null) {
                d.set("_type", MetaData.FIELDTYPE_BOOLEAN);
                upload = true;
            } else if (f.isAnnotationPresent(Output.class) && searchFilterAnnotation == null && !buildingColumns) {
                d.set("_type", MetaData.FIELDTYPE_OUTPUT);
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

                    d.set("_leftjoinql", f.getName());

                    upload = true;
                } else if (List.class.isAssignableFrom(f.getType())) {
                    if (buildingSearchForm && f.getGenericClass().isAnnotationPresent(Entity.class)) {
                        d.set("_type", MetaData.FIELDTYPE_ENTITY);
                        d.set("_entityClassName", f.getType().getCanonicalName());
                        d.set("_innerjoin", f.getName());
                        d.set("_qlname", getIdFieldName(f.getGenericClass()));
                        d.set("_ql", getQlForEntityField(f.getGenericClass()));

                    } else if (f.isAnnotationPresent(OwnedList.class) || !f.getGenericClass().isAnnotationPresent(Entity.class)) {

                        Class gc = f.getGenericClass();

                        if (gc.isPrimitive() || gc.equals(Long.class) || gc.equals(Integer.class) || gc.equals(Double.class) || gc.equals(String.class)) {
                            d.set("_type", MetaData.FIELDTYPE_TEXTAREA);

                            if (f.isAnnotationPresent(ValueClass.class) || f.isAnnotationPresent(ValueQL.class)) {

                                d.set("_type", MetaData.FIELDTYPE_GRID);
                                List<Data> cols = new ArrayList<>();

                                Class<?> finalGenericClass = gc;
                                final FieldInterfaced finalF1 = f;
                                addField(cols, new FieldInterfaced() {
                                    @Override
                                    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                                        return false;
                                    }

                                    @Override
                                    public Class<?> getType() {
                                        return finalGenericClass;
                                    }

                                    @Override
                                    public Class<?> getGenericClass() {
                                        return null;
                                    }

                                    @Override
                                    public Class<?> getDeclaringClass() {
                                        return null;
                                    }

                                    @Override
                                    public Type getGenericType() {
                                        return null;
                                    }

                                    @Override
                                    public String getName() {
                                        return (finalF1.isAnnotationPresent(MapLabels.class) && !Strings.isNullOrEmpty(finalF1.getAnnotation(MapLabels.class).labelForValue()))?finalF1.getAnnotation(MapLabels.class).labelForValue():"Value";
                                    }

                                    @Override
                                    public String getId() {
                                        return "_value";
                                    }

                                    @Override
                                    public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                                        return null;
                                    }

                                    @Override
                                    public Class<?> getOptionsClass() {
                                        return (finalF1.isAnnotationPresent(ValueClass.class))?finalF1.getAnnotation(ValueClass.class).value():null;
                                    }

                                    @Override
                                    public String getOptionsQL() {
                                        return (finalF1.isAnnotationPresent(ValueQL.class))?finalF1.getAnnotation(ValueQL.class).value():null;
                                    }

                                }, null, null, null, false, true);

                                d.set("_cols", cols);

                            }

                        } else {
                            d.set("_type", MetaData.FIELDTYPE_GRID);
                            List<Data> cols = new ArrayList<>();
                            for (Field ff : f.getGenericClass().getDeclaredFields()) {
                                if (!ff.isAnnotationPresent(Id.class) && !ff.getType().equals(f.getDeclaringClass()))
                                    addColumn(cols, ff);
                            }
                            d.set("_cols", cols);
                        }

                    } else {
                        d.set("_type", MetaData.FIELDTYPE_LIST);
                        d.set("_entityClassName", f.getGenericClass().getCanonicalName());

                        String ql = getQlForEntityField(f);

                        d.set("_ql", ql);
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
                    addField(cols, new FieldInterfaced() {
                            @Override
                            public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                                return false;
                            }

                            @Override
                            public Class<?> getType() {
                                return finalGenericKeyClass;
                            }

                            @Override
                            public Class<?> getGenericClass() {
                                return null;
                            }

                            @Override
                            public Class<?> getDeclaringClass() {
                                return null;
                            }

                            @Override
                            public Type getGenericType() {
                                return null;
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
                            public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                                return null;
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
                                addColumn(cols, ff);
                        }


                    } else {

                        Class<?> finalGenericClass = genericClass;
                        addField(cols, new FieldInterfaced() {
                            @Override
                            public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                                return false;
                            }

                            @Override
                            public Class<?> getType() {
                                return finalGenericClass;
                            }

                            @Override
                            public Class<?> getGenericClass() {
                                return null;
                            }

                            @Override
                            public Class<?> getDeclaringClass() {
                                return null;
                            }

                            @Override
                            public Type getGenericType() {
                                return null;
                            }

                            @Override
                            public String getName() {
                                return (finalF1.isAnnotationPresent(MapLabels.class) && !Strings.isNullOrEmpty(finalF1.getAnnotation(MapLabels.class).labelForValue()))?finalF1.getAnnotation(MapLabels.class).labelForValue():"Value";
                            }

                            @Override
                            public String getId() {
                                return "_value";
                            }

                            @Override
                            public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                                return null;
                            }

                            @Override
                            public Class<?> getOptionsClass() {
                                return (finalF1.isAnnotationPresent(ValueClass.class))?finalF1.getAnnotation(ValueClass.class).value():null;
                            }

                            @Override
                            public String getOptionsQL() {
                                return (finalF1.isAnnotationPresent(ValueQL.class))?finalF1.getAnnotation(ValueQL.class).value():null;
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

                                d.set("_metadata", getMetadaData(f.getType()).getData("_editorform"));

                            } else {

                                String nombreCampoId = "id";
                                for (Field ff : getAllFields(f.getType()))
                                    if (ff.isAnnotationPresent(Id.class)) {
                                        nombreCampoId = ff.getName();
                                    }


                                String defaultQl = "select x." + nombreCampoId + ", x.name from " + f.getType().getName() + " x order by x.name";

                                boolean hayName = false;
                                for (Field ff : getAllFields(f.getType()))
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
                                    for (Field ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            d.set("_qlname", d.getString("_qlname") + "." + ff.getName());

                                            defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());
                                        }
                                }

                                if (buildingSearchForm) {
                                    for (Field ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            d.set("_qlname", d.get("_qlname") + "." + ff.getName());
                                        }
                                }

                                if (!d.isEmpty("_leftjoin")) {
                                    for (Field ff : getAllFields(f.getType()))
                                        if (ff.isAnnotationPresent(Id.class)) {
                                            d.set("_leftjoinql", ff.getName());
                                        }
                                }

                                if (f.getType().isAnnotationPresent(UseIdToSelect.class)) {
                                    d.set("_useidtoselect", true);
                                    for (Field fid : getAllFields(f.getType())) {
                                        if (fid.isAnnotationPresent(Id.class)) {
                                            d.set("_idtype", fid.getType().getName());
                                            break;
                                        }
                                    }
                                    defaultQl = "select x.id, x.name from " + f.getType().getName() + " x where x.id = xxxx";

                                    hayName = false;
                                    for (Field ff : getAllFields(f.getType()))
                                        if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                                            if (!buildingSearchForm) d.set("_qlname", d.get("_qlname") + "." + ff.getName());
                                            defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());

                                            if (Translated.class.isAssignableFrom(ff.getType())) {
                                                d.set("_translation", true);
                                                d.set("_qlname", d.getString("_qlname") + ".es");

                                                defaultQl = "select x." + nombreCampoId + ", x." + ff.getName() + ".es from " + f.getType().getName() + " x where x.id = xxxx order by x." + ff.getName() + ".es";
                                            }
                                            hayName = true;
                                        }
                                    if (!hayName) {
                                        for (Field ff : getAllFields(f.getType()))
                                            if (ff.isAnnotationPresent(Id.class)) {
                                                d.set("_qlname", d.getString("_qlname") + "." + ff.getName());

                                                defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());
                                            }
                                    }


                                    String ql = f.getType().getAnnotation(UseIdToSelect.class).ql();
                                    if (ql != null && !"".equals(ql.trim())) d.set("_ql", ql);
                                    else d.set("_ql", defaultQl);
                                } else if (f.getType().isAnnotationPresent(UseAutocompleteToSelect.class)) {
                                    d.set("_useautocompletetoselect", true);
                                    String ql = f.getType().getAnnotation(UseAutocompleteToSelect.class).ql();
                                    if (ql != null && !"".equals(ql.trim())) d.set("_ql", ql);
                                    else d.set("_ql", defaultQl);
                                } else if (f.getType().isAnnotationPresent(QLForCombo.class)) {
                                    String ql = f.getType().getAnnotation(QLForCombo.class).ql();
                                    if (ql != null && !"".equals(ql.trim())) d.set("_ql", ql);
                                    else d.set("_ql", defaultQl);
                                } else {
                                    d.set("_ql", defaultQl);
                                }

                            }

                            upload = true;


                        } else {

                            d.set("_type", MetaData.FIELDTYPE_OBJECT);

                            if (buildingColumns) {
                                d.set("_notinlist", true);
                            }

                            upload = true;

                            System.out.println("adding field " + f.getName());

                            d.set("_metadata", getMetadaData(f.getName(), f.getType()).getData("_editorform"));


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

                if (f.isAnnotationPresent(StartsLine.class)) {
                    d.set("_startsline", true);
                }

                if (d.isEmpty("_label")) {
                    if (f.isAnnotationPresent(Caption.class)) {
                        d.set("_label", f.getAnnotation(Caption.class).value());
                    } else d.set("_label", Helper.capitalize(f.getName()));
                }
                _fields.add(d);
            }

        }
    }

    private static String getIdFieldName(Class<?> c) {
        String nombreCampoId = "id";
        for (Field ff : getAllFields(c))
            if (ff.isAnnotationPresent(Id.class)) {
                nombreCampoId = ff.getName();
                break;
            }
            return nombreCampoId;
    }

    private static String getQlForEntityField(FieldInterfaced f) {
        return getQlForEntityField(f.getGenericClass());
    }

    private static String getQlForEntityField(Class<?> c) {

        String nombreCampoId = "id";
        for (Field ff : getAllFields(c))
            if (ff.isAnnotationPresent(Id.class)) {
                nombreCampoId = ff.getName();
                break;
            }


        String defaultQl = "select x." + nombreCampoId + ", x.name from " + c.getName() + " x order by x.name";

        boolean hayName = false;
        for (Field ff : getAllFields(c))
            if ("name".equals(ff.getName()) || "title".equals(ff.getName())) {
                defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());

                if (Translated.class.isAssignableFrom(ff.getType())) {

                    defaultQl = "select x." + nombreCampoId + ", x." + ff.getName() + ".es from " + c.getName() + " x order by x." + ff.getName() + ".es";
                }
                hayName = true;
            }
        if (!hayName) {
            for (Field ff : getAllFields(c))
                if (ff.isAnnotationPresent(Id.class)) {
                    defaultQl = defaultQl.replaceAll("\\.name", "." + ff.getName());
                }
        }


        if (c.isAnnotationPresent(QLForCombo.class)) {
            String ql = c.getAnnotation(QLForCombo.class).ql();
            if (ql != null && !"".equals(ql.trim())) defaultQl = ql;
        }

        return defaultQl;
    }


    public static void main(String... args) throws Exception {
        //System.out.println(new ERPServiceImpl().getMetaData(Actor.class.getCanonicalName()));
    }

    public static WizardPageVO getWizardPageVO(BaseServerSideWizard w, AbstractServerSideWizardPage p, Data data) throws Throwable {
        if (p == null) {
            return null;
        } else {
            WizardPageVO vo = new WizardPageVO();

            vo.setTitle(p.getTitle());
            vo.setWizardClassName(w.getClass().getName());
            vo.setMetaData(getMetadaData(p.getClass()));
            vo.setFirstPage(w.getPages().indexOf(p) == 0);
            vo.setLastPage(w.getPages().indexOf(p) == w.getPages().size() - 1);
            if (!vo.isFirstPage()) vo.setGoBackAction("gotopage_" + (w.getPages().indexOf(p) - 1));
            if (!vo.isLastPage()) vo.setGoNextAction("gotopage_" + (w.getPages().indexOf(p) + 1));

            vo.setData(p.getData(data));

            return vo;
        }
    }
}
