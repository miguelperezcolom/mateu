package io.mateu.mdd.tester.model.entities.converter;


import io.mateu.mdd.core.annotations.Section;
import io.mateu.mdd.core.util.JsonConverter;
import io.mateu.mdd.core.util.XMLSerializable;
import io.mateu.mdd.core.util.XmlConverter;
import io.mateu.mdd.core.util.YamlConverter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class WithConverterDemoEntity {

    @Id
    @GeneratedValue
    private long id;


    private String name;

    @Section("XMLSerializable")
    @Convert(converter = XmlConverter.class)
    private XmlSerializableContent xmlSerializableContent;

    @Section("As xml")
    @Convert(converter = XmlConverter.class)
    private SerializableContent asXml;


    @Section("As json")
    @Convert(converter = JsonConverter.class)
    private SerializableContent asJson;


    @Section("As yaml")
    @Convert(converter = YamlConverter.class)
    private SerializableContent asYaml;

}
