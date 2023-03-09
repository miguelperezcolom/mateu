package io.mateu.remote.domain;

import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ViewMapper {
    public View map(Object uiInstance) throws Exception {
        //mddopencrudaction, crud class

        if (AbstractCrudView.class.isAssignableFrom(uiInstance.getClass())) {
            System.out.println("es una crud");
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
