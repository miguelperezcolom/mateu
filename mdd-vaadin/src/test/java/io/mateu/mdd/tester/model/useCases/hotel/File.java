package io.mateu.mdd.tester.model.useCases.hotel;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.NotWhenCreating;
import io.mateu.mdd.core.annotations.UseTable;
import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.EntityManager;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
public class File {

    private String leadName;

    @OneToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    @UseTable(fields = "leadName,doubValue,dd,hotel.name")
    private List<Booking> bookings = new ArrayList<>();


    @Action(order = 70, icon = VaadinIcons.PLUS, attachToField = "bookings")
    @NotWhenCreating
    public void incorporate() throws Throwable {
        MDD.alert("todavía no");
    }

    @Action(order = 80, icon = VaadinIcons.CLOSE, attachToField = "bookings")
    @NotWhenCreating
    public void cancel(EntityManager em, Set<Booking> selection) throws Throwable {
        MDD.alert("todavía no");
    }

}
