package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MarkdownDto;
import io.mateu.uidl.data.Markdown;
import java.util.List;

public class MarkdownComponentToDtoMapper {

  public static ComponentDto mapMarkdownToDto(Markdown markdown) {
    return new ComponentDto(new MarkdownDto(markdown.markdown()), "fieldId", null, List.of());
  }
}
