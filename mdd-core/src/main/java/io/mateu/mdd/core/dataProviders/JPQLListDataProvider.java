package io.mateu.mdd.core.dataProviders;

import com.google.common.base.Strings;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.QLFilter;
import io.mateu.mdd.shared.annotations.QLForCombo;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.*;

public class JPQLListDataProvider extends com.vaadin.data.provider.ListDataProvider {


    private FieldInterfaced field;
    private Class entityClass;
    private Class targetClass;
    private String jpql;

    public JPQLListDataProvider(Collection items) {
        super(items);
    }

    public JPQLListDataProvider(String jpql) throws Throwable {
        super(JPAHelper.selectObjects(jpql));
        this.jpql = jpql;
    }

    public JPQLListDataProvider(String jpql, Map<String, Object> params) throws Throwable {
        super(JPAHelper.selectObjects(jpql, params));
        this.jpql = jpql;
    }

    public JPQLListDataProvider(String jpql, Class targetClass) throws Throwable {
        super(JPAHelper.selectObjects(jpql, targetClass));
        this.jpql = jpql;
        this.targetClass = targetClass;
    }

    public JPQLListDataProvider(EntityManager em, String jpql) {
        this(em.createQuery(jpql));
    }

    public JPQLListDataProvider(Query q) {
        super(q.getResultList());
        //super(q.setHint(QueryHints.CACHE_USAGE, CacheUsage.DoNotCheckCache).getResultList());
    }

    public JPQLListDataProvider(Class entityClass) {
        super(getInstances(entityClass));
        this.entityClass = entityClass;
    }

    private static Collection getInstances(Class entityClass) {
        List col = new ArrayList();
        try {
            JPAHelper.notransact(em -> col.addAll(buildQuery(em, entityClass, null).getResultList()));
        } catch (Throwable throwable) {
            Notifier.alert(throwable);
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
                JPAHelper.transact( em -> refresh(buildQuery(em, field)));
            } catch (Throwable throwable) {
                Notifier.alert(throwable);
            }
        } else if (entityClass != null) {
            try {
                JPAHelper.transact( em -> refresh(buildQuery(em, entityClass, null)));
            } catch (Throwable throwable) {
                Notifier.alert(throwable);
            }
        } else if (jpql != null) {
            try {
                if (targetClass != null) {
                    JPAHelper.transact( em -> refresh(em.createQuery(jpql, targetClass)));
                } else {
                    JPAHelper.transact( em -> refresh(em.createQuery(jpql)));
                }
            } catch (Throwable throwable) {
                Notifier.alert(throwable);
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
            JPAHelper.notransact(MDDUIAccessor.getApp().getPersistenceUnitName(), em -> refresh(em.createQuery(s)));
        } catch (Throwable throwable) {
            Notifier.alert(throwable);
        }
    }

    @Override
    public void refreshAll() {
        super.refreshAll();
    }
}
