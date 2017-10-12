package io.mateu.mdd.model.population;

import io.mateu.erp.model.multilanguage.Literal;
import io.mateu.mdd.model.authentication.Permission;
import io.mateu.mdd.model.authentication.USER_STATUS;
import io.mateu.mdd.model.authentication.User;
import io.mateu.mdd.model.config.AppConfig;
import io.mateu.mdd.model.finnancials.Actor;
import io.mateu.mdd.model.finnancials.Currency;
import io.mateu.mdd.model.finnancials.Invoice;
import io.mateu.mdd.model.finnancials.InvoiceLine;
import io.mateu.erp.model.product.hotel.hotel.BoardType;
import io.mateu.erp.model.product.hotel.hotel.RoomType;
import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;

import java.time.LocalDate;

public class Populator {

    public static final String USER_ADMIN = "admin";


    public static void populate() throws Throwable {

        System.out.println("Populating database...");


        //authentication
        Helper.transact((JPATransaction) (em)->{

            AppConfig c = new AppConfig();
            c.setId(1);
            em.persist(c);

            c.createDummyDates();


            // create super admin permission
            Permission p = new Permission();
            p.setId(1);
            p.setName("Super admin");
            em.persist(p);


            {
                // create user admin
                User u = new User();
                u.setLogin(USER_ADMIN);
                u.setName("Admin");
                //u.setPassword(Helper.md5("1"));
                u.setPassword("1");
                u.setStatus(USER_STATUS.ACTIVE);
                u.setEmail("miguelperezcolom@gmail.com");
                u.getPermissions().add(p);
                em.persist(u);
            }

            {
                // create user admin
                User u = new User();
                u.setLogin("system");
                u.setName("System");
                //u.setPassword(Helper.md5("1"));
                u.setPassword("1");
                u.setStatus(USER_STATUS.ACTIVE);
                u.setEmail("miguelperezcolom@gmail.com");
                u.getPermissions().add(p);
                em.persist(u);
            }

            {
                // create user admin
                User u = new User();
                u.setLogin("importing");
                u.setName("Importing User");
                //u.setPassword(Helper.md5("1"));
                u.setPassword("1");
                u.setStatus(USER_STATUS.ACTIVE);
                u.setEmail("miguelperezcolom@gmail.com");
                u.getPermissions().add(p);
                em.persist(u);
            }


                Currency eur = new Currency();
                em.persist(eur);
                eur.setIsoCode("EUR");
                eur.setIso4217Code("1234");
                eur.setName("Euro");
                eur.setDecimals(2);
                em.persist(eur);

                Currency usd = new Currency();
                em.persist(usd);
                usd.setIsoCode("USD");
                usd.setIso4217Code("213");
                usd.setName("US Dollar");
                usd.setDecimals(2);
                em.persist(usd);

            {
                Actor a = new Actor();
                em.persist(a);
                a.setName("Viajes Urbis");
                a.setBusinessName("Viajes Urbis SA");
                a.setAddress("Gremi Fusters, 11");
                a.setComments("Test");
                a.setEmail("miguelperezcolom@gmail.com");
                a.setCurrency(eur);


                for (int k = 1; k < 30; k++) {

                    Invoice i = new Invoice();
                    em.persist(i);
                    i.setActor(a);
                    a.getInvoices().add(i);
                    i.setDate(LocalDate.of(2016, 1, k));
                    double t = 0;
                    for (int j = 0; j < 15; j++) {
                        InvoiceLine l = new InvoiceLine();
                        em.persist(l);
                        i.getLines().add(l);
                        l.setDescription("Line " + j);
                        l.setTotal(30 + j);
                        t += l.getTotal();
                    }
                    i.setTotal(t);

                }

            }

            {
                Actor a = new Actor();
                em.persist(a);
                a.setName("Atrápalo");
                a.setBusinessName("");
                a.setAddress("");
                a.setComments("");
                a.setEmail("");
                a.setCurrency(eur);
            }


            {
                Actor a = new Actor();
                em.persist(a);
                a.setName("Muchoviaje");
                a.setBusinessName("");
                a.setAddress("");
                a.setComments("");
                a.setEmail("");
                a.setCurrency(eur);
            }

            {
                RoomType a = new RoomType();
                em.persist(a);
                a.setCode("DBL");
                a.setName(new Literal("Double room", "Habitación doble"));
            }

            {
                RoomType a = new RoomType();
                em.persist(a);
                a.setCode("SUI");
                a.setName(new Literal("Suite", "Suite"));
            }

            {
                BoardType a = new BoardType();
                em.persist(a);
                a.setCode("BB");
                a.setName(new Literal("Bed & breakfast", "Alojamiento y desayuno"));
            }

            {
                BoardType a = new BoardType();
                em.persist(a);
                a.setCode("HB");
                a.setName(new Literal("Half board", "Media pensión"));
            }

            {
                BoardType a = new BoardType();
                em.persist(a);
                a.setCode("FB");
                a.setName(new Literal("Full board", "Pensión completa"));
            }

        });

        // multilanguage


        System.out.println("Database populated.");



    }
}
