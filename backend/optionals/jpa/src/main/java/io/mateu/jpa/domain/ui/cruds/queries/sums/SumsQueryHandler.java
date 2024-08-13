package io.mateu.jpa.domain.ui.cruds.queries.sums;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.Sum;
import io.mateu.core.domain.uidefinition.shared.data.SumData;
import io.mateu.jpa.domain.ui.cruds.queries.QueryHelper;
import jakarta.persistence.EntityManager;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class SumsQueryHandler {

  private final EntityManager em;
  private final ReflectionHelper reflectionHelper;
  private final Humanizer humanizer;

  public SumsQueryHandler(
      EntityManager em, ReflectionHelper reflectionHelper, Humanizer humanizer) {
    this.em = em;
    this.reflectionHelper = reflectionHelper;
    this.humanizer = humanizer;
  }

  @Transactional
  public List<SumData> run(SumsQuery query) {
    final List<SumData> sums = new ArrayList<>();

    try {
      jakarta.persistence.Query q =
          new QueryHelper(reflectionHelper)
              .buildJpaQuery(
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
        for (Field f : query.getSumFields()) {
          String caption = humanizer.capitalize(f.getName());
          if (!caption.startsWith("Total")) caption = "Total " + caption;
          if (!Strings.isNullOrEmpty(f.getAnnotation(Sum.class).caption()))
            caption = f.getAnnotation(Sum.class).caption();

          Object x = v[pos++];
          if (x != null && x instanceof Double) {
            x = Math.round(100d * (Double) x) / 100d;
            x = nf.format(x);
          }

          sums.add(new SumData(caption, (x != null) ? "" + x : "---", ""));
        }
      }
    } catch (Throwable throwable) {
      throwable.printStackTrace();
    }

    return sums;
  }
}
