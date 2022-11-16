package io.mateu.util.data;

public class Value<T> {

    private T value;

    public Value(T value) {
        this.value = value;
    }

    public T get() {
        return value;
    }

    public void set(T value) {
        this.value = value;
    }

}
