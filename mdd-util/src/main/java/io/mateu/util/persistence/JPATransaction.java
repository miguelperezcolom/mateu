package io.mateu.util.persistence;

import javax.persistence.EntityManager;

public interface JPATransaction {
    void run(EntityManager em) throws Throwable;
}
