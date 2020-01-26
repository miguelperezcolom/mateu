package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.BinderValidationStatus;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.AbstractComponent;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDViewProvider;
import io.mateu.mdd.vaadinport.vaadin.navigation.View;
import io.mateu.mdd.vaadinport.vaadin.navigation.ViewStack;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;
import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.ValidatorFactory;
import java.lang.reflect.Method;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class MethodParametersViewComponent extends EditorViewComponent {

    private final Method method;
    private final Object bean;
    private final Set pendingSelection;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.FORM;
    }

    private Class parametersType;
    private Object paremetersModel;

    public MethodParametersViewComponent(Object bean, Method method, Set pendingSelection) throws Exception {
        super(ReflectionHelper.createClass("" + method.getDeclaringClass().getSimpleName() + "_" + method.getName() + "_Parameters000", ReflectionHelper.getAllFields(method), false));
        this.bean = bean;
        this.method = method;
        this.pendingSelection = pendingSelection;
        setModel(getModelType().newInstance());
    }

    @Override
    public String toString() {
        String t = Helper.capitalize(method.getName());
        if (method.isAnnotationPresent(Action.class) && !Strings.isNullOrEmpty(method.getAnnotation(Action.class).value())) t = method.getAnnotation(Action.class).value();
        return t;
    }

    @Override
    public List<AbstractAction> getActions() {
        return Lists.newArrayList(new AbstractAction(VaadinIcons.BOLT, toString()) {
            @Override
            public void run(MDDExecutionContext context) {
                if (validate()) {
                    try {
                        Object r = ReflectionHelper.execute(MDD.getUserData(), method, getBinder(), bean, pendingSelection);
                        if (bean != null && void.class.equals(method.getReturnType())) {
                            if (method.isAnnotationPresent(Action.class) && method.getAnnotation(Action.class).saveAfter()) {
                                ViewStack stack = MDDUI.get().getNavegador().getViewProvider().getStack();
                                View v = stack.size() >= 2?stack.get(stack.size() - 2):null;
                                if (v != null && v.getViewComponent() instanceof EditorViewComponent) ((EditorViewComponent) v.getViewComponent()).save(false);
                            }
                            MDD.notifyInfo("Done");
                            MDDUI.get().getNavegador().goBack();
                        } else {
                            MDDUI.get().getNavegador().getViewProvider().pendingResult = r;
                            MDDUI.get().getNavegador().getViewProvider().lastMethodCall = method;
                            MDDUI.get().getNavegador().go("result");
                        }
                    } catch (Throwable e) {
                        MDD.alert(e);
                    }
                }
            }
        });
    }

}
