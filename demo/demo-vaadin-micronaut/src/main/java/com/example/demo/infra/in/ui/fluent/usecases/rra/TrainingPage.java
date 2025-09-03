package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.CardRow;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.CrudlType;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import lombok.SneakyThrows;

import java.net.URI;
import java.util.List;

@Serdeable
record TrainingRow(
        String id,
        String title,
        String content,
        String image,
        String subtitle,
        Status status) {

}

@Route("/fluent-app/use-cases/rra/training")
@Singleton
public class TrainingPage implements ComponentTreeSupplier, CrudlBackend<NoFilters, TrainingRow>, HasTriggers {

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Training and Development")
                .content(List.of(Crudl.builder()
                        .crudlType(CrudlType.card)
                        .onRowSelectionChangedActionId("go-to-selected-training")
                        .style("width: 100%;")
                        .build()))
                .style("width: 100%;")
                .build();
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(new OnLoadTrigger("search"));
    }

    @Override
    public CrudlData<TrainingRow> search(String searchText, NoFilters ordersFilters, Pageable pageable, HttpRequest httpRequest) {
        List<TrainingRow> allRows = List.of(
            new TrainingRow(
                    "001",
                    "New Products from Vision Corporation",
                    "02/06/25",
                    "/images/trainings/001.jpeg",
                    "0 of 4 tasks completed",
                    new Status(StatusType.WARNING, "Pending")),
                new TrainingRow(
                        "002",
                        "New This Week",
                        "02/06/25",
                        "/images/trainings/002.jpeg",
                        "0 of 4 tasks completed",
                        new Status(StatusType.WARNING, "Pending")),
                new TrainingRow(
                        "003",
                        "Product Recall Announcement",
                        "02/06/25",
                        "/images/trainings/003.jpeg",
                        "0 of 4 tasks completed",
                        new Status(StatusType.WARNING, "Pending"))
        );
        return new CrudlData<>(new Page<>(
                searchText,
                pageable.size(),
                0,
                allRows.size(),
                allRows
        ),
                "No trainings.");
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("go-to-selected-training".equals(actionId)) {
            return UICommand.navigateTo("/fluent-app/use-cases/rra/trainings/" + httpRequest.getSelectedRows(TrainingRow.class).get(0).id());
        }
        return CrudlBackend.super.handleAction(actionId, httpRequest);
    }

    @Override
    public boolean supportsAction(String actionId) {
        if ("go-to-selected-training".equals(actionId)) {
            return true;
        }
        return CrudlBackend.super.supportsAction(actionId);
    }
}
