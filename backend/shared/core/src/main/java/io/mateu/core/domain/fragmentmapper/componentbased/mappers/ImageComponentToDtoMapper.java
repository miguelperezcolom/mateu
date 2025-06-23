package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ImageDto;
import io.mateu.uidl.data.Image;
import java.util.List;

public class ImageComponentToDtoMapper {

  public static ComponentDto mapImageToDto(Image image) {
    return new ComponentDto(new ImageDto(image.src()), "fieldId", null, List.of());
  }
}
