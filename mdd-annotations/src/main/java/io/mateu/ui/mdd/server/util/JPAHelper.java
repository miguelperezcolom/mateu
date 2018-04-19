package io.mateu.ui.mdd.server.util;

import io.mateu.ui.core.shared.Data;

import javax.persistence.*;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by Antonia on 03/04/2017.
 */
public class JPAHelper {


    public static Object[] selectObjects(String jpql) throws Throwable {

        System.out.println("jpql: " + jpql);

        List<Object> r = new ArrayList<>();

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Exception {
                Query q = em.createQuery(jpql);
                List rs = q.getResultList();
                for (Object o : rs) {
                    r.add(o);
                }

            }
        });


        return r.toArray(new Object[0]);
    }

    public static Object[][] select(String jpql) throws Throwable {

        System.out.println("jpql: " + jpql);

        List<Object[]> r = new ArrayList<>();

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                Query q = em.createQuery(jpql);
                List rs = q.getResultList();
                for (Object o : rs) {
                    r.add((o.getClass().isArray())?(Object[]) o:new Object[] {o});
                }

            }
        });


        return r.toArray(new Object[0][]);
    }


    public static Object selectSingleValue(String jpql) throws Throwable {
        Object[] v = new Object[1];
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                Query q = em.createQuery(jpql);
                List rs = q.getResultList();
                for (Object o : rs) {
                    v[0] = o;
                    break;
                }

            }
        });
        return v[0];
    }


    public static Data selectPaginated(Data parameters) throws Throwable {
        Data d = new Data();

        int rowsPerPage = parameters.getInt("_rowsperpage");
        int fromRow = rowsPerPage * parameters.getInt("_currentpageindex");
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

                int numRows = q.getMaxResults();
                //d.set("_data_currentpageindex", from);
                d.set("_data_pagecount", numRows / rowsPerPage + ((numRows % rowsPerPage == 0)?0:1));
            }
        });


        return d;

    }


    public static int executeUpdate(String jpaql) throws Throwable {
        final int[] r = {0};
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                if (jpaql.startsWith("delete")) {
                    for (Object o : em.createQuery(jpaql.replaceFirst("delete", "select x")).getResultList()) {

                        for (Field f : getAllFields(o.getClass())) {
                            if (f.getType().isAnnotationPresent(Entity.class)) {
                                Object v = o.getClass().getMethod(getGetter(f)).invoke(o);
                                if (v != null) {
                                    Field parentField = null;
                                    for (Field ff : getAllFields(f.getType())) {
                                        try {
                                            if (ff.isAnnotationPresent(OneToMany.class) && ((ParameterizedType) ff.getGenericType()).getActualTypeArguments()[0].equals(o.getClass())) {
                                                OneToMany a = ff.getAnnotation(OneToMany.class);
                                                if (f.getName().equals(a.mappedBy())) parentField = ff;
                                            }
                                        } catch (Exception e) {

                                        }
                                    }
                                    if (parentField != null) {
                                        if (parentField.isAnnotationPresent(MapKey.class)) {
                                            String keyFieldName = parentField.getAnnotation(MapKey.class).name();
                                            Field keyField = o.getClass().getDeclaredField(keyFieldName);
                                            Object key = o.getClass().getMethod(getGetter(keyField)).invoke(o);
                                            Map m = (Map) v.getClass().getMethod(getGetter(parentField)).invoke(v);
                                            if (m.containsKey(key)) m.remove(key);
                                        } else {
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


    public static List<Field> getAllFields(Class c) {
        List<Field> l = new ArrayList<>();

        if (c.getSuperclass() != null && c.getSuperclass().isAnnotationPresent(Entity.class)) l.addAll(getAllFields(c.getSuperclass()));

        for (Field f : c.getDeclaredFields()) l.add(f);

        return l;
    }


    public static String getGetter(Field f) {
        return (("boolean".equals(f.getType().getName()) || Boolean.class.equals(f.getType()))?"is":"get") + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }

    public static String getSetter(Field f) {
        return "set" + f.getName().substring(0, 1).toUpperCase() + f.getName().substring(1);
    }

}
