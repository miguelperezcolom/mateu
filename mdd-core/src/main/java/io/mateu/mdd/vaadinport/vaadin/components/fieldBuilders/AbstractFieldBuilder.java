package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;

import java.util.List;
import java.util.Map;

public abstract class AbstractFieldBuilder {

    public static List<AbstractFieldBuilder> builders = Lists.newArrayList(
            new JPAUnmodifiableFieldBuilder()
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
            , new JPAPOJOFieldBuilder()
    );

    public abstract boolean isSupported(FieldInterfaced field);

    public abstract void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter);


    public static void applyStyles(AbstractStylist stylist, Object model,  Map<FieldInterfaced, Component> containers, Pair<Map<FieldInterfaced, List<String>>, Map<FieldInterfaced, List<String>>> styleChanges) {
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
                c.setVisible(stylist.isVisible(f, model));
            }
        }
    }

}
