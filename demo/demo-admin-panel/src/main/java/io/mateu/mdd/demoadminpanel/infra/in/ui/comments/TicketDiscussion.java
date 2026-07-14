package io.mateu.mdd.demoadminpanel.infra.in.ui.comments;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Comment;
import io.mateu.uidl.data.CommentThread;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link CommentThread} component: a ticket discussion with nested replies. */
@UI("/comments-demo")
@Title("Ticket #4821")
public class TicketDiscussion {

  @Section("Discussion")
  Component thread =
      CommentThread.builder()
          .comments(
              List.of(
                  Comment.builder()
                      .author("Ada Lovelace")
                      .avatar("👩‍💼")
                      .timestamp("2h ago")
                      .text("The export button throws a 500 for large datasets. Can we look at this?")
                      .replies(
                          List.of(
                              Comment.builder()
                                  .author("Alan Turing")
                                  .avatar("🧑‍💻")
                                  .timestamp("1h ago")
                                  .text("Reproduced. It's a timeout on the streaming query.")
                                  .replies(
                                      List.of(
                                          Comment.builder()
                                              .author("Grace Hopper")
                                              .avatar("👩‍🔬")
                                              .timestamp("40m ago")
                                              .text("I'll add pagination to the export. ETA today.")
                                              .build()))
                                  .build(),
                              Comment.builder()
                                  .author("Katherine J.")
                                  .avatar("📊")
                                  .timestamp("55m ago")
                                  .text("+1, this is blocking the monthly report.")
                                  .build()))
                      .build(),
                  Comment.builder()
                      .author("Linus T.")
                      .avatar("🐧")
                      .timestamp("20m ago")
                      .text("Merged the fix to staging. Please verify.")
                      .build()))
          .build();
}
