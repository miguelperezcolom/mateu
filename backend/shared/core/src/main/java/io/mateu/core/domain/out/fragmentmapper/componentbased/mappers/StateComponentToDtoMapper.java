package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.DataComponentToDtoMapper.mapItem;

import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.State;

public class StateComponentToDtoMapper {

  public static UIFragmentDto mapStateToDto(State state, String targetComponentId) {
    return new UIFragmentDto(targetComponentId, null, mapItem(state.state()), null, null, null);
  }
}
