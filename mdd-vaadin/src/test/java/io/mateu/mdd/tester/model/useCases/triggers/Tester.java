package io.mateu.mdd.tester.model.useCases.triggers;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
public class Tester {

    public static void main(String[] args) {
        test1();

        //test2();

        WorkflowEngine.exit(0);
    }

    private static void test2() {

        try {
            Helper.transact(em -> {

                Part p = ((List<Part>) Helper.selectObjects("select x from " + Part.class.getName() + " x")).stream().findFirst().get();
                p = em.merge(p);
                p.setValue(System.currentTimeMillis() % 1000);
                log.debug("antes del merge");
                log.debug("depués del merge");

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    private static void test1() {

        long id;

        try {
            Product p = new Product();
            Helper.transact(em -> {

                p.setName("Producto " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));

                for (int i = 0; i < 3; i++) {
                    Part part;
                    p.getParts().add(part = new Part());
                    part.setProduct(p);
                    part.setName("Parte " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
                    part.setValue(System.currentTimeMillis() % 1000);
                }

                em.persist(p);

            });

            id = p.getId();


            Helper.transact(em -> {
                log.debug("aux=" + em.find(Product.class, id).getAux());
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

}
