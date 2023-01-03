package com.example.demo.e2e.cruds.basic;

import com.example.demo.e2e.dtos.SamplePojo;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

public class Service {

    private List<SamplePojo> all;

    public Service() {
        all = getAll();
    }

    private List<SamplePojo> getAll() {
        String text = new Scanner(Service.class.getResourceAsStream("/data/names.txt"), "UTF-8")
                .useDelimiter("\\A").next();
        List<SamplePojo> all = new ArrayList<>();
        Map<String, Integer> ages =
                Map.of("Mateu Pérez", 14, "Antònia Galmés", 47, "Miguel Pérez", 53);
        for (String n : text.split("\n")) {
            n = n.replaceAll("\r", "");
            all.add(new SamplePojo(n , ages.getOrDefault(n, new Random().nextInt(80))));
        }
        return all;
    }

    public List<SamplePojo> rpc(SamplePojo filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        System.out.println("rpc(" + offset + ", " + limit + ")");
        return all.stream().filter(p -> match(p, filters)).sorted(getComparator(sortOrders)).skip(offset).limit(limit)
                .collect(Collectors.toList());
    }

    private Comparator<? super SamplePojo> getComparator(List<QuerySortOrder> sortOrders) {
        return (Comparator<SamplePojo>) (o1, o2) -> {
            int result = 0;
            for (QuerySortOrder sortOrder : sortOrders) {
                if (result == 0 && "name".equals(sortOrder.getSorted())) {
                    result = o1.getName().compareTo(o2.getName()) * (SortDirection.ASCENDING.equals(sortOrder.getDirection())?1:-1);
                }
                if (result == 0 && "age".equals(sortOrder.getSorted())) {
                    result = (o1.getAge() - o2.getAge()) * (SortDirection.ASCENDING.equals(sortOrder.getDirection())?1:-1);
                }
            }
            return result;
        };
    }

    private boolean match(SamplePojo i, SamplePojo filters) {
        if (filters.getAge() != 0 && filters.getAge() != i.getAge()) return false;
        if (filters.getName() != null && !filters.getName().isEmpty()
                && i.getName() != null && !removeDiacriticalMarks(i.getName()).toLowerCase()
                .contains(removeDiacriticalMarks(filters.getName()).toLowerCase()))
            return false;
        return true;
    }

    public static String removeDiacriticalMarks(String string) {
        return Normalizer.normalize(string, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }

    public int gatherCount(SamplePojo filters) throws Throwable {
        return (int) all.stream().filter(p -> match(p, filters)).count();
    }
}
