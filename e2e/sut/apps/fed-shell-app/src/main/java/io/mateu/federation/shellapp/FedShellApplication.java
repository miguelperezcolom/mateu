package io.mateu.federation.shellapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"io.mateu", "io.mateu.federation.shell"})
public class FedShellApplication {

    public static void main(String[] args) {
        SpringApplication.run(FedShellApplication.class, args);
    }

}
