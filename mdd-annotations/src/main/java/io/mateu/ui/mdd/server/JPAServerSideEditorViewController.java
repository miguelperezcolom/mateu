package io.mateu.ui.mdd.server;

import io.mateu.ui.core.server.ServerSideEditorViewController;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.Pair;
import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;
import org.apache.commons.beanutils.BeanUtils;

import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.EntityManager;
import java.lang.reflect.Method;

/**
 * Created by miguel on 7/1/17.
 */
public abstract class JPAServerSideEditorViewController extends ServerSideEditorViewController {

    @Override
    public Data get(Object id) throws Throwable {
        if (id instanceof Long) return new ERPServiceImpl().get("", getModelClass().getName(), (long) id);
        else if (id instanceof Integer) return new ERPServiceImpl().get("", getModelClass().getName(), (int) id);
        else if (id instanceof String) return new ERPServiceImpl().get("", getModelClass().getName(), (String) id);
        else return null;
    }

    @Override
    public Object set(Data data) throws Throwable {
        return new ERPServiceImpl().set("", getModelClass().getName(), data).get("_id");
    }

   public abstract Class getModelClass();
}
