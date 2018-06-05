package io.mateu.mdd.vaadinport.vaadin.tests;

public class JavafxBidingTester {


    public static void main(String[] args) {
        test1();

        test2();
    }

    private static void test2() {

        Persona p0 = new Persona();

        p0.setNombre("Mateu");
        p0.setApellidos("Pérez");
        p0.setEdad(10);

        System.out.println(p0);

        BeanPathAdapter<Persona> ppa0 = new BeanPathAdapter<>(p0);

        Persona p1 = new Persona();




    }

    private static void test1() {

        Persona p = new Persona();

        p.setNombre("Mateu");
        p.setApellidos("Pérez");
        p.setEdad(10);

        System.out.println(p);

    }


}
