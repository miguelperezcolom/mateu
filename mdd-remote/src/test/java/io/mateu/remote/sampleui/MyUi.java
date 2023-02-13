package io.mateu.remote.sampleui;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Action;
import lombok.Getter;
import lombok.Setter;

@MateuUI(path = "")
@Getter@Setter
public class MyUi {

    private String name = "Mateu";

    private int age;

    private String assessment;

    @Action
    private void assess() {
        assessment = "All good!";
    }

    public String toString() {
        return "This is a sample form";
    }

}
