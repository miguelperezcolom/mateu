package io.mateu.mdd.demoadminpanel.infra.in.ui.testimonials;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Testimonial;
import io.mateu.uidl.data.Testimonials;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link Testimonials} component: customer quote cards. */
@UI("/testimonials-demo")
@Title("What customers say")
public class CustomerVoices {

  @Section("Testimonials")
  Component testimonials =
      Testimonials.builder()
          .items(
              List.of(
                  Testimonial.builder()
                      .quote("We shipped our internal tool in a weekend. Zero frontend code.")
                      .author("Ada Lovelace")
                      .role("CTO, Analytical Engines")
                      .avatar("👩‍💼")
                      .rating(5)
                      .build(),
                  Testimonial.builder()
                      .quote("The multi-renderer story sold it — same model, mobile and web.")
                      .author("Alan Turing")
                      .role("Head of Platform, Bletchley")
                      .avatar("🧑‍💻")
                      .rating(5)
                      .build(),
                  Testimonial.builder()
                      .quote("Solid, pragmatic, and the AI chat is a genuine time-saver.")
                      .author("Grace Hopper")
                      .role("VP Engineering, COBOL Inc")
                      .avatar("👩‍🔬")
                      .rating(4)
                      .build()))
          .build();
}
