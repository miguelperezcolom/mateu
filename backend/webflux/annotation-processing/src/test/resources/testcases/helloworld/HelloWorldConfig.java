package io.mateu.annotationProcessing.testcases.helloworld;

import io.mateu.ReferenceForPackageScanning;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration("io.mateu.annotationProcessing.testcases.helloworld.HelloWorldConfig")
@ComponentScan(basePackageClasses = ReferenceForPackageScanning.class)
public class HelloWorldConfig {
}

