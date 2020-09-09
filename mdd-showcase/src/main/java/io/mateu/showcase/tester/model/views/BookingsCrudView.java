package io.mateu.showcase.tester.model.views;

import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.interfaces.AbstractCrudView;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.showcase.tester.model.useCases.hotel.Booking;
import io.mateu.showcase.tester.model.useCases.hotel.Hotel;
import lombok.Getter;
import lombok.Setter;

import java.lang.reflect.InvocationTargetException;
import java.util.Map;

@Getter@Setter
public class BookingsCrudView extends AbstractCrudView<Booking> {

    @MainSearchFilter
    private String leadName;


    @MainSearchFilter
    private boolean filtro1;


    private Hotel hotel;


    @Override
    public String addFilter(Object filters, FieldInterfaced f, Map<String, Object> parameterValues) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        String ql = "";
        if ("filtro1".equals(f.getName())) {
            if (filtro1) {
                ql = "x.total > 0 ";
            }
        } else super.addFilter(filters, f, parameterValues);
        return ql;
    }


}
