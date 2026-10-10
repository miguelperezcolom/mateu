package io.mateu.springdata.fixtures;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/** An H2-backed Spring Boot JPA context for the store tests. */
@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class TestJpaApp {}
