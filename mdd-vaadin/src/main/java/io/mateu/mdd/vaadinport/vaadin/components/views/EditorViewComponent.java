package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.*;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.Stylist;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.VoidStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAOutputFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.data.ChangeNotificationListener;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDNavigator;
import javafx.beans.value.ChangeListener;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public abstract class EditorViewComponent extends AbstractViewComponent {

    protected boolean newRecord;
    private Object model;
    private final Class modelType;

    private MDDBinder binder;

    private AbstractStylist stylist;

    public EditorViewComponent(Class modelType) {

        this.modelType = modelType;
        try {
            this.model = modelType.newInstance();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }

        setViewTitle(modelType.getSimpleName());
    }


    public EditorViewComponent(Object model) {
        this.modelType = model.getClass();
        this.model = model;
    }

    public Object getModel() {
        return model;
    }

    public void setModel(Object model) {
        this.model = model;
        binder.setBean(model);
        setViewTitle(stylist.getViewTitle(newRecord, model));
    }

    public Class getModelType() {
        return modelType;
    }

    @Override
    public EditorViewComponent build() throws IllegalAccessException, InstantiationException {

        super.build();

        addStyleName("editorviewcomponent");


        binder = new MDDBinder(modelType);
        //binder = new Binder(modelType, true);



        VerticalLayout contentContainer = new VerticalLayout();
        contentContainer.addStyleName("contentcontainer");

        Map<HasValue, List<Validator>> validators = new HashMap<>();

        stylist = new VoidStylist();

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

        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(modelType);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).collect(Collectors.toList());

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


        addComponent(contentContainer);

        return this;
    }

    @Override
    public void addViewActionsMenuItems(MenuBar bar) {

        super.addViewActionsMenuItems(bar);

        bar.addItem("Save", VaadinIcons.STAR, new MenuBar.Command() {
            @Override
            public void menuSelected(MenuBar.MenuItem menuItem) {
                try {

                    //binder.writeBean(model);

                    save();

                    // cambiamos la url, para reflejar el cambio

                    ((MyUI)UI.getCurrent()).goTo(getOriginatingAction(), getModelType(), ReflectionHelper.getId(model));

                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }
        });
    }


    public abstract void save() throws Throwable;

    public abstract void load(Object id) throws Throwable;

    public AbstractStylist getStylist() {
        return stylist;
    }

    public void setStylist(AbstractStylist stylist) {
        this.stylist = stylist;
    }
}
