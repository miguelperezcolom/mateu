package io.mateu.remote.domain.modelToDtoMappers.viewMapperStuff;

import io.mateu.mdd.core.interfaces.Card;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.core.interfaces.HasStepper;
import io.mateu.mdd.core.interfaces.JpaRpcCrudFactory;
import io.mateu.mdd.shared.annotations.SlotName;
import io.mateu.mdd.shared.data.Stepper;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.metadataBuilders.FormMetadataBuilder;
import io.mateu.remote.domain.modelToDtoMappers.RpcViewWrapper;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UIInstancePartsExtractor {

  @Autowired FormMetadataBuilder formMetadataBuilder;

  @Autowired JpaRpcCrudFactory jpaRpcCrudFactory;

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
    Object partInstance = ReflectionHelper.getValue(f, uiInstance);
    if (formMetadataBuilder.isOwner(f)) {
      partInstance = jpaRpcCrudFactory.create(uiInstance, f);
    }
    if (partInstance == null) {
      partInstance = ReflectionHelper.newInstance(f.getType());
    }
    if (partInstance instanceof Crud) {
      partInstance = new RpcViewWrapper((Listing) partInstance, f.getId());
    }
    return new UIInstancePart(
        f.getId(), partInstance, ReflectionHelper.getAllFields(partInstance.getClass()));
  }

  private UIInstancePart buildPart(Stepper stepper, Object uiInstance) throws Exception {
    Object partInstance = stepper;
    if (partInstance instanceof Crud) {
      partInstance = new RpcViewWrapper((Listing) partInstance, "stepper");
    }
    return new UIInstancePart("stepper", partInstance, List.of());
  }
}
