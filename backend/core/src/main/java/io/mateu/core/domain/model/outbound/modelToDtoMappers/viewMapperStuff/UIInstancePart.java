package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import io.mateu.core.domain.model.reflection.Field;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UIInstancePart {

  private String dataPrefix;

  private Object uiInstance;

  private List<Field> fields;
}