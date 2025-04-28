package io.mateu.core.domain;

import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import reactor.core.publisher.Mono;

import java.util.List;

@Named
public class ReflectionUiIncrementMapper implements UiIncrementMapper {
    @Override
    public Mono<UIIncrementDto> map(Object instance, String baseUrl, HttpRequest httpRequest) {
        if (instance == null) {
            return Mono.empty();
        }
        if (instance instanceof UIIncrementDto uiIncrementDto) {
            return Mono.just(uiIncrementDto);
        }
        return Mono.just(
                new UIIncrementDto(
                        null,
                        null,
                        null,
                        null
                ));
    }
}
