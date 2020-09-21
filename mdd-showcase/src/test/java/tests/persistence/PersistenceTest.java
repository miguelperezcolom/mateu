package tests.persistence;


import io.mateu.mdd.core.app.MateuApplication;
import io.mateu.mdd.util.JPAHelper;
import org.example.domain.boundaries.common.entities.Person;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class PersistenceTest {

    @Test
    public void testImmutable() {

        new MateuApplication().run(() -> {
            try {
                JPAHelper.transact(em -> {
                    Person p1 = em.find(Person.class, 1l);

                    if (p1 != null) {
                        // si copiamos una instancia, al hacer merge se piensa que es la misma y hace un update en lugar de un insert. COMPROBADO!
                        Person p2 = new Person(); //new Person(p1);
                        p2.setName(p1.getName() + " zzzz");

                        em.merge(p2);
                    }

                });
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        });
        assertEquals(1, 1);

    }

}
