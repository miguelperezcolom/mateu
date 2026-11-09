package io.mateu.explorer.examples.behaviour.offlinebanner;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * Nothing here handles connectivity: when a request cannot reach the server the client shows a
 * document-wide "offline" strip (it pushes the page down rather than covering it), and announces
 * the reconnection when traffic gets through again.
 */
@Title("Talk to the server")
public class ConnectionCheck {

  @Button
  Message ping() {
    return Message.success(
        "The server answered at " + LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
  }
}
