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
    return mapStateToDto(state, targetComponentId, null);
  }

  /**
   * The state an action answered ({@code new State(this)}): like the state of a rendered view, it
   * carries nothing the caller may not read.
   */
  @SuppressWarnings("unchecked")
  public static UIFragmentDto mapStateToDto(
      State state, String targetComponentId, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    var raw = state.state();
    Object mapped =
        (raw == null || raw instanceof Map || raw instanceof Collection || isBasic(raw))
            ? mapItem(raw)
            : io.mateu.core.domain.FieldAccess.readable(
                (Object) raw, (Map<String, Object>) toMap(raw), httpRequest);
    return new UIFragmentDto(
        targetComponentId, null, mapped, null, UIFragmentActionDto.ReplaceKeepData, null);
  }
}
