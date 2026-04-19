package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;

@Route("/example/:name")
public class ExampleParametersViewModel {

    String name;

    int version;

    @ReadOnly
    String assessment;

    @Button
    void check() {
        assessment = "name= " + name + ", version=" + version;
    }

}
