package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.data.*;
import jakarta.validation.constraints.NotEmpty;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

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
                        .id("progress")
                                        .headerTitle("${state.title}")
                                        .content(new Text("${state.progressText}"))
                                        .closeButtonOnHeader(true)
                        .initialData(Map.of(
                                "progressText", "Iniciando...",
                                "title", "Procesando..."
                        ))
                                        .build()),
                Flux.range(1, 10)
                        .delayElements(java.time.Duration.ofMillis(100))
                        .map(i -> UIFragmentDto.builder()
                                .targetComponentId("progress")
                                .state(Map.of("progressText", "Mensajes procesados: " + i + ""))
                                .build()),
                Flux.just(UIFragmentDto.builder()
                        .targetComponentId("progress")
                        .state(Map.of("progressText", "Hecho",
                                "title", "Terminado"))
                        .build())
        );
    }

}
