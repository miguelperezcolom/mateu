package io.mateu.sample1.app;

import io.micronaut.context.annotation.Import;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.runtime.Micronaut;
import io.micronaut.serde.annotation.SerdeImport;

@Introspected(packages = {"io.mateu.dtos", "io.mateu.uidl.data"})
@SerdeImport(packageName = "io.mateu.dtos")
@Import(packages = {
        "io.mateu",
        "io.mateu.core.application",
        "io.mateu.core.application.getui",
        "io.mateu.core.application.createjourney",
        "io.mateu.core.application.runaction",
        "io.mateu.core.domain",
        "io.mateu.core.domain.in",
        "io.mateu.core.domain.fragmentmapper",
        "io.mateu.core.domain.reflection",
        "io.mateu.core.infra.reflection",
        "io.mateu.core.domain.out",
        "io.mateu.core.domain.act",
        "io.mateu.core.infra.reflection.mappers",
        "io.mateu.core.domain.out.fragmentmapper",
        "io.mateu.core.domain.out.componentmapper",
        "io.mateu.core.infra.reflection.write",
        "io.mateu.core.infra.out",
        "io.mateu.core.infra.declarative"
},
        annotated = {"jakarta.inject.Named", "jakarta.inject.Singleton"})
public class MicronautApp1Application {

    public static void main(String[] args) {
        Micronaut.run(MicronautApp1Application.class, args);
    }
}
