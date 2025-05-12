package com.example.demo;

import io.mateu.core.domain.InstanceFactory;
import jakarta.inject.Inject;
import jakarta.inject.Named;

import java.util.List;

@Named
public class TestFactory {

    @Inject
    List<InstanceFactory> factories;


}
