package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;

import java.lang.reflect.InvocationTargetException;

public interface JpaRpcCrudFactory {

    Listing create(Object parentEntity, FieldInterfaced field) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException, InstantiationException, Exception;

}
