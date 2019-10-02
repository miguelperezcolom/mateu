package io.mateu.mdd.tester.model.tests;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.model.pojos.SamplePOJO;
import io.mateu.mdd.tester.model.useCases.hotel.Booking;

public class CustomLombokTester {

    public static void main(String[] args) {

        SamplePOJO p = new SamplePOJO();
        System.out.println(p.hashCode());
        System.out.println(p.getClass().hashCode());

        Booking b = new Booking();
        System.out.println(b.hashCode());
        System.out.println(b.getClass().hashCode());



        Booking b1 = new Booking();
        b1.setId(10);
        Booking b2 = new Booking();
        b2.setId(10);
        Booking b3 = new Booking();
        b3.setId(11);

        System.out.println(b1.equals(b1));
        System.out.println(b1.equals(b2));
        System.out.println(b1.equals(b3));

    }

}
