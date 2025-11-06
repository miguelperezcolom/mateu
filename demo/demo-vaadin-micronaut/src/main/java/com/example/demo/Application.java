package com.example.demo;

import io.micronaut.context.annotation.Import;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.runtime.Micronaut;
import io.micronaut.serde.annotation.SerdeImport;

@Introspected(packages = "io.mateu.dtos")
@SerdeImport(packageName = "io.mateu.dtos")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.antonia")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.components")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.crudls")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.forms")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.layouts")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.styling")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.nestedapps")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.actions")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.data")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.rules")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.triggers")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.validations")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.routes")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.commandsandmessages")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.usecases")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.fluent.usecases.rra")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.declarative")
@SerdeImport(packageName = "com.example.demo.infra.in.ui.imperative")
@SerdeImport(packageName = "com.example.demo.infra.in.ui")
@SerdeImport(packageName = "io.mateu.uidl.data")
@Import(packages = {
        "io.mateu",
        "io.mateu.core.application",
        "io.mateu.core.application.getui",
        "io.mateu.core.application.createjourney",
        "io.mateu.core.application.runaction",
        "io.mateu.core.domain",
        "io.mateu.core.domain.fragmentmapper",
        "io.mateu.core.domain.reflection",
        "io.mateu.core.infra.reflection",
        "io.mateu.core.domain.out",
        "io.mateu.core.domain.act",
        "io.mateu.core.infra.reflection.mappers",
        "io.mateu.core.domain.out.fragmentmapper",
        "io.mateu.core.domain.out.componentmapper",
        "io.mateu.core.infra.reflection.write"
},
        annotated = "*")
public class Application {

    public static void main(String[] args) {
        Micronaut.run(Application.class, args);
    }
}