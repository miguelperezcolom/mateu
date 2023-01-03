package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.reflection.ReflectionHelper;

import java.lang.reflect.ParameterizedType;
import java.util.Set;

public interface RpcCrudView<F, C, T> extends RpcView<F, C> {

    default Object deserializeId(String sid) {
        try {
            return ReflectionHelper.newInstance(getEditorClass(), sid);
        } catch (Exception e) {
            e.printStackTrace();
            try {
                return ReflectionHelper.newInstance(getRowClass(), sid);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
        return null;
    }

    default Class<C> getRowClass() {
        return (Class<C>) ((ParameterizedType) getClass().getGenericInterfaces()[0]).getActualTypeArguments()[1];
    }

    default Class<T> getEditorClass() {
        return (Class<T>) ((ParameterizedType) getClass().getGenericInterfaces()[0]).getActualTypeArguments()[2];
    }

    default boolean isAddEnabled() {
        return true;
    };

    default boolean isDeleteEnabled() {
        return true;
    }

    default void delete(Set<C> selection) {};

    @Override
    default boolean isEditHandled() {
        return true;
    }

    @Override
    default Object onEdit(C row) throws Throwable {
        try {
            return ReflectionHelper.newInstance(getEditorClass(), row);
        } catch (Exception e) {
        }
        return null;
    }

    @Override
    default Object onNew() throws Throwable {
        try {
            return ReflectionHelper.newInstance(getEditorClass());
        } catch (Exception e) {
        }
        return null;
    }
}
