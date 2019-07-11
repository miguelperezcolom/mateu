package io.mateu.mdd.tester.model.views;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.interfaces.AbstractCrudView;
import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.model.useCases.hotel.Booking;
import io.mateu.mdd.tester.model.useCases.hotel.Hotel;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.List;
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
