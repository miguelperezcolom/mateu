package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import io.mateu.mdd.shared.annotations.SameLine;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.Callable;

@Getter@Setter@Slf4j
public class RunnableFieldForm {

    private static String lastRun = "Not run yet";

    private String name;

    private int age;

    @SameLine
    private Runnable runnable = () -> {
        log.info(getClass().getSimpleName() + ".run()");
        if ("Not run yet".equals(lastRun)) lastRun = "";
        else lastRun += "|";
        lastRun += "runned for " + name + "," + age;
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
