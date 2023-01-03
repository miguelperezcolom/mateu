package com.example.demo.e2e.cruds.basic;

import com.example.demo.e2e.dtos.SamplePojo;
import com.vaadin.data.provider.QuerySortOrder;

import java.util.*;
import java.util.stream.Collectors;

public class Service {

    private List<SamplePojo> all;

    public Service() {
        all = getAll();
    }

    private List<SamplePojo> getAll() {
        String text = new Scanner(Service.class.getResourceAsStream("/data/names.txt"), "UTF-8").useDelimiter("\\A").next();
        List<SamplePojo> all = new ArrayList<>();
        Map<String, Integer> ages = Map.of("Mateu Pérez", 14, "Antònia Galmés", 47, "Miguel Pérez", 53);
        for (String n : text.split("\n")) {
            all.add(new SamplePojo(n , ages.getOrDefault(n, new Random().nextInt(80))));
        }
        return all;
    }

    public List<Row> rpc(SearchForm filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        System.out.println("rpc(" + offset + ", " + limit + ")");
        return all.stream().skip(offset).limit(limit).map(p -> new Row(p.getId(), p.getName(), p.getAge())).collect(Collectors.toList());
    }

    public int gatherCount(SearchForm filters) throws Throwable {
        return all.size();
    }
}
