package com.example.demo.demobooking;

import io.mateu.article2.Article2Client;
import io.mateu.uidl.interfaces.ConsumesUrlFragment;
import io.mateu.uidl.interfaces.Crud;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

record MyFilters() {

}

record MyRow(String id, String leadName) {

}

@Service
@Scope("prototype")
public class BookingsCrud implements Crud<MyFilters, MyRow>, ConsumesUrlFragment {

    private final Article2Client article2Client;
    private final CreateBookingForm createBookingForm;

    public BookingsCrud(Article2Client article2Client, CreateBookingForm createBookingForm) {
        this.article2Client = article2Client;
        this.createBookingForm = createBookingForm;
    }

    @Override
    public Mono<Page<MyRow>> fetchRows(String searchText, MyFilters filters, Pageable pageable) throws Throwable {
        return article2Client.search(searchText, pageable).map(p -> new PageImpl<>(
                p.getContent().stream().map(r -> new MyRow(r.id(), r.customer())).toList(),
                p.getPageable(),
                p.getTotalElements()
        ));
    }

    @Override
    public Object getNewRecordForm() throws Throwable {
        return createBookingForm;
    }

    @Override
    public Object consume(String urlFragment, ServerHttpRequest serverHttpRequest) {
        if ("new".equals(urlFragment)) {
            return createBookingForm;
        }
        return null;
    }
}
