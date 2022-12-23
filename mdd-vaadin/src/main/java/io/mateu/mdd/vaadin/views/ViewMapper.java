package io.mateu.mdd.vaadin.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.pojos.PrivateHome;
import io.mateu.mdd.shared.pojos.PublicHome;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.components.HomeComponent;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.components.ResultViewComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.AreaComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.FakeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.MenuComponent;
import io.mateu.mdd.vaadin.components.views.*;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.VoidController;
import io.mateu.mdd.vaadin.controllers.firstLevel.*;
import io.mateu.mdd.vaadin.controllers.secondLevel.EditorController;
import io.mateu.mdd.vaadin.controllers.secondLevel.ListViewController;
import io.mateu.mdd.vaadin.controllers.secondLevel.ReadOnlyController;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.Error;
import io.mateu.mdd.vaadin.pojos.Result;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

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
            ComponentView view = new ComponentView(stack, "Home", null, new Label("Public content"));
            view.setController(new PublicController());
            return view;
        }
        if (model instanceof PrivateHome) {
            ComponentView view = new ComponentView(stack, "Home", null, new Label("Private content"));
            view.setController(new PrivateController());
            return view;
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
                ComponentView view = new ComponentView(stack, area.getName(), null, new AreaComponent(area));
                view.setController(new AreaController(area));
                return view;
            }
        }
        if (model instanceof AbstractModule) {
            AbstractModule module = (AbstractModule) model;
            ComponentView view = new ComponentView(stack, module.getName(), null,
                    new FakeComponent("Module " + module.getName()));
            view.setController(new ModuleController(module));
            return view;
        }
        if (model instanceof AbstractMenu) {
            AbstractMenu menu = (AbstractMenu) model;
            ComponentView view = new ComponentView(stack, Helper.capitalize(step), null,
                    new MenuComponent(menu));
            view.setController(new MenuController(menu));
            return view;
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
            return new View(stack, new ResultViewComponent(result), new VoidController());
        }

        if (model instanceof ComponentWrapper) {
            ComponentWrapper componentWrapper = (ComponentWrapper) model;
            return new ComponentView(stack, componentWrapper.getTitle(), componentWrapper.getIcon(), (Component) model);
        }
        if (model instanceof MethodParametersViewComponent) {
            return new View(stack, (MethodParametersViewComponent) model, new VoidController());
        }
        if (model instanceof Component) {
            return new ComponentView(stack, Helper.capitalize(step), null,
                    (Component) model);
        }
        if (model instanceof RpcView) {
            RpcView rpcView = (RpcView) model;
            try {
                RpcListViewComponent component =
                        new RpcListViewComponent(rpcView);
                component.buildIfNeeded();
                View view = new View(stack, component, new ListViewController(component));
                return view;
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
        }
        if (model instanceof MDDOpenCRUDAction) {
            MDDOpenCRUDAction action = (MDDOpenCRUDAction) model;
            Class entityClass = ((MDDOpenCRUDAction) model).getEntityClass();
            try {
                JPAListViewComponent component =
                        new JPAListViewComponent(entityClass);
               return new View(stack, component, new ListViewController(component));
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
        }

        // es un pojo o una clase diferente de null
        EditorViewComponent editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(model);
        if (model != null && model.getClass().isAnnotationPresent(MateuUI.class))
            editorViewComponent.setIcon(VaadinIcons.FORM);
        Controller controller = new EditorController(model);
        if (model instanceof ReadOnlyPojo) {
            controller = new ReadOnlyController(model);
        }
        return new View(stack, editorViewComponent, controller);

    }

}
