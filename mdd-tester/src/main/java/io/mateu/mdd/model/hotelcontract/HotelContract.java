package io.mateu.mdd.model.hotelcontract;

import com.google.common.collect.Lists;
import io.mateu.erp.model.product.hotel.*;
import io.mateu.ui.mdd.server.annotations.Action;
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
            Map<String, RoomFare> porHabitacion = new HashMap<>();

            int finalJ = j;
            Lists.newArrayList("DBL", "SUI").stream().forEach((r) -> {
                RoomFare rf = new RoomFare();
                Lists.newArrayList("BB", "HB").stream().forEach((b) -> {
                    BoardFare bf = new BoardFare();
                    bf.setRoomPrice(new FareValue(false, false, false, 30 + (finalJ * 10)));
                    bf.setPaxPrice(new FareValue(false, false, false, 60.15 + (finalJ * 10)));
                    for (int q = 0; q < 2; q++) {
                        bf.getPaxDiscounts().put(3 + q, new FareValue(false, true, true, q + 10));
                    }
                    for (int q = 0; q < 3; q++) {
                        for (int t = 0; t < 3; t++) {
                            bf.getChildDiscounts().put(t * 100 + 1 + q, new FareValue(false, true, true, q + 10));
                        }
                    }
                    rf.getFarePerBoard().put(b, bf);
                });
                porHabitacion.put(r, rf);
            });
            p.getFares().add(new Fare("Fare " + j, fechas, porHabitacion));
        }

        setTerms(p);

    }

}
