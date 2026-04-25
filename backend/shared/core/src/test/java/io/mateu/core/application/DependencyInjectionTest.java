package io.mateu.core.application;

import com.example.FakeApplication;
import io.mateu.core.application.runaction.RunActionUseCase;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled(
    "Requires full Spring Boot context with web layer - run in webflux-core or mvc-core module")
@SpringBootTest(classes = FakeApplication.class)
public class DependencyInjectionTest {

  @Inject RunActionUseCase useCase;

  @Test
  void isInjected() {
    Assertions.assertNotNull(useCase);
  }
}
