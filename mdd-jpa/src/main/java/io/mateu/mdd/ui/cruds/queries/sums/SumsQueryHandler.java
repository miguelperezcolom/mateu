package io.mateu.mdd.ui.cruds.queries.sums;

import com.google.common.base.Strings;
import io.mateu.mdd.shared.annotations.Sum;
import io.mateu.mdd.shared.data.SumData;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.ui.cruds.queries.QueryHelper;
import io.mateu.util.Helper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class SumsQueryHandler {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public List<SumData> run(SumsQuery query) {
        final List<SumData> sums = new ArrayList<>();

        try {
            javax.persistence.Query q = new QueryHelper().buildJpaQuery(
                    query,
                    em,
                    query.getSelectColumnsForCount(),
                    query.getFilters(),
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
                for (FieldInterfaced f : query.getSumFields()) {
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
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return sums;
    }

}
