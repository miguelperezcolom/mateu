package io.mateu.mdd.ui.cruds;

import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.interfaces.JpaRpcCrudFactory;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;

@Service
public class JpaRpcCrudViewFactory implements JpaRpcCrudFactory {

    @Override
    public Listing create(Object parentEntity, FieldInterfaced field) throws Exception {
        MDDOpenCRUDAction action = new MDDOpenCRUDAction(field.getType());
        action.setExtraFilters(new ExtraFilters(":p.contains(x)", "p", parentEntity));
        return new JpaRpcCrudView(action);
    }
}
