package io.mateu.mdd.tester.model.tests;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.model.entities.relations.OneToManyChildEntity;
import io.mateu.mdd.tester.model.entities.relations.OneToManyParentEntity;

import javax.persistence.Query;
import java.util.List;

public class TesterJPQL {

    public static void main(String[] args) throws Throwable {


        test2();

    }

    public static void test1() throws Throwable {
        Helper.transact(em -> {

            Query q = em.createQuery("select  x.id, x.id, x.name, x0.name, x1.name " +
                    " from io.mateu.mdd.tester.entities.relations.OneToOneReferenced x  " +
                    " left join x.referencer x1 " +
                    " left join x.referencerMapper x0 " +
                    "");


            List l = q.getResultList();


            System.out.println("l.size() = " + l.size());

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


            System.out.println("l.size() = " + l.size());

        });

    }

}
