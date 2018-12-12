package io.mateu.mdd.tester.model.useCases.hotel;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.KPI;
import io.mateu.mdd.core.annotations.NotWhenCreating;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class HotelBookingLine {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne@NotNull
    private Booking booking;

    @ManyToOne@NotNull
    private Room room;

    private int pax;

    private boolean active;



    @KPI
    private boolean inventoryOk = true;

    @KPI
    private boolean releaseOk = true;

    @KPI
    private boolean minStayOk = true;


    public String toHtml() {
        return "" + room + " x " + pax + " (" + active + ")";
    }



    @Override
    public boolean equals(Object obj) {
        return this == obj || id != 0 && id == ((HotelBookingLine)obj).getId();
    }

    @Override
    public String toString() {
        return room != null?room.toString():"Booking line " + getId();
    }





    public void setPax(int pax) {
        this.pax = pax;
        if (booking != null) booking.askForUpdate();
    }



    @PostPersist@PostUpdate@PostRemove
    public void pre2() {
        System.out.println("**************** HotelBookingLine.post()");

        if (booking != null) booking.askForUpdate();
    }



    /*
desde aquí no podemos modificar valores de terceros (por ejemplo de booking)
 */
    //@PrePersist@PreUpdate
    public void pre() {
        System.out.println("**************** HotelBookingLine.pre()");

        if (booking != null) booking.askForUpdate();


        /*
         if (booking != null) {
            booking.setOverrideValue(false);
            booking.setOverridedValue(100d * pax);
            //Helper.getEMFromThreadLocal().merge(booking); // ni así
        }
         */

        WorkflowEngine.add(() -> {
            try {
                Helper.transact(em -> {
                    if (booking != null) {
                        booking = em.merge(booking); // si hacemos el merge al principio, entonces el objeto a modificar es el resultado de hacer el merge
                        booking.setOverrideValue(false);
                        booking.setTotal(100d * pax);
                        //em.merge(booking); // necesitamos hacer esto. Si no, booking no está en esta transacción
                    }
                });
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        });
    }
}
