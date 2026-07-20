package io.mateu.federation.remoteapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"io.mateu", "io.mateu.federation.remote"})
public class FedRemoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(FedRemoteApplication.class, args);
    }

}
