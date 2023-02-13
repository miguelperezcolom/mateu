package com.example.demoremote;

import io.mateu.remote.application.RemoteMateuController;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication(scanBasePackageClasses = {DemoRemoteApplication.class, RemoteMateuController.class})
public class DemoRemoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoRemoteApplication.class, args);
    }

}
