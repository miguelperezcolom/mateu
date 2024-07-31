package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import io.mateu.core.domain.model.outbound.metadataBuilders.FormMetadataBuilder;
import io.mateu.core.domain.model.outbound.metadataBuilders.RpcViewWrapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.core.interfaces.HasStepper;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.annotations.SlotName;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UIInstancePartsExtractor {

  final FormMetadataBuilder formMetadataBuilder;
  final JpaRpcCrudFactory jpaRpcCrudFactory;
  final ReflectionHelper reflectionHelper;

  public List<UIInstancePart> getUiParts(
      Object uiInstance, List<FieldInterfaced> fields, SlotName slot) throws Exception {
    List<UIInstancePart> parts = new ArrayList<>();

    List<FieldInterfaced> partCandidates = new ArrayList<>();
    List<FieldInterfaced> leftFields = new ArrayList<>();
    fields.forEach(
        f -> {
          if (Crud.class.isAssignableFrom(f.getType())
              || Card.class.isAssignableFrom(f.getType())
              || (Stepper.class.isAssignableFrom(f.getType()) && fields.size() == 1)
              || formMetadataBuilder.isOwner(f)) {
            partCandidates.add(f);
          } else {
            leftFields.add(f);
          }
        });

    for (FieldInterfaced f : partCandidates) {
      parts.add(buildPart(f, uiInstance));
    }
    if (leftFields.size() > 0) {
      parts.add(0, new UIInstancePart("", uiInstance, leftFields));
    }

    if (uiInstance instanceof HasStepper && SlotName.main.equals(slot)) {
      parts.add(0, buildPart(((HasStepper) uiInstance).getStepper(), uiInstance));
    }

    return parts;
  }

  private UIInstancePart buildPart(FieldInterfaced f, Object uiInstance) throws Exception {
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
    return new UIInstancePart(
        f.getId(), partInstance, reflectionHelper.getAllFields(partInstance.getClass()));
  }

  private UIInstancePart buildPart(Stepper stepper, Object uiInstance) throws Exception {
    Object partInstance = stepper;
    if (partInstance instanceof Crud) {
      partInstance = new RpcViewWrapper((Listing) partInstance, "stepper");
    }
    return new UIInstancePart("stepper", partInstance, List.of());
  }
}
