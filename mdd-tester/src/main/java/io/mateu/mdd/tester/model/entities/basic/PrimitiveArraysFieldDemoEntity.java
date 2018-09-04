package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.TextArea;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter@Setter
public class PrimitiveArraysFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;



    private int[] ints;

    private long[] primitiveLongs;

    private float[] primitiveFloats;

    private double[] primitiveDoubles;

    private boolean[] primitiveBooleans;




    private String[] strings;

    private Integer[] integers;

    private Long[] longs;

    private Float[] floats;

    private Double[] doubles;

    private Boolean[] booleans;



    @TextArea
    private String[] strings2;

    @TextArea
    private Integer[] integers2;

    @TextArea
    private Long[] longs2;

    @TextArea
    private Float[] floats2;

    @TextArea
    private Double[] doubles2;

    @TextArea
    private Boolean[] booleans2;

}
