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
import io.mateu.mdd.vaadin.controllers.thirdLevel.CollectionController;
import io.mateu.mdd.vaadin.controllers.thirdLevel.FieldController;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.Error;
import io.mateu.mdd.vaadin.pojos.FieldSearch;
import io.mateu.mdd.vaadin.pojos.ModelField;
import io.mateu.mdd.vaadin.pojos.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

import java.util.Collection;

public class ObjectToViewMapper {

    private final ViewStack stack;
    private final App app;
    private final FieldToViewMapper fieldToViewMapper;

    public ObjectToViewMapper(ViewStack stack) {
        this.stack = stack;
        this.app = MDDUIAccessor.getApp();
        fieldToViewMapper = new FieldToViewMapper(stack);
    }

    //todo: open for extension, close for modification
    public View toView(Object model, String step) {
        if (model == null) {
            return new BrokenLinkView(stack);
        }
        if (model instanceof PublicHome) {
            ComponentView view = new ComponentView(stack, "Home", null, null);

            view.setController(new PublicController());
            return view;
        }
        if (model instanceof PrivateHome) {
            ComponentView view = new ComponentView(stack, "Private home", null, null);
            view.setController(new PrivateController());
            return view;
        }
        if (model instanceof AbstractArea) {
            AbstractArea area = (AbstractArea) model;
            AbstractAction home = area.getDefaultAction();
            if (home != null) {
                if (home instanceof MDDOpenHtmlAction) {
                    ComponentView view = new ComponentView(stack, area.getName(), null,
                            new HomeComponent(home.getIcon(), "" + area.getName(),
                                    new Label(((MDDOpenHtmlAction) home).html, ContentMode.HTML), false));
                    view.setController(new AreaController(area));
                    return view;
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
        if (model instanceof MDDOpenHtmlAction) {
            MDDOpenHtmlAction openHtml = (MDDOpenHtmlAction) model;
            return new ComponentView(stack, openHtml.getCaption(), openHtml.getIcon(),
                    new Label(openHtml.html, ContentMode.HTML));
        }
        if (model instanceof Result && ((Result) model).getModel() instanceof MDDOpenUserJourneyAction) {
            model = ((Result) model).getModel();
        }
        if (model instanceof MDDOpenRemoteFormAction) {
            // crear clase al vuelo. Quizás cachear
            try {
                model = RemoteHelper.createBean(((MDDOpenRemoteFormAction) model).getRemoteForm());
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
        }
        if (model instanceof MDDRunUserJourneyAction) {
            // crear clase al vuelo. Quizás cachear
            try {
                model = UserJourneyHelper.completeStep((MDDRunUserJourneyAction) model);
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
        }
        if (model instanceof MDDOpenUserJourneyAction) {
            // crear clase al vuelo. Quizás cachear
            try {
                model = UserJourneyHelper.createBean(((MDDOpenUserJourneyAction) model).getUserJourney());
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
        }
        if (model instanceof Error) {
            Error error = (Error) model;
            return new ProblemView(stack, "Error", error);
        }
        if (model instanceof Result) {
            Result result = (Result) model;
            return new View(stack, new ResultViewComponent(result), new VoidController());
        }
        if (model instanceof ModelField) {
            return fieldToViewMapper.toView((ModelField) model, step);
        }
        if (model instanceof FieldSearch) {
            MDDBinder parentBinder = ((EditorViewComponent)io.mateu.mdd.vaadin.MateuUI.get().getStack()
                    .getLastNavigable().getViewComponent()).getBinder();
            ListViewComponent listViewComponent = MDDViewComponentCreator.createSearcherComponent(parentBinder,
                    ((FieldSearch) model).getField());
            return new View(stack, listViewComponent, new ListViewController(listViewComponent));
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
                        new JPAListViewComponent(entityClass, action.getQueryFilters(), null, null,
                                action.getColumns(), action.getFilters(), action.getFields(), null);
                component.setCaption(action.getCaption());
                component.setAddEnabled(action.isCanAdd());
                component.setReadOnlyFields(action.getReadOnlyFields());
                component.setDeleteEnabled(action.isCanDelete());
                component.setReadOnly(action.isReadOnly());
               return new View(stack, component, new ListViewController(component));
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
        }

        // es un pojo o una clase diferente de null
        EditorViewComponent editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(model);
        if (model != null && model.getClass().isAnnotationPresent(MateuUI.class))
            editorViewComponent.setIcon(VaadinIcons.FORM);
        Controller controller = new EditorController(editorViewComponent);
        if (model instanceof PersistentPojo) {
        } else if (model instanceof ReadOnlyPojo) {
            editorViewComponent = new ReadOnlyViewComponent(model);
            controller = new ReadOnlyController(model);
        }
        return new View(stack, editorViewComponent, controller);

    }

    private View getViewForField(ModelField modelField) {
        if (Collection.class.isAssignableFrom(modelField.getField().getType())) {
            ComponentView view = null;
            try {
                view = new ComponentView(stack, modelField.getField().getName(), null,
                        new CollectionListViewComponent((Collection) ReflectionHelper.getValue(modelField.getField(),
                                modelField.getInstance()),
                                ReflectionHelper.getGenericClass(
                                        modelField.getField(), Collection.class, "T")).build());
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
            view.setController(new CollectionController(modelField));
            return view;
        }
        ComponentView view = new ComponentView(stack, modelField.getField().getName(), null,
                new FakeComponent("Field " + modelField.getField().getName()));
        view.setController(new FieldController(modelField));
        return view;
    }

}
