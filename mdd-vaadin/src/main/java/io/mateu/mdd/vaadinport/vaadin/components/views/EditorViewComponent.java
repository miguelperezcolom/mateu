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

public class EditorViewComponent extends ViewComponent {

    private final Object model;
    private Binder binder;

    public EditorViewComponent(Object model) {
        this.model = model;

        build();

    }

    private void build() {

        JPAFieldBuilder fieldBuilder = new JPAFieldBuilder();

        Class c = model.getClass();

        binder = new Binder(c);



        for (FieldInterfaced f : ReflectionHelper.getAllFields(c)) {

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


    private void save() throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                em.merge(model);
            }
        });
    }
}
