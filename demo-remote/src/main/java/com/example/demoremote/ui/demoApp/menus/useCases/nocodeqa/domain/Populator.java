package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.CrudTest;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.FreeTest;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.Test;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.TestRepository;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class Populator implements CommandLineRunner {

    @Autowired
    TestRepository testRepository;

    @Override
    public void run(String... args) throws Exception {
        testRepository.save(createCrudTest());
        testRepository.save(createFreeTest());
    }

    private Test createFreeTest() {
        FreeTest test = new FreeTest();
        test.setName("Free test");
        test.setStatus(Status.Active);
        test.setComments("created from populator");
        test.setSteps(createSteps());
        return test;
    }

    private List<TestStep> createSteps() {
        List<TestStep> steps = new ArrayList<>();
        steps.add(createOpenUrlStep());
        steps.add(createFillFormStep());
        steps.add(createRunActionStep());
        steps.add(createExpectationStep());
        return steps;
    }

    private TestStep createExpectationStep() {
        ExpectedResult step = new ExpectedResult();
        step.setText("saved");
        return step;
    }

    private TestStep createRunActionStep() {
        RunAction step = new RunAction();
        step.setLabel("Save");
        return step;
    }

    private TestStep createFillFormStep() {
        FillForm step = new FillForm();
        step.setInputs(createInputs());
        return step;
    }

    private List<Input> createInputs() {
        List<Input> inputs = new ArrayList<>();
        Input input = new Input();
        input.setLabel("Name");
        input.setValue("Mateu");
        inputs.add(input);
        input = new Input();
        input.setLabel("Age");
        input.setValue("15");
        inputs.add(input);
        return inputs;
    }

    private TestStep createOpenUrlStep() {
        OpenUrl step = new OpenUrl();
        step.setUrl("/");
        return step;
    }

    private Test createCrudTest() {
        CrudTest test = new CrudTest();
        test.setName("Crud test");
        test.setStatus(Status.Active);
        test.setComments("created from populator");
        return test;
    }
}
