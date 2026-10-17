package io.mateu.uidl.annotations;

import io.mateu.uidl.data.StatusType;
import java.lang.annotation.Documented;
import java.lang.annotation.Target;

@Target({})
@Documented
public @interface StatusMapping {
  String from();

  StatusType to();
}
