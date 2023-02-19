package io.mateu.remote.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Form.class, name = "Form"),
        @JsonSubTypes.Type(value = Crud.class, name = "Crud")
})
public interface ViewMetadata {

}
