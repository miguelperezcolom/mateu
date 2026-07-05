package io.mateu.core.infra.reflection.read;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

final class ArrayValueConverter {

  static Object convertArrayValue(
      Field f, List<?> l, InstanceFactory instanceFactory, HttpRequest httpRequest)
      throws Exception {
    if (boolean[].class.equals(f.getType())) {
      boolean[] t = new boolean[l.size()];
      for (int i = 0; i < l.size(); i++) {
        Object v = l.get(i);
        t[i] = v instanceof Boolean && ((Boolean) v).booleanValue();
      }
      return t;
    }
    if (int[].class.equals(f.getType())) {
      int[] t = new int[l.size()];
      for (int i = 0; i < l.size(); i++) {
        Object v = l.get(i);
        if (v instanceof Integer) t[i] = ((Integer) v).intValue();
        else if (v instanceof String) t[i] = Integer.parseInt((String) v);
      }
      return t;
    }
    if (double[].class.equals(f.getType())) {
      double[] t = new double[l.size()];
      for (int i = 0; i < l.size(); i++) {
        Object v = l.get(i);
        if (v instanceof Double) t[i] = ((Double) v).doubleValue();
        else if (v instanceof Integer) t[i] = ((Integer) v).doubleValue();
        // the int[] branch parses strings — keep double[] consistent
        else if (v instanceof String) t[i] = Double.parseDouble((String) v);
      }
      return t;
    }
    if (String[].class.equals(f.getType())) {
      return l.toArray(new String[0]);
    }
    if (f.getType().getComponentType().isEnum()) {
      List<Object> t = new ArrayList<>();
      for (Object v : l) {
        t.add(Enum.valueOf((Class) f.getType().getComponentType(), (String) v));
      }
      return t.toArray((Object[]) Array.newInstance(f.getType().getComponentType(), 0));
    }
    List<Object> t = new ArrayList<>();
    for (Object v : l) {
      t.add(
          TypeCoercionHelper.getActualValue(
              f.getType().getComponentType(), v, instanceFactory, httpRequest));
    }
    return t.toArray((Object[]) Array.newInstance(f.getType().getComponentType(), 0));
  }

  private ArrayValueConverter() {}
}
