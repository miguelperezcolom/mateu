package io.mateu.mdd.core.dataProviders;

import com.google.common.base.Strings;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.QLFilter;
import io.mateu.mdd.core.annotations.QLForCombo;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.*;

public class JPQLListDataProvider extends com.vaadin.data.provider.ListDataProvider implements com.vaadin.data.provider.DataProvider {


    private FieldInterfaced field;
    private Class entityClass;
    private Class targetClass;
    private String jpql;

    public JPQLListDataProvider(Collection items) {
        super(items);
    }

    public JPQLListDataProvider(String jpql) throws Throwable {
        super(Helper.selectObjects(jpql));
        this.jpql = jpql;
    }

    public JPQLListDataProvider(String jpql, Class targetClass) throws Throwable {
        super(Helper.selectObjects(jpql, targetClass));
        this.jpql = jpql;
        this.targetClass = targetClass;
    }

    public JPQLListDataProvider(EntityManager em, String jpql) {
        this(em.createQuery(jpql));
    }

    public JPQLListDataProvider(Query q) {
        super(q.getResultList());
    }

    public JPQLListDataProvider(Class entityClass) {
        super(getInstances(entityClass));
        this.entityClass = entityClass;
    }

    private static Collection getInstances(Class entityClass) {
        List col = new ArrayList();
        try {
            Helper.notransact(em -> col.addAll(buildQuery(em, entityClass, null).getResultList()));
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
        return col;
    }

    public JPQLListDataProvider(EntityManager em, Class entityClass) {
        this(buildQuery(em, entityClass, null));
        this.entityClass = entityClass;
    }

    public JPQLListDataProvider(EntityManager em, FieldInterfaced field) {
        this(buildQuery(em, field));
        this.field = field;
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
        } else if (field.getGenericClass() != null) {
            return buildQuery(em, field.getGenericClass(), null);
        } else {
            return buildQuery(em, field.getType(), null);
        }
    }

    private static Query buildQuery(EntityManager em, Class entityClass, String filter) {

        String jpql = "select x from " + entityClass.getName() + " x";

        if (!Strings.isNullOrEmpty(filter)) jpql += " where " + filter;

        FieldInterfaced fname = ReflectionHelper.getNameField(entityClass);

        if (fname != null) jpql += " order by x." + fname.getName() + " ";

        return em.createQuery(jpql);

    }


    public void refresh() {
        if (field != null) {
            try {
                Helper.transact(em -> refresh(buildQuery(em, field)));
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        } else if (entityClass != null) {
            try {
                Helper.transact(em -> refresh(buildQuery(em, entityClass, null)));
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        } else if (jpql != null) {
            try {
                if (targetClass != null) {
                    Helper.transact(em -> refresh(em.createQuery(jpql, targetClass)));
                } else {
                    Helper.transact(em -> refresh(em.createQuery(jpql)));
                }
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        }
    }

    private void refresh(Query query) {
        List newItems = query.getResultList();
        getItems().clear();
        getItems().addAll(newItems);
        refreshAll();
    }

    public void refresh(String s) {
        try {
            Helper.notransact(em -> refresh(em.createQuery(s)));
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }
}
