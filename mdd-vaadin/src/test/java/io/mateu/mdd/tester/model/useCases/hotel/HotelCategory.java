package io.mateu.mdd.tester.model.useCases.hotel;

import lombok.MateuMDDEntity;

import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class HotelCategory {

    @Id
    private String code;

    private String name;

}
