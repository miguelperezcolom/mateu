package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MarkdownDto;
import io.mateu.uidl.data.Markdown;
import java.util.List;

public class MarkdownComponentToDtoMapper {

  public static ClientSideComponentDto mapMarkdownToDto(Markdown markdown) {
    return new ClientSideComponentDto(
        new MarkdownDto(markdown.markdown()),
        "fieldId",
        List.of(),
        markdown.style(),
        markdown.cssClasses(),
        null);
  }
}
