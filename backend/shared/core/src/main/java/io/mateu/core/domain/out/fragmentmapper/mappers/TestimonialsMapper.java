package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.TestimonialDto;
import io.mateu.dtos.TestimonialsDto;
import io.mateu.uidl.data.Testimonials;
import java.util.List;

public class TestimonialsMapper {

  public static ClientSideComponentDto mapTestimonialsToDto(Testimonials testimonials) {
    return new ClientSideComponentDto(
        TestimonialsDto.builder()
            .items(
                testimonials.items() != null
                    ? testimonials.items().stream()
                        .map(
                            item ->
                                TestimonialDto.builder()
                                    .quote(item.quote())
                                    .author(item.author())
                                    .role(item.role())
                                    .avatar(item.avatar())
                                    .rating(item.rating())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        testimonials.id(),
        List.of(),
        testimonials.style(),
        testimonials.cssClasses(),
        null);
  }
}
