package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ImageDto;
import io.mateu.uidl.data.Image;
import java.util.List;

public class ImageComponentToDtoMapper {

  public static ClientSideComponentDto mapImageToDto(Image image) {
    return new ClientSideComponentDto(
        new ImageDto(image.src()), "fieldId", List.of(), image.style(), image.cssClasses(), null);
  }
}
