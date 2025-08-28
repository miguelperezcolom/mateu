package com.example.demo.infra.data;

import com.example.demo.infra.in.data.RRAGenerator;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

@MicronautTest(startApplication = false)
class RRAGeneratorTest {

    @Inject
    RRAGenerator rraGenerator;


    @Test
    void generatesData() {

        rraGenerator.generate();

        System.out.println("generated");

    }

}