package io.mateu.mdd.vaadin.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.pojos.PrivateHome;
import io.mateu.mdd.shared.pojos.PublicHome;
import io.mateu.mdd.vaadin.MateuUI;
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
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.Error;
import io.mateu.mdd.vaadin.pojos.ModelField;
import io.mateu.mdd.vaadin.pojos.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

import java.util.Collection;

public class FieldToViewMapper {

    private final ViewStack stack;
    private final App app;

    public FieldToViewMapper(ViewStack stack) {
        this.stack = stack;
        this.app = MDDUIAccessor.getApp();
    }

    //todo: open for extension, close for modification
    public View toView(ModelField modelField, String step) {
        if (modelField == null) {
            return new BrokenLinkView(stack);
        }

        if (RpcView.class.isAssignableFrom(modelField.getField().getType())) {
            try {
                RpcListViewComponent component =
                        new RpcListViewComponent((RpcView) ReflectionHelper.getValue(modelField.getField(), modelField.getInstance()));
                component.buildIfNeeded();
                View view = new View(stack, component, new ListViewController(component));
                return view;
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
        }

        if (Collection.class.isAssignableFrom(modelField.getField().getType())) {
            try {
                EditorViewComponent currentEditor = (EditorViewComponent) stack.getLast().getViewComponent();

                return new View(stack, new OwnedCollectionViewComponent(currentEditor.getBinder(), modelField.getField(), (Integer) MDDUIAccessor.getPendingResult()), new VoidController());
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
        }

        if (!ReflectionHelper.isBasico(modelField.getField().getType())) {
            try {
                EditorViewComponent currentEditor = (EditorViewComponent) stack.getLast().getViewComponent();

                return new View(stack, new OwnedPojoViewComponent(currentEditor.getBinder(), modelField.getField()), new EditorController(ReflectionHelper.getValue(modelField.getField(), currentEditor.getModel())));
            } catch (Exception e) {
                return new ProblemView(stack, "Error", new Error(e));
            }
        }


        ComponentView view = new ComponentView(stack, modelField.getField().getName(), null,
                new FakeComponent("Field " + modelField.getField().getName()));
        view.setController(new FieldController(modelField));
        return view;
    }
}
