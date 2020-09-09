package io.mateu.showcase.tester.model.tests;

import io.mateu.showcase.test.model.Entidad;
import io.mateu.showcase.tester.model.pojos.SamplePOJO;
import io.mateu.showcase.tester.model.useCases.hotel.Booking;
import io.mateu.showcase.tester.model.useCases.hotel.HotelCategory;

public class CustomLombokTester {

    public static void main(String[] args) {

        SamplePOJO p = new SamplePOJO();
        System.out.println(p.hashCode());
        System.out.println(p.getClass().hashCode());

        Booking b = new Booking();

        System.out.println("******************************");

        System.out.println(b.hashCode());
        System.out.println(b.getClass().hashCode());

        System.out.println("******************************");
        System.out.println("*** deben ser iguales ***");
        System.out.println("******************************");


        Booking b1 = new Booking();
        b1.setId(10);
        Booking b2 = new Booking();
        b2.setId(10);
        Booking b3 = new Booking();
        b3.setId(11);
        Booking b4 = new Booking();
        Booking b5 = new Booking();

        System.out.println(b1.equals(b1));
        System.out.println(b1.equals(b2));
        System.out.println(b1.equals(b3));
        System.out.println(b4.equals(b4));
        System.out.println(b4.equals(b5));

        System.out.println("******************************");

        HotelCategory c1 = new HotelCategory();
        c1.setCode("a");
        HotelCategory c2 = new HotelCategory();
        c2.setCode("a");
        HotelCategory c3 = new HotelCategory();
        c3.setCode("b");
        HotelCategory c4 = new HotelCategory();
        HotelCategory c5 = new HotelCategory();
        System.out.println(c1.equals(c1));
        System.out.println(c1.equals(c2));
        System.out.println(c1.equals(c3));
        System.out.println(c4.equals(c4));
        System.out.println(c4.equals(c5));

        System.out.println("******************************");
        System.out.println("******************************");
        System.out.println("*** deben ser ***");
        System.out.println("true");
        System.out.println("true");
        System.out.println("false");
        System.out.println("true");
        System.out.println("false");
        System.out.println("******************************");

        Entidad e = new Entidad("aaaaaaa");
        e.setId(3);
        System.out.println(e.toString());

        e = new Entidad("xxxxxxxxxx");
        e.setId(3);
        System.out.println(e.toString());
    }

}
