package io.mateu.showcase.tester.model.views;

import io.mateu.mdd.core.annotations.*;
import lombok.Getter;
import lombok.Setter;

import java.net.MalformedURLException;
import java.net.URL;

@Getter@Setter
public class BookingForm {

    @Override
    public String toString() {
        return "Hola!";
    }

    @Ignored
    private final Reserva0 row;

    @IFrame
    @Width("1000px")@Height("700px")
    private URL preview;

    public BookingForm(Reserva0 row) {
        this.row = row;
        try {
            preview = new URL("https://elpais.com/");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }

    }
}
