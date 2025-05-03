package io.mateu.core.application;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class FakeMateuServiceTest {

  final FakeMateuService fakeMateuService = new FakeMateuService();

  @Test
  void getUI() {
    assertNull(fakeMateuService.getUI(null, null, null, null).block());
  }

  @Test
  void createJourney() throws Throwable {
    assertNull(fakeMateuService.createJourney(null, null, null, null, null, null).block());
  }

  @Test
  void runStepAndReturn() throws Throwable {
    assertNull(fakeMateuService.runAction(null, null, null, null, null).block());
  }
}
