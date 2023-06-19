package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.*;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QAPopulator implements CommandLineRunner {

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
        test.setLastResult(Result.Success);
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
        step.setName("Check saved");
        step.setStatus(Status.Active);
        step.setComments("");
        step.setOrder(4);
        step.setText("saved");
        return step;
    }

    private TestStep createRunActionStep() {
        RunAction step = new RunAction();
        step.setName("Save");
        step.setStatus(Status.Active);
        step.setComments("");
        step.setOrder(3);
        step.setLabel("Save");
        return step;
    }

    private TestStep createFillFormStep() {
        FillForm step = new FillForm();
        step.setName("Fill form");
        step.setStatus(Status.Active);
        step.setComments("");
        step.setOrder(2);
        step.setInputs(createInputs());
        return step;
    }

    private List<TestInput> createInputs() {
        List<TestInput> inputs = new ArrayList<>();
        TestInput input = new TestInput();
        input.setLabel("Name");
        input.setValue("Mateu");
        inputs.add(input);
        input = new TestInput();
        input.setLabel("Age");
        input.setValue("15");
        inputs.add(input);
        return inputs;
    }

    private TestStep createOpenUrlStep() {
        OpenUrl step = new OpenUrl();
        step.setName("Go to /");
        step.setStatus(Status.Active);
        step.setComments("");
        step.setOrder(1);
        step.setUrl("/");
        return step;
    }

    private Test createCrudTest() {
        CrudTest test = new CrudTest();
        test.setName("Crud test");
        test.setStatus(Status.Active);
        test.setLastResult(Result.Fail);
        test.setComments("created from populator");
        return test;
    }
}
