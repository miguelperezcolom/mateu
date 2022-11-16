package io.mateu.util;

import com.google.auto.service.AutoService;
import io.mateu.mdd.shared.JPAAdapter;
import io.mateu.util.persistence.JPATransaction;
import io.mateu.util.runnable.RunnableThrowsThrowable;
import org.jinq.jpa.JinqJPAStreamProvider;

import javax.persistence.*;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.util.*;

@AutoService(IJPAHelper.class)
public class JPAHelperImpl implements IJPAHelper {

    private static Map<String, JinqJPAStreamProvider> streams = new HashMap<>();
    private static Map<String, EntityManagerFactory> emf = new HashMap<>();

    @Override
    public void transact(JPATransaction t) throws Throwable {
        transact(System.getProperty("defaultpuname", "default"), t, null);
    }

    @Override
    public void transact(JPATransaction t, RunnableThrowsThrowable callback) throws Throwable {
        transact(System.getProperty("defaultpuname", "default"), t, callback);
    }

    @Override
    public void transact(String persistenceUnit, JPATransaction t) throws Throwable {
        transact(persistenceUnit, t, null);
    }

    @Override
    public void transact(String persistenceUnit, JPATransaction t, RunnableThrowsThrowable callback) throws Throwable {

        try {

            EntityManager em = getEMF(persistenceUnit).createEntityManager();

            try {

                em.getTransaction().begin();

                t.run(em);

                em.getTransaction().commit();

            } catch (Throwable e) {

                e.printStackTrace();
                if (em.getTransaction().isActive()) em.getTransaction().rollback();
                em.close();
                e = e.getCause() != null && e.getCause() instanceof ConstraintViolationException ?e.getCause():e;
                if (e instanceof ConstraintViolationException) {
                    StringBuffer sb = new StringBuffer();
                    ((ConstraintViolationException)e).getConstraintViolations().forEach(v -> sb.append(("".equals(sb.toString())?"":"\n") + (v.getPropertyPath() != null?v.getPropertyPath().toString() + " ":"") + v.getMessage() + (v.getRootBeanClass() != null?" en " + v.getRootBeanClass().getSimpleName() + "":"")));
                    e = new Exception(sb.toString());
                }
                rethrow(e);

            }

            em.close();

        } catch (Throwable e) {
            rethrow(e.getCause() != null && e.getCause() instanceof ConstraintViolationException?e.getCause():e);
        }
    }

    public void rethrow(Throwable e) throws Throwable {
        if (e instanceof ConstraintViolationException) {
            StringBuffer sb = new StringBuffer();
            for (ConstraintViolation v : ((ConstraintViolationException)e).getConstraintViolations()) {
                if (sb.length() > 0) sb.append("\n");
                sb.append("" + v.getPropertyPath() + " " + v.getMessage() + " at " + Helper.capitalize(v.getRootBeanClass().getSimpleName()));
            }
            throw new Exception(sb.toString());
        } else throw e;
    }

    public void printStackTrace(Throwable e) {
        e.printStackTrace();
        if (e instanceof ConstraintViolationException) {
            StringBuffer sb = new StringBuffer();
            for (ConstraintViolation v : ((ConstraintViolationException)e).getConstraintViolations()) {
                if (sb.length() > 0) sb.append("\n");
                sb.append("" + v.getPropertyPath() + " " + v.getMessage() + " at " + Helper.capitalize(v.getRootBeanClass().getSimpleName()));
            }
            System.out.println(sb.toString());
        }
    }

    @Override
    public void closeEMFs() {
        emf.values().forEach(x -> {
            if (x.isOpen()) x.close();
        });
        emf.clear();
    }

    @Override
    public void setEMF(EntityManagerFactory f) {
        emf.put(System.getProperty("defaultpuname", "default"), f);
    }

    @Override
    public EntityManagerFactory getEMF() {
        return getEMF(System.getProperty("defaultpuname", "default"));
    }


    @Override
    public EntityManagerFactory getEMF(String persistenceUnit) {
        EntityManagerFactory v;
        if ((v = emf.get(persistenceUnit)) == null) {
            emf.put(persistenceUnit, v = Persistence.createEntityManagerFactory(persistenceUnit, System.getProperties()));
        }
        return v;
    }

    @Override
    public void notransact(JPATransaction t) throws Throwable {
        notransact(System.getProperty("defaultpuname", "default"), t, true);
    }

    @Override
    public void notransact(JPATransaction t, boolean printException) throws Throwable {
        notransact(System.getProperty("defaultpuname", "default"), t, printException);
    }

    @Override
    public void notransact(String persistenceUnit, JPATransaction t) throws Throwable {
        notransact(persistenceUnit, t, true);
    }

    @Override
    public void notransact(String persistenceUnit, JPATransaction t, boolean printException) throws Throwable {

        EntityManager em = getEMF(persistenceUnit).createEntityManager();

        try {

            t.run(em);

        } catch (Exception e) {
            if (printException) e.printStackTrace();
            em.close();
            throw e;
        }

        em.close();

    }


    @Override
    public <T> T find(Class<T> type, Object id) throws Throwable {
        Object[] o = {null};
        notransact(em -> {
            o[0] = em.find(type, id);
        });
        return (T) o[0];
    }

    @Override
    public <T> List<T> findAll(EntityManager em, Class<T> type) throws Throwable {
        return em.createQuery("select x from " + type.getName() + " x").setFlushMode(FlushModeType.COMMIT).getResultList();
    }

    @Override
    public <T> List<T> findAll(Class<T> type) throws Throwable {
        List<T> l = new ArrayList<>();
        notransact(em -> {
            l.addAll(findAll(em, type));
        });
        return l;
    }

    @Override
    public <T> List<T> getAll(Class<T> type) {
        try {
            return findAll(type);
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return new ArrayList<>();
    }

    @Override
    public <T> T get(Class<T> type, Object id) {
        try {
            return find(type, id);
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return null;
    }

    @Override
    public JinqJPAStreamProvider getStreams() {
        return getStreams(System.getProperty("defaultpuname", "default"));
    }

    @Override
    public JinqJPAStreamProvider getStreams(String persistenceUnit) {
        JinqJPAStreamProvider s = streams.get(persistenceUnit);
        if (s == null) {
            streams.put(persistenceUnit, s = new JinqJPAStreamProvider(getEMF(persistenceUnit)));
        }
        return s;
    }



    @Override
    public <T> Optional<T> selectValue(String jpql) throws Throwable {
        return selectValue(jpql, null);
    }


    @Override
    public <T> Optional<T> selectValue(String jpql, Map<String, Object> params) throws Throwable {
        List<T> l = selectObjects(jpql, params);
        return Optional.of(l.size() > 0?l.get(0):null);
    }


    @Override
    public List selectObjects(String jpql) throws Throwable {
        return selectObjects(jpql, new HashMap<>());
    }


    @Override
    public List selectObjects(String jpql, Map<String, Object> params) throws Throwable {
        List l = new ArrayList<>();

        notransact(em -> {

            Query q = em.createQuery(jpql);
            Helper.getImpl(JPAAdapter.class).hint(q);

            if (params != null) {
                for (String k : params.keySet()) q.setParameter(k, params.get(k));
            }

            l.addAll(q.getResultList());


        });

        return l;
    }

    @Override
    public List selectObjects(String jpql, Class targetClass) throws Throwable {
        return selectObjects(jpql, new HashMap<>(), targetClass);
    }

    @Override
    public List selectObjects(String jpql, Map<String, Object> params, Class targetClass) throws Throwable {
        List l = new ArrayList<>();

        notransact(em -> {

            Query q = em.createQuery(jpql, targetClass);
            Helper.getImpl(JPAAdapter.class).hint(q);

            if (params != null) {
                for (String k : params.keySet()) q.setParameter(k, params.get(k));
            }


            l.addAll(q.getResultList());

        });

        return l;
    }

    //todo: sql nativo

    @Override
    public List<Object[]> nativeSelect(String sql) throws Throwable {
        List<Object[]> list = new ArrayList<>();

        notransact(em -> {

            Query q = em.createNativeQuery(sql);
            list.addAll(q.getResultList());

        });

        return list;
    }

    @Override
    public Object nativeSelectValue(String sql) throws Throwable {
        List<Object[]> list = new ArrayList<>();

        notransact(em -> {

            Query q = em.createNativeQuery(sql);
            list.addAll(q.getResultList());

        });

        return list.size() > 0?(list.get(0) instanceof Object[]?list.get(0)[0]:list.get(0)):null;
    }

    @Override
    public List<Object[]> sqlSelectPage(String jpql, int offset, int limit) throws Throwable {
        List<Object[]> list = new ArrayList<>();

        notransact(em -> {

            Query q = em.createQuery(jpql);

            q.setFirstResult(offset);
            q.setMaxResults(limit);
            Helper.getImpl(JPAAdapter.class).hint(q);


            list.addAll(q.getResultList());

        });

        return list;
    }

    //todo: sql nativo
    @Override
    public int sqlCount(String sql) throws Throwable {
        int[] count = {0};

        notransact(em -> {

            String countjpql = "select count(*) from (" + sql + ") xxx";
            Query q = em.createQuery(countjpql);
            Helper.getImpl(JPAAdapter.class).hint(q);
            count[0] = ((Long)q.getSingleResult()).intValue();


        });

        return count[0];
    }

    @Override
    public String runNativeSqlUpdate(String sql) throws Throwable {
        StringBuffer sb = new StringBuffer();
        transact(em -> {
            System.out.println("running " + sql);
            int r = em.createNativeQuery(sql).executeUpdate();
            sb.append(r);
        });
        return sb.toString();
    }





    @Override
    public <T> void deleteWithId(EntityManager em, Class<T> type, Object id) {
        T o = em.find(type, id);
        if (o != null) em.remove(o);
    }

    @Override
    public <T> T find(EntityManager em, Class<T> type, Object... params) {
        TypedQuery<T> q = createQuery(em, type, params);
        return q.getSingleResult();
    }

    @Override
    public <T> T find(Class<T> type, Object... params) {
        Object[] o = {null};
        try {
            notransact(em -> {
                TypedQuery<T> q = createQuery(em, type, params);
                o[0] = q.getSingleResult();
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return (T) o[0];
    }

    @Override
    public <T> TypedQuery<T> createQuery(EntityManager em, Class<T> type, Object[] params) {
        CriteriaBuilder b = em.getCriteriaBuilder();
        CriteriaQuery<T> cq = b.createQuery(type);
        Root<T> root = cq.from(type);
        int pos = 0;
        Object o0 = null;
        List<Predicate> predicados = new ArrayList<>();
        for (Object o : params) {
            if (pos > 0 && pos % 2 == 1) {
                predicados.add(b.equal(root.get("" + o0), o));
            } else {
                o0 = o;
            }
            pos++;
        }
        Predicate todosLosPredicados = b.and(predicados.toArray(new Predicate[0]));
        TypedQuery<T> q = em.createQuery(cq.select(root).where(todosLosPredicados));
        return q;
    }

    @Override
    public <T> List<T> list(EntityManager em, Class<T> type, Object... params) {
        TypedQuery<T> q = createQuery(em, type, params);
        return q.getResultList();
    }

    @Override
    public <T> void delete(EntityManager em, Class<T> type, Object... params) {
        T o = find(em, type, params);
        if (o != null) em.remove(o);
    }

    @Override
    public <T> int count(EntityManager em, Class<T> type) {
        try {
            return findAll(type).size();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return 0;
    }

    @Override
    public <T> int count(EntityManager em, Class<T> type, Object... params) {
        return list(em, type, params).size();
    }

    @Override
    public <T> TypedQuery<T> createQueryForCount(EntityManager em, Class<T> type, Object[] params) {
        CriteriaBuilder b = em.getCriteriaBuilder();
        CriteriaQuery<T> cq = b.createQuery(type);
        Root<T> root = cq.from(type);
        int pos = 0;
        Object o0 = null;
        List<Predicate> predicados = new ArrayList<>();
        for (Object o : params) {
            if (pos > 0 && pos % 2 == 1) {
                predicados.add(b.equal(root.get("" + o0), o));
            } else {
                o0 = o;
            }
            pos++;
        }
        Predicate todosLosPredicados = b.and(predicados.toArray(new Predicate[0]));
        TypedQuery<T> q = em.createQuery(cq.select(root).where(todosLosPredicados));
        return q;
    }

    @Override
    public void update(Object a, String fieldName, Object value) {
        // debe actualizar la propiedad "fieldName" en el objeto a, con el valor value
        // resolviendo cualquier mapeado inverso, tanto en el valor anterior como en el nuevo valor
        //todo: implementar
    }

}
