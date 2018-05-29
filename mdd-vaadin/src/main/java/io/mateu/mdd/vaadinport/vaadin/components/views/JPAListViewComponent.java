package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.ValueProvider;
import com.vaadin.data.provider.GridSortOrder;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.data.provider.SortOrder;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.data.sort.SortDirection;
import com.vaadin.ui.Grid;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.components.grid.SortOrderProvider;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;

import javax.persistence.EntityManager;
import javax.persistence.Id;
import javax.persistence.Query;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class JPAListViewComponent extends ListViewComponent {

    private final Class entityClass;

    public JPAListViewComponent(Class entityClass) {
        super();
        this.entityClass = entityClass;

        build();
    }

    protected void build() {

        super.build();

    }

    @Override
    public void addMenuItems(MenuBar bar) {
        super.addMenuItems(bar);

        bar.addItem("New", VaadinIcons.PLUS, new MenuBar.Command() {
            @Override
            public void menuSelected(MenuBar.MenuItem menuItem) {
                try {
                    MDD.openEditor(createNewInstance(), false);
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }
        });

    }


    public Object createNewInstance() throws IllegalAccessException, InstantiationException {
        return entityClass.newInstance();
    }

    @Override
    public void buildColumns(Grid grid) {
        int pos = 0;
        for (FieldInterfaced f : ReflectionHelper.getAllFields(entityClass)) {
            int finalPos = 1 + pos++;
             grid.addColumn(new ValueProvider() {
                @Override
                public Object apply(Object o) {
                    //return ReflectionHelper.getValue(f, o);
                    return ((Object[]) o)[finalPos];
                }
            }).setCaption(Helper.capitalize(f.getName())).setWidth(150).setSortOrderProvider(new SortOrderProvider() {
                 @Override
                 public Stream<QuerySortOrder> apply(SortDirection sortDirection) {
                     return Stream.of(new QuerySortOrder(f.getName(), sortDirection));
                 }
             }).setId(f.getName());
        }


    }


    @Override
    public void edit(Object id) throws Throwable {
        final Object[] o = {null};
        if (id == null) {
                o[0] = entityClass.newInstance();
        } else {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    o[0] = em.find(entityClass, id);
                }
            });
        }
        MDD.openEditor(o[0], false);
    }

    @Override
    public List findAll(List<QuerySortOrder> sortOrders, int offset, int limit) {
        List l = new ArrayList();

        try {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    String alias = "x";

                    String jpql = "select " + buildFieldsPart(alias) + " from " + entityClass.getName() + " x";
                    String oc = "";
                    for (QuerySortOrder qso : sortOrders) {
                        if (!"".equals(oc)) oc += ", ";
                        oc += alias + "." + qso.getSorted() + " " + ((SortDirection.DESCENDING.equals(qso.getDirection()))?"desc":"asc");
                    }
                    if (!"".equals(oc)) jpql += " order by " + oc;

                    Query q = em.createQuery(jpql).setFirstResult(offset).setMaxResults(limit);
                    System.out.println(q.toString());

                    l.addAll(q.getResultList());

                }
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return l;
    }

    @Override
    public int gatherCount() {
        final int[] count = {0};

        try {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = em.createQuery("select count(x) from " + entityClass.getName() + " x");
                    System.out.println(q.toString());

                    count[0] = ((Long) q.getSingleResult()).intValue();

                }
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return count[0];
    }

    private String buildFieldsPart(String alias) {
        String s = "";
        FieldInterfaced id = null;
        for (FieldInterfaced f : ReflectionHelper.getAllFields(entityClass)) {
            if (!"".equals(s)) s += ", ";
            s += "" + alias + "." + f.getName();

            if (f.isAnnotationPresent(Id.class)) id = f;
        }

        if (id != null) {
            s = alias + "." + id.getName() + ((!"".equals(s))?", " + s:"");
        }
        return s;
    }
}
