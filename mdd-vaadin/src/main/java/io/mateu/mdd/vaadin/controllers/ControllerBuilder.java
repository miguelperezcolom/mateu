package io.mateu.mdd.vaadin.controllers;

import io.mateu.mdd.core.app.*;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.pojos.PrivateHome;
import io.mateu.mdd.shared.pojos.PublicHome;
import io.mateu.mdd.vaadin.controllers.firstLevel.MenuController;
import io.mateu.mdd.vaadin.controllers.firstLevel.ModuleController;
import io.mateu.mdd.vaadin.controllers.firstLevel.PrivateController;
import io.mateu.mdd.vaadin.controllers.firstLevel.PublicController;
import io.mateu.mdd.vaadin.controllers.secondLevel.*;
import io.mateu.mdd.vaadin.controllers.thirdLevel.MethodController;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class ControllerBuilder {


    private final ViewStack stack;

    public ControllerBuilder(ViewStack stack) {
        this.stack = stack;
    }


    public Controller build(Object object, String path, String step) {
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
        if (object instanceof AbstractMenu) {
            return new MenuController(stack, path + "/" + step, (AbstractMenu) object);
        }
        if (object instanceof MDDOpenListViewAction) {
            return new ListViewController(stack, path + "/" + step, (MDDOpenListViewAction) object);
        }
        if (object instanceof MDDOpenCRUDAction) {
            return new CrudController(stack, path + "/" + step, (MDDOpenCRUDAction)object);
        } else if (object instanceof MDDOpenWizardAction) {
            return new WizardController(stack, path + "/" + step, ((MDDOpenWizardAction)object).firstPageSupplier.get());
        } else if (object instanceof MDDOpenCustomComponentAction) {
            return new CustomComponentController(stack, path + "/" + step, (MDDOpenCustomComponentAction)object);
        } else if (object instanceof MDDOpenEditorAction) {
            return new EditorController(stack, path + "/" + step, (MDDOpenEditorAction)object);
        } else if (object instanceof MDDCallMethodAction) {
            return new MethodController(stack, path + "/" + step, ((MDDCallMethodAction)object).instance, ((MDDCallMethodAction)object).method);
        }
        return  new BrokenLinkController(stack, path + "/" + step);
    }

}
