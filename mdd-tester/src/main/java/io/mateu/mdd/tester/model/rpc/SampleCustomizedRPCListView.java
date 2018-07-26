package io.mateu.mdd.tester.model.rpc;

import com.vaadin.ui.Grid;
import com.vaadin.ui.StyleGenerator;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.data.Just1StringColumn;
import io.mateu.mdd.core.interfaces.RpcView;
import javafx.util.Pair;
import lombok.Getter;
import lombok.Setter;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter@Setter
public class SampleCustomizedRPCListView implements RpcView<SampleCustomizedRPCListView, SampleCustomizedRPCListView.Row> {

    @MainSearchFilter
    private String url = "https://jsonplaceholder.typicode.com/comments";

    private String dummyFilter = "This does nothing";


    @Getter@Setter
    public class Row {

        private String id;

        private String name;

        private String email;

        public Row(Map<String, Object> o) {
            setId("" + o.get("id"));
            setName("" + o.get("name"));
            setEmail("" + o.get("email"));
        }
    }


    @Ignored
    private Pair<String, List<SampleCustomizedRPCListView.Row>> result;


    @Override
    public List<SampleCustomizedRPCListView.Row> rpc(SampleCustomizedRPCListView filters, int offset, int limit) {
        doRpcCall();
        return result.getValue().subList(offset, (result.getValue().size() > offset + limit)?offset + limit:result.getValue().size());
    }

    @Override
    public int gatherCount(SampleCustomizedRPCListView filters) {
        doRpcCall();
        return result.getValue().size();
    }

    private void doRpcCall() {
        if (result == null || !url.equals(result.getKey())) {
            List<SampleCustomizedRPCListView.Row> l = new ArrayList<>();

            try {
                Client client = ClientBuilder.newClient();
                WebTarget webTarget = client.target(url);

                Invocation.Builder invocationBuilder = webTarget.request(MediaType.APPLICATION_JSON);


                Response response = invocationBuilder.get();


                System.out.println(response.toString());
                List z = response.readEntity(List.class);
                z.forEach(o -> l.add(new SampleCustomizedRPCListView.Row((Map<String, Object>) o)));
                System.out.println(l);

                result = new Pair<>(getUrl(), l);
            } catch (Exception e) {
                result = new Pair<>(null, l);
                MDD.alert(e);
            }

        }
    }

    @Override
    public void decorateGrid(Grid<Row> grid) {
        grid.getColumn("name").setStyleGenerator(new StyleGenerator<Row>() {
            @Override
            public String apply(Row row) {
                return (row.getName().contains("et"))?"green":"";
            }
        });
    }

    public static void main(String[] args) {
        new SampleCustomizedRPCListView().doRpcCall();
    }

}
