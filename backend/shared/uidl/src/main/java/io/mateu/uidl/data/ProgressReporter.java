package io.mateu.uidl.data;

import io.mateu.dtos.UIFragmentDto;
import java.util.Map;

public class ProgressReporter {

  private final String dialogId;

  ProgressReporter(String dialogId) {
    this.dialogId = dialogId;
  }

  public Object step(String text) {
    return UIFragmentDto.builder()
        .targetComponentId(dialogId)
        .state(Map.of("progressText", text))
        .build();
  }

  public Object step(String text, String title) {
    return UIFragmentDto.builder()
        .targetComponentId(dialogId)
        .state(Map.of("progressText", text, "title", title))
        .build();
  }
}
