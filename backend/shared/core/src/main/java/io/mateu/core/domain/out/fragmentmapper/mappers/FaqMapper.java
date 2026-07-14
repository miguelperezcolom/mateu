package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FaqDto;
import io.mateu.dtos.FaqItemDto;
import io.mateu.uidl.data.Faq;
import java.util.List;

public class FaqMapper {

  public static ClientSideComponentDto mapFaqToDto(Faq faq) {
    return new ClientSideComponentDto(
        FaqDto.builder()
            .items(
                faq.items() != null
                    ? faq.items().stream()
                        .map(
                            item ->
                                FaqItemDto.builder()
                                    .question(item.question())
                                    .answer(item.answer())
                                    .open(item.open())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        faq.id(),
        List.of(),
        faq.style(),
        faq.cssClasses(),
        null);
  }
}
