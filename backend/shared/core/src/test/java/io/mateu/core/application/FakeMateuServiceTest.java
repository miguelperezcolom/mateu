package io.mateu.core.application;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FakeMateuServiceTest {

    final FakeMateuService fakeMateuService = new FakeMateuService();

    @Test
    void getUI() {
        assertNull(fakeMateuService.getUI(
                null,
                null,
                null,
                null).block());
    }

    @Test
    void createJourney() throws Throwable {
        assertNull(fakeMateuService
                .createJourney(
                        null,
                        null,
                        null,
                        null,
                        null, null).block());
    }

    @Test
    void runStepAndReturn() throws Throwable {
        assertNull(fakeMateuService
                .runStepAndReturn(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null).block());
    }

    @Test
    void getListRows() throws Throwable {
        assertNull(fakeMateuService
                .getListRows(
                        null,
                        0,
                        0,
                        null,
                        null,
                        null,
                        null,
                        null).block());
    }

    @Test
    void getItems() throws Throwable {
        assertNull(fakeMateuService
                .getItems(
                        null,
                        0,
                        0,
                        null).block());
    }
}