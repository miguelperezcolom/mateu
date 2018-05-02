package io.mateu.mdd.model.pocs;

import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;

import javax.persistence.EntityManager;
import javax.persistence.FlushModeType;
import java.time.LocalDateTime;

public class Tester {

    public static void main(String[] args) throws Throwable {

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {


/*
                A a = new A();
                a.setName("Esto es una A " + LocalDateTime.now());

                em.persist(a);



                em.createQuery("select x from " + D.class.getName() + " x where x.name = :n").setParameter("n", "Hola").getSingleResult();


                D d = em.find(D.class, 1l);

                d.setName(d.getName() + ".");
*/


                D d = new D();
                d.setName("Test");
                em.persist(d);

            }
        });


    }
}
