package io.mateu.util;

import javax.persistence.EntityManager;

public interface JPATransaction {
    void run(EntityManager em) throws Throwable;
}
