package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Getter@Setter@Slf4j
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
        log.info(getClass().getSimpleName() + ".run()");
        if ("Not run yet".equals(lastRun)) lastRun = "";
        else lastRun += "|";
        lastRun += "runned for " + name + "," + age;
    }

    @Action
    public void reset() {
        lastRun = "Not run yet";
    }
}
