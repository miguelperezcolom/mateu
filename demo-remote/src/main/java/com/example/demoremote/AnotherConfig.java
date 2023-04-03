package com.example.demoremote;

import io.mateu.ReferenceForPackageScanning;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackageClasses = {ReferenceForPackageScanning.class, })
//@EnableJpaRepositories
//@EntityScan
public class AnotherConfig {
}
