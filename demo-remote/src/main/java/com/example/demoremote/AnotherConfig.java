package com.example.demoremote;

import io.mateu.remote.ReferenceForPackageScanning;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@ComponentScan(basePackageClasses = {ReferenceForPackageScanning.class, })
//@EnableJpaRepositories
//@EntityScan
public class AnotherConfig {
}
