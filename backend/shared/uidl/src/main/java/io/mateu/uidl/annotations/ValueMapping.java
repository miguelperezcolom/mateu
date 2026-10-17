package io.mateu.uidl.annotations;

import java.lang.annotation.Target;

@Target({})
public @interface ValueMapping {
  String from();

  String to();
}
