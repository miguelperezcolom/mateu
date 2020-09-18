package tests.persistence;


import io.mateu.mdd.core.app.MateuApplication;
import io.mateu.mdd.util.JPAHelper;
import io.mateu.showcase.domain.boundedContexts.common.model.Person;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class PersistenceTest {

    @Test
    public void testImmutable() {

        new MateuApplication().run(() -> {
            try {
                JPAHelper.transact(em -> {
                    Person p1 = em.find(Person.class, 1l);

                    Person p2 = new Person(p1);
                    p2.setAge(10);
                    p2.setName(p1.getName() + " zzzz");

                    em.merge(p2);
                });
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        });
        assertEquals(1, 1);

    }

}
