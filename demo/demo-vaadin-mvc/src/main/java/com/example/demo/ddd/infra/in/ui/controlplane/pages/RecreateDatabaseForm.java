package com.example.demo.ddd.infra.in.ui.controlplane.pages;

import com.example.demo.ddd.infra.in.populator.Populator;
import com.example.demo.ddd.infra.in.populator.Writer;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SeasonRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.ContractRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.HotelRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.TariffRepository;
import io.mateu.core.infra.declarative.GenericForm;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.SliderMax;
import io.mateu.uidl.annotations.SliderMin;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@RequiredArgsConstructor
@Slf4j
@Title("Recreate database")
public class RecreateDatabaseForm extends GenericForm implements PostHydrationHandler {

    private final HotelRepository hotelRepository;
    private final AgencyRepository agencyRepository;
    private final SeasonRepository seasonRepository;
    private final ContractRepository contractRepository;
    private final TariffRepository tariffRepository;
    private final Populator populator;

    @SliderMin(1)
            @SliderMax(115)
            @Help("${this.state.hotels}")
    int hotels = 1;

    @SliderMin(1)
    @SliderMax(103)
    @Help("${this.state.agencies}")
    int agencies = 1;

    @SliderMin(1)
    @SliderMax(4)
    @Help("${this.state.years}")
    int years = 1;

    @SliderMin(1)
    @SliderMax(500)
    @Help("${this.state.tariffsPerContract}")
    int tariffsPerContract = 1;

    @ReadOnly
            @Style("width: 100%;")
            @Colspan(2)
    String heapSize;

    @Button
    void gc() {
        Runtime.getRuntime().gc();
    }

    @PostConstruct
    public void init() {
        hotels = hotelRepository.findAll().size();
        agencies = agencyRepository.findAll().size();
        years = seasonRepository.findAll().size() / 2;
        tariffsPerContract = !contractRepository.findAll().isEmpty() ?tariffRepository.findAll().size() / contractRepository.findAll().size():0;
    }

    @Button
    void recreate() {
        log.info("recreating database");
        populator.reset();
        populator.populate(hotels, agencies, years, tariffsPerContract);
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        Runtime rt = Runtime.getRuntime();
        long max   = rt.maxMemory();   // equivalente a Xmx (aprox)
        long total = rt.totalMemory(); // heap actualmente reservado
        long free  = rt.freeMemory();  // libre dentro de "total"
        long used  = total - free;
        heapSize = String.format("max=%dMB total=%dMB used=%dMB free=%dMB%n",
                max/1024/1024, total/1024/1024, used/1024/1024, free/1024/1024);
    }
}
