package tests;

import io.mateu.mdd.util.Helper;
import io.mateu.showcase.test.model.Hijo;
import io.mateu.showcase.test.model.Padre;
import org.junit.Assert;
import org.junit.Test;

import java.util.List;

public class MergeTestTest {


    @Test
    public  void test1() {

        Padre p = new Padre("Miguel");
        p.setHijos(List.of(new Hijo(p, "Mateu")));

        try {
            Helper.transact(em -> {
                em.persist(p);
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        Hijo[] h = new Hijo[1];

        try {
            Helper.transact(em -> {
                h[0] = em.find(Hijo.class, p.getHijos().get(0).getId());
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        h[0].setSaldo(30);

        try {
            Helper.transact(em -> {
                em.merge(h[0]);
                //em.find(Padre.class, p.getId());
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        Assert.assertEquals(0, 0);
    }

}
