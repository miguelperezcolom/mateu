package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.FormMetadataBuilder;
import io.mateu.core.domain.model.outbound.metadataBuilders.RpcViewWrapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.core.interfaces.HasStepper;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.annotations.SlotName;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import io.mateu.core.domain.uidefinition.shared.interfaces.Form;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ViewInstancePartsExtractor {

  final FormMetadataBuilder formMetadataBuilder;
  final JpaRpcCrudFactory jpaRpcCrudFactory;
  final ReflectionHelper reflectionHelper;

  public List<ViewInstancePart> getUiParts(Object viewInstance, List<Field> fields, SlotName slotName)
      throws Exception {
    List<ViewInstancePart> parts = new ArrayList<>();

    List<Field> partCandidates = new ArrayList<>();
    List<Field> leftFields = new ArrayList<>();
    fields.forEach(
        f -> {
          if (Crud.class.isAssignableFrom(f.getType())
              || Card.class.isAssignableFrom(f.getType())
              || (Stepper.class.isAssignableFrom(f.getType()) && fields.size() == 1)
              || (Form.class.isAssignableFrom(f.getType()))
              || formMetadataBuilder.isOwner(f)) {
            partCandidates.add(f);
          } else {
            leftFields.add(f);
          }
        });

    for (Field f : partCandidates) {
      parts.add(buildPart(f, viewInstance, slotName));
    }
    if (leftFields.size() > 0) {
      parts.add(0, new ViewInstancePart(slotName, viewInstance, null, leftFields));
    }

    if (viewInstance instanceof HasStepper && SlotName.main.equals(slotName)) {
      parts.add(0, buildPart(((HasStepper) viewInstance).getStepper(), viewInstance, slotName));
    }

    return parts;
  }

  private ViewInstancePart buildPart(Field f, Object uiInstance, SlotName slotName) throws Exception {
    Object partInstance = reflectionHelper.getValue(f, uiInstance);
    if (formMetadataBuilder.isOwner(f)) {
      partInstance = jpaRpcCrudFactory.create(uiInstance, f);
    }
    if (partInstance == null) {
      partInstance = reflectionHelper.newInstance(f.getType());
    }
    if (partInstance instanceof Crud) {
      partInstance = new RpcViewWrapper((Listing) partInstance, f.getId());
    }
    return new ViewInstancePart(
        slotName, partInstance, f, reflectionHelper.getAllFields(partInstance.getClass()));
  }

  private ViewInstancePart buildPart(Stepper stepper, Object uiInstance, SlotName slotName)
      throws Exception {
    return new ViewInstancePart(slotName, stepper, null, List.of());
  }
}
