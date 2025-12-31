package io.mateu.core.infra.valuegenerators;


import io.mateu.uidl.interfaces.ValueGenerator;
import jakarta.inject.Named;

import java.util.UUID;
import java.security.SecureRandom;


@Named
public class LocatorValueGenerator implements ValueGenerator {
    private static final String ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RNG = new SecureRandom();

    @Override
    public Object generate() {
        return newLocator(6);
    }

    public static String newLocator(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            int idx = RNG.nextInt(ALPHABET.length());
            sb.append(ALPHABET.charAt(idx));
        }
        return sb.toString();
    }
}
