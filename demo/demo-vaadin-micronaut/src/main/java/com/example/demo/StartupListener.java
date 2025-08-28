package com.example.demo;

import com.example.demo.infra.in.data.RRAGenerator;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.runtime.server.event.ServerStartupEvent;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import lombok.extern.slf4j.Slf4j;

@Singleton
@Slf4j
public class StartupListener implements ApplicationEventListener<ServerStartupEvent> {

    private final RRAGenerator rraGenerator;

    @Inject
    public StartupListener(RRAGenerator rraGenerator) {
        this.rraGenerator = rraGenerator;
    }

    @Override
    public void onApplicationEvent(ServerStartupEvent event) {
        log.info("Micronaut application has started!");
        runStartupTasks();

    }

    private void runStartupTasks() {
        log.info("Performing startup tasks such as initializing resources.");
        rraGenerator.generate();
    }

}