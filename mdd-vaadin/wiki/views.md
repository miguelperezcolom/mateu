CRUDs and publishing methods from server side classes will often not be enough.

You always need to create reports or special views for things that go off of the road.

Or perhaps you want to show a different view of an object, beside the default view which is created from the annotated class.

That's why I included views at Mateu mdd.

Currently you can create a list view (a browser with filters) from anything:

- an rpc call
- a jpql query
- a method call

## List anything

You just need to implement the `RpcView<F, C>`  interface, where F is the filters class and C is the result row class. 

So, you could do something like this:

```java

@Getter@Setter
public class MyRPCListView 
         implements 
             RpcView<MyRPCListView, MyRPCListView.Row> {

    @MainSearchFilter
    private String name;



    @Getter@Setter
    public class Row {
        private String id;
        private String name;
        private String email;
    }

    @Override
    public List<MyRPCListView.Row> rpc(MyRPCListView filters, 
                                             int offset, int limit) {
        // Do the rpc call and return results
    }

    @Override
    public int gatherCount(SampleCustomizedRPCListView filters) {
        // return the number of matching rows
    }
}

```

## CRUD anything

If you want to use the list view as a mean to access and edit records, you should implement the `RpcCrudView<F, C, T>` instead of the `RpcView<F, C>` interface, where the added `T` is the target POJO or entity type. 

## JPQL views

While the rpc views are absolutely generic interfaces, there are some useful JPA oriented base abstract classes:

- `AbstractJPQLListView<R>`
- `AbstractJPQLCrudView<R, T>`

Just feel free to use them if you want to create a list view from a JPQL query result, as in the following code:

```java

@Getter@Setter
public class SampleJPQLLIstView 
         extends AbstractJPQLListView<SampleJPQLLIstView.Row> {

    private String filter;

    @Getter@Setter
    public class Row {
        private String name;
        private int age;
    }


    @Override
    public Query buildQuery(EntityManager em, boolean forCount) {

        String ql = "select ";
        if (forCount) {
            ql += " count(x) ";
        } else {
            ql += " x.stringField, x.intField ";
        }
        ql += " from " + BasicFieldsDemoEntity.class.getName() + " x ";


        Map<String, Object> params = new HashMap<>();

        if (!Strings.isNullOrEmpty(filter)) {
            ql += " where lower(x.stringField) like :p0 ";
            params.put("p0", "%" + filter.toLowerCase() + "%");
        }

        if (!forCount) {
            ql += " order by x.id ";
        }


        Query q = em.createQuery(ql);

        params.keySet().forEach(k -> q.setParameter(k, params.get(k)));

        return q;
    }

}

```

## Let's make it interactive

At this point we know how to search and list things using list views.

Now we want to open things when we double click on our list view rows.

To achive this we only need to override the **isEditHandled** and **onEdit** methods of our list view:


````java

@Getter@Setter
public class RoomingListView extends AbstractJPQLListView<RoomingListView.Row> {

    private LocalDate from;
    private LocalDate to;


    @Getter@Setter
    public class Row {
        @NotInList
        private long partnerId;
        private String name;
        private long bookings;
    }



    @Override
    public Query buildQuery(EntityManager em, boolean forCount) throws Throwable {
        ...
    }

    @Override
    public boolean isEditHandled() {
        return true;
    }

    @Override
    public Object onEdit(Row row) {
        return new RoomingForm(row);
    }
}

````

When we double click on one of our rooming list view rows a **RoomingForm** (a POJO) editor will be presented to our user.



***

Continue with the manual at [wizards](Wizards).