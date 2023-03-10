package io.mateu.mdd.ui.cruds;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.annotations.Sum;
import io.mateu.mdd.shared.data.SumData;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.util.Helper;
import io.mateu.util.persistence.JPAHelper;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Query;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
public class JpaCrudSumsQuery extends JpaCrudQuery {

    private List<FieldInterfaced> sumFields;

    JpaCrudSumsQuery(MDDOpenCRUDAction action, Object filters, List<QuerySortOrder> sortOrders, int offset, int limit, Map<String, String> aliasedColumnNamesByColId, String queryFilters, ExtraFilters extraFilters, String selectColumnsForCount, String selectColumnsForList, Map<String, String> alias, Map<String, String> aliasedColumnNames, List<String> columnNames, List<String> aliasedColumnNamesList, List<FieldInterfaced> filterFields, List<FieldInterfaced> sumFields) {
        super(action, filters, sortOrders, offset, limit, aliasedColumnNamesByColId, queryFilters, extraFilters, selectColumnsForCount, selectColumnsForList, alias, aliasedColumnNames, columnNames, aliasedColumnNamesList, filterFields);
        this.sumFields = sumFields;
    }

    public List<SumData> run() {
        final List<SumData> sums = new ArrayList<>();

        try {
            JPAHelper.notransact(em -> {

                Query q = buildQuery(
                        em,
                        selectColumnsForCount,
                        filters,
                        null,
                        null,
                        0,
                        1000,
                        false);
                log.debug(q.toString());

                Object r = q.getSingleResult();

                if (r instanceof Object[]) {
                    Object[] v = (Object[]) r;

                    NumberFormat nf = new DecimalFormat("#,###,###,###,###,###,###.00");


                    int pos = 1;
                    for (FieldInterfaced f : sumFields) {
                        String caption = Helper.capitalize(f.getName());
                        if (!caption.startsWith("Total")) caption = "Total " + caption;
                        if (!Strings.isNullOrEmpty(f.getAnnotation(Sum.class).caption()))
                            caption = f.getAnnotation(Sum.class).caption();

                        Object x = v[pos++];
                        if (x != null && x instanceof Double) {
                            x = Math.round(100d * (Double) x) / 100d;
                            x = nf.format(x);
                        }

                        sums.add(new SumData(caption, (x != null)?"" + x:"---", ""));
                    }

                }

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return sums;
    }

}
