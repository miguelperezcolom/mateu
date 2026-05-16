package io.mateu.sample1.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"io.mateu", "io.mateu.sample1"})
public class WebfluxApp1Application {

    public static void main(String[] args) {
        SpringApplication.run(WebfluxApp1Application.class, args);
    }

}
