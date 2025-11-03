package com.example.demo;

import io.mateu.core.domain.ports.InstanceFactory;
import jakarta.inject.Inject;
import jakarta.inject.Named;

import java.util.List;

@Named
public class TestFactory {

    @Inject
    List<InstanceFactory> factories;


}
