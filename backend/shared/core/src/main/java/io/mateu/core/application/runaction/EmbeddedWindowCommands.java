package io.mateu.core.application.runaction;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Set;

/**
 * The answer to a request from an EMBEDDED micro frontend ({@code RunActionRqDto.embeddedChrome}: a
 * {@code MicroFrontend} with a {@code chrome}) carries no window commands: the island is a block of
 * another page, and the window — its title, the address bar, the favicon — belongs to that page.
 * Stripped here, at the end of every response (loads, actions, SSE steps, error pages), so no
 * producer of those commands (the page's title, a crud's history push, the shell's favicon) has to
 * know about it.
 */
public final class EmbeddedWindowCommands {

  /** What names or moves the window: never sent to an embedded island. */
  public static final Set<UICommandTypeDto> WINDOW_COMMANDS =
      Set.of(
          UICommandTypeDto.SetWindowTitle,
          UICommandTypeDto.SetFavicon,
          UICommandTypeDto.PushStateToHistory);

  private EmbeddedWindowCommands() {}

  /** Whether the request comes from an embedded micro frontend. */
  public static boolean embedded(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return false;
    }
    RunActionRqDto rq = httpRequest.runActionRq();
    return rq != null && rq.embedded();
  }

  /** The increment without its window commands when the request is embedded; as it is otherwise. */
  public static UIIncrementDto strip(UIIncrementDto increment, HttpRequest httpRequest) {
    if (increment == null || increment.commands() == null || !embedded(httpRequest)) {
      return increment;
    }
    return strip(increment);
  }

  /** The increment without its window commands. */
  public static UIIncrementDto strip(UIIncrementDto increment) {
    if (increment == null || increment.commands() == null) {
      return increment;
    }
    List<UICommandDto> kept =
        increment.commands().stream()
            .filter(c -> c == null || !WINDOW_COMMANDS.contains(c.type()))
            .toList();
    return kept.size() == increment.commands().size() ? increment : increment.withCommands(kept);
  }
}
