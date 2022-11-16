package io.mateu.util;


import io.mateu.util.ddd.DDDContext;
import io.mateu.util.ddd.DDDTransaction;
import io.mateu.util.persistence.JPAHelper;

public class DDDHelper {

    public static void transact(DDDTransaction t) throws Throwable {
        transact(System.getProperty("defaultpuname", "default"), t);
    }

    public static void transact(String persistenceUnit, DDDTransaction t) throws Throwable {
        JPAHelper.transact(persistenceUnit, em -> {
            DDDContext ctx = new DDDContext(em);
            t.run(ctx);
        }, null);
    }

    public static void notransact(DDDTransaction t) throws Throwable {
        notransact(System.getProperty("defaultpuname", "default"), t);
    }

    public static void notransact(String persistenceUnit, DDDTransaction t) throws Throwable {
        JPAHelper.transact(persistenceUnit, em -> {
            DDDContext ctx = new DDDContext(em);
            t.run(ctx);
        }, null);
    }

}
