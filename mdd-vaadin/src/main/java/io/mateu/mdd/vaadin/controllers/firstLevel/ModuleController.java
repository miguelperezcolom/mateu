package io.mateu.mdd.vaadin.controllers.firstLevel;

import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.AreaComponent;
import io.mateu.mdd.vaadin.controllers.secondLevel.ActionController;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class ModuleController extends ActionController {
    private final IModule module;

    public ModuleController(ViewStack stack, String path, IModule module) {
        super(stack, path);
        this.module = module;
        register(stack, path, new AreaComponent((AbstractArea) module.getArea()));
    }

}
