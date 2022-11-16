package io.mateu.util.data;

import io.mateu.util.Serializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Created by miguel on 21/10/16.
 *
 * un almacen de datos
 *
 * añade un id para comparar
 *
 */
public class Data extends HashMap<String, Object> {

    public Data() {
        put("__id", "" + UUID.randomUUID());
    }

    public Data(String json) throws IOException {
        super(Serializer.fromJson(json));
        put("__id", "" + UUID.randomUUID());
    }

    public Data(Data other) {
        copy(other);
        put("__id", "" + UUID.randomUUID());
    }

    public Data(Object... args) {
        super();

        if (args != null && args.length == 1 && args[0] != null && Map.class.isAssignableFrom(args[0].getClass())) {
            copy((Map<String, Object>) args[0]);
            put("__id", "" + UUID.randomUUID());
        } else {
            int pos = 0;
            String n = null;
            if (args != null) for (Object x : args) {
                if (pos % 2 == 0) {
                    n = (String) x;
                } else {
                    put(n, x);
                }
                pos++;
            }
        }
    }

    public Data strip(String... ids) {
        Data d = new Data(this);
        for (String id : ids) {
            d.remove(id);
        }
        return d;
    }

    public List<Data> getSelection(String property) {
        List<Data> s = new ArrayList<>();
        for (Data x : getList(property)) if (x.getBoolean("_selected")) s.add(x);
        return s;
    }

    public String getString(String property) {
        Object v = get(property);
        return (v != null)?"" + v : null;
    }

    public double getDouble(String property) {
        return (containsKey(property))?(Double) get(property):0;
    }

    public boolean getBoolean(String property) {
        return (get(property) != null)?(Boolean) get(property):false;
    }

    public Date getDate(String property) {
        Object d = get(property);
        if (d instanceof Long) return new Date((Long) d);
        return (Date) d;
    }

    public LocalDate getLocalDate(String property) {
        Object d = get(property);
        return (LocalDate) d;
    }

    public LocalDateTime getLocalDateTime(String property) {
        Object d = get(property);
        return (LocalDateTime) d;
    }

    public int getInt(String property) {
        return (get(property) != null)?(Integer) get(property):0;
    }

    public long getLong(String property) {
        long l = 0;
        Object o;
        if ((o = get(property)) !=null) {
            if (o instanceof Long) {
                l = (Long) o;
            } else {
                l = new Long("" + o);
            }

        }
        return l;
    }

    public List<Data> getList(String property) {
        List<Data> l = get(property);
        if (l == null) {
            l = new ArrayList<Data>();
            set(property, l);
        }
        return l;
    }

    public Data getData(String property) {
        return get(property);
    }

    public void copy(Map<String, Object> original) {
        clear();
        if (original != null) for (Entry<String, Object> e : original.entrySet()) {
            if (e.getValue() instanceof List) {
                List l = getList(e.getKey());
                l.clear();
                for (Object o : ((List) e.getValue())) {
                    l.add(auxCopy(o));
                }
            } else {
                set(e.getKey(), auxCopy(e.getValue()));
            }
        }
    }

    public Object auxCopy(Object o) {
        Object c = null;
        if (o instanceof Data) {
            c = new Data((Data)o);
        } else {
            c = o;
        }
        return c;
    }

    public <X> X set(String name, X value) {
        if (value != null && value instanceof Date) value = (X) new Date(((Date)value).getTime());
        return (X) put(name, value);
    }

    public <X> X get(String property) {
        return (X) super.get(property);
    }

    public <X> X get(String property, X valueWhenNull) {
        Object x = get(property);
        return (X) ((x != null)?x:valueWhenNull);
    }


    public boolean isEmpty(String property) {
        boolean empty = get(property) == null;
        if (!empty) {
            Object x = get(property);
            empty = x instanceof String && "".equals(((String)x).trim());
        }
        return empty;
    }



    public Object clone() {
        Data d = new Data(this);
        if (d.containsKey("__id")) d.set("__id", "" + UUID.randomUUID());
        return d;
    }

    @Override
    public int hashCode() {
        return get("__id").hashCode();
    }

    @Override
    public String toString() {
        if (containsKey("_text")) return get("_text");
        if (containsKey("_nameproperty")) return get(get("_nameproperty"));
        try {
            return Serializer.toJson(this);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public String toJson() throws IOException {
        return Serializer.toJson(this);
    }

    public void setAll(Data data) {
        if (data != null) {
            for (String k : data.keySet()) {
                set(k, data.get(k));
            }
        }
    }


}
