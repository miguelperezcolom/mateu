package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.Section;
import io.mateu.mdd.core.annotations.Stylist;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.VoidStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.fields.FieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAOutputFieldBuilder;
import io.mateu.mdd.core.data.ChangeNotificationListener;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;

import javax.persistence.GeneratedValue;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FormLayoutBuilder implements io.mateu.mdd.core.data.FormLayoutBuilder {

    @Override
    public Pair<Component, AbstractStylist> build(MDDBinder binder, Class<?> modelType, Object model, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields) {
        CssLayout contentContainer = new CssLayout();
        contentContainer.addStyleName("contentcontainer");
        return build(contentContainer, binder, modelType, model, validators, allFields);
    }

    public Pair<Component, AbstractStylist> build(Layout contentContainer, MDDBinder binder, Class modelType, Object model, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields) {
        return build(contentContainer, binder, modelType, model, validators, allFields, true);
    }

    public Pair<Component, AbstractStylist> build(Layout contentContainer, MDDBinder binder, Class modelType, Object model, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields, boolean createSections) {


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

        if (createSections) {
            List<FormLayoutSection> sections = new ArrayList<>();
            allFields.forEach(f -> {
                if (f.isAnnotationPresent(Section.class)) sections.add(new FormLayoutSection(f.getAnnotation(Section.class).value()));
                if (sections.size() == 0) sections.add(new FormLayoutSection("General"));
                sections.get(sections.size() - 1).getFields().add(f);
            });

            if (sections.size() == 1) {
                FormLayoutSection s = sections.get(0);
                if ("general".equalsIgnoreCase(s.getCaption())) s.setCaption(null);
            }

            AbstractStylist finalStylist1 = stylist;
            sections.forEach(s -> {
                FormLayout form = new FormLayout();
                form.setSizeUndefined();
                form.addStyleName("section");
                //form.addStyleName(ValoTheme.FORMLAYOUT_LIGHT);

                if (s.getCaption() != null) {
                    Label section = new Label(s.getCaption());
                    section.addStyleName(ValoTheme.LABEL_H2);
                    section.addStyleName(ValoTheme.LABEL_COLORED);
                    form.addComponent(section);
                }


                buildAndAddFields(ofb, model, form, binder, validators, finalStylist1, allFieldContainers, s.getFields());
                contentContainer.addComponent(form);
            });
        } else {
            buildAndAddFields(ofb, model, contentContainer, binder, validators, stylist, allFieldContainers, allFields);
        }

        binder.setBean(model);

        AbstractStylist finalStylist = stylist;
        binder.addChangeNotificationListener(new ChangeNotificationListener() {
            @Override
            public void somethingChanged() {
                JPAFieldBuilder.applyStyles(finalStylist, binder.getBean(), allFieldContainers, finalStylist.process(binder.getBean()));
            }
        });

        JPAFieldBuilder.applyStyles(stylist, model, allFieldContainers, stylist.process(binder.getBean()));

        return new Pair(contentContainer, stylist);
    }

    private void buildAndAddFields(JPAOutputFieldBuilder ofb, Object model, Layout contentContainer, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, List<FieldInterfaced> fields) {
        for (FieldInterfaced f : fields) {

            if (f.isAnnotationPresent(FieldBuilder.class)) {
                try {
                    (f.getAnnotation(FieldBuilder.class).value().newInstance()).build(f, model, contentContainer, binder, validators, stylist, allFieldContainers);
                } catch (Exception e) {
                    MDD.alert(e);
                }
            } else if (f.isAnnotationPresent(GeneratedValue.class) || f.isAnnotationPresent(Output.class)) {
                ofb.build(f, model, contentContainer, binder, validators, stylist, allFieldContainers);
            } else {
                for (JPAFieldBuilder fieldBuilder : JPAFieldBuilder.builders) if (fieldBuilder.isSupported(f)) {
                    fieldBuilder.build(f, model, contentContainer, binder, validators, stylist, allFieldContainers);
                    break;
                }
            }

        }

    }

    private static FormLayoutBuilder instance = new FormLayoutBuilder();

    public static FormLayoutBuilder get() {
        return instance;
    }

}
