package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.Data;

public class DataComponentToDtoMapper {

  public static UIFragmentDto mapDataToDto(
      Data data, String targetComponentId, Object componentSupplier) {
    return new UIFragmentDto(targetComponentId, null, data.newState(), data.data(), null);
  }
}
