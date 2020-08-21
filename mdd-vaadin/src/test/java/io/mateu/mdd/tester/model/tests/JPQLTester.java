package io.mateu.mdd.tester.model.tests;

import io.mateu.mdd.util.Helper;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Query;
import java.util.List;
import java.util.Scanner;

@Slf4j
public class JPQLTester {

    public static void main(String[] args) {

        Scanner in = new Scanner(System.in);

        String previousLines = "";
        String s = null;
        while (!(s = in.next()).equals("\\q")) {
            log.debug("read:" + s);
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
                        log.debug("l.size() = " + l.size());
                    });
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }
        }

    }

}
