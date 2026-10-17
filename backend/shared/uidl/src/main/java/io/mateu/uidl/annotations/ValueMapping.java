package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.Target;

@Target({})
@Documented
public @interface ValueMapping {
  String from();

  String to();
}
