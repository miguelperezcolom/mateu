package io.mateu.remote.domain.modelToDtoMappers.viewMapperStuff;

import io.mateu.mdd.shared.reflection.FieldInterfaced;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data@AllArgsConstructor
public class UIInstancePart {

    private String dataPrefix;

    private Object uiInstance;

    private List<FieldInterfaced> fields;

}
