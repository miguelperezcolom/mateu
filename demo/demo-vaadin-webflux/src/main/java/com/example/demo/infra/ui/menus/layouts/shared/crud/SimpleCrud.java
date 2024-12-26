package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.data.CloseModal;
import io.mateu.uidl.data.ResultType;
import io.mateu.uidl.interfaces.Crud;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.Message;
import io.mateu.uidl.interfaces.ResponseWrapper;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

@MateuUI("/crud")
@Component@Scope("prototype")
public class SimpleCrud implements Crud<SearchForm, Row> {


    private final SimpleCrudService service;

    public SimpleCrud(SimpleCrudService service) {
        this.service = service;
    }

    @Override
    public Mono<Page<Row>> fetchRows(
            String searchText, SearchForm filters, Pageable pageable) {
        return service.fetchRows(searchText, filters, pageable);
    }

    @Action(target = ActionTarget.NewModal, closeModalWindow = true)
    public Mono<Message> askAndClose(@Min(1)@Max(500)@Help("Max 500") int quantity) {
        return Mono.just(new Message(ResultType.Success, "Result", "Quantity was " + quantity, 2000));
    }

    @Action(target = ActionTarget.NewModal)
    public Mono<CloseModal<SimpleCrud>> askAndCloseUsingCloseModal(@Min(1)@Max(500)@Help("Max 500") int quantity) {
        return Mono.just("Quantity was " + quantity).flatMap(s -> Mono.just(new CloseModal<>(this)));
    }

    @Action(target = ActionTarget.NewModal, closeModalWindow = true)
    public Mono<ResponseWrapper> askAndShow(@Min(1)@Max(500)@Help("Max 500") int quantity) {
        return Mono.just("Quantity was " + quantity).flatMap(s -> Mono.just(new ResponseWrapper(this, List.of(new Message(ResultType.Success, "Result", s, 3000)))));
    }

    @Action(target = ActionTarget.NewModal)
    public Mono<String> askAndRemain(@Min(1)@Max(500)@Help("Max 500") int quantity) {
        return Mono.just("Quantity was " + quantity).delayElement(Duration.ofSeconds(3));
    }

}
