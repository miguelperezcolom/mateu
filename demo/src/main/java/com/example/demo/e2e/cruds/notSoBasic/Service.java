package com.example.demo.e2e.cruds.notSoBasic;

import com.example.demo.e2e.dtos.SamplePojo;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import io.mateu.reflection.ReflectionHelper;
import lombok.extern.slf4j.Slf4j;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class Service {

    private static List<SamplePojo> all;

    public Service() {
        if (all == null) all = getAll();
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
        return all.stream().limit(3).collect(Collectors.toList());
    }

    public List<Row> rpc(SearchForm filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        log.info("rpc(" + offset + ", " + limit + ")");
        return all.stream().filter(p -> match(p, filters)).sorted(getComparator(sortOrders)).skip(offset).limit(limit)
                .map(p -> new Row(p.getId(), p.getName(), p.getAge())).collect(Collectors.toList());
    }

    private Comparator<? super SamplePojo> getComparator(List<QuerySortOrder> sortOrders) {
        return (Comparator<SamplePojo>) (o1, o2) -> {
            int result = 0;
            for (QuerySortOrder sortOrder : sortOrders) {
                if (result == 0 && "name".equals(sortOrder.getSorted())) {
                    result = o1.getName().compareTo(o2.getName())
                            * (SortDirection.ASCENDING.equals(sortOrder.getDirection())?1:-1);
                }
                if (result == 0 && "age".equals(sortOrder.getSorted())) {
                    result = (o1.getAge() - o2.getAge())
                            * (SortDirection.ASCENDING.equals(sortOrder.getDirection())?1:-1);
                }
            }
            return result;
        };
    }

    private boolean match(SamplePojo i, SearchForm filters) {
        if (filters.getId() != null && !filters.getId().isEmpty() && !filters.getId().equals(i.getId())) return false;
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

    public int gatherCount(SearchForm filters) throws Throwable {
        return (int) all.stream().filter(p -> match(p, filters)).count();
    }

    public void save(SamplePojo pojo) {
        all.stream().filter(p -> p.getId().equals(pojo.getId())).findFirst().ifPresentOrElse(p -> {
            ReflectionHelper.copy(pojo, p);
        }, () -> {
            all.add(pojo);
        });
    }

    public void save(ReadOnlyView readOnlyView) {
        all.stream().filter(p -> p.getId().equals(readOnlyView.getId())).findFirst().ifPresentOrElse(p -> {
            ReflectionHelper.copy(readOnlyView, p);
        }, () -> {
            SamplePojo pojo = new SamplePojo();
            ReflectionHelper.copy(readOnlyView, pojo);
            all.add(pojo);
        });
    }
}
