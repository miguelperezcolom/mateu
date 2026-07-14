package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record TestimonialsDto(List<TestimonialDto> items) implements ComponentMetadataDto {

  public TestimonialsDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<TestimonialDto> items() {
    return Collections.unmodifiableList(items);
  }
}
