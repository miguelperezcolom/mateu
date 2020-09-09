package io.mateu.showcase.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.TextArea;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
public class PrimitiveCollectionsFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    private List<String> strings = new ArrayList<>();

    private List<Integer> integers = new ArrayList<>();

    private List<Long> longs = new ArrayList<>();

    private List<Float> floats = new ArrayList<>();

    private List<Double> doubles = new ArrayList<>();

    private List<Boolean> booleans = new ArrayList<>();



    @TextArea
    private List<String> strings2 = new ArrayList<>();

    @TextArea
    private List<Integer> integers2 = new ArrayList<>();

    @TextArea
    private List<Long> longs2 = new ArrayList<>();

    @TextArea
    private List<Float> floats2 = new ArrayList<>();

    @TextArea
    private List<Double> doubles2 = new ArrayList<>();

    @TextArea
    private List<Boolean> booleans2 = new ArrayList<>();

}
