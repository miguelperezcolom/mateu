package io.mateu.mdd.core.interfaces;

import io.mateu.remote.dtos.UI;
import reactor.core.publisher.Mono;

public interface DynamicUI {

    Mono<UI> build();

}
