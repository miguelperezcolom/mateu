package io.mateu.core.application.out;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import java.util.concurrent.CompletableFuture;

public interface MateuHttpClient {
  CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request);
}
