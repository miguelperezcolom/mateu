package io.mateu.mdd.tester.model.tests;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.tester.model.tests.mappings.maps.c10BasicEntityTransient.C10Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c10BasicEntityTransient.C10Son;
import io.mateu.mdd.tester.model.tests.mappings.maps.c11BasicEntityOneToManyWithKeyInInverseJoin.C11Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c11BasicEntityOneToManyWithKeyInInverseJoin.C11Son;
import io.mateu.mdd.tester.model.tests.mappings.maps.c2BasicBacsicSerializedInTable.C2Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c1BasicBacsicSerialized.C1Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c3BasicEntityWithoutMapKeyJoinColumn.C3Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c3BasicEntityWithoutMapKeyJoinColumn.C3Son;
import io.mateu.mdd.tester.model.tests.mappings.maps.c4BasicEntityWithMapKeyJoinColumn.C4Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c4BasicEntityWithMapKeyJoinColumn.C4Son;
import io.mateu.mdd.tester.model.tests.mappings.maps.c5BasicEntityWithJoinTable.C5Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c5BasicEntityWithJoinTable.C5Son;
import io.mateu.mdd.tester.model.tests.mappings.maps.c6BasicEntityManyToManyWithJoinTable.C6Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c6BasicEntityManyToManyWithJoinTable.C6Son;
import io.mateu.mdd.tester.model.tests.mappings.maps.c7BasicEntityManyToManyWithJoinTable2.C7Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c7BasicEntityManyToManyWithJoinTable2.C7Son;
import io.mateu.mdd.tester.model.tests.mappings.maps.c8BasicEntityManyToManyWithJoinTable3.C8Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c8BasicEntityManyToManyWithJoinTable3.C8Son;
import io.mateu.mdd.tester.model.tests.mappings.maps.c9BasicEntityOneToManyWithConverter.C9Parent;
import io.mateu.mdd.tester.model.tests.mappings.maps.c9BasicEntityOneToManyWithConverter.C9Son;

import java.util.HashMap;

public class MappingTester {

    public static void main(String[] args) {

        System.setProperty("javax.persistence.jdbc.url", "jdbc:postgresql://localhost:5432/mdd");
        System.setProperty("javax.persistence.jdbc.driver", "org.postgresql.Driver");
        System.setProperty("javax.persistence.jdbc.user", "postgres");
        System.setProperty("javax.persistence.jdbc.password", "aa");

        //testMapBasiBasicSerialized();
        //testMapBasiBasicSerializedInTable();
        //testMapBasiEntityWithoutMapKeyJoinColumn();
        //testMapBasiEntityWithMapKeyJoinColumn();
        //testMapBasiEntityWithJoinTable();
        //testMapBasicEntityManyToManyWithJoinTable();
        //testMapBasicEntityManyToManyWithJoinTable2();
        //testMapBasicEntityManyToManyWithAuxEntity();
        //testMapBasicEntityWithConverter();
        //testMapBasicEntityWithTransient();
        testMapBasicEntityWithElementCollectionWithForeignKey();

        WorkflowEngine.exit(0);
    }

    private static void testMapBasiBasicSerialized() {

        C1Parent p = new C1Parent();
        p.getValuesByKey().put("a", "A");
        p.getValuesByKey().put("b", "B");

        try {
            Helper.transact(em -> {
                em.persist(p);
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C1Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    private static void testMapBasiBasicSerializedInTable() {

        C2Parent p = new C2Parent();
        p.getValuesByKey().put("a", "A");
        p.getValuesByKey().put("b", "B");

        try {
            Helper.transact(em -> {
                em.persist(p);
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C2Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    private static void testMapBasiEntityWithoutMapKeyJoinColumn() {

        C3Parent p = new C3Parent();
        p.getSons().put("a", new C3Son("A"));
        p.getSons().put("b", new C3Son("B"));

        try {
            Helper.transact(em -> {
                em.persist(p);
                p.getSons().values().forEach(s -> em.persist(s));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C3Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }


    private static void testMapBasiEntityWithMapKeyJoinColumn() {

        C4Parent p = new C4Parent();
        p.getSons().put("a", new C4Son("A"));
        p.getSons().put("b", new C4Son("B"));

        try {
            Helper.transact(em -> {
                em.persist(p);
                p.getSons().values().forEach(s -> em.persist(s));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C4Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    private static void testMapBasiEntityWithJoinTable() {

        C5Parent p = new C5Parent();
        p.getSons().put("a", new C5Son("A"));
        p.getSons().put("b", new C5Son("B"));

        try {
            Helper.transact(em -> {
                em.persist(p);
                p.getSons().values().forEach(s -> em.persist(s));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C5Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    private static void testMapBasicEntityManyToManyWithJoinTable() {

        C6Parent p = new C6Parent();
        p.getSons().put("a", new C6Son("A"));
        p.getSons().put("b", new C6Son("B"));

        try {
            Helper.transact(em -> {
                em.persist(p);
                p.getSons().values().forEach(s -> em.persist(s));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C6Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    private static void testMapBasicEntityManyToManyWithJoinTable2() {

        C7Parent p = new C7Parent();
        p.getSons().put("a", new C7Son("A"));
        p.getSons().put("b", new C7Son("B"));

        try {
            Helper.transact(em -> {
                em.persist(p);
                p.getSons().values().forEach(s -> em.persist(s));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C7Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    private static void testMapBasicEntityManyToManyWithAuxEntity() {

        C8Parent p = new C8Parent();
        p.getSons().put("a", new C8Son("A"));
        p.getSons().put("b", new C8Son("B"));

        try {
            Helper.transact(em -> {
                em.persist(p);
                p.getSons().values().forEach(s -> em.persist(s));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C8Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }


    private static void testMapBasicEntityWithConverter() {

        C9Parent p = new C9Parent();
        p.getSons().put("a", new C9Son("A"));
        p.getSons().put("b", new C9Son("B"));

        try {
            Helper.transact(em -> {
                em.persist(p);
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        Helper.getEMF().getCache().evictAll();

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C9Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }



    private static void testMapBasicEntityWithTransient() {

        C10Parent p = new C10Parent();
        p.setSons(new HashMap(Helper.hashmap("a", new C10Son("A"), "b", new C10Son("B"))));

        try {
            Helper.transact(em -> {
                em.persist(p);
                p.getSons().values().forEach(s -> em.persist(s));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        Helper.getEMF().getCache().evictAll();

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C10Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        Helper.getEMF().getCache().evictAll();

        try {
            Helper.transact(em -> {
                em.find(C10Parent.class, p.getId()).setSons(new HashMap(Helper.hashmap("c", new C10Son("D"), "d", new C10Son("A"))));;
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }


        Helper.getEMF().getCache().evictAll();

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C10Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }


    }


    private static void testMapBasicEntityWithElementCollectionWithForeignKey() {

        C11Parent p = new C11Parent();
        p.setSons(new HashMap(Helper.hashmap("a", new C11Son("A"), "b", new C11Son("B"))));

        try {
            Helper.transact(em -> {
                em.persist(p);
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        Helper.getEMF().getCache().evictAll();

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C11Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        Helper.getEMF().getCache().evictAll();

        try {
            Helper.transact(em -> {
                C11Parent x = em.find(C11Parent.class, p.getId());
                x.getSons().put("zzzz", x.getSons().values().iterator().next());
                x.setSons(new HashMap<>(x.getSons()));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }


        Helper.getEMF().getCache().evictAll();

        try {
            Helper.transact(em -> {
                System.out.println(Helper.toJson(em.find(C11Parent.class, p.getId())));
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }


    }
}
