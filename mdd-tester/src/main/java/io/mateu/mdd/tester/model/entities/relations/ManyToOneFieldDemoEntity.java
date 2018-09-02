package io.mateu.mdd.tester.model.entities.relations;

import com.google.common.base.Strings;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.annotations.UseRadioButtons;
import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.mdd.core.interfaces.EntityProvider;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Getter@Setter
public class ManyToOneFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "zzzz";

    @ManyToOne
    private ManyToOneFieldDemoDestinationEntity simple;

    @ManyToOne
    private ManyToOneFieldDemoDestinationEntity mapped;


    @UseRadioButtons
    @ManyToOne
    private ManyToOneFieldDemoDestinationEntity usingRadioButtons;


    @UseLinkToListView
    @ManyToOne
    private ManyToOneFieldDemoDestinationEntity usingDefaultListView;


    @UseLinkToListView(listViewClass = CustomListView.class)
    @ManyToOne
    private ManyToOneFieldDemoDestinationEntity usingCustomListView;

    @ManyToOne
    private UseIdToSelectDemoEntity useIdToSelect;



    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof  ManyToOneFieldDemoEntity && id == ((ManyToOneFieldDemoEntity)obj).id);
    }


    @Getter@Setter
    public class CustomListView extends AbstractJPQLListView<CustomListView.Row> {

        private String filter;


        @Getter@Setter
        public class Row implements EntityProvider {

            @Ignored
            long id;

            String name;


            @Override
            public Object toEntity(EntityManager em) {
                return em.find(ManyToOneFieldDemoDestinationEntity.class, id);
            }
        }

        @Override
        public Query buildQuery(EntityManager em, boolean forCount) throws Throwable {

            String ql = "select ";

            if (forCount) {
                ql += " count(x) ";
            } else {
                ql += " x.id, x.stringField ";
            }

            ql += " from " + ManyToOneFieldDemoDestinationEntity.class.getName() + " x ";


            Map<String, Object> params = new HashMap<>();

            if (!Strings.isNullOrEmpty(filter)) {

                ql += " where lower(x.stringField) like :p0 ";

                params.put("p0", "%" + filter.toLowerCase() + "%");

            }

            if (!forCount) {
                ql += " order by x.id ";
            }


            Query q = em.createQuery(ql);

            params.keySet().forEach(k -> q.setParameter(k, params.get(k)));

            return q;
        }
    }

}
