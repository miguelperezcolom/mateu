package com.example.demo;

import io.mateu.core.application.runaction.AppMenuResolver;
import io.mateu.core.application.runaction.CrudNavigationAdjuster;
import io.mateu.core.application.runaction.RouteInstanceCreator;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.core.domain.out.componentmapper.ComponentMapperBean;
import io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper;
import io.mateu.core.domain.out.fragmentmapper.ComponentFragmentMapper;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.core.infra.reflection.ReflectionUiIncrementMapper;
import io.mateu.core.infra.reflection.write.ForeignKeyResolverActionRunner;
import io.mateu.core.infra.reflection.write.RunMethodActionRunner;
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
// @SerdeImport(packageName = "io.mateu.uidl.data") -- disabled: records with multiple constructors cause Serde AP errors
@Import(packages = {
        "io.mateu",
        "io.mateu.core.application",
        "io.mateu.core.application.getui",
        "io.mateu.core.application.createjourney",
        "io.mateu.core.domain",
        "io.mateu.core.domain.in",
        "io.mateu.core.domain.fragmentmapper",
        "io.mateu.core.domain.reflection",
        "io.mateu.core.domain.out",
        "io.mateu.core.domain.act",
        "io.mateu.core.infra.reflection.mappers",
        "io.mateu.core.infra.out"
},
        classes = {
                // io.mateu.core.application.runaction — explicit to avoid anonymous/inner class scanning
                AppMenuResolver.class,
                CrudNavigationAdjuster.class,
                RouteInstanceCreator.class,
                RunActionUseCase.class,
                YamlUidlLoader.class,
                // io.mateu.core.domain.out.componentmapper
                ComponentMapperBean.class,
                ReflectionObjectToComponentMapper.class,
                // io.mateu.core.domain.out.fragmentmapper
                ComponentFragmentMapper.class,
                // io.mateu.core.infra.reflection
                DefaultInstanceFactory.class,
                ReflectionInstanceFactory.class,
                ReflectionUiIncrementMapper.class,
                // io.mateu.core.infra.reflection.write
                ForeignKeyResolverActionRunner.class,
                RunMethodActionRunner.class
        },
        annotated = "*")
public class Application {

    public static void main(String[] args) {
        Micronaut.run(Application.class, args);
    }
}
