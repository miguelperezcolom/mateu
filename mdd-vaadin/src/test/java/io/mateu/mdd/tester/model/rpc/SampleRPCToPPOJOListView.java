package io.mateu.mdd.tester.model.rpc;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.data.Pair;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;
import io.mateu.mdd.tester.model.pojos.SamplePPOJO;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter@Setter
public class SampleRPCToPPOJOListView implements RpcCrudView<SampleRPCToPPOJOListView, SampleRPCToPPOJOListView.Row, SamplePPOJO> {

    private String stringFieldFilter = "";

    @Override
    public Object deserializeId(String sid) {
        return Long.parseLong(sid);
    }

    @Override
    public boolean isAddEnabled() {
        return true;
    }

    @Getter@Setter
    public class Row {
        private long id;
        private String all;


        // to link with the editor
        @Override
        public String toString() {
            return "" + id;
        }

        public Row(BasicFieldsDemoEntity e) {
            setId(e.getId());
            try {
                setAll(Helper.toJson(e));
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
    }

    @Ignored
    private Pair<String, List<Row>> result;


    @Override
    public List<Row> rpc(SampleRPCToPPOJOListView filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        doRpcCall();
        return result.getValue().subList(offset, (result.getValue().size() > offset + limit)?offset + limit:result.getValue().size());
    }

    @Override
    public int gatherCount(SampleRPCToPPOJOListView filters) {
        doRpcCall();
        return result.getValue().size();
    }

    private void doRpcCall() {
        List<Row> l = new ArrayList<>();

        try {

            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    String ql = "select x from " + BasicFieldsDemoEntity.class.getName() + " x ";

                    Map<String, Object> params = new HashMap<>();

                    if (!Strings.isNullOrEmpty(stringFieldFilter)) {
                        ql += " where lower(x.stringField) like :p0";
                        params.put("p0", "%" + stringFieldFilter.toLowerCase() + "%");
                    }

                    ql += " order by x.id";

                    Query q = em.createQuery(ql);
                    for (String k : params.keySet()) q.setParameter(k, params.get(k));

                    l.addAll(((List<BasicFieldsDemoEntity>)q.getResultList()).stream().map(e -> new Row(e)).collect(Collectors.toList()));


                }
            });


            result = new Pair<>(stringFieldFilter, l);
        } catch (Throwable e) {
            result = new Pair<>(null, l);
            MDD.alert(e);
        }
    }






}
