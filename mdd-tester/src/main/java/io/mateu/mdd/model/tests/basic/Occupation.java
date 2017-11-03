package io.mateu.mdd.model.tests.basic;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;

@Getter@Setter
public class Occupation {

    @NotNull
    private int numberOfRooms = 1;

    @NotNull
    private int paxPerRoom = 2;

    private int[] ages;

}
