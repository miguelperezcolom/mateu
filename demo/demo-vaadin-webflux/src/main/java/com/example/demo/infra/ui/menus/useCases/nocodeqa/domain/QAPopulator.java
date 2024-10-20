package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain;

import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.environments.Environment;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.environments.EnvironmentRepository;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.executions.TestExecution;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.executions.TestExecutionRepository;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.executions.TestResult;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.*;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.steps.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class QAPopulator implements CommandLineRunner {

  @Autowired
  TestProjectRepository testProjectRepository;

  @Autowired
  TestRepository testRepository;

  @Autowired
  TestStepRepository testStepRepository;

  @Autowired
  EnvironmentRepository environmentRepository;

  @Autowired
  TestExecutionRepository testExecutionRepository;

  @Override
  public void run(String... args) {
    TestProject project = new TestProject();
    project.setName("My project");
    project.setGithubRepository("");
    project.setGithubApiKey("");
    project.setStatus(Status.Active);
    project.setComments("Created by populator");
    testProjectRepository.save(project);
    testRepository.save(createCrudTest(project));
    FreeTest freeTest;
    testRepository.save(freeTest = createFreeTest(project));
    createSteps(freeTest);
    createEnvironments();
    createExecutions();
  }

  private void createExecutions() {
    environmentRepository
        .findAll()
        .forEach(
            env -> {
              testRepository
                  .findAll()
                  .forEach(
                      t -> {
                        testExecutionRepository.save(createExecution(t, env));
                      });
            });
  }

  private TestExecution createExecution(Test t, Environment env) {
    TestExecution execution = new TestExecution();
    execution.setTest(t);
    execution.setEnvironment(env);
    execution.setWhen(LocalDateTime.now());
    execution.setResult(TestResult.Success);
    return execution;
  }

  private void createEnvironments() {
    environmentRepository.save(createEnvironment("Dev", "https://dev.wefox.com"));
    environmentRepository.save(createEnvironment("Stg", "https://stg.wefox.com"));
    environmentRepository.save(createEnvironment("Prod", "https://www.wefox.com"));
  }

  private Environment createEnvironment(String name, String url) {
    Environment env = new Environment();
    env.setName(name);
    env.setBaseUrl(url);
    return env;
  }

  private FreeTest createFreeTest(TestProject project) {
    FreeTest test = new FreeTest();
    test.setProject(project);
    test.setName("Sample free test");
    test.setStatus(Status.Active);
    test.setLastResult(Result.Success);
    test.setComments("created from populator");
    return test;
  }

  private List<TestStep> createSteps(FreeTest test) {
    List<TestStep> steps = new ArrayList<>();
    steps.add(createOpenUrlStep(test));
    steps.add(createFillFormStep(test));
    steps.add(createRunActionStep(test));
    steps.add(createExpectationStep(test));
    testStepRepository.saveAll(steps);
    return steps;
  }

  private TestStep createExpectationStep(FreeTest test) {
    ExpectedResult step = new ExpectedResult();
    step.setTest(test);
    step.setName("Check saved");
    step.setStatus(Status.Active);
    step.setComments("");
    step.setOrder(4);
    step.setText("saved");
    return step;
  }

  private TestStep createRunActionStep(FreeTest test) {
    RunAction step = new RunAction();
    step.setTest(test);
    step.setName("Save");
    step.setStatus(Status.Active);
    step.setComments("");
    step.setOrder(3);
    step.setLabel("Save");
    return step;
  }

  private TestStep createFillFormStep(FreeTest test) {
    FillForm step = new FillForm();
    step.setTest(test);
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

  private TestStep createOpenUrlStep(FreeTest test) {
    OpenUrl step = new OpenUrl();
    step.setTest(test);
    step.setName("Go to /");
    step.setStatus(Status.Active);
    step.setComments("");
    step.setOrder(1);
    step.setUrl("/");
    return step;
  }

  private Test createCrudTest(TestProject project) {
    CrudTest test = new CrudTest();
    test.setProject(project);
    test.setName("Sample crud test");
    test.setStatus(Status.Active);
    test.setLastResult(Result.Fail);
    test.setComments("created from populator");
    test.setMenuOption("Teams");
    test.setFilters("Name");
    test.setColumns("Id,Name");
    test.setFields("Id,Name");
    return test;
  }
}
