package io.mateu.remote.domain.mappers;

import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.metadata.CrudMetadataBuilder;
import io.mateu.remote.domain.metadata.FormMetadataBuilder;
import io.mateu.remote.domain.metadata.ResultMetadataBuilder;
import io.mateu.remote.dtos.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ViewMapper {
    public View map(Object uiInstance) throws Exception {
        //mddopencrudaction, crud class

        if (false) { //todo: check si es un crud jpa
            System.out.println("es una crud jpa");
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

    public static Map<String, Object> getData(Object uiInstance) throws IOException {
        Map<String, Object> data = new HashMap<>();
        Class dataContainerClass = uiInstance.getClass();
        Object dataContainer = uiInstance;
        if (uiInstance instanceof RpcView) {
            return Map.of();
        }
        for (FieldInterfaced field : ReflectionHelper.getAllTransferrableFields(dataContainerClass)) {
            try {
                data.put(field.getId(), ReflectionHelper.getValue(field, dataContainer));
            } catch (Exception e) {
            }
        }
        return data;
    }

    private ViewMetadata getMetadata(Object uiInstance) {
        ViewMetadata metadata;

        if (uiInstance instanceof io.mateu.mdd.shared.interfaces.JourneyStarter) {
            metadata = getJourneyStarter((io.mateu.mdd.shared.interfaces.JourneyStarter) uiInstance);
        } else if (uiInstance instanceof io.mateu.mdd.shared.interfaces.JourneyRunner) {
            metadata = getJourneyRunner((io.mateu.mdd.shared.interfaces.JourneyRunner) uiInstance);
        } else if (uiInstance instanceof Result) {
            metadata = getResult((Result) uiInstance);
        } else if (uiInstance instanceof RpcView) {
            metadata = getCrud((RpcView) uiInstance);
        } else {
            metadata = getForm(uiInstance);
        }

        return metadata;
    }

    private JourneyRunner getJourneyRunner(io.mateu.mdd.shared.interfaces.JourneyRunner uiInstance) {
        return JourneyRunner.builder()
                .baseUrl(uiInstance.getBaseUrl())
                .journeyType(uiInstance.getJourneyType())
                .build();
    }

    private JourneyStarter getJourneyStarter(io.mateu.mdd.shared.interfaces.JourneyStarter uiInstance) {
        return JourneyStarter.builder()
                .baseUrl(uiInstance.getBaseUrl())
                .build();
    }

    private io.mateu.remote.dtos.Result getResult(Result uiInstance) {
        return new ResultMetadataBuilder().build(uiInstance);
    }

    private Form getForm(Object uiInstance) {
        return new FormMetadataBuilder().build(uiInstance);
    }

    private Crud getCrud(RpcView rpcView) {
        return new CrudMetadataBuilder().build(rpcView);
    }


}