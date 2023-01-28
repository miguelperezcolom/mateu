package com.example.demo.e2e.forms;

import io.mateu.mdd.core.interfaces.Button;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Getter@Setter@Slf4j
public class ButtonFieldForm {

    private static String lastRun = "Not run yet";

    private String name;

    private int age;

    private Button button = new Button("Hello button!", () -> {
        log.info(getClass().getSimpleName() + ".run()");
        if ("Not run yet".equals(lastRun)) lastRun = "";
        else lastRun += "|";
        lastRun += "runned for " + name + "," + age;
    });

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
