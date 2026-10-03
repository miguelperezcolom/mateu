package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.data.LongTask;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import reactor.core.publisher.Flux;

public class Page5 {


    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
            @NotEmpty
    String hotelId;

    // MULTI-valued: the ids show as chips; «Add» opens the same selector with row checkboxes and
    // «Add selected» (a row click adds that one hotel)
    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
    List<String> hotelIds = new ArrayList<>(List.of("3"));


    @Button
    Object save() {
        return Message.success("Saved " + hotelId + " " + hotelIds);
    }


    @Button
    @Action(validationRequired = false)
    Flux<?> doSomethingLong() {
        return LongTask.create("Procesando...")
                .withProgressBar()
                .done("Terminado", "Hecho")
                .closeAfter(3)
                .withCommand(UICommand.navigateTo("/xxxx"))
                .run(progress -> Flux.range(1, 10)
                        .delayElements(java.time.Duration.ofMillis(100))
                        .map(i -> progress.step("Mensajes procesados: " + i, i / 10d)));
    }

}
