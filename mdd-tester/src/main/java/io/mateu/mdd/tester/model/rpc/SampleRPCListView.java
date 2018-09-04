package io.mateu.mdd.tester.model.rpc;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.data.Just1StringColumn;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.data.Pair;
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

@Getter@Setter
public class SampleRPCListView implements RpcView<SampleRPCListView, Just1StringColumn> {

    @MainSearchFilter
    private String url = "https://jsonplaceholder.typicode.com/comments";

    private String dummyFilter = "This does nothing";

    @Ignored
    private Pair<String, List<Just1StringColumn>> result;


    @Override
    public List<Just1StringColumn> rpc(SampleRPCListView filters, int offset, int limit) {
        doRpcCall();
        return result.getValue().subList(offset, (result.getValue().size() > offset + limit)?offset + limit:result.getValue().size());
    }

    @Override
    public int gatherCount(SampleRPCListView filters) {
        doRpcCall();
        return result.getValue().size();
    }

    private void doRpcCall() {
        if (result == null || !url.equals(result.getKey())) {
            List<Just1StringColumn> l = new ArrayList<>();

            try {
                Client client = ClientBuilder.newClient();
                WebTarget webTarget = client.target(url);

                Invocation.Builder invocationBuilder = webTarget.request(MediaType.APPLICATION_JSON);


                Response response = invocationBuilder.get();


                System.out.println(response.toString());
                List z = response.readEntity(List.class);
                z.forEach(o -> l.add(new Just1StringColumn("" + o)));
                System.out.println(l);

                result = new Pair<>(getUrl(), l);
            } catch (Exception e) {
                result = new Pair<>(null, l);
                MDD.alert(e);
            }

        }
    }


    public static void main(String[] args) {
        new SampleRPCListView().doRpcCall();
    }

}
