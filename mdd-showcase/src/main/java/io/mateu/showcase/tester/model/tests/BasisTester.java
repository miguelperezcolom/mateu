package io.mateu.showcase.tester.model.tests;

import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.workflow.WorkflowEngine;
import io.mateu.showcase.tester.model.entities.inmutables.HijoInmutable;
import io.mateu.showcase.tester.model.entities.inmutables.Inmutable;
import io.mateu.showcase.tester.model.entities.inmutables.PadreInmutable;
import io.mateu.showcase.tester.model.entities.mergeables.HijoMergeable;
import io.mateu.showcase.tester.model.entities.mergeables.PadreMergeable;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class BasisTester {

    public static void main(String[] args) {
        testInmutabilidad1();

        testPropagacion();

        testInmutabilidad2();

        WorkflowEngine.exit(0);
    }

    private static void testPropagacion() {

        PadreMergeable p = new PadreMergeable("Miguel", 10);
        HijoMergeable h;
        p.getHijos().add(h = new HijoMergeable(p, "Mateu", 9));

        try {
            Helper.transact(em -> {

                em.persist(p);

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        log.debug("*******************************");
        log.debug("" + p);
        log.debug("*******************************");

        try {
            Helper.transact(em -> {

                h.setTotal(11);
                em.merge(h);

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.notransact(em -> {

                log.debug("*******************************");
                PadreMergeable p2;
                log.debug("" + (p2 = em.find(PadreMergeable.class, p.getId())));
                log.debug("" + p2.getHijos().get(0));
                log.debug("*******************************");

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    private static void testInmutabilidad1() {

        Inmutable i = new Inmutable("Mateu", 11);

        try {
            Helper.transact(em -> {

                em.persist(i);


            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.notransact(em -> {

                log.debug("" + em.find(Inmutable.class, i.getId()));


            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    private static void testInmutabilidad2() {

        PadreInmutable p = new PadreInmutable("Miguel", 10);
        HijoInmutable h;
        p.setHijos(Helper.extend(p.getHijos(), h = new HijoInmutable(p, "Mateu", 9)));

        try {
            Helper.transact(em -> {

                em.persist(p);

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        log.debug("*******************************");
        log.debug("" + p);
        log.debug("*******************************");

        try {
            Helper.notransact(em -> {

                HijoInmutable x = em.find(HijoInmutable.class, h.getId());

                log.debug("----------------------------");

                log.debug(x.getNombre());

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        log.debug("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        Helper.getEMF().getCache().evictAll();

        try {
            Helper.notransact(em -> {

                HijoInmutable x = em.find(HijoInmutable.class, h.getId());

                log.debug("----------------------------");

                log.debug(x.getNombre());

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        log.debug("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        Helper.getEMF().getCache().evictAll();

        try {
            Helper.notransact(em -> {

                PadreInmutable x = em.find(PadreInmutable.class, p.getId());

                log.debug("----------------------------");

                log.debug(x.getNombre());

                log.debug("----------------------------");

                log.debug("" + x.getHijos().size());

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }
}
