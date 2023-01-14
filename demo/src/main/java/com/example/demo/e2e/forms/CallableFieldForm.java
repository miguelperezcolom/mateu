package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import java.util.concurrent.Callable;

@Getter@Setter
public class CallableFieldForm {

    private static String lastRun = "Not run yet";

    private String name;

    private int age;

    private Callable<String> callable = () -> {
        System.out.println(getClass().getSimpleName() + ".run()");
        if ("Not run yet".equals(lastRun)) lastRun = "";
        else lastRun += "|";
        String msg;
        lastRun += msg = "runned for " + name + "," + age;
        return msg;
    };

    @Output
    private String allRecordedRuns;

    public String getAllRecordedRuns() {
        return lastRun;
    }

    @Action
    public void reset() {
        lastRun = "Not run yet";
    }

}
