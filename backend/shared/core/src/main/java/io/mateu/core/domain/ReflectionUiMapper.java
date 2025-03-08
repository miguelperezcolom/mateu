package io.mateu.core.domain;

import io.mateu.dtos.UIDto;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public class ReflectionUiMapper implements UiMapper {
    @Override
    public Mono<UIDto> map(Object uiInstance, String baseUrl, HttpRequest httpRequest) {
        if (uiInstance instanceof DynamicUI dynamicUI) {
            return dynamicUI.build();
        }
        return Mono.just(new UIDto("fav_icon", "page_title"));
    }
}
