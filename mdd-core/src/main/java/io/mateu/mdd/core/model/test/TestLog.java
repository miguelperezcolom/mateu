package io.mateu.mdd.core.model.test;

import java.util.ArrayList;
import java.util.List;

public class TestLog {

    static List<String> messages = new ArrayList<>();

    public static void add(String message) {
        System.out.println("-->" + message);
        messages.add(message);
    }

    public static void clear() {
        messages.clear();
    }

    public static List<String> get() {
        return messages;
    }

}
