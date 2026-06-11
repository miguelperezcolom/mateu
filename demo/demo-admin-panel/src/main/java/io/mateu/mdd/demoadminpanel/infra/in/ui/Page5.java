package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import reactor.core.publisher.Flux;

public class Page5 {


    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
            @NotEmpty
    String hotelId;


    @Button
    Object save() {
        return Message.success("Saved " + hotelId);
    }


    @Button
    @Action(sse = true)
    Flux<?> doSomethingLong() {
        return Flux.range(1, 10)
                .delayElements(java.time.Duration.ofMillis(500))
                .map(i -> Message.success("Mensaje " + i))
                .concatWith(Flux.just(Message.success("Hecho")));
    }

}
