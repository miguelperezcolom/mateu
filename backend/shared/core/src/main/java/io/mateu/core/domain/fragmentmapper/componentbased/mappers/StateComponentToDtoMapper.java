package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.State;

public class StateComponentToDtoMapper {

  public static UIFragmentDto mapStateToDto(State state, String targetComponentId) {
    return new UIFragmentDto(targetComponentId, null, state.state(), null, null);
  }
}
