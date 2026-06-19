package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.mappers.DataMapper.mapItem;

import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.State;

public class StateMapper {

  public static UIFragmentDto mapStateToDto(State state, String targetComponentId) {
    return new UIFragmentDto(targetComponentId, null, mapItem(state.state()), null, UIFragmentActionDto.ReplaceKeepData, null);
  }
}
