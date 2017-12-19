package io.mateu.ui.mdd.server;

import com.google.common.base.Strings;
import io.mateu.erp.model.util.XMLSerializable;
import io.mateu.ui.core.shared.*;
import io.mateu.ui.mdd.server.annotations.*;
import io.mateu.ui.mdd.server.annotations.CellStyleGenerator;
import io.mateu.ui.mdd.server.interfaces.*;
import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;
import io.mateu.ui.mdd.shared.ERPService;
import io.mateu.ui.mdd.shared.MetaData;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.BeanUtilsBean;
import org.reflections.Reflections;

import javax.persistence.*;
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
    public Data set(UserData user, String entityClassName, String viewClassName, Data data) throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                Class cl = Class.forName(entityClassName);
                Class vcl = Class.forName(viewClassName);

                fillEntity(em, cl, vcl, data);

            }
        });


        Object id = data.get("_id");
        if (id instanceof Long) return get(user, entityClassName, viewClassName, (long) id);
        else if (id instanceof Integer) return get(user, entityClassName, viewClassName, (int) id);
        else if (id instanceof String) return get(user, entityClassName, viewClassName, (String) id);
        else return null;
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

    private static Object fillEntity(EntityManager em, Class cl, Data data) throws Throwable {
        return fillEntity(em, cl, cl, data);
    }

    private static Object fillEntity(EntityManager em, Class cl, Class vcl, Data data) throws Throwable {
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


        fillEntity(em, o, data, newInstance, vcl);

        return o;
    }

    public static void fillEntity(EntityManager em, Object o, Data data, boolean newInstance) throws Throwable {
        fillEntity(em, o, data, newInstance, o.getClass());
    }

    public static void fillEntity(EntityManager em, Object o, Data data, boolean newInstance, Class viewClass) throws Throwable {

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


        for (FieldInterfaced f : getAllFields(o.getClass(), view, (view != null)?asList(view.getFields()):null)) {
            boolean updatable = true;
            if (AuditRecord.class.isAssignableFrom(f.getType()) || f.isAnnotationPresent(Output.class) || f.isAnnotationPresent(Ignored.class) || f.isAnnotationPresent(NotInEditor.class) || (!newInstance && f.isAnnotationPresent(Unmodifiable.class))) {
                updatable = false;
            }

            if (updatable) {

                if (data != null && data.containsKey(f.getId() + "____object")) {
                    Object z = o.getClass().getMethod(getGetter(f)).invoke(o);
                    boolean recienCreado = false;
                    if (z == null) {
                        recienCreado = true;
                        z = f.getType().newInstance();
                        BeanUtils.setProperty(o, f.getName(), z);
                    }
                    fillEntity(em, z, data.getData(f.getId()), recienCreado, viewClass);
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
                        fillEntity(em, z, data, recienCreado);
                    } else {
                        System.out.println("owned y no es una entity");
                    }
                } else if (data != null && data.containsKey(f.getId())) {
                    Object v = data.get(f.getId());
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

                            if (f.isAnnotationPresent(OwnedList.class)) {
                                String idfieldatx = "id";
                                for (FieldInterfaced fx : getAllFields(genericClass))
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
                                        Object x = fillEntity(em, genericClass, d);
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
                                            fillEntity(em, z, d, true);
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
                                        Object x = fillEntity(em, genericClass, d);
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

                        f.setValue(o, v);
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
                Object o = em.find(Class.forName(entityClassName), (id instanceof Integer)?new Long((Integer)id):id);

                Class viewClass = Class.forName(viewClassName);

                View v = null;

                if (!viewClass.equals(o.getClass())) v = (View) viewClass.newInstance();

                fillData(user, em, viewClass, id, data, o);

                for (Method m : viewClass.getDeclaredMethods()) {
                    if ("toString".equals(m.getName())) {
                        data.set("_tostring", (v == null)?m.invoke(v):m.invoke(v, o));
                    }

                    if (m.isAnnotationPresent(Subtitle.class)) {
                        data.set("_subtitle", (v == null)?m.invoke(v):m.invoke(v, o));
                    }

                    if (m.isAnnotationPresent(Badges.class)) {
                        data.set("_badges", (v == null)?m.invoke(v):m.invoke(v, o));
                    }

                    if (m.isAnnotationPresent(Links.class)) {
                        data.set("_links", (v == null)?m.invoke(v):m.invoke(v, o));
                    }
                }

                if (data.isEmpty("_badges")) for (Method m : getAllMethods(viewClass)) {
                    if (m.isAnnotationPresent(Badges.class)) {
                        data.set("_badges", (v == null)?m.invoke(v):m.invoke(v, o));
                    }
                }

                if (data.isEmpty("_links")) for (Method m : getAllMethods(viewClass)) {
                    if (m.isAnnotationPresent(Links.class)) {
                        data.set("_links", (v == null)?m.invoke(v):m.invoke(v, o));
                    }
                }

                data.set("_title", Helper.capitalize((o.getClass().isAnnotationPresent(Entity.class) && !Strings.isNullOrEmpty(((Entity)o.getClass().getAnnotation(Entity.class)).name()))?((Entity)o.getClass().getAnnotation(Entity.class)).name():o.getClass().getSimpleName()) + " " + ((data.isEmpty("_tostring"))?id:data.get("_tostring")));

            }
        });

        return data;
    }

    private static void fillData(UserData user, EntityManager em, Class viewClass, Object id, Data data, Object o) throws Throwable {
        fillData(user, em, viewClass, id, data, "", o);
    }

    public static void fillData(UserData user, EntityManager em, Data data, Object o) throws Throwable {
        fillData(user, em, null, null, data, "", o);
    }

    private static void fillData(UserData user, EntityManager em, Class viewClass, Object id, Data data, String prefix, Object o) throws Throwable {

        if (id != null) data.set(prefix + "_id", id);

        View v = null;
        List<String> l = null;

        if (viewClass == null) viewClass = o.getClass();

        if (View.class.isAssignableFrom(viewClass)) {
            v = (View) viewClass.newInstance();
            l = asList(v.getFields());
        }

        if (v == null) {
            for (FieldInterfaced f : getAllFields(o.getClass())) fillData(user, em, viewClass, data, prefix, o, f);
        } else {
            for (FieldInterfaced f : getAllFields(o.getClass(), v, l)) fillData(user, em, viewClass, data, prefix, o, f);
        }

        for (Method m : getAllMethods(o.getClass())) {
            if (!Modifier.isStatic(m.getModifiers())) {
                if (m.isAnnotationPresent(Show.class) || m.isAnnotationPresent(ShowAsHtml.class)) {

                    if (v == null || l.contains(m.getName())) fillData(user, em, viewClass, data, prefix, o, getInterfaced(m));

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
            v = execute(null, m, null, o);
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

    private static void fillData(UserData user, EntityManager em, Class viewClass, Data data, String prefix, Object o, FieldInterfaced f) throws Throwable {
        if (!f.isAnnotationPresent(Ignored.class) && !(f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class))) {
            boolean uneditable = false;
            if (f.isAnnotationPresent(Output.class) || f.isAnnotationPresent(Unmodifiable.class)) {
                uneditable = false;
            }

            Object v = f.getValue(o);
            if (!uneditable && v != null) {
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
                        if (v != null) fillData(user, em, viewClass, em.getEntityManagerFactory().getPersistenceUnitUtil().getIdentifier(v), data, f.getName() + "_", v);
                        ok = false; // no añadimos el objeto tal cual
                    } else {
                        if (v != null) {
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

                    if (genericClass.isAnnotationPresent(Entity.class)) {

                        Method m = null;

                        if (f.isAnnotationPresent(OwnedList.class)) {

                            List<Data> dl = new ArrayList<>();

                            List l = (List) v;
                            for (Object x : l) {
                                Data dx = new Data();
                                fillData(user, em, viewClass, getId(x), dx, x);
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
                                fillData(user, em, viewClass, getId(x), dx, x);
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
                                fillData(user, em, viewClass, getId(z), dx, z);
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
                    }


                    ok = true;


                } else {
                    data.set(prefix + f.getName() + "____object", true);
                    if (v != null) fillData(user, em,  viewClass,null, data, f.getName() + "_", v);
                    ok = false; // no añadimos el objeto tal cual
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

    public static Data getMetadaData(UserData user, EntityManager em, Class c) throws Exception {
        return getMetadaData(user, em, null, c);
    }

    public static Data getMetadaData(UserData user, EntityManager em, String parentFieldName, Class c) throws Exception {
        Data data = new Data();

        View v = null;

        List<String> viewParamFields = new ArrayList<>();
        List<String> viewColumnFields = new ArrayList<>();
        List<String> viewOrderFields = new ArrayList<>();
        List<String> viewFormFields = new ArrayList<>();

        if (View.class.isAssignableFrom(c)) {
            System.out.println(c.getName() + " is a view");
            v = (View) c.newInstance();
            for (Type t : c.getGenericInterfaces()) {
                if (t.getTypeName().startsWith(View.class.getName())) c = (Class) ((ParameterizedType)t).getActualTypeArguments()[0];
            }

            addToList(viewParamFields, v.getParams());
            addToList(viewColumnFields, v.getCols());
            addToList(viewOrderFields, v.getOrderCriteria());
            addToList(viewFormFields, v.getFields());

        } else {
            System.out.println(c.getName() + " is an entity");
        }
        System.out.println("entity=" + c.getName());

        Class viewClass = c;
        if (v != null) viewClass = v.getClass();

        data.set("_entityClassName", c.getName());
        data.set("_viewClassName", viewClass.getName());
        data.set("_rawtitle", Helper.capitalize(Helper.pluralize((c.isAnnotationPresent(Entity.class) && !Strings.isNullOrEmpty(((Entity)c.getAnnotation(Entity.class)).name()))?((Entity)c.getAnnotation(Entity.class)).name():c.getSimpleName())));

        if (viewClass.isAnnotationPresent(Indelible.class)) data.set("_indelible", true);
        if (viewClass.isAnnotationPresent(NewNotAllowed.class)) data.set("_newnotallowed", true);

        if (Filtered.class.isAssignableFrom(viewClass)) {
            try {
                Class finalViewClass = viewClass;
                Helper.transact(new JPATransaction() {
                    @Override
                    public void run(EntityManager em) throws Throwable {
                        data.set("_additionalcriteria", ((Filtered) finalViewClass.newInstance()).getAdditionalCriteria(em, user));
                    }
                });
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }

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
                if (s.getCanonicalName() != null) subclases.add(new Data("_name", Helper.capitalize(s.getSimpleName()), "_type", s.getCanonicalName(), "_editorform", getEditorForm(user, em, v, viewFormFields, viewClass, s)));
            }
            if (subclases.size() > 0) data.set("_subclasses", subclases);


        }


        // seguimos...

        List<Data> searchFormFields = new ArrayList<>();
        List<Data> listColumns = new ArrayList<>();
        List<Data> staticActions = new ArrayList<>();

        for (FieldInterfaced f : getAllFields(c, v, viewParamFields)) {
            if (f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(SearchFilters.class)) {
                for (SearchFilter sf : f.getDeclaredAnnotationsByType(SearchFilter.class)) {
                    addField(user, em, searchFormFields, f, null, sf, null, true, false);
                }
            } else if (f.isAnnotationPresent(SearchFilterIsNull.class)) {
                addField(user, em, searchFormFields, new FieldInterfacedFromField(f) {

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
                addField(user, em, searchFormFields, f, null, null, null, true, false);
            }

        }

        boolean hayListColumns = false;
        if (v == null) for (FieldInterfaced f : getAllFields(c)) {
            if (f.isAnnotationPresent(Id.class) || f.isAnnotationPresent(ListColumn.class) || f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(ListColumns.class) || f.isAnnotationPresent(SearchFilters.class)) {
                if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(NotInList.class))) {
                    hayListColumns |= f.isAnnotationPresent(ListColumn.class) || f.isAnnotationPresent(ListColumns.class);
                    addColumn(user, em, listColumns, f);
                }
            }
        }

        if (!hayListColumns) {
            listColumns.clear();
            for (FieldInterfaced f : getAllFields(c, v, viewColumnFields)) {
                if (!(f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class) || f.isAnnotationPresent(MapKey.class) || f.isAnnotationPresent(ElementCollection.class) || f.isAnnotationPresent(NotInList.class)))
                    addColumn(user, em, listColumns, f);
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




        for (Method m : getAllMethods(viewClass)) {
            if (Modifier.isStatic(m.getModifiers())) {
                addMethod(user, em, staticActions, m, viewClass);
            }
        }




        Data dsf;
        data.set("_searchform", dsf = new Data());
        dsf.set("_fields", searchFormFields);
        dsf.set("_columns", listColumns);
        data.set("_actions", staticActions);
        data.set("_editorform", getEditorForm(user, em, v, viewFormFields, viewClass, c));

        if (!Strings.isNullOrEmpty(parentFieldName)) {
            parentFieldName = Helper.capitalize(parentFieldName);
            for (Data x : data.getData("_editorform").getList("_fields")) {
                if (x.containsKey("_label")) x.set("_label", parentFieldName + " " + x.get("_label"));
            }
        }

        return data;
    }

    private static void addToList(List<String> l, String s) {
        if (s != null) for (String t : s.split(",")) {
            t = t.trim();
            if (!"".equals(t)) l.add(t);
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
    public Data getMetaData(UserData user, String entityClassName) throws Exception {
        Class c = Class.forName(entityClassName);

        Data[] data = new Data[1];

        try {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    data[0] = getMetadaData(user, em, c);
                }
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return data[0];
    }

    private Data getMetaData(UserData user, EntityManager em, Class entity) throws Throwable {
        return getMetadaData(user, em, entity);
    }

    private static Data getEditorForm(UserData user, EntityManager em, View v, List<String> viewFormFields, Class viewClass, Class c) throws Exception {
        List<Data> editorFormFields = new ArrayList<>();
        for (FieldInterfaced f : getAllFields(c, v, viewFormFields)) {
            if (!f.isAnnotationPresent(Ignored.class) && !f.isAnnotationPresent(NotInEditor.class) && !(f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class))) {
                addField(user, em, editorFormFields, f);
            }
        }

        for (Method m : getAllMethods(c)) {
            if (!Modifier.isStatic(m.getModifiers())) {
                if (m.isAnnotationPresent(Show.class) || m.isAnnotationPresent(ShowAsHtml.class)) {
                    addField(user, em, editorFormFields, getInterfaced(m));
                }
            }
        }

        Data def = new Data();
        def.set("_fields", editorFormFields);
        List<Data> actions = new ArrayList<>();
        for (Method m : getAllMethods(viewClass)) {
            if (!Modifier.isStatic(m.getModifiers())) {
                addMethod(user, em, actions, m, viewClass);
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

    private static List<FieldInterfaced> getAllFields(Class c) {

        List<String> vistos = new ArrayList<>();
        Map<String, Field> originales = new HashMap<>();
        for (Field f : c.getDeclaredFields()) {
            originales.put(f.getName(), f);
        }

        List<FieldInterfaced> l = new ArrayList<>();

        if (c.getSuperclass() != null && (!c.isAnnotationPresent(Entity.class) || c.getSuperclass().isAnnotationPresent(Entity.class))) {
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

    private static List<FieldInterfaced> getAllFields(Class entityClass, View view, List<String> fieldsFilter) {
        List<FieldInterfaced> fs = getAllFields(entityClass);
        Map<String, FieldInterfaced> m = getAllFieldsMap(fs);

        List<FieldInterfaced> l = new ArrayList<>();

        if (view != null) for (String fn : fieldsFilter) {
            fn = fn;
            if (fn.contains(".")) {
                FieldInterfaced f = null;
                String finalFn = fn;
                l.add(f = new FieldInterfacedFromField(getField(entityClass, finalFn, m)) {
                    @Override
                    public String getId() {
                        return finalFn;
                    }

                    @Override
                    public String getName() {
                        return Helper.capitalize(getId());
                    }
                });

            } else {
                if (m.containsKey(fn)) l.add(m.get(fn));
            }
        } else l.addAll(fs);

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
    public Object runInServer(UserData user, String className, String methodName, Data parameters) throws Throwable {
        Class c = Class.forName(className);
        Method m = null;
        for (Method x : c.getDeclaredMethods()) if (x.getName().equals(methodName)) {
            m = x;
            break;
        }

        return execute(user, m, parameters);
    }

    private static Object execute(UserData user, Method m, Data parameters) throws Throwable {
        return execute(user, m, parameters, null);
    }

    private static Object execute(UserData user, Method m, Data parameters, Object instance) throws Throwable {
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
            }


            Method finalM = m;
            Class finalEntityClass = entityClass;
            boolean finalCalledFromView = calledFromView;
            Class finalViewClass = viewClass;
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    try {
                        Object o = instance;
                        if (o == null) o = (parameters.isEmpty("_id"))?finalEntityClass.newInstance():em.find(finalEntityClass, parameters.get("_id"));
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
                            } else {
                                vs.add(parameters.get(p.getName()));
                            }
                        }
                        Object[] args = vs.toArray();

                        Object i = o;
                        if (finalCalledFromView && finalViewClass != null) i = finalViewClass.newInstance();

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

            for (Object p : w.getPages()) {
                fillEntity(em, p, data, false);
            }

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

    private static void addMethod(UserData user, EntityManager em, List<Data> actions, Method m, Class viewClass) throws Exception {
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
                if (anadir) addField(user, em, parameters, new FieldInterfaced() {
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

    private static void addColumn(UserData user, EntityManager em, List<Data> listColumns, FieldInterfaced f) throws Exception {
        List<ListColumn> lcs = new ArrayList<>();
        for (ListColumn lc : f.getDeclaredAnnotationsByType(ListColumn.class)) lcs.add(lc);
        if (lcs.size() == 0) lcs.add(null);
        for (ListColumn lc : lcs) {
            addField(user, em, listColumns, f, lc, null, null, false, true);
        }
    }

    private static void addField(UserData user, EntityManager em, List<Data> _fields, FieldInterfaced f) throws Exception {
        addField(user, em, _fields, f, null, null, null, false, false);
    }

    private static void addField(UserData user, EntityManager em, List<Data> _fields, FieldInterfaced f, ListColumn listColumnAnnotation, SearchFilter searchFilterAnnotation, SearchFilterIsNull searchFilterIsNullAnnotation, boolean buildingSearchForm, boolean buildingColumns) throws Exception {
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
                    d.set("_qlname", f.getId() + "." + listColumnAnnotation.field());
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
                else d.set("_qlname", f.getId());
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
            if (f.isAnnotationPresent(NotNull.class)) {
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

            if (f.isAnnotationPresent(Show.class)) {
                d.set("_type", MetaData.FIELDTYPE_OUTPUT);
                upload = true;
            } else if (f.isAnnotationPresent(ShowAsHtml.class)) {
                d.set("_type", MetaData.FIELDTYPE_HTML);
                upload = true;
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
                        addColumn(user, em, cols, new FieldInterfacedFromField(ff));
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
                                addField(user, em, cols, new FieldInterfacedFromField(f) {
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
                                    addColumn(user, em, cols, new FieldInterfacedFromField(ff));
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
                    addField(user, em, cols, new FieldInterfacedFromField(f) {

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
                                addColumn(user, em, cols, new FieldInterfacedFromField(ff));
                        }


                    } else {

                        Class<?> finalGenericClass = genericClass;
                        addField(user, em, cols, new FieldInterfacedFromField(f) {

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

                                d.set("_metadata", getMetadaData(user, em, f.getType()).getData("_editorform"));

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
                                        for (FieldInterfaced ff : getAllFields(f.getType()))
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

                            System.out.println("adding field " +f.getId());

                            d.set("_metadata", getMetadaData(user, em, f.getId(), f.getType()).getData("_editorform"));


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

    private static Data getInitialData(UserData user, EntityManager em, Class<? extends BaseServerSideWizard> wc) throws Throwable {
        Data d = new Data();

        BaseServerSideWizard w = fillWizard(user, em, wc, d);
        for (AbstractServerSideWizardPage p : w.getPages()) {
            fillData(user, em, d, p);
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

    private static String getQlForEntityField(FieldInterfaced f) {
        return getQlForEntityField(f.getGenericClass());
    }

    private static String getQlForEntityField(Class<?> c) {

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
            vo.setMetaData(getMetadaData(user, em, p.getClass()));
            vo.setFirstPage(w.getPages().indexOf(p) == 0);
            vo.setLastPage(w.getPages().indexOf(p) == w.getPages().size() - 1);
            if (!vo.isFirstPage()) vo.setGoBackAction("gotopage_" + (w.getPages().indexOf(p) - 1));
            if (!vo.isLastPage()) vo.setGoNextAction("gotopage_" + (w.getPages().indexOf(p) + 1));

            vo.setData(p.getData(user, em, data));

            return vo;
        }
    }
}
