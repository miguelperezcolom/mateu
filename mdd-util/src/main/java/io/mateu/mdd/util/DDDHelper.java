package io.mateu.mdd.util;

import io.mateu.mdd.util.ddd.DDDContext;
import io.mateu.mdd.util.ddd.DDDTransaction;

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
