package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.collect.Lists;
import com.vaadin.data.*;
import com.vaadin.server.ErrorEvent;
import com.vaadin.server.UserError;
import com.vaadin.ui.AbstractComponent;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public abstract class AbstractFieldBuilder {

    public static List<AbstractFieldBuilder> builders = Lists.newArrayList(
            new KPIInlineFieldBuilder()
            , new FareValueFieldBuilder()
            , new JPAUnmodifiableFieldBuilder()
            , new FromDataProviderFieldBuilder()
            , new JPAAuditFieldBuilder()
            , new JPAWizardFieldBuilder()
            , new JPAWeekDaysFieldBuilder()
            , new JPAIFrameFieldBuilder()
            , new JPAURLFieldBuilder()
            , new JPAFileFieldBuilder()
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
            , new JPADoubleFieldBuilder()
            , new JPABooleanFieldBuilder()
            , new JPAEnumerationFieldBuilder()
            , new JPAOneToOneFieldBuilder()
            , new JPAManyToOneFieldBuilder()
            , new JPAOneToManyFieldBuilder()
            , new JPADateFieldBuilder()
            , new JPALocalDateFieldBuilder()
            , new JPALocalDateTimeFieldBuilder()
            , new ComponentFieldBuilder()
            , new JPAPOJOFieldBuilder()
    );

    public abstract boolean isSupported(FieldInterfaced field);

    public abstract Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter);


    public static void applyStyles(AbstractStylist stylist, Object model, Map<FieldInterfaced, Component> containers, Pair<Map<FieldInterfaced, List<String>>, Map<FieldInterfaced, List<String>>> styleChanges) {
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
                boolean v = stylist.isVisible(f, model);
                if (c.getParent() instanceof Layout && ((Layout) c.getParent()).getComponentCount() == 1) c.getParent().setVisible(v);
                else c.setVisible(v);
            }
        }
    }

    public void addErrorHandler(AbstractComponent tf) {
        tf.setErrorHandler(e -> {
            Throwable th = e.getThrowable();
            while (th != null && th.getCause() != null) {
                th = th.getCause();
            }
            e.setThrowable(th);
            tf.setComponentError(new UserError(th.getMessage()));
        });
    }

    public static Binder.Binding completeBinding(Binder.BindingBuilder aux, MDDBinder binder, FieldInterfaced field) {
        return completeBinding(aux, binder, field, null);
    }

    public static Binder.Binding completeBinding(Binder.BindingBuilder aux, MDDBinder binder, FieldInterfaced field, AbstractComponent captionOwner) {
        aux.withValidator(new Validator() {

            boolean initialized = false;
            Object lastValue = null;
            ValidationResult lastResult;

            @Override
            public ValidationResult apply(Object v, ValueContext valueContext) {
                if (valueContext.getHasValue().isPresent()) {
                    if (initialized && (lastValue == v || (v != null && v.equals(lastValue)))) {
                        return lastResult != null?lastResult:(lastResult = ValidationResult.ok());
                    } else {
                        initialized = true;
                        try {
                            ReflectionHelper.setValue(field, binder.getBean(), v);
                            lastValue = v;
                            return lastResult = ValidationResult.ok();
                        } catch (Exception e) {
                            Throwable th = e;
                            while (th != null && th.getCause() != null) {
                                th = th.getCause();
                            }
                            th.printStackTrace();
                            return lastResult = ValidationResult.error(th.getMessage() != null?th.getMessage():th.getClass().getSimpleName());
                        }
                    }
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
        Binder.Binding binding = aux.bind(o -> ReflectionHelper.getValue(field, o, String.class.equals(field.getType())?"":null), (o, v) -> {
            /*
            try {
                ReflectionHelper.setValue(field, o, v);
                tf.setComponentError(null);
            } catch (Exception e) {
                Throwable th = e;
                while (th != null && th.getCause() != null) {
                    th = th.getCause();
                }

                BindingValidationStatus<?> status = new BindingValidationStatus<Object>(Result.error(th.getMessage()), (Binder.Binding<?, Object>) tf.getData());
                binder.getValidationStatusHandler().statusChange(new BinderValidationStatus(binder, Arrays.asList(status), Collections.emptyList()));
            }
            */
        });
        return binding;
    }

    public void completeBinding(HasValue hv, MDDBinder binder, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(hv);

        completeBinding(aux, binder, field);
    }

}
