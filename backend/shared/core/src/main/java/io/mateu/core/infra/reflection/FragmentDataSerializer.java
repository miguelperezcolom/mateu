package io.mateu.core.infra.reflection;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;

import io.mateu.core.infra.declarative.FormViewModel;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DialogDto;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import java.util.Collection;
import java.util.Map;
import lombok.SneakyThrows;

final class FragmentDataSerializer {

  static UIFragmentDto serializeData(UIFragmentDto fragment) {
    return new UIFragmentDto(
        fragment.targetComponentId(),
        fragment.component(),
        toMap(fragment.state()),
        toMap(fragment.data()),
        isOverlay(fragment) ? UIFragmentActionDto.Add : UIFragmentActionDto.Replace,
        fragment.containerId());
  }

  // Overlays (dialogs, drawers) are ADDED on top of the initiator component instead of
  // replacing its content, so the page underneath stays alive while the overlay is open.
  private static boolean isOverlay(UIFragmentDto fragment) {
    return fragment.component() != null
        && fragment.component() instanceof ClientSideComponentDto
        && (((ClientSideComponentDto) fragment.component()).metadata() instanceof DialogDto
            || ((ClientSideComponentDto) fragment.component()).metadata() instanceof DrawerDto);
  }

  @SneakyThrows
  static Object toMap(Object data) {
    if (data == null) {
      return null;
    }
    if (data instanceof Map) {
      return data;
    }
    if (isBasic(data)) {
      return data;
    }
    if (data instanceof Collection) {
      return fromJson(toJson(data));
    }
    return FormViewModel.toMap(data);
  }
}
