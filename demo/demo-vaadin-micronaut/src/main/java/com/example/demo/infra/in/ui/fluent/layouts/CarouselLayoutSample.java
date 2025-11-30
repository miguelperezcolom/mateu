package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.CarouselLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

import static com.example.demo.infra.in.ui.fluent.layouts.LayoutSampleHelper.buildPanel;

@Route(value="/layouts/carousel", parentRoute="^$")
public class CarouselLayoutSample implements ComponentTreeSupplier {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Carousel Layout")
                .content(List.of(

                        new Text("basic (swipe to change)"),

                        CarouselLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .style("--skeleton-carousel-min-height: 9rem;")
                                .build(),

                        new Text("with nav and other things"),

                        CarouselLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .nav(true)
                                .dots(true)
                                .loop(true)
                                .style("--skeleton-carousel-min-height: 9rem;")
                                .build(),

                        new Text("")

                ))
                .build();
    }

}
