package io.mateu.mdd.core.test;

public class TestCaller {

    public static void println() {
        System.out.println("Hola!");
    }

    public static void withParameters(String param) {
        System.out.println("Hola " + param + "!");
    }

    public static int returnsInt() {
        System.out.println("Hola!");
        return 10;
    }

}
