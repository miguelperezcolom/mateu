package io.mateu.showcase.tester.app.simpleCase;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.FieldGroup;
import io.mateu.mdd.core.annotations.Html;
import io.mateu.mdd.core.annotations.IFrame;
import lombok.Getter;
import lombok.Setter;

import java.net.MalformedURLException;
import java.net.URL;

@Getter@Setter
public class SampleForm {

    private String email;

    @Html
    private String postscript;

    @FieldGroup("Preview")
    @IFrame
    private URL preview;

    public SampleForm() {
        try {
            preview = new URL("https://www.elpais.es");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
    }

    @Action
    public void hacerAlgo() {
        System.out.println("Hola!");
    }
}
