package io.mateu.mdd.model.tests.basic;

import io.mateu.ui.mdd.server.annotations.Required;

public class Occupation {

    @Required
    private int numberOfRooms = 1;

    @Required
    private int paxPerRoom = 2;

    private int[] ages;

}
