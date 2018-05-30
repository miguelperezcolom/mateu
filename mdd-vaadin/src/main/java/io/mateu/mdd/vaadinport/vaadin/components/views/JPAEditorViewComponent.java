package io.mateu.mdd.vaadinport.vaadin.components.views;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;

import javax.persistence.EntityManager;

public class JPAEditorViewComponent extends EditorViewComponent {

    public JPAEditorViewComponent(Class modelType) {
        super(modelType);
    }

    public JPAEditorViewComponent(Object model) {
        super(model);
    }

    @Override
    public void save() throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                em.merge(getModel());
            }
        });
    }

    @Override
    public void load(Object id) throws Throwable {
        if (id == null) {
            setModel(getModelType().newInstance());
        } else {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    setModel(em.find(getModelType(), id));
                }
            });
        }
    }
}
