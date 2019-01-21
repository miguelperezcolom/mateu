package io.mateu.mdd.tester.app.club.model;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;

import java.util.List;

public class Tester {

    public static void main(String[] args) {
        test1();


        try {
            Thread.sleep(1000l);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        WorkflowEngine.exit(0);
    }

    private static void test1() {

        try {
            Helper.transact(em -> {


                Subscripcion s = ((List<Subscripcion>) em.createQuery("select x from " + Subscripcion.class.getName() + " x").getResultList()).get(0);
                s.setImporte(System.currentTimeMillis() % 100000 / 100d);
                if (!s.isConfirmada()) s.setConfirmada(true);

                //((List<Pago>)em.createQuery("select x from " + Pago.class.getName() + " x").getResultList()).get(0).setImporte(System.currentTimeMillis() % 100000 / 100d);


            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

}
