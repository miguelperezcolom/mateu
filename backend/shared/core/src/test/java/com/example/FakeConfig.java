package com.example;

import io.mateu.ReferenceForPackageScanning;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration("com.example.FakeConfig")
@ComponentScan(basePackageClasses = ReferenceForPackageScanning.class)
public class FakeConfig {
}