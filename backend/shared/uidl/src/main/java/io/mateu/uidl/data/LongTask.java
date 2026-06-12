package io.mateu.uidl.data;

import io.mateu.dtos.UIFragmentDto;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import reactor.core.publisher.Flux;

public class LongTask {

  static final String PROGRESS_VALUE_KEY = "progressValue";

  private final String title;
  private String doneTitle;
  private String doneText;
  private boolean progressBar;

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

  public LongTask withProgressBar() {
    this.progressBar = true;
    return this;
  }

  public Flux<?> run(Function<ProgressReporter, Flux<?>> work) {
    String id = UUID.randomUUID().toString();
    ProgressReporter reporter = new ProgressReporter(id, progressBar);

    return Flux.concat(Flux.just(openingDialog(id)), work.apply(reporter), closingFlux(id));
  }

  private Object openingDialog(String id) {
    Map<String, Object> initialData = new HashMap<>();
    initialData.put("progressText", "Iniciando...");
    initialData.put("title", title != null ? title : "");
    if (progressBar) {
      initialData.put(PROGRESS_VALUE_KEY, 0.0);
    }

    Object content =
        progressBar
            ? VerticalLayout.builder()
                .content(
                    List.of(
                        new Text("${state.progressText}"),
                        ProgressBar.builder()
                                .valueKey(PROGRESS_VALUE_KEY)
                                .style("width: 100%;")
                                .build()))
                .style("width: 100%;")
                .build()
            : new Text("${state.progressText}");

    return Dialog.builder()
        .id(id)
        .headerTitle("${state.title}")
        .content((io.mateu.uidl.fluent.Component) content)
        .closeButtonOnHeader(true)
        .initialData(initialData)
        .build();
  }

  private Flux<?> closingFlux(String id) {
    Map<String, Object> state = new HashMap<>();
    if (doneText != null) state.put("progressText", doneText);
    if (doneTitle != null) state.put("title", doneTitle);
    if (progressBar) state.put(PROGRESS_VALUE_KEY, 1.0);
    if (state.isEmpty()) return Flux.empty();
    return Flux.just(UIFragmentDto.builder().targetComponentId(id).state(state).build());
  }
}
