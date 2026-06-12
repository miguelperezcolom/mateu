package io.mateu.uidl.data;

import io.mateu.dtos.UIFragmentDto;
import java.util.HashMap;
import java.util.Map;

public class ProgressReporter {

  private final String dialogId;
  private final boolean progressBar;

  ProgressReporter(String dialogId, boolean progressBar) {
    this.dialogId = dialogId;
    this.progressBar = progressBar;
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

  public Object step(String text, double progress) {
    Map<String, Object> state = new HashMap<>();
    state.put("progressText", text);
    if (progressBar) state.put(LongTask.PROGRESS_VALUE_KEY, progress);
    return UIFragmentDto.builder().targetComponentId(dialogId).state(state).build();
  }

  public Object step(String text, String title, double progress) {
    Map<String, Object> state = new HashMap<>();
    state.put("progressText", text);
    state.put("title", title);
    if (progressBar) state.put(LongTask.PROGRESS_VALUE_KEY, progress);
    return UIFragmentDto.builder().targetComponentId(dialogId).state(state).build();
  }
}
