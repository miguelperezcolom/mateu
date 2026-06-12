package io.mateu.uidl.data;

import io.mateu.dtos.UIFragmentDto;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import reactor.core.publisher.Flux;

public class LongTask {

  private final String title;
  private String doneTitle;
  private String doneText;

  private LongTask(String title) {
    this.title = title;
  }

  public static LongTask create(String title) {
    return new LongTask(title);
  }

  public LongTask done(String doneTitle, String doneText) {
    this.doneTitle = doneTitle;
    this.doneText = doneText;
    return this;
  }

  public Flux<?> run(Function<ProgressReporter, Flux<?>> work) {
    String id = UUID.randomUUID().toString();
    ProgressReporter reporter = new ProgressReporter(id);

    return Flux.concat(Flux.just(openingDialog(id)), work.apply(reporter), closingFlux(id));
  }

  private Object openingDialog(String id) {
    return Dialog.builder()
        .id(id)
        .headerTitle("${state.title}")
        .content(new Text("${state.progressText}"))
        .closeButtonOnHeader(true)
        .initialData(Map.of("progressText", "Iniciando...", "title", title != null ? title : ""))
        .build();
  }

  private Flux<?> closingFlux(String id) {
    Map<String, Object> state = new HashMap<>();
    if (doneText != null) state.put("progressText", doneText);
    if (doneTitle != null) state.put("title", doneTitle);
    if (state.isEmpty()) return Flux.empty();
    return Flux.just(UIFragmentDto.builder().targetComponentId(id).state(state).build());
  }
}
