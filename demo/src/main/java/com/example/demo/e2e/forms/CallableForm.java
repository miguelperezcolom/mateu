package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import java.util.concurrent.Callable;

@Getter@Setter
public class CallableForm implements Callable<String> {

    private static String lastRun = "Not run yet";

    private String name;

    private int age;

    @Output
    private String allRecordedRuns;

    public String getAllRecordedRuns() {
        return lastRun;
    }

    @Action
    public void reset() {
        lastRun = "Not run yet";
    }

    @Override
    public String call() throws Exception {
        System.out.println(getClass().getSimpleName() + ".run()");
        if ("Not run yet".equals(lastRun)) lastRun = "";
        else lastRun += "|";
        String msg;
        lastRun += msg = "runned for " + name + "," + age;
        return msg;
    }
}
