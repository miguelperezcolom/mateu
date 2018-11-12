package io.mateu.mdd.tester.model.tests;

import io.mateu.mdd.core.util.Helper;

import javax.persistence.Query;
import java.util.List;
import java.util.Scanner;

public class JPQLTester {

    public static void main(String[] args) {

        Scanner in = new Scanner(System.in);

        String previousLines = "";
        String s = null;
        while (!(s = in.next()).equals("\\q")) {
            System.out.println("read:" + s);
            if (!s.contains(";")) {
                if (!"".equals(previousLines)) previousLines += "\n";
                previousLines += s;
            } else for (String t : s.split(";")) {
                String ql = previousLines;
                if (!"".equals(ql)) ql += "\n";
                ql += t;
                try {
                    String finalQl = ql;
                    Helper.transact(em -> {
                        Query q = em.createQuery(finalQl);
                        List l = q.getResultList();
                        System.out.println("l.size() = " + l.size());
                    });
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }
        }

    }

}
