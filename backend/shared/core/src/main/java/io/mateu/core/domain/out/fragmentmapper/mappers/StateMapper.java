package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DataMapper.mapItem;
import static io.mateu.core.infra.declarative.FormViewModel.toMap;

import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.State;
import java.util.Collection;
import java.util.Map;

public class StateMapper {

  public static UIFragmentDto mapStateToDto(State state, String targetComponentId) {
    var raw = state.state();
    Object mapped =
        (raw == null || raw instanceof Map || raw instanceof Collection || isBasic(raw))
            ? mapItem(raw)
            : toMap(raw);
    return new UIFragmentDto(
        targetComponentId, null, mapped, null, UIFragmentActionDto.ReplaceKeepData, null);
  }
}
