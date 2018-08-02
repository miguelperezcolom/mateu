package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;
import javafx.util.Pair;

import java.util.List;
import java.util.Map;
import java.util.Set;

public abstract class JPAFieldBuilder {

    public static List<JPAFieldBuilder> builders = Lists.newArrayList(
            new JPATextAreaFieldBuilder()
            , new JPAStringFieldBuilder()
            , new JPAIntegerFieldBuilder()
            , new JPALongFieldBuilder()
            , new JPADoubleFieldBuilder()
            , new JPABooleanFieldBuilder()
            , new JPAEnumerationFieldBuilder()
            , new JPAOneToOneFieldBuilder()
            , new JPAManyToOneFieldBuilder()
            , new JPAOneToManyFieldBuilder()
            , new JPALocalDateFieldBuilder()
            , new JPALocalDateTimeFieldBuilder()
            , new JPAPOJOFieldBuilder()
    );

    public abstract boolean isSupported(FieldInterfaced field);

    public abstract void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers);


    public static void applyStyles(Map<FieldInterfaced, Component> containers, Pair<Map<FieldInterfaced, List<String>>, Map<FieldInterfaced, List<String>>> styleChanges) {
        Map<FieldInterfaced, List<String>> remove = styleChanges.getKey();
        Map<FieldInterfaced, List<String>> add = styleChanges.getValue();

        remove.keySet().forEach((f) -> {
            if (containers.containsKey(f)) containers.get(f).removeStyleNames(remove.get(f).toArray(new String[0]));
        });
        add.keySet().forEach((f) -> {
            if (containers.containsKey(f)) containers.get(f).addStyleNames(add.get(f).toArray(new String[0]));
        });
    }

}
