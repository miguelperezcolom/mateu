package io.mateu.mdd.vaadinport.vaadin.components.dataProviders;

import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.Collection;

public class JPQLListDataProvider extends com.vaadin.data.provider.ListDataProvider implements com.vaadin.data.provider.DataProvider {
    public JPQLListDataProvider(Collection items) {
        super(items);
    }

    public JPQLListDataProvider(EntityManager em, String jpql) {
        this(em.createQuery(jpql));
    }

    public JPQLListDataProvider(Query q) {
        super(q.getResultList());
    }

    public JPQLListDataProvider(EntityManager em, Class entityClass) {
        this(buildQuery(em, entityClass));
    }

    private static Query buildQuery(EntityManager em, Class entityClass) {

        String jpql = "select x from " + entityClass.getName() + " x";

        FieldInterfaced fname = ReflectionHelper.getNameField(entityClass);

        if (fname != null) jpql += " order by x." + fname.getName() + " ";

        return em.createQuery(jpql);

    }

}
