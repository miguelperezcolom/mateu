package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ConfirmOnNavigationIfDirty;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.*;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Hotel reception check-in screen.
 *
 * <p>Phase 1: all the information of the reservation is shown declaratively using existing
 * Mateu annotations (sections, grids, tabs, textareas). Sections are stacked vertically for now;
 * the dense two-column layout (named zones), per-section actions and value-coloured grid pills
 * are added in phase 2 as framework extensions.
 */
@Service
@Scope("prototype")
@Route(value = "/:id/checkin", uis = {"/checkin"})
@Trigger(type = TriggerType.OnLoad, actionId = "load")
@ConfirmOnNavigationIfDirty
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Title("Check-in")
@Zones({
    @Zone(name = "left", width = "64%"),
    @Zone(name = "right", width = "36%")
})
public class CheckInForm {

    final ReservationLineRepository repository;

    public CheckInForm(ReservationLineRepository repository) {
        this.repository = repository;
    }

    @Hidden String id;

    // ===================== Información general de la reserva =====================
    @Section(value = "Información general de la reserva", columns = 4, zone = "left")
    @ReadOnly @Label("Localizador") String localizador;
    @ReadOnly @Label("Agencia") String agencia;
    @ReadOnly @Label("Hotel") String hotel;
    @ReadOnly @Label("Régimen") MealPlan mealPlan;
    @ReadOnly @Label("Tipo cobro") String chargeType;
    @ReadOnly @Label("Llegada") LocalDate arrivalDate;
    @ReadOnly @Label("Noches") int nights;
    @ReadOnly @Label("Salida") LocalDate departureDate;
    @ReadOnly @Label("Tiempo esperando") String waitingTime;
    @ReadOnly @Label("Adultos") int adults;
    @ReadOnly @Label("Niños") int children;
    @ReadOnly @Label("Bebés") int babies;
    @ReadOnly @Label("Estado") String reservationStatus;
    @ReadOnly @Label("Ref. tarifa") String tarifaRef;
    @ReadOnly @Label("Tipo tarifa") String tarifaType;
    @ReadOnly @Label("Grupo res.") String grupoRes;
    @ReadOnly @Label("Grupo op.") String grupoOp;
    @ReadOnly @Label("Garantizada") boolean garantizada;
    @ReadOnly @Label("Terceros") boolean terceros;
    @ReadOnly @Label("Pdte. Int.") boolean pdteInt;
    @ReadOnly @Label("Exp.") boolean exp;
    @ReadOnly @Label("Múltiple") boolean multiple;
    @ReadOnly @Label("VIP") boolean vip;
    @ReadOnly @Label("Riu Class") String riuClass;
    @ReadOnly @Label("Requiere") String requiere;

    // ===================== Check-in =====================
    @Section(value = "Check-in", columns = 4, zone = "left")
    @Label("Nº habitación") String assignedRoom;
    @ReadOnly @Label("Tipo hab. física") String roomTypePhysical;
    @ReadOnly @Label("Tipo hab. contratada") String roomType;
    @Label("Upgrade") boolean upgrade;
    @Label("Espera") boolean espera;
    @Stereotype(FieldStereotype.textarea) @Label("Deseos") String deseos;
    @Stereotype(FieldStereotype.textarea) @Label("Observaciones internas") String observacionesInternas;
    @Stereotype(FieldStereotype.textarea) @Label("Avisos") String avisos;

    // ===================== Detalle de estancia (PAX) =====================
    @Section(value = "Detalle de estancia (huéspedes)", columns = 1, zone = "left")
    @Stereotype(FieldStereotype.grid)
    List<GuestData> guests = new ArrayList<>();

    // ===================== Información cliente (tabs) =====================
    @Section(value = "Información cliente", zone = "left")
    @Tab("Info Cardex")
    @Label("Apellidos") String leadLastName;
    @Label("Nombre") String leadFirstName;
    @Label("Email") String leadEmail;
    @Label("Teléfono") String leadPhone;
    @Label("Dirección") String leadAddress;
    @Label("Población") String leadCity;
    @Label("CP") String leadCp;
    @Label("Provincia") String leadProvince;
    @Label("País residencia") String leadCountryResidence;
    @Label("Nacionalidad") String leadNationality;
    @Label("Idioma") String leadLanguage;
    @Label("Fecha nacimiento") LocalDate leadDob;
    @Label("Sexo") Sex leadSex;
    @Label("Ciudad nacimiento") String leadBirthCity;
    @Label("Tipo documento") DocumentType leadDocType;
    @Label("Nº documento") String leadDocNumber;
    @Label("Expedido") LocalDate leadIssued;
    @Label("Expira") LocalDate leadExpiry;
    @Label("Nº Riu Class") String leadRiuClassNo;
    @Label("Fax") String leadFax;
    @Label("Acepta publicidad") String leadAcceptsAds;
    @Label("Acompañante") boolean leadCompanion;
    @Label("Cardex provisional") boolean leadProvisionalCardex;

    @Tab("Datos Empresa")
    @ReadOnly @Label("Razón social") String companyName;
    @ReadOnly @Label("CIF") String cif;
    @ReadOnly @Label("Email facturación") String billingEmail;
    @ReadOnly @Label("Dirección fiscal") String fiscalAddress;
    @ReadOnly @Label("Forma de pago") String paymentTerms;

    @Tab("Datos Tarjeta")
    @ReadOnly @Label("Tipo tarjeta") String cardTypeName;
    @ReadOnly @Label("4 últimos dígitos") String cardLast4Tab;
    @ReadOnly @Label("Caducidad") String cardExpiry;
    @ReadOnly @Label("Titular") String cardHolder;
    @ReadOnly @Label("Garantía validada") boolean cardValidated;

    @Tab("Histórico cliente")
    @Stereotype(FieldStereotype.grid)
    List<HistoryStay> historyStays = new ArrayList<>();

    @Tab("Preferencias")
    @Stereotype(FieldStereotype.textarea) @Label("Preferencias del cliente") String preferenceNotes;

    // ===================== Importes =====================
    @Section(value = "Importes", columns = 1, zone = "right")
    @Stereotype(FieldStereotype.grid)
    List<ImporteLine> importes = new ArrayList<>();

    // ===================== Información habitación =====================
    @Section(value = "Información habitación", columns = 2, zone = "right")
    @ReadOnly @Label("Nº habitación") String roomInfoNumber;
    @ReadOnly @Label("Dobles / Individuales") String beds;
    @ReadOnly @Label("Estado") RoomState roomState;
    @Label("Checkout") boolean checkout;
    @ReadOnly @Label("Observaciones") String roomObservations;
    @Stereotype(FieldStereotype.textarea) @Label("Averías") String averias;

    // ===================== Historial cliente =====================
    @Section(value = "Historial cliente", columns = 2, zone = "right")
    @ReadOnly @Label("Tipo Riu Class") String riuClassType;
    @ReadOnly @Label("Último hotel") String lastHotel;
    @ReadOnly @Label("RPC") boolean rpc;
    @ReadOnly @Label("Repetido") int repeated;
    @ReadOnly @Label("Tipo cliente") String clientType;
    @ReadOnly @Label("Nº Attn H") int attnH;
    @ReadOnly @Label("Última habitación") String lastRoom;
    @Stereotype(FieldStereotype.textarea) @Label("Preferencias") String historialPreferences;

    // ===================== Folios / Anticipos =====================
    @Section(value = "Folios / Anticipos", columns = 2, zone = "right")
    @Label("Crédito cancelado") boolean creditCancelled;
    @Label("Imprimir recibo") boolean printReceipt;
    @Label("Límite crédito") BigDecimal creditLimit;
    @ReadOnly @Label("Tipo tarjeta") String cardType;
    @ReadOnly @Label("4 últimos dígitos") String cardLast4;
    @Label("Entrega a cuenta") BigDecimal deposit;
    @ReadOnly @Label("Saldo pendiente") BigDecimal saldoPendiente;

    Object load(HttpRequest httpRequest) {
        return populate() ? (Object) new State(this) : Message.success("Reservation not found");
    }

    /** Loads the reservation into the form fields. Reusable so the listing can pre-fill the form. */
    boolean populate() {
        var found = repository.findById(id);
        if (found.isEmpty()) {
            return false;
        }
        var line = found.get();
        {
            // Reservation
            localizador = line.getLocalizador();
            agencia = line.getAgencia();
            hotel = line.getHotel();
            mealPlan = line.getMealPlan();
            chargeType = line.getChargeType();
            arrivalDate = line.getArrivalDate();
            departureDate = line.getDepartureDate();
            nights = (int) ChronoUnit.DAYS.between(line.getArrivalDate(), line.getDepartureDate());
            waitingTime = line.getWaitingTime();
            adults = line.getAdults();
            children = line.getChildren();
            babies = line.getBabies();
            reservationStatus = line.getStatus() != null ? line.getStatus().name() : "";
            tarifaRef = line.getTarifaRef();
            tarifaType = line.getTarifaType();
            grupoRes = line.getGrupoRes();
            grupoOp = line.getGrupoOp();
            garantizada = line.isGarantizada();
            terceros = line.isTerceros();
            pdteInt = line.isPdteInt();
            exp = line.isExp();
            multiple = line.isMultiple();
            vip = line.isVip();
            riuClass = line.getRiuClass();
            requiere = line.getRequiere();

            // Check-in
            assignedRoom = line.getAssignedRoom();
            roomTypePhysical = line.getRoomTypePhysical();
            roomType = line.getRoomType();
            upgrade = line.isUpgrade();
            espera = line.isEspera();
            deseos = line.getDeseos();
            observacionesInternas = line.getObservacionesInternas();
            avisos = line.getAvisos();

            // Pax
            guests = new ArrayList<>(line.getGuests());

            // Lead guest cardex
            var lead = line.getGuests().isEmpty() ? null : line.getGuests().get(0);
            leadLastName = lead != null ? lead.getLastName() : "";
            leadFirstName = lead != null ? lead.getFirstName() : "";
            leadEmail = line.getLeadEmail();
            leadPhone = line.getLeadPhone();
            leadAddress = line.getLeadAddress();
            leadCity = line.getLeadCity();
            leadCp = line.getLeadCp();
            leadProvince = line.getLeadProvince();
            leadCountryResidence = line.getLeadCountryResidence();
            leadNationality = line.getLeadNationality();
            leadLanguage = line.getLeadLanguage();
            leadDob = line.getLeadDob();
            leadSex = line.getLeadSex();
            leadBirthCity = line.getLeadBirthCity();
            leadDocType = line.getLeadDocType();
            leadDocNumber = line.getLeadDocNumber();
            leadIssued = line.getLeadIssued();
            leadExpiry = line.getLeadExpiry();
            leadRiuClassNo = line.getLeadRiuClassNo();
            leadFax = line.getLeadFax();
            leadAcceptsAds = line.getLeadAcceptsAds();
            leadCompanion = line.isLeadCompanion();
            leadProvisionalCardex = line.isLeadProvisionalCardex();

            // Company / card / history tabs
            companyName = line.getCompanyName();
            cif = line.getCif();
            billingEmail = line.getBillingEmail();
            fiscalAddress = line.getFiscalAddress();
            paymentTerms = line.getPaymentTerms();
            cardTypeName = line.getCardTypeName();
            cardLast4Tab = line.getCardLast4();
            cardExpiry = line.getCardExpiry();
            cardHolder = line.getCardHolder();
            cardValidated = line.isCardValidated();
            historyStays = new ArrayList<>(line.getHistoryStays());
            preferenceNotes = line.getPreferences();

            // Importes
            importes = new ArrayList<>(line.getImportes());

            // Room info
            roomInfoNumber = line.getAssignedRoom() == null || line.getAssignedRoom().isBlank()
                    ? "—" : line.getAssignedRoom();
            beds = line.getBeds();
            roomState = line.getRoomState();
            checkout = line.isCheckout();
            roomObservations = line.getRoomObservations();
            averias = line.getAverias();

            // Client history
            riuClassType = line.getRiuClassType();
            lastHotel = line.getLastHotel();
            rpc = line.isRpc();
            repeated = line.getRepeated();
            clientType = line.getClientType();
            attnH = line.getAttnH();
            lastRoom = line.getLastRoom();
            historialPreferences = line.getPreferences();

            // Folio
            creditCancelled = line.isCreditCancelled();
            printReceipt = line.isPrintReceipt();
            creditLimit = line.getCreditLimit();
            cardType = line.getCardType();
            cardLast4 = line.getCardLast4();
            deposit = line.getDeposit();
            saldoPendiente = line.getSaldoPendiente();
        }
        return true;
    }

    private ReservationLine apply(ReservationLine line) {
        line.setAssignedRoom(assignedRoom);
        line.setUpgrade(upgrade);
        line.setEspera(espera);
        line.setDeseos(deseos);
        line.setObservacionesInternas(observacionesInternas);
        line.setAvisos(avisos);
        line.setCheckout(checkout);
        line.setAverias(averias);
        line.setCreditCancelled(creditCancelled);
        line.setPrintReceipt(printReceipt);
        line.setCreditLimit(creditLimit);
        line.setDeposit(deposit);
        line.setGuests(guests);
        return line;
    }

    @Button
    @Label("Guardar")
    Object save(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            repository.save(apply(line));
            return (Object) List.of(Message.success("Guardado"), UICommand.markAsClean());
        }).orElse(Message.success("Reservation not found"));
    }

    @Button
    @Label("Confirmar check-in")
    Object confirmCheckin(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            apply(line).setStatus(CheckInStatus.CHECKED_IN);
            repository.save(line);
            return (Object) List.of(
                    Message.success("Check-in confirmado para " + line.getTitular()),
                    MateuBeanProvider.getBean(CheckInListing.class)
            );
        }).orElse(Message.success("Reservation not found"));
    }

    @Button
    @Label("Pre asignar")
    Object preAsignar(HttpRequest httpRequest) {
        return Message.success("Habitación pre-asignada");
    }

    @Button
    @Label("Lector documento")
    Object lectorDocumento(HttpRequest httpRequest) {
        return Message.success("Lector de documento iniciado");
    }

    @Button
    @Label("Tarjeta welcome")
    Object tarjetaWelcome(HttpRequest httpRequest) {
        return Message.success("Tarjeta welcome enviada a impresión");
    }

    @Button
    @Label("Código WiFi")
    Object codigoWifi(HttpRequest httpRequest) {
        return Message.success("Código WiFi: RIU-" + (id == null ? "0000" : id) + "-GUEST");
    }

    @Button
    @Label("No show")
    Object noShow(HttpRequest httpRequest) {
        return Message.success("Reserva marcada como No show");
    }

    @Button
    @Label("Deshacer check-in")
    Object deshacerCheckin(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            line.setStatus(CheckInStatus.PENDING);
            repository.save(line);
            return (Object) Message.success("Check-in deshecho");
        }).orElse(Message.success("Reservation not found"));
    }
}
