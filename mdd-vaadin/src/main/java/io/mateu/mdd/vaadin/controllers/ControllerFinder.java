package io.mateu.mdd.vaadin.controllers;

import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.pojos.PrivateHome;
import io.mateu.mdd.shared.pojos.PublicHome;
import io.mateu.mdd.vaadin.controllers.firstLevel.ModuleController;
import io.mateu.mdd.vaadin.controllers.firstLevel.PrivateController;
import io.mateu.mdd.vaadin.controllers.firstLevel.PublicController;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class ControllerFinder {


    private final ViewStack stack;

    public ControllerFinder(ViewStack stack) {
        this.stack = stack;
    }


    public Controller find(Object object, String path, String step) {
        if (object == null) return  new BrokenLinkController(stack, path + "/" + step);
        if (object instanceof IModule) {
            return new ModuleController(stack, path + "/" + step, (IModule) object);
        }
        if (object instanceof PrivateHome) {
            return new PrivateController(stack, path + "/" + step);
        }
        if (object instanceof PublicHome) {
            return new PublicController(stack, path + "/" + step);
        }
        return  new BrokenLinkController(stack, path + "/" + step);
    }

}
