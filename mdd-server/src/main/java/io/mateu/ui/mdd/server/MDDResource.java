package io.mateu.ui.mdd.server;

import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.UserData;

import javax.jws.WebService;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Map;

@WebService
@Path("mdd")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface MDDResource {


    @GET
    @Path("/menu")
    public Map<String, Object> getMenu() throws Throwable;

    @GET
    @Path("/authenticate")
    public UserData authenticate(Data parameters);


    @GET
    @Path("/booking/{bookingid}")
    public String getBooking(@PathParam("bookingid") String bookingId) throws Throwable;


}
