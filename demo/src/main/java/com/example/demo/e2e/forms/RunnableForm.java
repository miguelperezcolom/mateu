package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class RunnableForm implements Runnable {

    private static String lastRun = "Not run yet";

    private String name;

    private int age;

    @Output
    private String allRecordedRuns;

    public String getAllRecordedRuns() {
        return lastRun;
    }

    @Override
    public void run() {
        System.out.println(getClass().getSimpleName() + ".run()");
        if ("Not run yet".equals(lastRun)) lastRun = "";
        else lastRun += "|";
        lastRun += "runned for " + name + "," + age;
    }

    @Action
    public void reset() {
        lastRun = "Not run yet";
    }
}
