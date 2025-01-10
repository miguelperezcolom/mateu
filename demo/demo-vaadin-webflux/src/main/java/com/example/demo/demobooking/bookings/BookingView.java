package com.example.demo.demobooking.bookings;

import io.mateu.article2.Article2Client;
import io.mateu.article2.model.Booking;
import io.mateu.article2.model.BookingStatus;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Ignored;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.RequestFocus;
import io.mateu.uidl.data.Destination;
import io.mateu.uidl.data.DestinationType;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Result;
import io.mateu.uidl.data.ResultType;
import io.mateu.uidl.interfaces.MicroFrontend;
import io.mateu.uidl.interfaces.UpdatesHash;
import io.mateu.uidl.interfaces.View;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.SneakyThrows;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@Scope("prototype")
class Info {

    private final Article2Client article2Client;

    @Ignored
    String id;

    @RequestFocus
    @NotEmpty
    String leadName;

    @NotEmpty
    String service;

    @NotNull
    LocalDate startDate;

    @NotNull
    LocalDate endDate;


    Info(Article2Client article2Client) {
        this.article2Client = article2Client;
    }

    @Action
    Mono<Result> cancel(BigDecimal newValue) {
        return article2Client.cancel(id, newValue)
                .then(Mono.just(new Result(
                        ResultType.Success,
                        "Booking cancelled :)",
                        new Destination(
                                DestinationType.Url,
                                "Back to bookings list",
                                "#bookings"))));
    }

    @MainAction
    Mono<Result> save() {
        return article2Client.update(new Booking(id, leadName, service, startDate, endDate, new BigDecimal(0),
                        BookingStatus.Confirmed))
                .then(Mono.just(new Result(ResultType.Success, "Booking saved :)",
                        new Destination(DestinationType.Url, "Back to bookings list", "#bookings"))));
    }

    @SneakyThrows
    public Info load(String id) {
        var booking = article2Client.findById(id).toFuture().get();

        this.id = id;
        leadName = booking.leadName();
        service = booking.service();
        startDate = booking.serviceStartDate();
        endDate = booking.serviceEndDate();

        return this;
    }
}

@Service("BookingView2")
@Scope("prototype")
public class BookingView implements View, UpdatesHash {

    private final Info info;

    public BookingView(Info info) {
        this.info = info;
    }

    @Ignored
    String id;

    HorizontalLayout horizontalLayout;


    @SneakyThrows
    public BookingView load(String id) {

        this.id = id;

        horizontalLayout = new HorizontalLayout(
                info.load(id),
                new MicroFrontend(
                        "https://article2.mateu.io/financial/bookingreport",
                        Map.of("id", id)));

        return this;
    }

    @Override
    public String toString() {
        return "Booking " + id;
    }

    @Override
    public String getHash() {
        return id;
    }
}
