package io.mateu.explorer.examples.components.media;

import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.AvatarGroup;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Icon;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.VerticalAlignment;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import java.util.List;

/** An image, icons (typed: IconKey), avatars, an avatar group and badges, built fluently. */
public class FluentMedia implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                Image.builder().src("/explorer/components/media-and-badges/bay.svg").alt("The hotel on the bay").style("max-width: 16rem;").build(),
                HorizontalLayout.builder()
                    .spacing(true)
                    .verticalAlignment(VerticalAlignment.CENTER)
                    .content(
                        List.of(
                            new Icon(IconKey.Key),
                            new Icon(IconKey.Suitcase),
                            new Avatar("Tomás Ibarra"),
                            AvatarGroup.builder()
                                .maxItemsVisible(2)
                                .avatars(List.of(new Avatar("Marta Ruiz"), new Avatar("Joan Puig"), new Avatar("Nerea Gil")))
                                .build(),
                            Badge.builder().text("Confirmed").color("success").build(),
                            Badge.builder().text("VIP").color("success").primary(true).pill(true).build()))
                    .build()))
        .build();
  }
}
