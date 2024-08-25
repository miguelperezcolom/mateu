package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.List;
import java.util.Map;

/**
 * A common interface for componentIds
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = GenericComponent.class, name = "GenericComponent"),
        @JsonSubTypes.Type(value = CrudComponent.class, name = "CrudComponent"),
})

public interface Component {

    ComponentMetadata metadata();
    String id();
    String className();
    Map<String, Object> attributes();
    Map<String, Object> data();
    List<String> childComponentIds();

}
