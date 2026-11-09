package io.mateu.explorer.examples.components.activity;

import io.mateu.uidl.data.Comment;
import io.mateu.uidl.data.CommentThread;
import io.mateu.uidl.data.FileItem;
import io.mateu.uidl.data.FileList;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Timeline;
import io.mateu.uidl.data.TimelineItem;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * A Timeline whose last event is clickable, a CommentThread and a FileList whose file opens through
 * an action — the methods named by the actionIds run on the server.
 */
public class FluentActivity implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                Timeline.builder()
                    .items(
                        List.of(
                            TimelineItem.builder().id("e1").title("Booked online").timestamp("2 Oct").icon("🌐").build(),
                            TimelineItem.builder()
                                .id("e2")
                                .title("Card declined on pre-authorisation")
                                .description("Click to see the bank's answer")
                                .timestamp("13 Nov")
                                .icon("⚠️")
                                .color("#ef4444")
                                .actionId("openDecline")
                                .build()))
                    .build(),
                CommentThread.builder()
                    .comments(
                        List.of(
                            Comment.builder()
                                .id("c1")
                                .author("Marta Ruiz")
                                .text("Quiet room, please.")
                                .timestamp("2 h ago")
                                .replies(List.of(Comment.builder().id("c2").author("Joan Puig").text("Moved to 214.").timestamp("1 h ago").build()))
                                .build()))
                    .build(),
                FileList.builder()
                    .files(List.of(FileItem.builder().name("invoice-HB-20431.pdf").size("64 KB").type("application/pdf").actionId("openInvoice").build()))
                    .build()))
        .build();
  }

  public Message openDecline() {
    return Message.warning("Bank answer: 51 — insufficient funds");
  }

  public Message openInvoice() {
    return new Message("Generating invoice HB-20431…");
  }
}
