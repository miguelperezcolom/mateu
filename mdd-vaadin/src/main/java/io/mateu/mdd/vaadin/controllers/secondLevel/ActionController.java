package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.vaadin.components.views.RpcListViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.Error;
import io.mateu.mdd.vaadin.views.ComponentView;
import io.mateu.mdd.vaadin.views.ProblemView;
import io.mateu.reflection.ReflectionHelper;

public class ActionController extends Controller {

    public ActionController() {
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (!"".equals(step)) {
            App app = MDDUIAccessor.getApp();

            MenuEntry action = app.getMenu(path + "/" + cleanStep);

            if (action instanceof MDDOpenListViewAction) {
                MDDOpenListViewAction typedAction = (MDDOpenListViewAction) action;
                Class listViewClass = typedAction.getListViewClass();
                if (RpcView.class.isAssignableFrom(listViewClass)) {
                    try {
                        return ReflectionHelper.newInstance(listViewClass);
                    } catch (Exception e) {
                        return new Error(e);
                    }
                }
                return new Error("Not a recognized list view class");
            }
            if (action instanceof MDDOpenEditorAction) {
                MDDOpenEditorAction typedAction = (MDDOpenEditorAction) action;
                if (typedAction.getBean() != null) {
                    return typedAction.getBean();
                }
                if (typedAction.getViewClass() != null) {
                    try {
                        return ReflectionHelper.newInstance(typedAction.getViewClass());
                    } catch (Exception e) {
                        return new Error(e);
                    }
                }
                return new Error("Not a bean either class specified");
            }
            return action;
        }
        return null;
    }
}
