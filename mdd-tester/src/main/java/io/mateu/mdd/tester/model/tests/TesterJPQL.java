package io.mateu.mdd.tester.model.tests;

import io.mateu.mdd.core.util.Helper;

import javax.persistence.Query;
import java.util.List;

public class TesterJPQL {

    public static void main(String[] args) throws Throwable {

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

}
