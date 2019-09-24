package io.mateu.mdd.tester.model.useCases.hotel;

import io.mateu.mdd.core.annotations.Ignored;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Getter@Setter
public class RefreshOnBackFormLine {

    @Ignored
    private UUID uuid = UUID.randomUUID();

    private String aaaa;

    private LocalTime time;

    private int entero;

    private double doble;

    private boolean booleano;

    private LocalDate fecha;

    private LocalDateTime fechaHora;


    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof RefreshOnBackFormLine && uuid.equals(((RefreshOnBackFormLine) obj).getUuid()));
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
