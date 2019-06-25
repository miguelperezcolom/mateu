package io.mateu.mdd.test;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.test.model.Entidad;
import org.junit.Test;

import java.util.List;
import java.util.concurrent.CountDownLatch;

import static junit.framework.TestCase.*;

public class WorkflowTest {


    @Test
    public void test1() throws Throwable {





        Helper.transact(em -> {

            em.persist(new Entidad());

        });

        assertEquals(1, Helper.selectObjects("select x from Entidad x").size());

        assertEquals(1, Helper.selectObjects("select x from Evento x").size());

        assertEquals(1, Helper.selectObjects("select x from Tarea x").size());


        Entidad x = ((List<Entidad>)Helper.selectObjects("select x from Entidad x")).get(0);

        System.out.println(x.getId() + " - " + x.getTrigger() + " - " + x.getLog().size());

        assertEquals(1, ((List<Entidad>)Helper.selectObjects("select x from Entidad x")).get(0).getLog().size());


    }



    @Test
    public void test2() throws Throwable {


        Helper.transact(em -> {

            em.persist(new Entidad());

        });

        int entidades = Helper.selectObjects("select x from Entidad x").size();

        System.out.println(entidades + " entidades");

        assertEquals(entidades, Helper.selectObjects("select x from Evento x").size());

        assertEquals(entidades, Helper.selectObjects("select x from Tarea x").size());


    }


    @Test
    public void test3() throws Throwable {

        {
            CountDownLatch l = new CountDownLatch(10);
            for (int i = 0; i < 10; i++) {
                Thread t = new Thread(() -> {

                    try {
                        Helper.transact(em -> {

                            em.persist(new Entidad());

                        });
                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
                    }
                    l.countDown();
                });
                t.start();
            }

            l.await();
        }

        {
            CountDownLatch l = new CountDownLatch(10);
            for (int i = 0; i < 10; i++) {
                Thread t = new Thread(() -> {

                    try {
                        Helper.transact(em -> {

                            em.persist(new Entidad());

                        });
                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
                    }
                    l.countDown();
                });
                t.start();
            }

            l.await();
        }


        int entidades = Helper.selectObjects("select x from Entidad x").size();

        System.out.println(entidades + " entidades");

        assertEquals(entidades, Helper.selectObjects("select x from Evento x").size());

        assertEquals(entidades, Helper.selectObjects("select x from Tarea x").size());


    }
}
