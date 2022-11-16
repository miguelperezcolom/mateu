package io.mateu.util.common;

public class Pair<S, T> {

    private final S a;
    private final T b;

    public Pair(S a, T b) {
        this.a = a;
        this.b = b;
    }

    public S getA() {
        return a;
    }

    public T getB() {
        return b;
    }
}
