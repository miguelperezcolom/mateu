package io.mateu.erp.model.product.hotel.hotel;

import io.mateu.erp.model.multilanguage.Literal;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

/**
 * Created by miguel on 1/10/16.
 */
@Entity
@Getter
@Setter
public class RoomType {

    @Id
    private String code;

    @ManyToOne(cascade = CascadeType.ALL)
    private Literal name;

}
