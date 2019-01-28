package io.mateu.mdd.core.util;

import javax.persistence.EntityManager;

public interface JPATransaction {
    void run(EntityManager var1) throws Throwable;
}
