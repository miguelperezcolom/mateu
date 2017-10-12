package io.mateu.mdd.model.hotelcontract;

import io.mateu.erp.model.product.hotel.HotelContractPhoto;
import io.mateu.ui.mdd.server.annotations.Tab;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
public class HotelContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String title;

    @Tab("Terms")
    @Column(name = "terms2")
    @Convert(converter = HotelContractPhotoConverter.class)
    private HotelContractPhoto terms;

}
