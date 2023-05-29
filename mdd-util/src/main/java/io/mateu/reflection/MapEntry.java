package io.mateu.reflection;

import lombok.Getter;
import lombok.Setter;

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
