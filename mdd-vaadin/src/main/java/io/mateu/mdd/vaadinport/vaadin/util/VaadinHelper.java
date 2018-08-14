package io.mateu.mdd.vaadinport.vaadin.util;

import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.FieldInterfacedFromType;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAOutputFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.FormLayoutBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

public class VaadinHelper {

    public static <T> void getValue(String caption, Class<T> type, Consumer<T> f) {

        Map<FieldInterfaced, Component> allFieldContainers = new HashMap<>();
        JPAOutputFieldBuilder ofb = new JPAOutputFieldBuilder();

        FieldInterfaced field = new FieldInterfacedFromType(type, "value");

        List<FieldInterfaced> fields = Lists.newArrayList(field);

        MDDBinder binder = new MDDBinder(fields);


        // Create a sub-window and set the content
        Window subWindow = new Window(caption);
        VerticalLayout subContent = new VerticalLayout();
        subWindow.setContent(subContent);


        VerticalLayout vl = new VerticalLayout();

        Map<String, Object> model = new HashMap<>();

        Map<HasValue, List<Validator>> validators = new HashMap<>();


        FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, validators, fields);

        // Put some components in it
        subContent.addComponent(vl);
        Button b;
        subContent.addComponent(b = new Button("OK"));

        b.addClickListener(e -> {
            Object v = ((Map<String, Object>)binder.getBean()).get("value");
            f.accept((T) v);
            subWindow.close();
        });

        // Center it in the browser window
        subWindow.center();
        subWindow.setModal(true);

        // Open it in the UI
        UI.getCurrent().addWindow(subWindow);


    }


    public static <K, V> void getPair(String caption, Class<K> keyType, Class<V> valueType, BiConsumer<K, V> f) {

        Map<FieldInterfaced, Component> allFieldContainers = new HashMap<>();
        JPAOutputFieldBuilder ofb = new JPAOutputFieldBuilder();

        FieldInterfaced keyField = new FieldInterfacedFromType(keyType, "key");
        FieldInterfaced valueField = new FieldInterfacedFromType(valueType, "value");

        List<FieldInterfaced> fields = Lists.newArrayList(keyField, valueField);

        MDDBinder binder = new MDDBinder(fields);


        // Create a sub-window and set the content
        Window subWindow = new Window(caption);
        VerticalLayout subContent = new VerticalLayout();
        subWindow.setContent(subContent);


        VerticalLayout vl = new VerticalLayout();

        Map<String, Object> model = new HashMap<>();

        Map<HasValue, List<Validator>> validators = new HashMap<>();


        FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, validators, fields);

        // Put some components in it
        subContent.addComponent(vl);
        Button b;
        subContent.addComponent(b = new Button("OK"));

        b.addClickListener(e -> {
            Map<String, Object> bean = (Map<String, Object>) binder.getBean();
            Object k = bean.get("key");
            Object v = bean.get("value");
            if (k != null) {
                f.accept((K) k, (V)v);
                subWindow.close();
            } else {
                MDD.alert("Key can not be empty");
            }
        });

        // Center it in the browser window
        subWindow.center();
        subWindow.setModal(true);

        // Open it in the UI
        UI.getCurrent().addWindow(subWindow);


    }
}
