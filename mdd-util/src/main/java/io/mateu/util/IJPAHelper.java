package io.mateu.util;

import io.mateu.util.persistence.JPATransaction;
import io.mateu.util.runnable.RunnableThrowsThrowable;
import org.jinq.jpa.JinqJPAStreamProvider;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.TypedQuery;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IJPAHelper {
    void transact(JPATransaction t) throws Throwable;

    void transact(JPATransaction t, RunnableThrowsThrowable callback) throws Throwable;

    void transact(String persistenceUnit, JPATransaction t) throws Throwable;

    void transact(String persistenceUnit, JPATransaction t, RunnableThrowsThrowable callback) throws Throwable;

    void closeEMFs();

    void setEMF(EntityManagerFactory f);

    EntityManagerFactory getEMF();

    EntityManagerFactory getEMF(String persistenceUnit);

    void notransact(JPATransaction t) throws Throwable;

    void notransact(JPATransaction t, boolean printException) throws Throwable;

    void notransact(String persistenceUnit, JPATransaction t) throws Throwable;

    void notransact(String persistenceUnit, JPATransaction t, boolean printException) throws Throwable;

    <T> T find(Class<T> type, Object id) throws Throwable;

    <T> List<T> findAll(EntityManager em, Class<T> type) throws Throwable;

    <T> List<T> findAll(Class<T> type) throws Throwable;

    <T> List<T> getAll(Class<T> type);

    <T> T get(Class<T> type, Object id);

    JinqJPAStreamProvider getStreams();

    JinqJPAStreamProvider getStreams(String persistenceUnit);

    <T> Optional<T> selectValue(String jpql) throws Throwable;

    <T> Optional<T> selectValue(String jpql, Map<String, Object> params) throws Throwable;

    List selectObjects(String jpql) throws Throwable;

    List selectObjects(String jpql, Map<String, Object> params) throws Throwable;

    List selectObjects(String jpql, Class targetClass) throws Throwable;

    List selectObjects(String jpql, Map<String, Object> params, Class targetClass) throws Throwable;

    List<Object[]> nativeSelect(String sql) throws Throwable;

    Object nativeSelectValue(String sql) throws Throwable;

    List<Object[]> sqlSelectPage(String jpql, int offset, int limit) throws Throwable;

    //todo: sql nativo
    int sqlCount(String sql) throws Throwable;

    String runNativeSqlUpdate(String sql) throws Throwable;

    <T> void deleteWithId(EntityManager em, Class<T> type, Object id);

    <T> T find(EntityManager em, Class<T> type, Object... params);

    <T> T find(Class<T> type, Object... params);

    <T> TypedQuery<T> createQuery(EntityManager em, Class<T> type, Object[] params);

    <T> List<T> list(EntityManager em, Class<T> type, Object... params);

    <T> void delete(EntityManager em, Class<T> type, Object... params);

    <T> int count(EntityManager em, Class<T> type);

    <T> int count(EntityManager em, Class<T> type, Object... params);

    <T> TypedQuery<T> createQueryForCount(EntityManager em, Class<T> type, Object[] params);

    void update(Object a, String fieldName, Object value);
}
