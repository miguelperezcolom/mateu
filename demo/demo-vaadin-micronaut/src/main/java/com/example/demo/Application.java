package com.example.demo;

import io.micronaut.context.annotation.Import;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.runtime.Micronaut;
import io.micronaut.serde.annotation.SerdeImport;

@Introspected(packages = "io.mateu.dtos")
@SerdeImport(packageName = "io.mateu.dtos")
@Import(packages = {
        "io.mateu",
        "io.mateu.core.application",
        "io.mateu.core.application.getui",
        "io.mateu.core.application.createjourney",
        "io.mateu.core.application.runaction",
        "io.mateu.core.domain",
        "io.mateu.core.domain.fragmentmapper",
        "io.mateu.core.domain.reflection"
},
        annotated = "*")
public class Application {

    public static void main(String[] args) {
        Micronaut.run(Application.class, args);
    }
}