package io.mateu.sample1.shell;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.Getter;
import lombok.Setter;

/** A screen of the shell that echoes the app context fixed by the header pickers. */
@Title("Probe")
@Getter
@Setter
public class ShellProbe {

  String note;

  @Button
  public Message whereAmI(HttpRequest httpRequest) {
    return new Message(
        "region=" + httpRequest.appContext("region") + " hotel=" + httpRequest.appContext("hotel"));
  }
}
