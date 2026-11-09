package io.mateu.explorer.examples.components.landing;

import io.mateu.uidl.data.Faq;
import io.mateu.uidl.data.FaqItem;
import io.mateu.uidl.data.Feature;
import io.mateu.uidl.data.FeatureGrid;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Testimonial;
import io.mateu.uidl.data.Testimonials;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** FeatureGrid (one clickable feature), Testimonials and a Faq, built fluently. */
public class FluentLanding implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                FeatureGrid.builder()
                    .columns(2)
                    .features(
                        List.of(
                            new Feature("🧖", "Spa", "Sauna, hammam and a heated pool.", "openSpa"),
                            new Feature("🚲", "Bikes", "Free city bikes at the door.", null)))
                    .build(),
                Testimonials.builder()
                    .items(List.of(new Testimonial("Best breakfast on the coast.", "Ana Soler", "Weekend stay", null, 5)))
                    .build(),
                Faq.builder()
                    .items(List.of(new FaqItem("Can I check in early?", "From 10:00 for € 30, subject to availability.", true)))
                    .build()))
        .build();
  }

  public Message openSpa() {
    return new Message("Spa: open 9:00–21:00, booking recommended");
  }
}
