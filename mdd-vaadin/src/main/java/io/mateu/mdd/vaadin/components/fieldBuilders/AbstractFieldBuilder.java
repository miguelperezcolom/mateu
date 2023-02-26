package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.*;
import com.vaadin.server.ErrorMessage;
import com.vaadin.server.UserError;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.Help;
import io.mateu.mdd.shared.interfaces.Choice;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.util.VaadinHelper;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.data.Pair;
import io.mateu.util.notification.Notifier;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public abstract class AbstractFieldBuilder implements IFieldBuilder {

    public static List<AbstractFieldBuilder> builders = Lists.newArrayList(
            new KPIInlineFieldBuilder()
            , new ButtonFieldBuilder()
            , new ChoiceFieldBuilder()
            , new FareValueFieldBuilder()
            , new JPAUnmodifiableFieldBuilder()
            , new FromDataProviderFieldBuilder()
            , new JPAAuditFieldBuilder()
            , new JPAWizardFieldBuilder()
            , new JPAWeekDaysFieldBuilder()
            , new JPAIFrameFieldBuilder()
            , new JPAURLFieldBuilder()
            , new FileFieldBuilder()
            , new JPAResourceFieldBuilder()
            , new JPAIconFieldBuilder()
            , new JPALiteralFieldBuilder()
            , new JPASignatureFieldBuilder()
            , new JPACodeFieldBuilder()
            , new JPAHtmlFieldBuilder()
            , new JPAPrimitiveArraysFieldBuilder()
            , new JPAPrimitiveCollectionsFieldBuilder()
            , new JPAFastMoneyFieldBuilder()
            , new JPAMoneyFieldBuilder()
            , new JPATextAreaFieldBuilder()
            , new JPAStringFieldBuilder()
            , new JPATimeFieldBuilder()
            , new JPAIntegerFieldBuilder()
            , new JPALongFieldBuilder()
            , new JPAFloatFieldBuilder()
            , new JPADoubleFieldBuilder()
            , new JPABooleanFieldBuilder()
            , new JPAEnumerationFieldBuilder()
            , new RpcViewFieldBuilder()
            , new JPAOneToOneFieldBuilder()
            , new JPAManyToOneFieldBuilder()
            , new JPAOneToManyFieldBuilder()
            , new JPADateFieldBuilder()
            , new JPALocalDateFieldBuilder()
            , new JPALocalDateTimeFieldBuilder()
            , new ComponentFieldBuilder()
            , new MongoObjectFieldBuilder()
            , new JPAPOJOFieldBuilder()
    );

    public abstract boolean isSupported(FieldInterfaced field);

    public abstract Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader,
                                    FieldInterfaced field, Object object, Layout container,
                                    MDDBinder binder, Map<HasValue, List<Validator>> validators,
                                    AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers,
                                    boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions);


    public static void applyStyles(AbstractStylist stylist, Object model, Map<FieldInterfaced, Component> containers,
                                   Pair<Map<FieldInterfaced, List<String>>,
                                           Map<FieldInterfaced, List<String>>> styleChanges) {
        Map<FieldInterfaced, List<String>> remove = styleChanges.getKey();
        Map<FieldInterfaced, List<String>> add = styleChanges.getValue();

        remove.keySet().forEach((f) -> {
            if (containers.containsKey(f)) containers.get(f).removeStyleNames(remove.get(f).toArray(new String[0]));
        });
        add.keySet().forEach((f) -> {
            if (containers.containsKey(f)) containers.get(f).addStyleNames(add.get(f).toArray(new String[0]));
        });

        if (model != null) for (FieldInterfaced f : containers.keySet()) {
            Component c = containers.get(f);
            if (c != null) {

                List<String> styles = stylist.style(f, model);
                //c.setStyleName(styles.stream().collect(Collectors.joining(" ")));

                c.setEnabled(stylist.isEnabled(f, model));

                boolean v = stylist.isVisible(f, model);
                c.setVisible(v);
                if (c.getParent() instanceof HorizontalLayout) {
                    final boolean[] algunoVisible = {false};
                    ((Layout) c.getParent()).getComponentIterator()
                            .forEachRemaining(x -> algunoVisible[0] |= x.isVisible());
                    c.getParent().setVisible(algunoVisible[0]);
                }
            }
        }
    }

    public void addErrorHandler(FieldInterfaced f, AbstractComponent tf) {
        if (!MDDUIAccessor.isMobile() && f.isAnnotationPresent(Help.class)
                && !Strings.isNullOrEmpty(f.getAnnotation(Help.class).value())) {
            String h = f.getAnnotation(Help.class).value();
            tf.setDescription(h);
            if (tf instanceof AbstractTextField) ((AbstractTextField)tf).setPlaceholder(h);
        }
        tf.setErrorHandler(e -> {
            Throwable th = e.getThrowable();
            while (th != null && th.getCause() != null) {
                th = th.getCause();
            }
            e.setThrowable(th);
            tf.setComponentError(new UserError(th.getMessage()));
        });
    }

    public static Binder.Binding completeBinding(Binder.BindingBuilder aux, MDDBinder binder,
                                                 FieldInterfaced field) {
        return completeBinding(aux, binder, field, null);
    }

    public static Binder.Binding completeBinding(Binder.BindingBuilder aux, MDDBinder binder,
                                                 FieldInterfaced field, AbstractComponent captionOwner) {
        aux.withValidator(new Validator() {

            boolean initialized = false;
            Object lastValue = null;
            ValidationResult lastResult;

            @Override
            public ValidationResult apply(Object v, ValueContext valueContext) {
                if (valueContext.getHasValue().isPresent()) {
                    if (initialized && (lastValue == v || (v != null && v.equals(lastValue)))) {
                    } else {
                        if (!initialized || lastValue != v || (v != null && !v.equals(lastValue))) {
                            initialized = true;

                            boolean isChoice = Choice.class.isAssignableFrom(field.getType());
                            if (isChoice) {
                                if (field.isAnnotationPresent(NotNull.class)) {
                                    try {
                                        Choice choice = (Choice) ReflectionHelper.getValue(field, binder.getBean());
                                        if (choice.getValue() == null) {
                                            if (captionOwner != null) captionOwner.setComponentError(new ErrorMessage() {

                                                @Override
                                                public ErrorLevel getErrorLevel() {
                                                    return ErrorLevel.ERROR;
                                                }

                                                @Override
                                                public String getFormattedHtmlMessage() {
                                                    return "Can not be null";
                                                }
                                            });
                                            return ValidationResult.error("Can not be null");
                                        } else {
                                            return ValidationResult.ok();
                                        }
                                    } catch (Exception e) {
                                        Notifier.alert(e);
                                        return ValidationResult.error(e.getClass().getSimpleName() + ": " + e.getMessage());
                                    }
                                } else {
                                    return ValidationResult.ok();
                                }
                            }

                            try {
                                Object old = ReflectionHelper.getValue(field, binder.getBean());
                                if (!Helper.equals(v, old)) {
                                    ReflectionHelper.setValue(field, binder.getBean(), v);
                                }
                                lastValue = v;
                                return lastResult = ValidationResult.ok();
                            } catch (Exception e) {
                                Throwable th = e;
                                while (th != null && th.getCause() != null) {
                                    th = th.getCause();
                                }
                                th.printStackTrace();
                                return lastResult = ValidationResult.error(th.getMessage() != null?
                                        th.getMessage():th.getClass().getSimpleName());
                            }
                        }
                    }
                    return lastResult != null?lastResult:(lastResult = ValidationResult.ok());
                } else return ValidationResult.error("missing HasValue");
            }

            @Override
            public Object apply(Object o, Object o2) {
                return ValidationResult.ok();
            }
        });
        if (captionOwner != null) {
            aux.withValidationStatusHandler(s -> {
               if (s.isError()) captionOwner.setComponentError(new UserError(s.getMessage().orElse("Error")));
               else captionOwner.setComponentError(null);
            });
        }
        Binder.Binding binding = aux.bind(o ->
                ReflectionHelper.getValue(field, o, getDefaultValueForField(field)), (o, v) -> {
            binder.update(o); // entra en bucle!!!
        });
        return binding;
    }

    private static Object getDefaultValueForField(FieldInterfaced field) {
        if (String.class.equals(field.getType())) return "";
        if (boolean.class.equals(field.getType())) return false;
        return null;
    }

    public static void completeBinding(HasValue hv, MDDBinder binder, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(hv);
        completeBinding(aux, binder, field);
    }

    public void addComponent(Layout container, Component c, List<AbstractAction> attachedActions) {
        if (attachedActions == null || attachedActions.size() == 0) container.addComponent(c);
        else {
            VerticalLayout vl = null;
            if (c instanceof VerticalLayout && ((VerticalLayout)c).getComponentCount() == 2
                    && ((VerticalLayout) c).getComponent(1) instanceof HorizontalLayout) {
                vl = (VerticalLayout) c;
                crearBotonera(vl.getComponent(0), attachedActions, (Layout) vl.getComponent(1));
            } else {
                vl = new VerticalLayout(c, crearBotonera(c, attachedActions));
            }
            vl.addStyleName(CSS.NOPADDING);
            vl.addStyleName("contenedorbotoneracampo");
            vl.addStyleName("conbotonera");
            container.addComponent(vl);
        }
    }

    private Component crearBotonera(Component c, List<AbstractAction> attachedActions) {
        HorizontalLayout hl = new HorizontalLayout();
        hl.addStyleName(CSS.NOPADDING);
        hl.addStyleName("botoneracampo");
        return crearBotonera(c, attachedActions, hl);
    }

    private Component crearBotonera(Component c, List<AbstractAction> attachedActions, Layout hl) {
        for (AbstractAction a : attachedActions) {
            Component i = null;
            if (true) {
                Button b;
                i = b = new Button(a.getCaption(), a.getIcon());
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addStyleName(ValoTheme.BUTTON_TINY);
                b.addClickListener(e -> {
                    try {

                        Runnable r = new Runnable() {
                            @Override
                            public void run() {
                                if (c instanceof Grid)
                                    MateuUI.get().setPendingSelection(((Grid) c).getSelectedItems());
                                try {
                                    new AcctionRunner().run(a);
                                } catch (Throwable ex) {
                                    Notifier.alert(ex);
                                }
                            }
                        };

                        if (!Strings.isNullOrEmpty(a.getConfirmationMessage())) {
                            VaadinHelper.confirm(a.getConfirmationMessage(), () -> {

                                r.run();

                                //todo: actualizar vista con los cambios en el modelo

                            });
                        } else r.run();

                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                });

                if (!Strings.isNullOrEmpty(a.getStyle())) i.addStyleName(a.getStyle());

                if (Strings.isNullOrEmpty(a.getGroup())) hl.addComponent(i);

            }
            if (i != null && !Strings.isNullOrEmpty(a.getStyle())) i.addStyleName(a.getStyle());
            i.setVisible(true);
        }
        return hl;
    }
}
