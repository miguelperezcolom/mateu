package io.mateu.federation.sectionsapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The same federation as fed-shell-app, drawn as HAMBURGER_SECTIONS (Opera Cloud style): the
 * hamburger holds the sections and the band under the header the entries of the one on screen
 * (tests/federation-sections).
 */
@SpringBootApplication(scanBasePackages = "io.mateu.federation")
public class FedSectionsApplication {

    public static void main(String[] args) {
        SpringApplication.run(FedSectionsApplication.class, args);
    }

}
