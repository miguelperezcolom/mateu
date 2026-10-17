package io.mateu.uidl.annotations;

import io.mateu.uidl.data.StatusType;
import java.lang.annotation.Target;

@Target({})
public @interface StatusMapping {
  String from();

  StatusType to();
}
