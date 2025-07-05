package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.Data;

public class DataComponentToDtoMapper {

  public static UIFragmentDto mapDataToDto(Data data, String targetComponentId) {
    return new UIFragmentDto(targetComponentId, null, data.data());
  }
}
