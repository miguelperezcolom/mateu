package io.mateu.mdd.core.interfaces;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.util.Helper;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.*;

public abstract class AbstractCrudView<R> extends AbstractJPQLListView<R>  implements RpcCrudView<AbstractJPQLListView, R, R>, StepInterceptor {

    @Override
    public boolean isAddEnabled() {
        return true;
    }

    @Override
    public boolean isEditHandled() {
        return true;
    }

    @Override
    public Object onEdit(R row) throws Throwable {
        return Helper.find(getRowClass(), ReflectionHelper.getId(row));
    }

    @Override
    public Object onEdit(String sid) throws Throwable {
        FieldInterfaced idField = ReflectionHelper.getIdField(getRowClass());
        Object id = null;
        if (idField != null && !Strings.isNullOrEmpty(sid)) {
            if (long.class.equals(idField.getType()) || Long.class.equals(idField.getType())) id = Long.parseLong(sid);
            else if (int.class.equals(idField.getType()) || Integer.class.equals(idField.getType())) id = Integer.parseInt(sid);
            else if (String.class.equals(idField.getType())) id = sid;
        }
        return Helper.find(getRowClass(), id);
    }



    @Override
    public Query buildQuery(EntityManager em, List<QuerySortOrder> sortOrders, boolean forCount) throws Throwable {
        return buildFilteredQueryFromEntityClass(em, sortOrders, forCount);
    }


    @Override
    public List<FieldInterfaced> getFilterFields() {
        return new ArrayList<>();
    }
}
