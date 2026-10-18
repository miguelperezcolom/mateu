package io.mateu.sample1.chat;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;

/** A page that subscribes to nothing: a generated screen lands on it through the shell. */
@Title("Plain chat page")
@ReadOnly
public class ChatLabPlainPage {
  public String note = "Nothing subscribes here";
}
