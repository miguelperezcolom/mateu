package io.mateu.mdd.tester.model.entities.population;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;

import javax.persistence.EntityManager;

public class Populator {

    public static void main(String[] args) throws Throwable {

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                for (int i = 1000; i < 12000; i++) {
                    BasicFieldsDemoEntity o = new BasicFieldsDemoEntity();
                    o.setIntField(i);
                    o.setStringField("Objeto básico " + i);
                    o.setLongField(i * 2);
                    o.setDoubleField(i / 2);
                    em.persist(o);
                }

            }
        });

    }
}
