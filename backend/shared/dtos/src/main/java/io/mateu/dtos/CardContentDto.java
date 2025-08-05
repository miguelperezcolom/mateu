package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.v3.oas.annotations.media.Schema;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = CardTextContentDto.class, name = "text"),
  @JsonSubTypes.Type(value = CardImageAndTextContentDto.class, name = "image-and-text"),
  @JsonSubTypes.Type(value = CardScrollerContentDto.class, name = "scroller")
})
@Schema(
    oneOf = {
      CardTextContentDto.class,
      CardImageAndTextContentDto.class,
      CardScrollerContentDto.class
    })
public interface CardContentDto {}
