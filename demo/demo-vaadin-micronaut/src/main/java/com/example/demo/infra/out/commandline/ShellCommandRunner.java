package com.example.demo.infra.out.commandline;

import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.runtime.event.annotation.EventListener;
import io.micronaut.runtime.server.event.ServerShutdownEvent;
import io.micronaut.runtime.server.event.ServerStartupEvent;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Slf4j
public class ShellCommandRunner {

    static ExecutorService executorService =
            new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS,
                    new LinkedBlockingQueue<Runnable>());

    @SneakyThrows
    public static String runCommand(String... command) {
        log.info("running " + Arrays.toString(command));
        ProcessBuilder builder = new ProcessBuilder();
        builder.command(command);
        builder.directory(new File(System.getProperty("user.home")));
        Process process = builder.start();
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        StreamGobbler streamGobbler =
                new StreamGobbler(process.getInputStream(), pw::println);
        Future<?> future = executorService.submit(streamGobbler);

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new Exception("Error when running " + String.join(" ", command) +
                    ". Exit code: " + exitCode);
        }
        return sw.toString();
    }

    @SneakyThrows
    public static String runCommand(String command) {
        return runCommand(command.split(" "));
    }


    @EventListener
    public void handle(ServerShutdownEvent event) {
        log.info(">>> ServerShutdownEvent annotation based listener raised");
        executorService.shutdownNow();
    }
}
