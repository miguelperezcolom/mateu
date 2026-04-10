package io.mateu.uidl.annotations;

import io.mateu.uidl.data.StatusType;

public @interface StatusMapping {
  String from();

  StatusType to();
}
