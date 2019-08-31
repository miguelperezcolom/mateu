package io.mateu.mdd.tester.model.tests;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.model.entities.relations.OneToManyChildEntity;
import io.mateu.mdd.tester.model.entities.relations.OneToManyParentEntity;
import io.mateu.mdd.tester.model.entities.relations.OneToOneReferenced;
import io.mateu.mdd.tester.model.useCases.hotel.Booking;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Query;
import java.util.List;

@Slf4j
public class TesterJPQL {

    public static void main(String[] args) throws Throwable {


        test3();

    }

    private static void test3() throws Throwable {

        Helper.notransact(em -> {

            String ql = "";

            ql += " select h.id, h.name, count(*) ";

            ql+= " from booking b inner join hotel h on h.id = b.hotel_id ";

            ql += " group by h.id, h.name ";
            ql += " order by h.name ";

            if (true) {
                ql = " select count(*) from (" + ql + ")";
            }

            Query q = em.createNativeQuery(ql);


            List l = q.getResultList();


            log.debug("l.size() = " + l.size());

        });

    }

    public static void test1() throws Throwable {
        Helper.transact(em -> {

            Query q = em.createQuery("select  x.id, x.id, x.name, x0.name, x1.name " +
                    " from " + OneToOneReferenced.class.getName() + " x  " +
                    " left join x.referencer x1 " +
                    " left join x.referencerMapper x0 " +
                    "");


            List l = q.getResultList();


            log.debug("l.size() = " + l.size());

        });

    }

    public static void test2() throws Throwable {

        Helper.notransact(em -> {

            OneToManyParentEntity p = em.find(OneToManyParentEntity.class, 1l);

            Query q = em.createQuery("select  x.id, x.id, x.stringField, x0 " +
                    //" from " + OneToManyParentEntity.class.getName() + " p inner join p.children x  " +
                    " from " + OneToManyChildEntity.class.getName() + " x" +
                    //", " + OneToManyParentEntity.class.getName() + " p  " +
                    " left join x.parent x0 " +
                    //" where x member of p.children " +
                    //" where x in (select q from " + OneToManyParentEntity.class.getName() + " p join p.children q where p = :z) " +
                    " where x in (select p.children from " + OneToManyParentEntity.class.getName() + " p where p = :z) " +
                    //" and p.id = " + p.getId() +
                    //" and p = :z " +
                    " ")
                    //.setParameter("col", p.getChildren())
                    .setParameter("z", p)
                    ;

            List l = q.getResultList();


            log.debug("l.size() = " + l.size());

        });

    }

}
