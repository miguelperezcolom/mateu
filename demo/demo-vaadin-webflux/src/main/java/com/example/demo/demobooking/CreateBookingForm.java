package com.example.demo.demobooking;

import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.RequestFocus;
import io.mateu.uidl.data.Destination;
import io.mateu.uidl.data.DestinationType;
import io.mateu.uidl.data.Result;
import io.mateu.uidl.data.ResultType;
import io.mateu.uidl.interfaces.UpdatesUrlFragment;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Service@Scope("prototype")
public class CreateBookingForm implements UpdatesUrlFragment {

    @RequestFocus@NotEmpty
    String leadName;

    @NotEmpty
    String service;

    @NotNull
    LocalDate startDate;

    @NotNull
    LocalDate endDate;

    @MainAction
    public Mono<Result> create() {
        return Mono.just(new Result(
                ResultType.Success,
                "The booking has been created :)",
                new Destination(DestinationType.Url, "Back to bookings list", "#useCases_booking_bookings")));
    }


    @Override
    public String getUrlFragment() {
        return "new";
    }
}
