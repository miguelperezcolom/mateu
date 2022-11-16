package io.mateu.util.persistence;

import io.mateu.util.Helper;
import io.mateu.util.IJPAHelper;
import io.mateu.util.JPAHelperImpl;
import io.mateu.util.runnable.RunnableThrowsThrowable;
import org.jinq.jpa.JinqJPAStreamProvider;

import javax.persistence.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class JPAHelper {

    static IJPAHelper impl;

    public static IJPAHelper get() {
        if (impl == null) {
            try {
                impl = new JPAHelperImpl();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return impl;
    }

    public static void set(IJPAHelper i) {
        impl = i;
    }

    public static void transact(JPATransaction t) throws Throwable {
        get().transact(t);
    }

    public static void transact(JPATransaction t, RunnableThrowsThrowable callback) throws Throwable {
        get().transact(t, callback);
    }

    public static void transact(String persistenceUnit, JPATransaction t) throws Throwable {
        get().transact(persistenceUnit, t);
    }

    public static void transact(String persistenceUnit, JPATransaction t, RunnableThrowsThrowable callback) throws Throwable {
        get().transact(persistenceUnit, t, callback);
    }

    public static void closeEMFs() {
        get().closeEMFs();
    }

    public static void setEMF(EntityManagerFactory f) {
        get().setEMF(f);
    }

    public static EntityManagerFactory getEMF() {
        return get().getEMF();
    }


    public static EntityManagerFactory getEMF(String persistenceUnit) {
        return get().getEMF(persistenceUnit);
    }

    public static void notransact(JPATransaction t) throws Throwable {
        get().notransact(t);
    }

    public static void notransact(JPATransaction t, boolean printException) throws Throwable {
        get().notransact(t, printException);
    }

    public static void notransact(String persistenceUnit, JPATransaction t) throws Throwable {
        get().notransact(persistenceUnit, t);
    }

    public static void notransact(String persistenceUnit, JPATransaction t, boolean printException) throws Throwable {
        get().notransact(persistenceUnit, t, printException);
    }


    public static <T> T find(Class<T> type, Object id) throws Throwable {
        return get().find(type, id);
    }

    public static <T> List<T> findAll(EntityManager em, Class<T> type) throws Throwable {
        return get().findAll(em, type);
    }

    public static <T> List<T> findAll(Class<T> type) throws Throwable {
        return get().findAll(type);
    }

    public static <T> List<T> getAll(Class<T> type) {
        return get().getAll(type);
    }

    public static <T> T get(Class<T> type, Object id) {
        return get().get(type, id);
    }

    public static JinqJPAStreamProvider getStreams() {
        return get().getStreams();
    }

    public static JinqJPAStreamProvider getStreams(String persistenceUnit) {
        return get().getStreams(persistenceUnit);
    }



    public static <T> Optional<T> selectValue(String jpql) throws Throwable {
        return get().selectValue(jpql);
    }


    public static <T> Optional<T> selectValue(String jpql, Map<String, Object> params) throws Throwable {
        return get().selectValue(jpql, params);
    }


    public static List selectObjects(String jpql) throws Throwable {
        return get().selectObjects(jpql);
    }


    public static List selectObjects(String jpql, Map<String, Object> params) throws Throwable {
        return get().selectObjects(jpql, params);
    }

    public static List selectObjects(String jpql, Class targetClass) throws Throwable {
        return get().selectObjects(jpql, targetClass);
    }

    public static List selectObjects(String jpql, Map<String, Object> params, Class targetClass) throws Throwable {
        return get().selectObjects(jpql, params, targetClass);
    }

    //todo: sql nativo

    public static List<Object[]> nativeSelect(String sql) throws Throwable {
        return get().nativeSelect(sql);
    }

    public static Object nativeSelectValue(String sql) throws Throwable {
        return get().nativeSelectValue(sql);
    }

    public static List<Object[]> sqlSelectPage(String jpql, int offset, int limit) throws Throwable {
        return get().sqlSelectPage(jpql, offset, limit);
    }

    //todo: sql nativo
    public static int sqlCount(String sql) throws Throwable {
        return get().sqlCount(sql);
    }

    public static String runNativeSqlUpdate(String sql) throws Throwable {
        return get().runNativeSqlUpdate(sql);
    }






    public static <T> void deleteWithId(EntityManager em, Class<T> type, Object id) {
        get().deleteWithId(em, type, id);
    }

    public static <T> T find(EntityManager em, Class<T> type, Object... params) {
        return get().find(em, type, params);
    }

    public static <T> T find(Class<T> type, Object... params) {
        return get().find(type, params);
    }

    private static <T> TypedQuery<T> createQuery(EntityManager em, Class<T> type, Object[] params) {
        return get().createQuery(em, type, params);
    }

    public static <T> List<T> list(EntityManager em, Class<T> type, Object... params) {
        return get().list(em, type, params);
    }

    public static <T> void delete(EntityManager em, Class<T> type, Object... params) {
        get().delete(em, type, params);
    }

    public static <T> int count(EntityManager em, Class<T> type) {
        return get().count(em, type);
    }

    public static <T> int count(EntityManager em, Class<T> type, Object... params) {
        return get().count(em, type, params);
    }

    private static <T> TypedQuery<T> createQueryForCount(EntityManager em, Class<T> type, Object[] params) {
        return get().createQueryForCount(em, type, params);
    }

    public static void update(Object a, String fieldName, Object value) {
        get().update(a, fieldName, value);
    }

}
