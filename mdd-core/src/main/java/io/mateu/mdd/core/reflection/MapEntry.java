package io.mateu.mdd.core.reflection;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Getter@Setter
public class MapEntry<K, V> {

    private K key;

    private V value;


    public MapEntry(K key, V value) {
        this.key = key;
        this.value = value;
    }


    @Override
    public int hashCode() {
        return key.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj instanceof MapEntry && key.equals(((MapEntry) obj).key));
    }
}
