package io.mateu.remote.domain;

import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Help;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ViewMapper {
    public View map(Object uiInstance) throws Exception {
        //mddopencrudaction, crud class

        if (uiInstance instanceof MDDOpenCRUDAction) {

        } else if (uiInstance instanceof Class && RpcView.class.isAssignableFrom((Class<?>) uiInstance)) {
            uiInstance = ReflectionHelper.newInstance((Class) uiInstance);
        }


        View view = View.builder()
                .components(List.of(
                        Component.builder()
                                .metadata(getMetadata(uiInstance))
                                .data(getData(uiInstance))
                                .rules(List.of())
                                .build()
                ))
                .build();

        return view;
    }

    private Map<String, Object> getData(Object uiInstance) throws IOException {
        Map<String, Object> data = new HashMap<>();
        for (FieldInterfaced field : ReflectionHelper.getAllEditableFields(uiInstance.getClass())) {
            try {
                data.put(field.getId(), ReflectionHelper.getValue(field, uiInstance));
            } catch (Exception e) {
            }
        }
        return data;
    }

    private ViewMetadata getMetadata(Object uiInstance) {
        ViewMetadata metadata;

        if (uiInstance instanceof RpcView) {
            metadata = getCrud((RpcView) uiInstance);
        } else {
            metadata = getForm(uiInstance);
        }

        return metadata;
    }

    private Form getForm(Object uiInstance) {
        return new FormMetadataBuilder().build(uiInstance);
    }

    private Crud getCrud(RpcView rpcView) {
        return new CrudMetadataBuilder().build(rpcView);
    }


}
