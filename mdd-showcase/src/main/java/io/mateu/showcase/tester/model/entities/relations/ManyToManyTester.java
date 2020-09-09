package io.mateu.showcase.tester.model.entities.relations;

import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.workflow.WorkflowEngine;

import java.io.IOException;
import java.util.List;

public class ManyToManyTester {

    public static void main(String[] args) {


        try {
            String r = Helper.runCommand("dropdb -U postgres mdd");
            System.out.println(r);
            if (r.toLowerCase().contains("error")) {
                r = Helper.runCommand("psql -U postgres -c \"drop schema public cascade\" mdd");
                System.out.println(r);
                r = Helper.runCommand("psql -U postgres -c \"create schema public\" mdd");
            }
            else r = Helper.runCommand("createdb -U postgres mdd");
            System.out.println(r);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.setProperty("javax.persistence.jdbc.url", "jdbc:postgresql://localhost:5432/mdd");
        System.setProperty("javax.persistence.jdbc.driver", "org.postgresql.Driver");
        System.setProperty("javax.persistence.jdbc.user", "postgres");
        System.setProperty("javax.persistence.jdbc.password", "aa");


        try {
            Helper.transact(em -> {
                for (String n : List.of("a1", "a2", "a3", "a4", "a5")) {
                    ManyToManyASideEntity a = new ManyToManyASideEntity(n);
                    em.persist(a);
                }
                for (String n : List.of("b1", "b2", "b3", "b4", "b5")) {
                    ManyToManyBSideEntity b = new ManyToManyBSideEntity(n);
                    em.persist(b);
                }
            });


            Helper.transact(em -> {
                for (String n : List.of("a1", "a2")) {
                    ManyToManyASideEntity a = em.find(ManyToManyASideEntity.class, n);
                    for (String m : List.of("b3", "b4", "b5")) {
                        ManyToManyBSideEntity b = em.find(ManyToManyBSideEntity.class, m);

                        a.getManytomanysetmanytomanyset().add(b);
                        b.getManytomanysetmanytomanyset().add(a);

                    }
                }
            });


            Helper.transact(em -> {
                for (String n : List.of("a1", "a2")) {
                    ManyToManyASideEntity a = em.find(ManyToManyASideEntity.class, n);
                    for (String m : List.of("b3", "b4", "b5")) {
                        ManyToManyBSideEntity b = em.find(ManyToManyBSideEntity.class, m);

                        a.getManytomanylistmanytomanylist().add(b);
                        b.getManytomanylistmanytomanylist().add(a);

                    }
                }
            });


            Helper.transact(em -> {
                for (String n : List.of("a1", "a2")) {
                    ManyToManyASideEntity a = em.find(ManyToManyASideEntity.class, n);
                    for (String m : List.of("b3", "b4", "b5")) {
                        ManyToManyBSideEntity b = em.find(ManyToManyBSideEntity.class, m);

                        a.getManytomanylistonetomanylist().add(b);
                        b.getOnetomanylistmanytomanylist().add(a);

                    }
                }
            });


            Helper.transact(em -> {
                for (String n : List.of("a1", "a2")) {
                    ManyToManyASideEntity a = em.find(ManyToManyASideEntity.class, n);
                    for (String m : List.of("b3", "b4", "b5")) {
                        ManyToManyBSideEntity b = em.find(ManyToManyBSideEntity.class, m);

                        a.getManytomanylistmanytomanyset().add(b);
                        b.getManytomanysetmanytomanylist().add(a);

                    }
                }
            });

        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }


        WorkflowEngine.exit(0);
    }

}
