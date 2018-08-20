package io.mateu.mdd.core.dataProviders;

import com.google.common.base.Strings;
import io.mateu.mdd.core.annotations.QLFilter;
import io.mateu.mdd.core.annotations.QLForCombo;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.Collection;
import java.util.Set;

public class JPQLListDataProvider extends com.vaadin.data.provider.ListDataProvider implements com.vaadin.data.provider.DataProvider {
    public JPQLListDataProvider(Collection items) {
        super(items);
    }

    public JPQLListDataProvider(String jpql) throws Throwable {
        super(Helper.selectObjects(jpql));
    }

    public JPQLListDataProvider(EntityManager em, String jpql) {
        this(em.createQuery(jpql));
    }

    public JPQLListDataProvider(Query q) {
        super(q.getResultList());
    }

    public JPQLListDataProvider(EntityManager em, Class entityClass) {
        this(buildQuery(em, entityClass, null));
    }

    public JPQLListDataProvider(EntityManager em, FieldInterfaced field) {
        this(buildQuery(em, field));
    }

    private Class getType(FieldInterfaced f) {
        if (Collection.class.isAssignableFrom(f.getType())) {
            return f.getGenericClass();
        } else if (Set.class.isAssignableFrom(f.getType())) {
            return f.getGenericClass();
        } else {
            return f.getType();
        }
    }

    private static Query buildQuery(EntityManager em, FieldInterfaced field) {
        if (field.isAnnotationPresent(QLForCombo.class) && !Strings.isNullOrEmpty(field.getAnnotation(QLForCombo.class).ql())) {
            return em.createQuery(field.getAnnotation(QLForCombo.class).ql());
        } else if (field.isAnnotationPresent(QLFilter.class) && !Strings.isNullOrEmpty(field.getAnnotation(QLFilter.class).value())) {
            return buildQuery(em, field.getGenericClass(), field.getAnnotation(QLFilter.class).value());
        } else {
            return buildQuery(em, field.getGenericClass(), null);
        }
    }

    private static Query buildQuery(EntityManager em, Class entityClass, String filter) {

        String jpql = "select x from " + entityClass.getName() + " x";

        if (!Strings.isNullOrEmpty(filter)) jpql += " where " + filter;

        FieldInterfaced fname = ReflectionHelper.getNameField(entityClass);

        if (fname != null) jpql += " order by x." + fname.getName() + " ";

        return em.createQuery(jpql);

    }

}
