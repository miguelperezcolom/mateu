package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

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
                for (Object o : getMergeables()) em.merge(o);
                Object m = getModel();
                setModel(em.merge(m));
            }
        });
    }

    @Override
    public void load(Object id) throws Throwable {
        if (id == null) {
            newRecord = true;
            setModel(getModelType().newInstance());
        } else {
            newRecord = false;
            Helper.notransact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    setModel(em.find(getModelType(), id));
                }
            });
        }
    }

}
