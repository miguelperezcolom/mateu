package io.mateu.mdd.specdrivengenerator.infra.in.ui;

import io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.aggregate.AggregateCrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.entity.EntityCrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.invariant.InvariantCrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.module.ModuleCrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.project.ProjectCrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.valueobject.ValueObjectCrudOrchestrator;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

@UI("")
@Title("Spec-driven code generator")
public class SpecDrivenGeneratorHome {

    @Menu
    ProjectCrudOrchestrator projects;

    @Menu
    ModuleCrudOrchestrator modules;

    @Menu
    AggregateCrudOrchestrator aggregates;

    @Menu
    EntityCrudOrchestrator entities;

    @Menu
    ValueObjectCrudOrchestrator valueObjects;

    @Menu
    InvariantCrudOrchestrator invariants;


}
