package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
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
        return Flux.concat(
                Flux.just(Dialog.builder()
                        .headerTitle("Procesando...")
                        .content(new Text("La operación está en curso."))
                        .closeButtonOnHeader(true)
                        .build()),
                Flux.range(1, 10)
                        .delayElements(java.time.Duration.ofMillis(500))
                        .map(i -> Message.success("Mensaje " + i)),
                Flux.just(Message.success("Hecho"))
        );
    }

}
