package io.mateu.mdd.model.hotelcontract;

import com.google.common.collect.Lists;
import io.mateu.erp.model.product.hotel.*;
import io.mateu.ui.mdd.server.annotations.Action;
import io.mateu.ui.mdd.server.annotations.FullWidth;
import io.mateu.ui.mdd.server.annotations.Tab;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Getter
@Setter
public class HotelContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String title;

    private LocalDate validFrom;

    private LocalDate validTo;

    @Tab("Terms")
    @Column(name = "terms2")
    @Convert(converter = HotelContractPhotoConverter.class)
    @FullWidth
    private HotelContractPhoto terms;

    @Action(name = "Fill fares")
    public void fillFares(EntityManager em) {

        HotelContractPhoto p = getTerms();
        if (p == null) p = new HotelContractPhoto();

        HotelContract c = this;

        for (int j = 1; j < 20; j++) {
            List<DatesRange> fechas = new ArrayList<>();
            for (int k = 0; k < 5; k++) {
                fechas.add(new DatesRange(c.getValidFrom().plusDays(j * 10), c.getValidFrom().plusDays((j + 1) * 10 - 1)));
            }

            List<LinearFareLine> lineas = new ArrayList<>();

            int finalJ = j;
            Lists.newArrayList("DBL", "SUI").stream().forEach((r) -> {
                Lists.newArrayList("BB", "HB").stream().forEach((b) -> {
                    double ad;
                    lineas.add(new LinearFareLine(r, b, 30 + (finalJ * 10), ad = 60.15 + (finalJ * 10), ad, ad / 2, 0));
                });
            });

            p.getFares().add(new LinearFare(fechas, "Fare " + j, lineas));
        }

        setTerms(p);

    }

}
