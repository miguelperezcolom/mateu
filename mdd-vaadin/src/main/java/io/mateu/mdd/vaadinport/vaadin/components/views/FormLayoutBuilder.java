package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.Component;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.Stylist;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.VoidStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAOutputFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.data.ChangeNotificationListener;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;
import javafx.util.Pair;

import javax.persistence.GeneratedValue;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FormLayoutBuilder {

    public static Pair<Component, AbstractStylist> build(MDDBinder binder, Class modelType, Object model, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields) {

        VerticalLayout contentContainer = new VerticalLayout();
        contentContainer.addStyleName("contentcontainer");

        AbstractStylist stylist = new VoidStylist();

        if (modelType.isAnnotationPresent(Stylist.class)) {
            try {
                stylist = (AbstractStylist) ((Stylist)modelType.getAnnotation(Stylist.class)).value().newInstance();
            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (ClassCastException e) {
                e.printStackTrace();
            }
        }

        stylist.setViewTitle(Helper.capitalize(modelType.getSimpleName()));


        stylist.setUp(allFields);

        Map<FieldInterfaced, Component> allFieldContainers = new HashMap<>();

        JPAOutputFieldBuilder ofb = new JPAOutputFieldBuilder();

        for (FieldInterfaced f : allFields) {

            if (f.isAnnotationPresent(GeneratedValue.class) || f.isAnnotationPresent(Output.class)) {
                ofb.build(f, model, contentContainer, binder, validators, stylist, allFieldContainers);
            } else {
                for (JPAFieldBuilder fieldBuilder : JPAFieldBuilder.builders) if (fieldBuilder.isSupported(f)) fieldBuilder.build(f, model, contentContainer, binder, validators, stylist, allFieldContainers);
            }

        }

        binder.setBean(model);

        AbstractStylist finalStylist = stylist;
        binder.addChangeNotificationListener(new ChangeNotificationListener() {
            @Override
            public void somethingChanged() {
                JPAFieldBuilder.applyStyles(allFieldContainers, finalStylist.process(binder.getBean()));
            }
        });

        JPAFieldBuilder.applyStyles(allFieldContainers, stylist.process(binder.getBean()));

        return new Pair(contentContainer, stylist);
    }
}
