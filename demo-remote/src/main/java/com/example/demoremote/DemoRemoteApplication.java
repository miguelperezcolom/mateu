package com.example.demoremote;

import io.mateu.remote.ReferenceForPackageScanning;
import io.mateu.remote.application.RemoteMateuController;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackageClasses = {DemoRemoteApplication.class, ReferenceForPackageScanning.class, })
public class DemoRemoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoRemoteApplication.class, args);
    }

}
