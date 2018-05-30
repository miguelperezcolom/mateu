package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.Binder;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAFieldBuilder;

import javax.persistence.EntityManager;
import java.util.List;

public abstract class EditorViewComponent extends ViewComponent {

    private Object model;
    private final Class modelType;

    private Binder binder;

    public EditorViewComponent(Class modelType) {
        this.modelType = modelType;
        try {
            this.model = modelType.newInstance();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }

        build();
    }


    public EditorViewComponent(Object model) {
        this.modelType = model.getClass();
        this.model = model;

        build();
    }


    public Object getModel() {
        return model;
    }

    public void setModel(Object model) {
        this.model = model;
        binder.readBean(model);
    }

    public Class getModelType() {
        return modelType;
    }

    private void build() {

        JPAFieldBuilder fieldBuilder = new JPAFieldBuilder();

        binder = new Binder(modelType);



        for (FieldInterfaced f : ReflectionHelper.getAllFields(modelType)) {

            if (fieldBuilder.isSupported(f)) fieldBuilder.build(f, model, this, binder);

        }


        binder.readBean(model);

    }

    @Override
    public void addMenuItems(MenuBar bar) {

        super.addMenuItems(bar);

        bar.addItem("Save", VaadinIcons.STAR, new MenuBar.Command() {
            @Override
            public void menuSelected(MenuBar.MenuItem menuItem) {
                try {

                    binder.writeBean(model);

                    save();
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }
        });
    }


    public abstract void save() throws Throwable;

    public abstract void load(Object id) throws Throwable;
}
