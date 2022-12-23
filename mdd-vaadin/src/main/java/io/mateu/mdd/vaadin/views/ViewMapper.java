package io.mateu.mdd.vaadin.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.pojos.PrivateHome;
import io.mateu.mdd.shared.pojos.PublicHome;
import io.mateu.mdd.shared.reflection.CoreReflectionHelper;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.components.HomeComponent;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.components.ResultView;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.AreaComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.FakeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.MenuComponent;
import io.mateu.mdd.vaadin.components.views.EditorListener;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.MethodParametersViewComponent;
import io.mateu.mdd.vaadin.controllers.secondLevel.EditorController;
import io.mateu.mdd.vaadin.controllers.secondLevel.ReadOnlyController;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.Error;
import io.mateu.mdd.vaadin.pojos.MethodCall;
import io.mateu.mdd.vaadin.pojos.ModelField;
import io.mateu.mdd.vaadin.pojos.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;

public class ViewMapper {

    private final ViewStack stack;
    private final App app;

    public ViewMapper(ViewStack stack) {
        this.stack = stack;
        this.app = MDDUIAccessor.getApp();
    }

    //todo: open for extension, close for modification
    public View toView(Object model, String step) {
        if (model == null) {
            return new BrokenLinkView(stack);
        }
        if (model instanceof PublicHome) {
            return new ComponentView(stack, "Home", null, new Label("Public content"));
        }
        if (model instanceof PrivateHome) {
            return new ComponentView(stack, "Home", null, new Label("Private content"));
        }
        if (model instanceof AbstractArea) {
            AbstractArea area = (AbstractArea) model;
            AbstractAction home = area.getDefaultAction();
            if (home != null) {
                if (home instanceof MDDOpenHtml) {
                    return new ComponentView(stack, area.getName(), null,
                            new HomeComponent(home.getIcon(), "" + area.getName(),
                                    new Label(((MDDOpenHtml)home).html, ContentMode.HTML), false));
                } else {
                    try {
                        new AcctionRunner().run((AbstractAction) home);
                    } catch (Throwable e) {
                        Notifier.alert(e);
                    }
                }
            } else {
                return new ComponentView(stack, area.getName(), null, new AreaComponent(area));
            }
        }
        if (model instanceof AbstractModule) {
            AbstractModule module = (AbstractModule) model;
            return new ComponentView(stack, module.getName(), null,
                    new FakeComponent("Module "  + module.getName()));
        }
        if (model instanceof AbstractMenu) {
            return new ComponentView(stack, Helper.capitalize(step), null,
                    new MenuComponent((AbstractMenu) model));
        }
        if (model instanceof AbstractModule) {
            return new ComponentView(stack, Helper.capitalize(step), null,
                    new FakeComponent("Module " + ((AbstractModule) model).getName()));
        }
        if (model instanceof MDDOpenHtml) {
            MDDOpenHtml openHtml = (MDDOpenHtml) model;
            return new ComponentView(stack, "Home", null,
                    new HomeComponent(openHtml.getIcon(), "Home",
                            new Label(openHtml.html, ContentMode.HTML), false));
        }
        if (model instanceof Error) {
            Error error = (Error) model;
            return new ProblemView(stack, "Error", error);
        }
        if (model instanceof Result) {
            Result result = (Result) model;
            return new ResultView(stack, "Result", result);
        }

        if (model instanceof ComponentWrapper) {
            ComponentWrapper componentWrapper = (ComponentWrapper) model;
            return new ComponentView(stack, componentWrapper.getTitle(), componentWrapper.getIcon(), (Component) model);
        }
        if (model instanceof Component) {
            return new ComponentView(stack, Helper.capitalize(step), null,
                    (Component) model);
        }
        // es un pojo o una clase diferente de null
        EditorViewComponent editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(model);
        if (model != null && model.getClass().isAnnotationPresent(MateuUI.class))
            editorViewComponent.setIcon(VaadinIcons.FORM);
        ComponentView view =
                new ComponentView(stack, editorViewComponent.getTitle(),
                        editorViewComponent.getIcon(), editorViewComponent);
        if (model instanceof ReadOnlyPojo) {
            view.setController(new ReadOnlyController(model));
        } else {
            view.setController(new EditorController(model));
        }
        return view;

    }

}
