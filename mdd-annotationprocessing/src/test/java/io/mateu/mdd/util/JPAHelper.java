package io.mateu.mdd.util;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;

public class JPAHelper {

    public static void transact(JPATransaction t) throws Throwable {
    }

    public static void notransact(JPATransaction t) throws Throwable {
    }


    public static <T> T find(Class<T> type, Object id) throws Throwable {
        return null;
    }

    public static <T> List<T> findAll(EntityManager em, Class<T> type) throws Throwable {
        return null;
    }



    public static <T> void deleteWithId(EntityManager em, Class<T> type, Object id) {
    }

    public static <T> T find(EntityManager em, Class<T> type, Object... params) {
        return null;
    }

    public static <T> List<T> list(EntityManager em, Class<T> type, Object... params) {
        return null;
    }

    public static <T> void delete(EntityManager em, Class<T> type, Object... params) {
    }

    public static <T> int count(EntityManager em, Class<T> type) {
        return 0;
    }

    public static <T> int count(EntityManager em, Class<T> type, Object... params) {
        return 0;
    }
}
