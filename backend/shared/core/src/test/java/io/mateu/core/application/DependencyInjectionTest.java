package io.mateu.core.application;

import com.example.FakeApplication;
import io.mateu.core.application.getui.GetUIUseCase;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = FakeApplication.class)
public class DependencyInjectionTest {

  @Inject GetUIUseCase useCase;

  @Test
  void isInjected() {
    Assertions.assertNotNull(useCase);
  }
}
