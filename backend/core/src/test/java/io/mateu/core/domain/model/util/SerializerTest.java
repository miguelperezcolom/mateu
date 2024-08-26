package io.mateu.core.domain.model.util;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

import io.mateu.core.domain.model.reflection.fieldabstraction.FieldFactory;
import io.mateu.core.domain.model.reflection.usecases.*;
import io.mateu.core.domain.model.util.persistence.EntitySerializer;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import io.mateu.core.domain.uidefinition.shared.data.StepperStep;
import io.mateu.core.infra.MateuConfiguratorBean;
import io.mateu.dtos.ComponentMetadata;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;

class SerializerTest {

  Serializer serializer =
      new Serializer(
          mock(EntitySerializer.class),
          new ValueProvider(
              new GetterProvider(),
              new FieldByNameProvider(new AllFieldsProvider(new FieldFactory()))),
          new AllFieldsProvider(new FieldFactory()),
          new BasicTypeChecker(),
          new InstanceProvider(
              new MateuConfiguratorBean(mock(ApplicationContext.class)),
              new FieldByNameProvider(new AllFieldsProvider(new FieldFactory())),
              new ValueProvider(
                  new GetterProvider(),
                  new FieldByNameProvider(new AllFieldsProvider(new FieldFactory()))),
              new ValueWriter(
                  new SetterProvider(),
                  new GetterProvider(),
                  new FieldByNameProvider(new AllFieldsProvider(new FieldFactory()))),
              new AllFieldsProvider(new FieldFactory())),
          new ValueWriter(
              new SetterProvider(),
              new GetterProvider(),
              new FieldByNameProvider(new AllFieldsProvider(new FieldFactory()))));

  @Test
  void pojoFromJson() throws Exception {
    // given
    var json =
        new String(
            getClass().getResourceAsStream("serializer/pojofromjson.json").readAllBytes(),
            StandardCharsets.UTF_8);
    ;
    var destinationClass = ComponentMetadata.class;

    // when
    var object = serializer.pojoFromJson(json, destinationClass);

    // then
    assertNotNull(object);
  }

  @Test
  public void stepperIsSerialized() throws Exception {
    // given
    Stepper stepper =
        new Stepper(
            0,
            "Bad guy Information (Step 1 of 4)",
            List.of(
                new StepperStep("calculation", "STEP 1", "Insured Information", false, true),
                new StepperStep("priceSelection", "STEP 2", "Price Selection", false, false),
                new StepperStep("contract", "STEP 3", "Contract", false, false),
                new StepperStep("summary", "STEP 4", "Summary", false, false)));

    // when
    var json = serializer.toJson(stepper);

    // then
    assertNotNull(json);
  }
}
