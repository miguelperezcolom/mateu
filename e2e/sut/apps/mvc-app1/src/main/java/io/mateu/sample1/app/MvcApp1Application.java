package io.mateu.sample1.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"io.mateu", "io.mateu.sample1"})
public class MvcApp1Application {

    public static void main(String[] args) {
        SpringApplication.run(MvcApp1Application.class, args);
    }

}
