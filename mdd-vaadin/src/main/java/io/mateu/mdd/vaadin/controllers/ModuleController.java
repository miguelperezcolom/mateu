package io.mateu.mdd.vaadin.controllers;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.vaadin.components.app.views.AreaComponent;

public class ModuleController extends ActionController {
    private final IModule module;

    public ModuleController(IModule module) {
        super();
        this.module = module;
    }

    @Override
    public Component apply(String path, String step, String remaining) throws Exception {
        if ("".equals(step)) {
            return new AreaComponent((AbstractArea) module.getArea());
        } else {
            return super.apply(path, step, remaining);
        }
    }
}
