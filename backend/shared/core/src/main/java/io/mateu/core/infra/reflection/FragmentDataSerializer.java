package io.mateu.core.infra.reflection;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DialogDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import java.util.Map;
import lombok.SneakyThrows;

final class FragmentDataSerializer {

  static UIFragmentDto serializeData(UIFragmentDto fragment) {
    return new UIFragmentDto(
        fragment.targetComponentId(),
        fragment.component(),
        toMap(fragment.state()),
        toMap(fragment.data()),
        isDialog(fragment) ? UIFragmentActionDto.Add : UIFragmentActionDto.Replace,
        fragment.containerId());
  }

  private static boolean isDialog(UIFragmentDto fragment) {
    return fragment.component() != null
        && fragment.component() instanceof ClientSideComponentDto
        && ((ClientSideComponentDto) fragment.component()).metadata() instanceof DialogDto;
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
    return fromJson(toJson(data));
  }
}
