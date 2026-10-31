package com.Muthu.AICTE_FDRMS.repository;

import com.Muthu.AICTE_FDRMS.model.*;
import com.Muthu.AICTE_FDRMS.repository.mongo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Enterprise Central Data Repository for AICTE Regulation Bureau FDRMS.
 * Connected directly to MongoDB Atlas with in-memory resilient cache and cryptographic chaining.
 */
@Component
public class DataStore {

    @Autowired(required = false)
    private InstitutionMongoRepository institutionMongoRepository;

    @Autowired(required = false)
    private FdrInstrumentMongoRepository fdrInstrumentMongoRepository;

    @Autowired(required = false)
    private DocumentMongoRepository documentMongoRepository;

    @Autowired(required = false)
    private ScrutinyVerificationMongoRepository scrutinyVerificationMongoRepository;

    @Autowired(required = false)
    private ScrutinyObservationMongoRepository scrutinyObservationMongoRepository;

    @Autowired(required = false)
    private ReleaseRefundCaseMongoRepository releaseRefundCaseMongoRepository;

    @Autowired(required = false)
    private NotificationMongoRepository notificationMongoRepository;

    @Autowired(required = false)
    private AuditTrailMongoRepository auditTrailMongoRepository;

    @Autowired(required = false)
    private InternalUserMongoRepository internalUserMongoRepository;

    @Autowired(required = false)
    private MasterConfigMongoRepository masterConfigMongoRepository;

    public final Map<String, Institution> institutions = new ConcurrentHashMap<>();
    public final Map<String, FdrInstrument> fdrInstruments = new ConcurrentHashMap<>();
    public final Map<String, DocumentRecord> documents = new ConcurrentHashMap<>();
    public final Map<String, ScrutinyVerificationRecord> verifications = new ConcurrentHashMap<>();
    public final Map<String, ScrutinyObservation> observations = new ConcurrentHashMap<>();
    public final Map<String, ReleaseRefundCase> releaseCases = new ConcurrentHashMap<>();
    public final List<Notification> notifications = new CopyOnWriteArrayList<>();
    public final List<AuditTrailEntry> auditTrail = new CopyOnWriteArrayList<>();
    public final Map<String, InternalUser> users = new ConcurrentHashMap<>();
    public MasterConfiguration configuration = new MasterConfiguration();

    private final DateTimeFormatter dtFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @PostConstruct
    public void init() {
        System.out.println("==================================================================");
        System.out.println("AICTE-FDRMS: Initializing Official Regulatory Officer Dataset...");
        System.out.println("==================================================================");
        wipeAndSeedOfficialOfficerData();
    }

    /**
     * Completely wipes existing mock data from MongoDB Atlas collections and memory,
     * re-populates the official regulatory dataset connected to Smt. Ananya Sen (Desk Officer),
     * and persists the entire dataset into MongoDB Atlas.
     */
    public synchronized Map<String, Object> wipeAndSeedOfficialOfficerData() {
        System.out.println("AICTE-FDRMS: Step 1 - Purging all collections in MongoDB Atlas...");

        try {
            if (institutionMongoRepository != null) institutionMongoRepository.deleteAll();
            if (fdrInstrumentMongoRepository != null) fdrInstrumentMongoRepository.deleteAll();
            if (documentMongoRepository != null) documentMongoRepository.deleteAll();
            if (scrutinyVerificationMongoRepository != null) scrutinyVerificationMongoRepository.deleteAll();
            if (scrutinyObservationMongoRepository != null) scrutinyObservationMongoRepository.deleteAll();
            if (releaseRefundCaseMongoRepository != null) releaseRefundCaseMongoRepository.deleteAll();
            if (notificationMongoRepository != null) notificationMongoRepository.deleteAll();
            if (auditTrailMongoRepository != null) auditTrailMongoRepository.deleteAll();
            if (internalUserMongoRepository != null) internalUserMongoRepository.deleteAll();
            if (masterConfigMongoRepository != null) masterConfigMongoRepository.deleteAll();
            System.out.println("AICTE-FDRMS: Step 1 Complete - All MongoDB Atlas collections purged.");
        } catch (Exception e) {
            System.err.println("AICTE-FDRMS: Warning during MongoDB purge: " + e.getMessage());
        }

        // Clear in-memory state
        institutions.clear();
        fdrInstruments.clear();
        documents.clear();
        verifications.clear();
        observations.clear();
        releaseCases.clear();
        notifications.clear();
        auditTrail.clear();
        users.clear();
        configuration = new MasterConfiguration();

        System.out.println("AICTE-FDRMS: Step 2 - Seeding Official Officer Dataset...");
        seedMasterData();
        seedUsers();
        seedInstitutions();
        seedFdrInstruments();
        seedDocuments();
        seedScrutinyAndVerifications();
        seedReleaseCases();
        seedNotifications();
        seedAuditTrail();
        recalculateAllStatuses();

        System.out.println("AICTE-FDRMS: Step 3 - Synchronizing dataset directly to MongoDB Atlas...");
        syncAllToMongo();

        // Verify counts directly from MongoDB
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("timestamp", now());
        summary.put("officerPersona", "Smt. Ananya Sen, Deputy Director (Regulation Bureau / Case Scrutiny Cell)");
        summary.put("approvingAuthority", "Dr. Rajesh Sharma, Advisor & Director (Regulation Bureau)");
        summary.put("systemAdmin", "Shri Vikram Patel, Senior System Analyst (IT Bureau)");
        summary.put("status", "SUCCESS");

        Map<String, Long> mongoCounts = new LinkedHashMap<>();
        try {
            mongoCounts.put("institutions", institutionMongoRepository != null ? institutionMongoRepository.count() : institutions.size());
            mongoCounts.put("fdr_instruments", fdrInstrumentMongoRepository != null ? fdrInstrumentMongoRepository.count() : fdrInstruments.size());
            mongoCounts.put("documents", documentMongoRepository != null ? documentMongoRepository.count() : documents.size());
            mongoCounts.put("verifications", scrutinyVerificationMongoRepository != null ? scrutinyVerificationMongoRepository.count() : verifications.size());
            mongoCounts.put("scrutiny_observations", scrutinyObservationMongoRepository != null ? scrutinyObservationMongoRepository.count() : observations.size());
            mongoCounts.put("release_cases", releaseRefundCaseMongoRepository != null ? releaseRefundCaseMongoRepository.count() : releaseCases.size());
            mongoCounts.put("notifications", notificationMongoRepository != null ? notificationMongoRepository.count() : notifications.size());
            mongoCounts.put("audit_trail", auditTrailMongoRepository != null ? auditTrailMongoRepository.count() : auditTrail.size());
            mongoCounts.put("users", internalUserMongoRepository != null ? internalUserMongoRepository.count() : users.size());
            mongoCounts.put("master_configuration", masterConfigMongoRepository != null ? masterConfigMongoRepository.count() : 1);
        } catch (Exception e) {
            System.err.println("AICTE-FDRMS: Notice reading Mongo counts: " + e.getMessage());
        }

        summary.put("mongoCounts", mongoCounts);
        System.out.println("AICTE-FDRMS: Official Dataset successfully committed to MongoDB Atlas. Counts: " + mongoCounts);
        return summary;
    }

    public void syncAllToMongo() {
        try {
            if (institutionMongoRepository != null) institutionMongoRepository.saveAll(institutions.values());
            if (fdrInstrumentMongoRepository != null) fdrInstrumentMongoRepository.saveAll(fdrInstruments.values());
            if (documentMongoRepository != null) documentMongoRepository.saveAll(documents.values());
            if (scrutinyVerificationMongoRepository != null) scrutinyVerificationMongoRepository.saveAll(verifications.values());
            if (scrutinyObservationMongoRepository != null) scrutinyObservationMongoRepository.saveAll(observations.values());
            if (releaseRefundCaseMongoRepository != null) releaseRefundCaseMongoRepository.saveAll(releaseCases.values());
            if (notificationMongoRepository != null) notificationMongoRepository.saveAll(notifications);
            if (auditTrailMongoRepository != null) auditTrailMongoRepository.saveAll(auditTrail);
            if (internalUserMongoRepository != null) internalUserMongoRepository.saveAll(users.values());
            if (masterConfigMongoRepository != null && configuration != null) masterConfigMongoRepository.save(configuration);
        } catch (Exception e) {
            System.err.println("AICTE-FDRMS: Notice - Failed to bulk sync state to MongoDB: " + e.getMessage());
        }
    }

    public void saveInstitution(Institution inst) {
        if (inst == null || inst.getId() == null) return;
        institutions.put(inst.getId(), inst);
        if (institutionMongoRepository != null) {
            try { institutionMongoRepository.save(inst); } catch (Exception ignored) {}
        }
    }

    public void saveFdr(FdrInstrument fdr) {
        if (fdr == null || fdr.getId() == null) return;
        fdrInstruments.put(fdr.getId(), fdr);
        if (fdrInstrumentMongoRepository != null) {
            try { fdrInstrumentMongoRepository.save(fdr); } catch (Exception ignored) {}
        }
    }

    public void saveDocument(DocumentRecord doc) {
        if (doc == null || doc.getId() == null) return;
        documents.put(doc.getId(), doc);
        if (documentMongoRepository != null) {
            try { documentMongoRepository.save(doc); } catch (Exception ignored) {}
        }
    }

    public void saveVerification(ScrutinyVerificationRecord ver) {
        if (ver == null || ver.getId() == null) return;
        verifications.put(ver.getId(), ver);
        if (scrutinyVerificationMongoRepository != null) {
            try { scrutinyVerificationMongoRepository.save(ver); } catch (Exception ignored) {}
        }
    }

    public void saveObservation(ScrutinyObservation obs) {
        if (obs == null || obs.getId() == null) return;
        observations.put(obs.getId(), obs);
        if (scrutinyObservationMongoRepository != null) {
            try { scrutinyObservationMongoRepository.save(obs); } catch (Exception ignored) {}
        }
    }

    public void saveReleaseCase(ReleaseRefundCase c) {
        if (c == null || c.getId() == null) return;
        releaseCases.put(c.getId(), c);
        if (releaseRefundCaseMongoRepository != null) {
            try { releaseRefundCaseMongoRepository.save(c); } catch (Exception ignored) {}
        }
    }

    public void saveNotification(Notification n) {
        if (n == null) return;
        if (!notifications.contains(n)) notifications.add(0, n);
        if (notificationMongoRepository != null) {
            try { notificationMongoRepository.save(n); } catch (Exception ignored) {}
        }
    }

    public void saveUser(InternalUser u) {
        if (u == null || u.getId() == null) return;
        users.put(u.getId(), u);
        if (internalUserMongoRepository != null) {
            try { internalUserMongoRepository.save(u); } catch (Exception ignored) {}
        }
    }

    public void saveConfiguration(MasterConfiguration cfg) {
        if (cfg == null) return;
        this.configuration = cfg;
        if (masterConfigMongoRepository != null) {
            try { masterConfigMongoRepository.save(cfg); } catch (Exception ignored) {}
        }
    }

    public String now() {
        return LocalDateTime.now().format(dtFormatter);
    }

    public String today() {
        return LocalDate.now().format(dateFormatter);
    }

    public synchronized void addAuditEntry(String action, String entityType, String entityId,
                                          String performedBy, String userRole, String details,
                                          String beforeValue, String afterValue) {
        String id = "AUD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String prevHash = (!auditTrail.isEmpty() && auditTrail.get(0).getIntegrityHash() != null)
                ? auditTrail.get(0).getIntegrityHash()
                : "0000000000000000000000000000000000000000000000000000000000000000";

        AuditTrailEntry entry = new AuditTrailEntry(
                id, action, entityType, entityId, performedBy, userRole, now(), details, beforeValue, afterValue
        );
        entry.setPreviousHash(prevHash);
        auditTrail.add(0, entry);

        if (auditTrailMongoRepository != null) {
            try {
                auditTrailMongoRepository.save(entry);
            } catch (Exception ignored) {}
        }
    }

    public void recalculateAllStatuses() {
        LocalDate current = LocalDate.now();
        int advanceDays = 60;
        if (configuration != null && configuration.getAdvanceReminderDays() != null && !configuration.getAdvanceReminderDays().isEmpty()) {
            advanceDays = Collections.max(configuration.getAdvanceReminderDays());
        }

        for (FdrInstrument fdr : fdrInstruments.values()) {
            if (fdr.getInstrumentStatus() == InstrumentStatus.RELEASED ||
                fdr.getInstrumentStatus() == InstrumentStatus.CLOSED ||
                fdr.getInstrumentStatus() == InstrumentStatus.RENEWED ||
                fdr.getInstrumentStatus() == InstrumentStatus.REPLACED) {
                continue;
            }

            try {
                LocalDate maturity = LocalDate.parse(fdr.getMaturityDate(), dateFormatter);
                long daysUntilMaturity = ChronoUnit.DAYS.between(current, maturity);

                if (daysUntilMaturity < 0) {
                    if (fdr.getInstrumentStatus() != InstrumentStatus.RENEWAL_PENDING &&
                        fdr.getInstrumentStatus() != InstrumentStatus.RELEASE_PENDING) {
                        fdr.setInstrumentStatus(InstrumentStatus.OVERDUE);
                        fdr.setPriority(Priority.URGENT);
                    }
                } else if (daysUntilMaturity <= advanceDays) {
                    if (fdr.getInstrumentStatus() == InstrumentStatus.ACTIVE) {
                        fdr.setInstrumentStatus(InstrumentStatus.EXPIRING_SOON);
                        if (daysUntilMaturity <= 15) {
                            fdr.setPriority(Priority.URGENT);
                        } else if (daysUntilMaturity <= 30) {
                            fdr.setPriority(Priority.HIGH);
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
    }

    private void seedMasterData() {
        configuration.getAdvanceReminderDays().addAll(List.of(30, 60, 90));
        configuration.setEscalationThresholdDays(15);
        configuration.setScrutinyDueDays(14);
        configuration.setLastUpdated("2026-10-15 10:00:00");
        configuration.setUpdatedBy("patel.v@aicte-india.org");

        configuration.getAuthorizedBanks().addAll(List.of(
                new BankMaster("BNK-01", "State Bank of India", "Public Sector", "SBIN", true),
                new BankMaster("BNK-02", "Punjab National Bank", "Public Sector", "PUNB", true),
                new BankMaster("BNK-03", "Canara Bank", "Public Sector", "CNRB", true),
                new BankMaster("BNK-04", "Bank of Baroda", "Public Sector", "BARB", true),
                new BankMaster("BNK-05", "Union Bank of India", "Public Sector", "UBIN", true),
                new BankMaster("BNK-06", "HDFC Bank", "Private Scheduled", "HDFC", true),
                new BankMaster("BNK-07", "ICICI Bank", "Private Scheduled", "ICIC", true),
                new BankMaster("BNK-08", "Axis Bank", "Private Scheduled", "UTIB", true)
        ));

        configuration.getInstitutionCategories().addAll(List.of(
                "Engineering & Technology", "Management", "Pharmacy", "Architecture",
                "Applied Arts & Crafts", "Hotel Management & Catering", "Polytechnic / Diploma", "State / Central University"
        ));

        configuration.getInstrumentTypes().addAll(List.of(
                "FDR (Fixed Deposit Receipt)", "Bank Guarantee", "Joint Term Deposit", "Escrow Deposit"
        ));

        configuration.getDocumentTypes().addAll(List.of(
                "FDR Original Scan", "Bank Confirmation Letter", "Joint Lien Undertaking",
                "Renewal Certificate", "Institution Compliance Letter", "Scrutiny Sheet",
                "Competent Authority Sanction Order", "Discharge Certificate"
        ));
    }

    private void seedUsers() {
        users.put("USR-001", new InternalUser(
                "USR-001", "Dr. Rajesh Sharma", "Advisor & Director (Regulation Bureau)",
                "sharma.r@aicte-india.org", UserRole.ROLE_APPROVER,
                "Approval & Regulatory Affairs Bureau, AICTE HQ New Delhi", "+91 11 2958 1001", "ACTIVE", 4
        ));

        users.put("USR-002", new InternalUser(
                "USR-002", "Smt. Ananya Sen", "Deputy Director (Case Scrutiny & FDR Cell)",
                "sen.a@aicte-india.org", UserRole.ROLE_REVIEWER,
                "Regulation Bureau, Scrutiny Cell, AICTE HQ New Delhi", "+91 11 2958 1042", "ACTIVE", 8
        ));

        users.put("USR-003", new InternalUser(
                "USR-003", "Shri Vikram Patel", "Senior Portal Administrator & IT Analyst",
                "patel.v@aicte-india.org", UserRole.ROLE_ADMIN,
                "e-Governance & IT Bureau, AICTE HQ New Delhi", "+91 11 2958 1088", "ACTIVE", 0
        ));
    }

    private void seedInstitutions() {
        // 1. Delhi Institute of Technology & Management (Northern Region - NWRO)
        institutions.put("INST-001", new Institution(
                "INST-001", "1-10928472", "1-4392817201", "Delhi Institute of Technology & Management",
                "Engineering & Technology", "Delhi", "North West Delhi", "110085",
                "Plot No. 14, Institutional Area, Sector 9, Rohini, New Delhi - 110085",
                "Prof. (Dr.) Arvind Kulshrestha", "Director", "director@ditm-delhi.edu.in",
                "+91 98110 23411", "registrar@ditm-delhi.edu.in",
                "Approved (EoA 2026-27)",
                "Sponsoring Trust: Shri Krishna Educational & Charitable Society (Regd. S/38291/1998). Affiliated to GGSIPU, Delhi. Active joint FDR ₹50.00 L in SBI CP branch maturing in 45 days, plus ₹30.00 L BG in ICICI Bank for AI & Data Science expansion.",
                "2021-12-10 10:00:00", "2026-10-15 11:30:00"
        ));

        // 2. Maharashtra Institute of Management Studies (Western Region - WRO)
        institutions.put("INST-002", new Institution(
                "INST-002", "1-28374619", "1-4392817302", "Maharashtra Institute of Management Studies",
                "Management", "Maharashtra", "Pune", "411038",
                "S.No. 44/1, Paud Road, Kothrud, Pune, Maharashtra - 411038",
                "Dr. Meenakshi Joshi", "Director", "director@mims-pune.org",
                "+91 94220 54321", "admin@mims-pune.org",
                "Notice Issued (Discrepancy Pending)",
                "Sponsoring Body: Vidya Vikas Shikshan Sanstha, Pune. Affiliated to Savitribai Phule Pune University. Security deposit ₹35.00 L in PNB Kothrud branch has lien endorsement discrepancy. Notice issued under Section 10(k) of AICTE Act.",
                "2023-06-12 14:20:00", "2026-10-22 16:45:00"
        ));

        // 3. Karnataka College of Pharmacy (South-Western Region - SWRO)
        institutions.put("INST-003", new Institution(
                "INST-003", "1-39485721", "1-4392817403", "Karnataka College of Pharmacy",
                "Pharmacy", "Karnataka", "Bengaluru Urban", "560064",
                "Survey No. 12, Kogilu Main Road, Yelahanka New Town, Bengaluru, Karnataka - 560064",
                "Dr. S. K. Narayana", "Principal", "principal@kcpharmacy.ac.in",
                "+91 98450 11223", "trustee@kcpharmacy.ac.in",
                "Statutory Notice Issued (Renewal Overdue)",
                "Sponsoring Body: Karnataka Technical & Medical Research Trust. Affiliated to RGUHS Bengaluru. FDR ₹25.00 L in Canara Bank Yelahanka matured on 2026-10-10; overdue by 21 days without renewal receipt. Second reminder issued.",
                "2020-03-15 09:15:00", "2026-10-26 12:10:00"
        ));

        // 4. Tamil Nadu Polytechnic College (Southern Region - SRO)
        institutions.put("INST-004", new Institution(
                "INST-004", "1-48291048", "1-4392817504", "Tamil Nadu Polytechnic College",
                "Polytechnic / Diploma", "Tamil Nadu", "Coimbatore", "641014",
                "Avinashi Road, Civil Aerodrome Post, Peelamedu, Coimbatore, Tamil Nadu - 641014",
                "Thiru K. Balasubramanian", "Principal", "principal@tnpolytechnic.edu.in",
                "+91 94430 77889", "office@tnpolytechnic.edu.in",
                "Approved (EoA 2026-27)",
                "Sponsoring Body: Kovai Technical Education Foundation. Affiliated to DOTE Tamil Nadu. Initial 3-year term deposit of ₹15.00 L in Bank of Baroda renewed in August 2024 for another 3 years. Valid joint lien endorsement in core banking.",
                "2021-08-20 11:00:00", "2024-08-22 15:20:00"
        ));

        // 5. National Apex School of Architecture (Northern Region - NRO)
        institutions.put("INST-005", new Institution(
                "INST-005", "1-58291039", "1-4392817605", "National Apex School of Architecture",
                "Architecture", "Uttar Pradesh", "Gautam Buddha Nagar", "201306",
                "Plot No. 8, Knowledge Park III, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh - 201306",
                "Prof. Rajiv Mehrotra", "Head of School", "head@apexarch.edu.in",
                "+91 98101 44556", "accounts@apexarch.edu.in",
                "Refund Sanction in Process",
                "Sponsoring Body: Apex Higher Education & Design Society. Affiliated to AKTU Lucknow. Completed mandatory 8-year lock-in period for ₹1.00 Cr deposit in HDFC Bank. Scrutiny completed; awaiting formal Competent Authority Sanction Order.",
                "2018-09-01 10:30:00", "2026-10-28 17:00:00"
        ));

        // 6. Gujarat Institute of Applied Sciences & Engineering (Central Region - CRO)
        institutions.put("INST-006", new Institution(
                "INST-006", "1-68291049", "1-4392817706", "Gujarat Institute of Applied Sciences & Engineering",
                "Engineering & Technology", "Gujarat", "Ahmedabad", "380015",
                "Opp. Iscon Temple, Near SG Highway, Bodakdev, Ahmedabad, Gujarat - 380015",
                "Dr. Hasmukh Patel", "Director", "director@gias-gujarat.ac.in",
                "+91 98250 88990", "registrar@gias-gujarat.ac.in",
                "Closed - Deposit Discharged",
                "Sponsoring Body: Sardar Patel Technical Education Society. Voluntary closure of non-viable Electrical Engineering diploma wing. Discharge certificate AICTE/DIS/2026/019 issued on 2026-05-10; ₹50.00 L deposit released to sponsoring society.",
                "2017-02-14 10:00:00", "2026-05-10 14:00:00"
        ));

        // 7. Hyderabad Institute of Technology & Science (South-Central Region - SCRO)
        institutions.put("INST-007", new Institution(
                "INST-007", "1-74829101", "1-4392817807", "Hyderabad Institute of Technology & Science",
                "Engineering & Technology", "Telangana", "Hyderabad", "500081",
                "Survey No. 108, Hitech City Phase II, Madhapur, Hyderabad, Telangana - 500081",
                "Dr. V. Chandrasekhar", "Principal", "principal@hits-hyd.ac.in",
                "+91 98490 66554", "admin@hits-hyd.ac.in",
                "Approved (EoA 2026-27)",
                "Sponsoring Body: Nizam Educational Foundation. Affiliated to JNTU Hyderabad. ₹1.00 Cr deposit held in Bank of Baroda under verified joint lien. Valid up to July 2029.",
                "2022-07-01 09:30:00", "2026-07-05 14:15:00"
        ));

        // 8. Kolkata Academy of Computer Applications (Eastern Region - ERO)
        institutions.put("INST-008", new Institution(
                "INST-008", "1-83920194", "1-4392817908", "Kolkata Academy of Computer Applications",
                "Management", "West Bengal", "North 24 Parganas", "700091",
                "Block EM, Sector V, Salt Lake City, Bidhannagar, Kolkata, West Bengal - 700091",
                "Prof. Sougata Mukherjee", "Director", "director@kaca-kolkata.edu.in",
                "+91 98300 22334", "dean@kaca-kolkata.edu.in",
                "Scrutiny In Progress",
                "Sponsoring Body: Tagore Memorial Education Trust. Affiliated to MAKAUT. New standalone MCA institute setup. Submitted ₹35.00 L FDR on Union Bank of India. Verification dispatch sent to Salt Lake branch.",
                "2026-10-01 11:00:00", "2026-10-24 16:30:00"
        ));

        // 9. Rajasthan College of Engineering for Women (North-Western Region - NWRO)
        institutions.put("INST-009", new Institution(
                "INST-009", "1-92837465", "1-4392818009", "Rajasthan College of Engineering for Women",
                "Engineering & Technology", "Rajasthan", "Jaipur", "302026",
                "NH-8, Bhankrota, Ajmer Road, Jaipur, Rajasthan - 302026",
                "Dr. Sunita Rathore", "Principal", "principal@rcew-jaipur.ac.in",
                "+91 94140 33445", "info@rcew-jaipur.ac.in",
                "Approved (EoA 2026-27)",
                "Sponsoring Body: Mahila Shiksha Samiti, Jaipur. Affiliated to RTU Kota. ₹50.00 L FDR in Punjab National Bank under joint lien with Regional Officer NWRO. Reinvestment interest mapped to scholarship fund.",
                "2023-04-15 10:00:00", "2026-04-18 11:20:00"
        ));

        // 10. St. Xavier's Polytechnic Institute (South-Western Region - SWRO)
        institutions.put("INST-010", new Institution(
                "INST-010", "1-10392847", "1-4392818110", "St. Xavier's Polytechnic Institute",
                "Polytechnic / Diploma", "Kerala", "Ernakulam", "682030",
                "Kakkanad InfoPark Expressway, Kochi, Ernakulam, Kerala - 682030",
                "Fr. Dr. Mathew Varghese", "Principal", "principal@xavierpoly-kochi.ac.in",
                "+91 94470 11992", "admin@xavierpoly-kochi.ac.in",
                "Bank Guarantee Renewal Pending",
                "Sponsoring Body: Society of Jesus Technical Education Mission. ₹25.00 L Bank Guarantee issued by State Bank of India expiring in November 2026. Renewal demand letter issued on 2026-10-15.",
                "2023-11-20 09:45:00", "2026-10-25 15:40:00"
        ));
    }

    private void seedFdrInstruments() {
        // FDR 1: Active, approaching maturity (within 60 days) - Delhi DITM
        FdrInstrument f1 = new FdrInstrument();
        f1.setId("FDR-2026-001");
        f1.setFdrNumber("SBI/ND/2021/883921");
        f1.setInstitutionId("INST-001");
        f1.setInstitutionName("Delhi Institute of Technology & Management");
        f1.setInstitutionAicteId("1-10928472");
        f1.setInstrumentType(InstrumentType.FDR);
        f1.setBankName("State Bank of India");
        f1.setBranchName("Connaught Place Branch, New Delhi");
        f1.setBranchIfsc("SBIN0000691");
        f1.setAmount(5000000.0); // 50 Lakhs
        f1.setCurrency("INR");
        f1.setIssueDate("2021-12-15");
        f1.setMaturityDate("2026-12-15");
        f1.setTenureMonths(60);
        f1.setInterestRate(6.75);
        f1.setInterestType("Cumulative / Reinvestment");
        f1.setMaturityAmount(6987500.0);
        f1.setJointLienMarked(true);
        f1.setJointHolderName("Regional Officer, AICTE NWRO & Principal DITM");
        f1.setInstrumentEvent("NEW_DEPOSIT");
        f1.setComplianceReference("AICTE/NWRO/2021/DITM-01");
        f1.setInstrumentStatus(InstrumentStatus.EXPIRING_SOON);
        f1.setVerificationStatus(VerificationStatus.VERIFIED);
        f1.setAssignedReviewerId("USR-002");
        f1.setAssignedReviewerName("Smt. Ananya Sen");
        f1.setPriority(Priority.HIGH);
        f1.setRemarks("Deposit under joint lien for establishing new CSE program. Due for renewal in approx 45 days. Official advance reminder notice issued.");
        f1.setCreatedAt("2021-12-20 11:30:00");
        f1.setUpdatedAt("2026-10-15 09:00:00");
        fdrInstruments.put(f1.getId(), f1);

        // FDR 2: Discrepancy Found (Missing joint lien in bank master) - Pune MIMS
        FdrInstrument f2 = new FdrInstrument();
        f2.setId("FDR-2026-002");
        f2.setFdrNumber("PNB/PUN/2023/102938");
        f2.setInstitutionId("INST-002");
        f2.setInstitutionName("Maharashtra Institute of Management Studies");
        f2.setInstitutionAicteId("1-28374619");
        f2.setInstrumentType(InstrumentType.FDR);
        f2.setBankName("Punjab National Bank");
        f2.setBranchName("Kothrud Branch, Pune");
        f2.setBranchIfsc("PUNB0182900");
        f2.setAmount(3500000.0); // 35 Lakhs
        f2.setCurrency("INR");
        f2.setIssueDate("2023-06-01");
        f2.setMaturityDate("2028-06-01");
        f2.setTenureMonths(60);
        f2.setInterestRate(7.10);
        f2.setInterestType("Cumulative");
        f2.setMaturityAmount(4973500.0);
        f2.setJointLienMarked(false); // Discrepancy!
        f2.setJointHolderName("MIMS Pune (Sole Holder - AICTE Lien not endorsed by branch)");
        f2.setInstrumentEvent("NEW_DEPOSIT");
        f2.setComplianceReference("AICTE/WRO/2023/MIMS-09");
        f2.setInstrumentStatus(InstrumentStatus.ACTIVE);
        f2.setVerificationStatus(VerificationStatus.DISCREPANCY_FOUND);
        f2.setAssignedReviewerId("USR-002");
        f2.setAssignedReviewerName("Smt. Ananya Sen");
        f2.setPriority(Priority.URGENT);
        f2.setFlagDiscrepancy(true);
        f2.setRemarks("Bank verification letter indicates FDR is solely in college name. Lien in favour of Regional Officer AICTE not marked in Core Banking System.");
        f2.setCreatedAt("2023-06-15 10:15:00");
        f2.setUpdatedAt("2026-10-22 14:00:00");
        fdrInstruments.put(f2.getId(), f2);

        // FDR 3: Matured / Overdue without renewal - Karnataka Pharmacy
        FdrInstrument f3 = new FdrInstrument();
        f3.setId("FDR-2026-003");
        f3.setFdrNumber("CNRB/BLR/2020/556781");
        f3.setInstitutionId("INST-003");
        f3.setInstitutionName("Karnataka College of Pharmacy");
        f3.setInstitutionAicteId("1-39485721");
        f3.setInstrumentType(InstrumentType.FDR);
        f3.setBankName("Canara Bank");
        f3.setBranchName("Yelahanka Branch, Bengaluru");
        f3.setBranchIfsc("CNRB0001829");
        f3.setAmount(2500000.0); // 25 Lakhs
        f3.setCurrency("INR");
        f3.setIssueDate("2020-10-10");
        f3.setMaturityDate("2026-10-10");
        f3.setTenureMonths(72);
        f3.setInterestRate(6.50);
        f3.setInterestType("Cumulative");
        f3.setMaturityAmount(3672000.0);
        f3.setJointLienMarked(true);
        f3.setJointHolderName("Regional Officer AICTE SWRO & Principal KCP");
        f3.setInstrumentEvent("NEW_DEPOSIT");
        f3.setComplianceReference("AICTE/SWRO/2020/KCP-04");
        f3.setInstrumentStatus(InstrumentStatus.OVERDUE);
        f3.setVerificationStatus(VerificationStatus.VERIFIED);
        f3.setAssignedReviewerId("USR-002");
        f3.setAssignedReviewerName("Smt. Ananya Sen");
        f3.setPriority(Priority.URGENT);
        f3.setFlagMissingDocuments(true);
        f3.setRemarks("Matured on 10 Oct 2026. Renewal certificate not submitted by institution despite reminder. Statutory notice issued under Section 10(k).");
        f3.setCreatedAt("2020-10-15 14:00:00");
        f3.setUpdatedAt("2026-10-26 11:20:00");
        fdrInstruments.put(f3.getId(), f3);

        // FDR 4: Original FDR that was renewed - TN Polytechnic
        FdrInstrument f4Old = new FdrInstrument();
        f4Old.setId("FDR-2021-004");
        f4Old.setFdrNumber("BARB/CBE/2021/334411");
        f4Old.setInstitutionId("INST-004");
        f4Old.setInstitutionName("Tamil Nadu Polytechnic College");
        f4Old.setInstitutionAicteId("1-48291048");
        f4Old.setInstrumentType(InstrumentType.FDR);
        f4Old.setBankName("Bank of Baroda");
        f4Old.setBranchName("Peelamedu Branch, Coimbatore");
        f4Old.setBranchIfsc("BARB0PEELAM");
        f4Old.setAmount(1500000.0); // 15 Lakhs
        f4Old.setCurrency("INR");
        f4Old.setIssueDate("2021-08-15");
        f4Old.setMaturityDate("2024-08-15");
        f4Old.setTenureMonths(36);
        f4Old.setInterestRate(6.25);
        f4Old.setInterestType("Cumulative");
        f4Old.setMaturityAmount(1805000.0);
        f4Old.setJointLienMarked(true);
        f4Old.setJointHolderName("Regional Officer AICTE SRO & Principal TNPC");
        f4Old.setInstrumentEvent("NEW_DEPOSIT");
        f4Old.setComplianceReference("AICTE/SRO/2021/POLY-88");
        f4Old.setInstrumentStatus(InstrumentStatus.RENEWED);
        f4Old.setVerificationStatus(VerificationStatus.VERIFIED);
        f4Old.setAssignedReviewerId("USR-002");
        f4Old.setAssignedReviewerName("Smt. Ananya Sen");
        f4Old.setNextFdrId("FDR-2024-004R");
        f4Old.setPriority(Priority.LOW);
        f4Old.setRemarks("Original 3-year diploma setup deposit. Successfully renewed as FDR-2024-004R.");
        f4Old.setCreatedAt("2021-08-20 10:00:00");
        f4Old.setUpdatedAt("2024-08-22 12:00:00");
        fdrInstruments.put(f4Old.getId(), f4Old);

        // FDR 4 Ren: Active renewed FDR linked to original - TN Polytechnic
        FdrInstrument f4New = new FdrInstrument();
        f4New.setId("FDR-2024-004R");
        f4New.setFdrNumber("BARB/CBE/2024/991122");
        f4New.setInstitutionId("INST-004");
        f4New.setInstitutionName("Tamil Nadu Polytechnic College");
        f4New.setInstitutionAicteId("1-48291048");
        f4New.setInstrumentType(InstrumentType.FDR);
        f4New.setBankName("Bank of Baroda");
        f4New.setBranchName("Peelamedu Branch, Coimbatore");
        f4New.setBranchIfsc("BARB0PEELAM");
        f4New.setAmount(1500000.0);
        f4New.setCurrency("INR");
        f4New.setIssueDate("2024-08-15");
        f4New.setMaturityDate("2027-08-15");
        f4New.setTenureMonths(36);
        f4New.setInterestRate(7.00);
        f4New.setInterestType("Cumulative");
        f4New.setMaturityAmount(1843500.0);
        f4New.setJointLienMarked(true);
        f4New.setJointHolderName("Regional Officer AICTE SRO & Principal TNPC");
        f4New.setInstrumentEvent("RENEWAL");
        f4New.setComplianceReference("AICTE/SRO/2024/POLY-88/REN");
        f4New.setInstrumentStatus(InstrumentStatus.ACTIVE);
        f4New.setVerificationStatus(VerificationStatus.VERIFIED);
        f4New.setAssignedReviewerId("USR-002");
        f4New.setAssignedReviewerName("Smt. Ananya Sen");
        f4New.setPreviousFdrId("FDR-2021-004");
        f4New.setPriority(Priority.LOW);
        f4New.setRemarks("Renewed deposit leaf with valid joint lien endorsement. Next maturity August 2027.");
        f4New.setCreatedAt("2024-08-22 14:30:00");
        f4New.setUpdatedAt("2026-08-22 15:20:00");
        fdrInstruments.put(f4New.getId(), f4New);

        // FDR 5: Release Pending / 8-Year Moratorium Complete - NASA Architecture
        FdrInstrument f5 = new FdrInstrument();
        f5.setId("FDR-2018-005");
        f5.setFdrNumber("HDFC/NOI/2018/776655");
        f5.setInstitutionId("INST-005");
        f5.setInstitutionName("National Apex School of Architecture");
        f5.setInstitutionAicteId("1-58291039");
        f5.setInstrumentType(InstrumentType.FDR);
        f5.setBankName("HDFC Bank");
        f5.setBranchName("Sector 62 Branch, Noida");
        f5.setBranchIfsc("HDFC0000281");
        f5.setAmount(10000000.0); // 1.00 Crore
        f5.setCurrency("INR");
        f5.setIssueDate("2018-09-01");
        f5.setMaturityDate("2026-09-01");
        f5.setTenureMonths(96);
        f5.setInterestRate(7.25);
        f5.setInterestType("Cumulative");
        f5.setMaturityAmount(17650000.0);
        f5.setJointLienMarked(true);
        f5.setJointHolderName("Regional Officer AICTE NRO & Head of Institution NASA");
        f5.setInstrumentEvent("NEW_DEPOSIT");
        f5.setComplianceReference("AICTE/NRO/2018/ARCH-01");
        f5.setInstrumentStatus(InstrumentStatus.RELEASE_PENDING);
        f5.setVerificationStatus(VerificationStatus.VERIFIED);
        f5.setAssignedReviewerId("USR-001");
        f5.setAssignedReviewerName("Dr. Rajesh Sharma");
        f5.setPriority(Priority.HIGH);
        f5.setRemarks("8-year mandatory security deposit term completed. Case scrutinized by Scrutiny Cell, forwarded to Director for Sanction Order.");
        f5.setCreatedAt("2018-09-05 11:00:00");
        f5.setUpdatedAt("2026-10-28 17:00:00");
        fdrInstruments.put(f5.getId(), f5);

        // FDR 6: Released & Discharged - Gujarat Applied Sciences
        FdrInstrument f6 = new FdrInstrument();
        f6.setId("FDR-2017-006");
        f6.setFdrNumber("UBIN/AHM/2017/123987");
        f6.setInstitutionId("INST-006");
        f6.setInstitutionName("Gujarat Institute of Applied Sciences & Engineering");
        f6.setInstitutionAicteId("1-68291049");
        f6.setInstrumentType(InstrumentType.FDR);
        f6.setBankName("Union Bank of India");
        f6.setBranchName("Bodakdev Branch, Ahmedabad");
        f6.setBranchIfsc("UBIN0543210");
        f6.setAmount(5000000.0); // 50 Lakhs
        f6.setCurrency("INR");
        f6.setIssueDate("2017-02-10");
        f6.setMaturityDate("2025-02-10");
        f6.setTenureMonths(96);
        f6.setInterestRate(6.80);
        f6.setInterestType("Cumulative");
        f6.setMaturityAmount(8520000.0);
        f6.setJointLienMarked(true);
        f6.setJointHolderName("Regional Officer AICTE CRO & Principal GIAS");
        f6.setInstrumentEvent("NEW_DEPOSIT");
        f6.setComplianceReference("AICTE/CRO/2017/ENGG-99");
        f6.setInstrumentStatus(InstrumentStatus.RELEASED);
        f6.setVerificationStatus(VerificationStatus.VERIFIED);
        f6.setAssignedReviewerId("USR-001");
        f6.setAssignedReviewerName("Dr. Rajesh Sharma");
        f6.setPriority(Priority.LOW);
        f6.setRemarks("Discharge Certificate No. AICTE/DIS/2026/019 issued on 2026-05-10. Original FDR released to institution.");
        f6.setCreatedAt("2017-02-15 10:00:00");
        f6.setUpdatedAt("2026-05-10 14:00:00");
        fdrInstruments.put(f6.getId(), f6);

        // FDR 7: Bank Guarantee Active - Delhi DITM
        FdrInstrument f7 = new FdrInstrument();
        f7.setId("FDR-2025-007");
        f7.setFdrNumber("BG/ICIC/2025/449900");
        f7.setInstitutionId("INST-001");
        f7.setInstitutionName("Delhi Institute of Technology & Management");
        f7.setInstitutionAicteId("1-10928472");
        f7.setInstrumentType(InstrumentType.BANK_GUARANTEE);
        f7.setBankName("ICICI Bank");
        f7.setBranchName("Rohini Sector 9 Branch, Delhi");
        f7.setBranchIfsc("ICIC0000554");
        f7.setAmount(3000000.0); // 30 Lakhs
        f7.setCurrency("INR");
        f7.setIssueDate("2025-03-01");
        f7.setMaturityDate("2028-03-01");
        f7.setTenureMonths(36);
        f7.setInterestRate(0.0);
        f7.setInterestType("Non-interest (Bank Guarantee)");
        f7.setMaturityAmount(3000000.0);
        f7.setJointLienMarked(true);
        f7.setJointHolderName("In favour of Member Secretary, AICTE New Delhi");
        f7.setInstrumentEvent("NEW_DEPOSIT");
        f7.setComplianceReference("AICTE/NWRO/2025/BG-09");
        f7.setInstrumentStatus(InstrumentStatus.ACTIVE);
        f7.setVerificationStatus(VerificationStatus.VERIFIED);
        f7.setAssignedReviewerId("USR-002");
        f7.setAssignedReviewerName("Smt. Ananya Sen");
        f7.setPriority(Priority.LOW);
        f7.setRemarks("SFMS confirmation advice received from ICICI Bank trade desk on 2025-03-10.");
        f7.setCreatedAt("2025-03-05 12:00:00");
        f7.setUpdatedAt("2025-03-12 16:30:00");
        fdrInstruments.put(f7.getId(), f7);

        // FDR 8: Active Long-term ₹1.00 Cr - Hyderabad HITS
        FdrInstrument f8 = new FdrInstrument();
        f8.setId("FDR-2022-008");
        f8.setFdrNumber("BARB/HYD/2022/667788");
        f8.setInstitutionId("INST-007");
        f8.setInstitutionName("Hyderabad Institute of Technology & Science");
        f8.setInstitutionAicteId("1-74829101");
        f8.setInstrumentType(InstrumentType.FDR);
        f8.setBankName("Bank of Baroda");
        f8.setBranchName("Madhapur Branch, Hyderabad");
        f8.setBranchIfsc("BARB0MADHAP");
        f8.setAmount(10000000.0); // 1.00 Crore
        f8.setCurrency("INR");
        f8.setIssueDate("2022-07-01");
        f8.setMaturityDate("2029-07-01");
        f8.setTenureMonths(84);
        f8.setInterestRate(7.15);
        f8.setInterestType("Cumulative");
        f8.setMaturityAmount(16280000.0);
        f8.setJointLienMarked(true);
        f8.setJointHolderName("Regional Officer AICTE SCRO & Principal HITS");
        f8.setInstrumentEvent("NEW_DEPOSIT");
        f8.setComplianceReference("AICTE/SCRO/2022/ENGG-77");
        f8.setInstrumentStatus(InstrumentStatus.ACTIVE);
        f8.setVerificationStatus(VerificationStatus.VERIFIED);
        f8.setAssignedReviewerId("USR-002");
        f8.setAssignedReviewerName("Smt. Ananya Sen");
        f8.setPriority(Priority.LOW);
        f8.setRemarks("Clean security deposit. Annual interest reporting up to date.");
        f8.setCreatedAt("2022-07-05 10:00:00");
        f8.setUpdatedAt("2026-07-05 14:15:00");
        fdrInstruments.put(f8.getId(), f8);

        // FDR 9: Fresh Submission under Scrutiny - Kolkata Academy
        FdrInstrument f9 = new FdrInstrument();
        f9.setId("FDR-2026-009");
        f9.setFdrNumber("UBIN/KOL/2026/892100");
        f9.setInstitutionId("INST-008");
        f9.setInstitutionName("Kolkata Academy of Computer Applications");
        f9.setInstitutionAicteId("1-83920194");
        f9.setInstrumentType(InstrumentType.FDR);
        f9.setBankName("Union Bank of India");
        f9.setBranchName("Salt Lake Sector V Branch, Kolkata");
        f9.setBranchIfsc("UBIN0812901");
        f9.setAmount(3500000.0); // 35 Lakhs
        f9.setCurrency("INR");
        f9.setIssueDate("2026-10-01");
        f9.setMaturityDate("2031-10-01");
        f9.setTenureMonths(60);
        f9.setInterestRate(6.90);
        f9.setInterestType("Cumulative");
        f9.setMaturityAmount(4915000.0);
        f9.setJointLienMarked(true);
        f9.setJointHolderName("Regional Officer AICTE ERO & Director KACA");
        f9.setInstrumentEvent("NEW_DEPOSIT");
        f9.setComplianceReference("AICTE/ERO/2026/MCA-12");
        f9.setInstrumentStatus(InstrumentStatus.ACTIVE);
        f9.setVerificationStatus(VerificationStatus.PENDING_SCRUTINY);
        f9.setAssignedReviewerId("USR-002");
        f9.setAssignedReviewerName("Smt. Ananya Sen");
        f9.setPriority(Priority.MEDIUM);
        f9.setRemarks("Fresh deposit receipt for newly approved MCA division. Bank confirmation letter dispatched to Branch Manager.");
        f9.setCreatedAt("2026-10-05 11:30:00");
        f9.setUpdatedAt("2026-10-24 16:30:00");
        fdrInstruments.put(f9.getId(), f9);

        // FDR 10: Active Verified ₹50.00 L - Rajasthan Women Engg
        FdrInstrument f10 = new FdrInstrument();
        f10.setId("FDR-2023-010");
        f10.setFdrNumber("PNB/JAI/2023/554433");
        f10.setInstitutionId("INST-009");
        f10.setInstitutionName("Rajasthan College of Engineering for Women");
        f10.setInstitutionAicteId("1-92837465");
        f10.setInstrumentType(InstrumentType.FDR);
        f10.setBankName("Punjab National Bank");
        f10.setBranchName("Ajmer Road Branch, Jaipur");
        f10.setBranchIfsc("PUNB0392000");
        f10.setAmount(5000000.0); // 50 Lakhs
        f10.setCurrency("INR");
        f10.setIssueDate("2023-04-15");
        f10.setMaturityDate("2028-04-15");
        f10.setTenureMonths(60);
        f10.setInterestRate(7.05);
        f10.setInterestType("Cumulative");
        f10.setMaturityAmount(7035000.0);
        f10.setJointLienMarked(true);
        f10.setJointHolderName("Regional Officer AICTE NWRO & Principal RCEW");
        f10.setInstrumentEvent("NEW_DEPOSIT");
        f10.setComplianceReference("AICTE/NWRO/2023/WOMEN-01");
        f10.setInstrumentStatus(InstrumentStatus.ACTIVE);
        f10.setVerificationStatus(VerificationStatus.VERIFIED);
        f10.setAssignedReviewerId("USR-002");
        f10.setAssignedReviewerName("Smt. Ananya Sen");
        f10.setPriority(Priority.LOW);
        f10.setRemarks("Joint lien confirmed by PNB Chief Manager. Annual interest assigned to student merit scholarship.");
        f10.setCreatedAt("2023-04-20 10:00:00");
        f10.setUpdatedAt("2026-04-18 11:20:00");
        fdrInstruments.put(f10.getId(), f10);

        // FDR 11: Bank Guarantee Expiring in 25 Days - St. Xavier's Kochi
        FdrInstrument f11 = new FdrInstrument();
        f11.setId("FDR-2023-011");
        f11.setFdrNumber("BG/SBI/2023/112244");
        f11.setInstitutionId("INST-010");
        f11.setInstitutionName("St. Xavier's Polytechnic Institute");
        f11.setInstitutionAicteId("1-10392847");
        f11.setInstrumentType(InstrumentType.BANK_GUARANTEE);
        f11.setBankName("State Bank of India");
        f11.setBranchName("Kakkanad Branch, Kochi");
        f11.setBranchIfsc("SBIN0010567");
        f11.setAmount(2500000.0); // 25 Lakhs
        f11.setCurrency("INR");
        f11.setIssueDate("2023-11-25");
        f11.setMaturityDate("2026-11-25");
        f11.setTenureMonths(36);
        f11.setInterestRate(0.0);
        f11.setInterestType("Non-interest (Bank Guarantee)");
        f11.setMaturityAmount(2500000.0);
        f11.setJointLienMarked(true);
        f11.setJointHolderName("In favour of Member Secretary, AICTE New Delhi");
        f11.setInstrumentEvent("NEW_DEPOSIT");
        f11.setComplianceReference("AICTE/SWRO/2023/BG-41");
        f11.setInstrumentStatus(InstrumentStatus.EXPIRING_SOON);
        f11.setVerificationStatus(VerificationStatus.VERIFIED);
        f11.setAssignedReviewerId("USR-002");
        f11.setAssignedReviewerName("Smt. Ananya Sen");
        f11.setPriority(Priority.URGENT);
        f11.setRemarks("Bank guarantee expiring on 2026-11-25. Renewal demand letter dispatched to institution.");
        f11.setCreatedAt("2023-11-28 14:00:00");
        f11.setUpdatedAt("2026-10-25 15:40:00");
        fdrInstruments.put(f11.getId(), f11);

        // FDR 12: Active Safe Deposit ₹50.00 L - Ahmedabad GIAS (Surviving Division)
        FdrInstrument f12 = new FdrInstrument();
        f12.setId("FDR-2022-012");
        f12.setFdrNumber("UBIN/AHM/2022/990011");
        f12.setInstitutionId("INST-006");
        f12.setInstitutionName("Gujarat Institute of Applied Sciences & Engineering");
        f12.setInstitutionAicteId("1-68291049");
        f12.setInstrumentType(InstrumentType.FDR);
        f12.setBankName("Union Bank of India");
        f12.setBranchName("Bodakdev Branch, Ahmedabad");
        f12.setBranchIfsc("UBIN0543210");
        f12.setAmount(5000000.0);
        f12.setCurrency("INR");
        f12.setIssueDate("2022-06-15");
        f12.setMaturityDate("2027-06-15");
        f12.setTenureMonths(60);
        f12.setInterestRate(7.10);
        f12.setInterestType("Cumulative");
        f12.setMaturityAmount(7080000.0);
        f12.setJointLienMarked(true);
        f12.setJointHolderName("Regional Officer AICTE CRO & Principal GIAS");
        f12.setInstrumentEvent("NEW_DEPOSIT");
        f12.setComplianceReference("AICTE/CRO/2022/ENGG-99B");
        f12.setInstrumentStatus(InstrumentStatus.ACTIVE);
        f12.setVerificationStatus(VerificationStatus.VERIFIED);
        f12.setAssignedReviewerId("USR-002");
        f12.setAssignedReviewerName("Smt. Ananya Sen");
        f12.setPriority(Priority.LOW);
        f12.setRemarks("Deposit for existing Computer Engineering division. Fully compliant.");
        f12.setCreatedAt("2022-06-20 10:00:00");
        f12.setUpdatedAt("2026-06-20 11:00:00");
        fdrInstruments.put(f12.getId(), f12);
    }

    private void seedDocuments() {
        // Doc 1: DITM Original FDR Scan
        DocumentRecord d1 = new DocumentRecord();
        d1.setId("DOC-001");
        d1.setFdrId("FDR-2026-001");
        d1.setInstitutionId("INST-001");
        d1.setDocumentType(DocumentType.FDR_ORIGINAL_COPY);
        d1.setTitle("SBI Term Deposit Certificate Leaf - FDR 883921");
        d1.setFileName("SBI_FDR_883921_DITM_Verified.pdf");
        d1.setFileSize("1.8 MB");
        d1.setFileContentType("application/pdf");
        d1.setReceivedDate("2021-12-18");
        d1.setUploadedDate("2021-12-20");
        d1.setUploadedBy("sen.a@aicte-india.org");
        d1.setSourceReference("Speed Post Dispatch ED839218291IN from DITM");
        d1.setVersion(1);
        d1.setStatus(DocumentStatus.ACCEPTED);
        d1.setNotes("Clear scanned certificate showing AICTE NWRO joint lien endorsement on leaf face.");
        documents.put(d1.getId(), d1);

        // Doc 2: DITM Bank Confirmation
        DocumentRecord d2 = new DocumentRecord();
        d2.setId("DOC-002");
        d2.setFdrId("FDR-2026-001");
        d2.setInstitutionId("INST-001");
        d2.setDocumentType(DocumentType.BANK_CONFIRMATION_LETTER);
        d2.setTitle("SBI Connaught Place Branch Direct Confirmation Letter");
        d2.setFileName("SBI_CP_Confirmation_Memo_2022.pdf");
        d2.setFileSize("940 KB");
        d2.setFileContentType("application/pdf");
        d2.setReceivedDate("2022-01-10");
        d2.setUploadedDate("2022-01-12");
        d2.setUploadedBy("sen.a@aicte-india.org");
        d2.setSourceReference("Official Bank Letter Ref: SBI/CP/ADV/2022/990");
        d2.setVersion(1);
        d2.setStatus(DocumentStatus.ACCEPTED);
        d2.setNotes("Confirmed by Chief Manager Shri K. Ramanathan, verified amount ₹50,00,000.");
        documents.put(d2.getId(), d2);

        // Doc 3: MIMS Pune Discrepant FDR Scan
        DocumentRecord d3 = new DocumentRecord();
        d3.setId("DOC-003");
        d3.setFdrId("FDR-2026-002");
        d3.setInstitutionId("INST-002");
        d3.setDocumentType(DocumentType.FDR_ORIGINAL_COPY);
        d3.setTitle("PNB Fixed Deposit Receipt Copy 102938 (Missing Lien)");
        d3.setFileName("PNB_FDR_102938_MIMS_LienMissing.pdf");
        d3.setFileSize("2.1 MB");
        d3.setFileContentType("application/pdf");
        d3.setReceivedDate("2023-06-10");
        d3.setUploadedDate("2023-06-15");
        d3.setUploadedBy("sen.a@aicte-india.org");
        d3.setSourceReference("Courier DTDC-992102 from MIMS");
        d3.setVersion(1);
        d3.setStatus(DocumentStatus.QUESTIONABLE);
        d3.getScrutinyFlags().add("QUESTIONABLE");
        d3.getScrutinyFlags().add("INCOMPLETE");
        d3.setNotes("Notice: Name on receipt displays MIMS Pune only. Stamp and joint designation of Regional Officer absent.");
        documents.put(d3.getId(), d3);

        // Doc 4: MIMS Pune Bank Discrepancy Statement
        DocumentRecord d4 = new DocumentRecord();
        d4.setId("DOC-004");
        d4.setFdrId("FDR-2026-002");
        d4.setInstitutionId("INST-002");
        d4.setDocumentType(DocumentType.BANK_CONFIRMATION_LETTER);
        d4.setTitle("PNB Kothrud Branch Discrepancy Statement");
        d4.setFileName("PNB_Kothrud_Discrepancy_Reply_2023.pdf");
        d4.setFileSize("760 KB");
        d4.setFileContentType("application/pdf");
        d4.setReceivedDate("2023-07-20");
        d4.setUploadedDate("2023-07-22");
        d4.setUploadedBy("sen.a@aicte-india.org");
        d4.setSourceReference("Letter Ref: PNB/KOT/CONF/2023/412");
        d4.setVersion(1);
        d4.setStatus(DocumentStatus.REJECTED);
        d4.getScrutinyFlags().add("QUESTIONABLE");
        d4.setNotes("Bank states term deposit is unencumbered in college name without registered lien to AICTE.");
        documents.put(d4.getId(), d4);

        // Doc 5: NASA Formal Refund Request Letter
        DocumentRecord d5 = new DocumentRecord();
        d5.setId("DOC-005");
        d5.setFdrId("FDR-2018-005");
        d5.setInstitutionId("INST-005");
        d5.setCaseId("REL-2026-001");
        d5.setDocumentType(DocumentType.INSTITUTION_COVER_LETTER);
        d5.setTitle("NASA Formal Surrender Application - 8 Yr Tenure Completion");
        d5.setFileName("NASA_8Yr_Moratorium_Refund_Request.pdf");
        d5.setFileSize("1.2 MB");
        d5.setFileContentType("application/pdf");
        d5.setReceivedDate("2026-09-10");
        d5.setUploadedDate("2026-09-12");
        d5.setUploadedBy("sen.a@aicte-india.org");
        d5.setSourceReference("Letter Ref: NASA/REG/2026/102");
        d5.setVersion(1);
        d5.setStatus(DocumentStatus.ACCEPTED);
        d5.setNotes("Institution requests release of ₹1.00 Crore after completion of 8-year moratorium.");
        documents.put(d5.getId(), d5);

        // Doc 6: NASA Scrutiny Sheet
        DocumentRecord d6 = new DocumentRecord();
        d6.setId("DOC-006");
        d6.setFdrId("FDR-2018-005");
        d6.setInstitutionId("INST-005");
        d6.setCaseId("REL-2026-001");
        d6.setDocumentType(DocumentType.SCRUTINY_SHEET);
        d6.setTitle("Scrutiny Checklist & Field Verification Report - NASA");
        d6.setFileName("Scrutiny_Checklist_NASA_REL2026_001.pdf");
        d6.setFileSize("850 KB");
        d6.setFileContentType("application/pdf");
        d6.setReceivedDate("2026-10-18");
        d6.setUploadedDate("2026-10-18");
        d6.setUploadedBy("sen.a@aicte-india.org");
        d6.setSourceReference("Internal Scrutiny Note #48/2026");
        d6.setVersion(1);
        d6.setStatus(DocumentStatus.ACCEPTED);
        d6.setNotes("All 5 regulatory verification criteria satisfied. Recommended by Scrutiny Cell for sanction.");
        documents.put(d6.getId(), d6);

        // Doc 7: NASA State Govt NOC
        DocumentRecord d7 = new DocumentRecord();
        d7.setId("DOC-007");
        d7.setFdrId("FDR-2018-005");
        d7.setInstitutionId("INST-005");
        d7.setCaseId("REL-2026-001");
        d7.setDocumentType(DocumentType.INSTITUTION_COVER_LETTER);
        d7.setTitle("UP Technical Education Directorate NOC for Deposit Release");
        d7.setFileName("UP_DTE_NOC_NASA_Surrender_2026.pdf");
        d7.setFileSize("620 KB");
        d7.setFileContentType("application/pdf");
        d7.setReceivedDate("2026-10-12");
        d7.setUploadedDate("2026-10-15");
        d7.setUploadedBy("sen.a@aicte-india.org");
        d7.setSourceReference("Letter No. DTE/UP/NOC/2026/891");
        d7.setVersion(1);
        d7.setStatus(DocumentStatus.ACCEPTED);
        d7.setNotes("No objection issued by State Government. No student fee disputes pending.");
        documents.put(d7.getId(), d7);

        // Doc 8: GIAS Competent Authority Sanction Order
        DocumentRecord d8 = new DocumentRecord();
        d8.setId("DOC-008");
        d8.setFdrId("FDR-2017-006");
        d8.setInstitutionId("INST-006");
        d8.setCaseId("REL-2026-002");
        d8.setDocumentType(DocumentType.SANCTION_ORDER);
        d8.setTitle("AICTE Sanction Order - Release of Deposit (GIAS Gujarat)");
        d8.setFileName("AICTE_SANCTION_ORDER_2026_019.pdf");
        d8.setFileSize("1.1 MB");
        d8.setFileContentType("application/pdf");
        d8.setReceivedDate("2026-04-12");
        d8.setUploadedDate("2026-04-12");
        d8.setUploadedBy("sharma.r@aicte-india.org");
        d8.setSourceReference("Sanction Memo AICTE/REG/SAN/2026/019");
        d8.setVersion(1);
        d8.setStatus(DocumentStatus.ACCEPTED);
        d8.setNotes("Formal approval signed by Director (Regulation Bureau) under delegated council authority.");
        documents.put(d8.getId(), d8);

        // Doc 9: GIAS Discharge Certificate
        DocumentRecord d9 = new DocumentRecord();
        d9.setId("DOC-009");
        d9.setFdrId("FDR-2017-006");
        d9.setInstitutionId("INST-006");
        d9.setCaseId("REL-2026-002");
        d9.setDocumentType(DocumentType.RELEASE_DISCHARGE_ORDER);
        d9.setTitle("Official Discharge & Lien Release Certificate");
        d9.setFileName("AICTE_DISCHARGE_CERTIFICATE_GIAS_019.pdf");
        d9.setFileSize("780 KB");
        d9.setFileContentType("application/pdf");
        d9.setReceivedDate("2026-05-10");
        d9.setUploadedDate("2026-05-10");
        d9.setUploadedBy("patel.v@aicte-india.org");
        d9.setSourceReference("Discharge Certificate No. AICTE/DIS/2026/019");
        d9.setVersion(1);
        d9.setStatus(DocumentStatus.ACCEPTED);
        d9.setNotes("Official discharge certificate dispatching original FDR receipt back to institution.");
        documents.put(d9.getId(), d9);

        // Doc 10: GIAS Postal Delivery Ack
        DocumentRecord d10 = new DocumentRecord();
        d10.setId("DOC-010");
        d10.setFdrId("FDR-2017-006");
        d10.setInstitutionId("INST-006");
        d10.setCaseId("REL-2026-002");
        d10.setDocumentType(DocumentType.OTHER);
        d10.setTitle("India Post Delivery Acknowledgement for Discharged Deposit");
        d10.setFileName("IndiaPost_Ack_SP_DL_2026_9901.pdf");
        d10.setFileSize("430 KB");
        d10.setFileContentType("application/pdf");
        d10.setReceivedDate("2026-05-18");
        d10.setUploadedDate("2026-05-20");
        d10.setUploadedBy("patel.v@aicte-india.org");
        d10.setSourceReference("Speed Post Tracking SP-DL-2026-9901");
        d10.setVersion(1);
        d10.setStatus(DocumentStatus.ACCEPTED);
        d10.setNotes("Delivered to Principal Dr. Hasmukh Patel on 16-May-2026.");
        documents.put(d10.getId(), d10);

        // Doc 11: DITM Bank Guarantee SFMS Advice
        DocumentRecord d11 = new DocumentRecord();
        d11.setId("DOC-011");
        d11.setFdrId("FDR-2025-007");
        d11.setInstitutionId("INST-001");
        d11.setDocumentType(DocumentType.BANK_CONFIRMATION_LETTER);
        d11.setTitle("ICICI Bank Structured Financial Messaging (SFMS) Advice");
        d11.setFileName("ICICI_SFMS_Advice_BG_449900.pdf");
        d11.setFileSize("610 KB");
        d11.setFileContentType("application/pdf");
        d11.setReceivedDate("2025-03-08");
        d11.setUploadedDate("2025-03-10");
        d11.setUploadedBy("sen.a@aicte-india.org");
        d11.setSourceReference("SFMS Ref: IFN760COV/2025/ICIC/881");
        d11.setVersion(1);
        d11.setStatus(DocumentStatus.ACCEPTED);
        d11.setNotes("SFMS message verified through central treasury desk. BG valid for 36 months.");
        documents.put(d11.getId(), d11);

        // Doc 12: TNPC Trust Board Resolution
        DocumentRecord d12 = new DocumentRecord();
        d12.setId("DOC-012");
        d12.setFdrId("FDR-2024-004R");
        d12.setInstitutionId("INST-004");
        d12.setDocumentType(DocumentType.JOINT_LIEN_UNDERTAKING);
        d12.setTitle("Kovai Technical Education Trust Board Resolution - Renewal");
        d12.setFileName("Kovai_Trust_Board_Resolution_2024.pdf");
        d12.setFileSize("1.4 MB");
        d12.setFileContentType("application/pdf");
        d12.setReceivedDate("2024-08-10");
        d12.setUploadedDate("2024-08-15");
        d12.setUploadedBy("sen.a@aicte-india.org");
        d12.setSourceReference("Trust Resolution Ext. No. 04/2024");
        d12.setVersion(1);
        d12.setStatus(DocumentStatus.ACCEPTED);
        d12.setNotes("Resolution authorizing Chairman to renew FDR for 3 additional years in favor of AICTE.");
        documents.put(d12.getId(), d12);

        // Doc 13: TNPC Rollover Certificate
        DocumentRecord d13 = new DocumentRecord();
        d13.setId("DOC-013");
        d13.setFdrId("FDR-2024-004R");
        d13.setInstitutionId("INST-004");
        d13.setDocumentType(DocumentType.RENEWAL_RECEIPT);
        d13.setTitle("Bank of Baroda Rollover Certificate 991122");
        d13.setFileName("BOB_Renewed_FDR_991122_TNPC.pdf");
        d13.setFileSize("1.9 MB");
        d13.setFileContentType("application/pdf");
        d13.setReceivedDate("2024-08-18");
        d13.setUploadedDate("2024-08-22");
        d13.setUploadedBy("sen.a@aicte-india.org");
        d13.setSourceReference("BOB Branch Letter Ref: BOB/PEEL/ADV/2024/311");
        d13.setVersion(1);
        d13.setStatus(DocumentStatus.ACCEPTED);
        d13.setNotes("Confirmed renewal from 2024 to 2027 under joint lien.");
        documents.put(d13.getId(), d13);

        // Doc 14: KCP Overdue Show Cause Notice
        DocumentRecord d14 = new DocumentRecord();
        d14.setId("DOC-014");
        d14.setFdrId("FDR-2026-003");
        d14.setInstitutionId("INST-003");
        d14.setDocumentType(DocumentType.OTHER);
        d14.setTitle("AICTE Statutory Show-Cause Notice - Overdue Renewal");
        d14.setFileName("AICTE_ShowCause_Notice_Overdue_KCP_2026.pdf");
        d14.setFileSize("520 KB");
        d14.setFileContentType("application/pdf");
        d14.setReceivedDate("2026-10-20");
        d14.setUploadedDate("2026-10-22");
        d14.setUploadedBy("sen.a@aicte-india.org");
        d14.setSourceReference("Notice Ref: AICTE/SWRO/NOT/2026/KCP-01");
        d14.setVersion(1);
        d14.setStatus(DocumentStatus.ACCEPTED);
        d14.setNotes("Official statutory notice calling upon management to explain failure to renew security deposit.");
        documents.put(d14.getId(), d14);

        // Doc 15: Kolkata Academy Fresh FDR Submission
        DocumentRecord d15 = new DocumentRecord();
        d15.setId("DOC-015");
        d15.setFdrId("FDR-2026-009");
        d15.setInstitutionId("INST-008");
        d15.setDocumentType(DocumentType.FDR_ORIGINAL_COPY);
        d15.setTitle("Union Bank Term Deposit Leaf - FDR 892100");
        d15.setFileName("UBIN_FDR_892100_Kolkata_Academy.pdf");
        d15.setFileSize("1.7 MB");
        d15.setFileContentType("application/pdf");
        d15.setReceivedDate("2026-10-04");
        d15.setUploadedDate("2026-10-05");
        d15.setUploadedBy("sen.a@aicte-india.org");
        d15.setSourceReference("Registered AD Letter Ref: KACA/AICTE/2026/01");
        d15.setVersion(1);
        d15.setStatus(DocumentStatus.PENDING_REVIEW);
        d15.setNotes("Receipt leaf currently under scrutiny. Verification letter sent to bank on 06-Oct-2026.");
        documents.put(d15.getId(), d15);
    }

    private void seedScrutinyAndVerifications() {
        // Verification 1: FDR 1 Verified
        ScrutinyVerificationRecord v1 = new ScrutinyVerificationRecord();
        v1.setId("VER-001");
        v1.setFdrId("FDR-2026-001");
        v1.setInstitutionId("INST-001");
        v1.setVerificationMethod("OFFICIAL_BANK_LETTER");
        v1.setVerificationSource("Shri K. Ramanathan, Chief Manager, SBI Connaught Place");
        v1.setReferenceNumber("SBI/CP/CONF/2022/990");
        v1.setVerificationDate("2022-01-10");
        v1.setResult("VERIFIED");
        v1.setVerifiedBy("sen.a@aicte-india.org");
        v1.setSupportingDocumentId("DOC-002");
        v1.setConfirmedAmount(5000000.0);
        v1.setConfirmedMaturityDate("2026-12-15");
        v1.setConfirmedLienStatus(true);
        v1.setRemarks("Bank confirmed FDR leaf authenticity, joint lien noted in core banking system.");
        v1.setCreatedAt("2022-01-12 11:00:00");
        verifications.put(v1.getId(), v1);

        // Verification 2: FDR 2 Discrepancy Found
        ScrutinyVerificationRecord v2 = new ScrutinyVerificationRecord();
        v2.setId("VER-002");
        v2.setFdrId("FDR-2026-002");
        v2.setInstitutionId("INST-002");
        v2.setVerificationMethod("OFFICIAL_BANK_LETTER");
        v2.setVerificationSource("Branch Manager, PNB Kothrud Branch, Pune");
        v2.setReferenceNumber("PNB/KOT/CONF/2023/412");
        v2.setVerificationDate("2023-07-20");
        v2.setResult("DISCREPANCY_FOUND");
        v2.setVerifiedBy("sen.a@aicte-india.org");
        v2.setSupportingDocumentId("DOC-004");
        v2.setConfirmedAmount(3500000.0);
        v2.setConfirmedMaturityDate("2028-06-01");
        v2.setConfirmedLienStatus(false);
        v2.setDiscrepancyDetails("Bank stated that FDR 102938 is an unencumbered term deposit solely in institution name; joint lien in favour of AICTE Regional Officer has NOT been registered.");
        v2.setRemarks("Official clarification notice sent to institution to submit rectifying bank lien endorsement certificate.");
        v2.setCreatedAt("2023-07-22 15:30:00");
        verifications.put(v2.getId(), v2);

        // Verification 3: FDR 3 Verified initially
        ScrutinyVerificationRecord v3 = new ScrutinyVerificationRecord();
        v3.setId("VER-003");
        v3.setFdrId("FDR-2026-003");
        v3.setInstitutionId("INST-003");
        v3.setVerificationMethod("OFFICIAL_BANK_LETTER");
        v3.setVerificationSource("Assistant General Manager, Canara Bank Yelahanka");
        v3.setReferenceNumber("CNRB/YEL/CONF/2020/118");
        v3.setVerificationDate("2020-11-05");
        v3.setResult("VERIFIED");
        v3.setVerifiedBy("sen.a@aicte-india.org");
        v3.setConfirmedAmount(2500000.0);
        v3.setConfirmedMaturityDate("2026-10-10");
        v3.setConfirmedLienStatus(true);
        v3.setRemarks("Initial 6-year deposit verified under joint lien. Now overdue as of October 2026.");
        v3.setCreatedAt("2020-11-08 14:00:00");
        verifications.put(v3.getId(), v3);

        // Observations:
        ScrutinyObservation o1 = new ScrutinyObservation();
        o1.setId("OBS-001");
        o1.setFdrId("FDR-2026-002");
        o1.setInstitutionId("INST-002");
        o1.setCategory("LIEN_ENDORSEMENT_MISSING");
        o1.setSeverity(ScrutinySeverity.CRITICAL);
        o1.setObservation("Joint lien in favour of AICTE Regional Officer Western Region missing on FDR leaf and bank CBS master.");
        o1.setFollowUpRequired(true);
        o1.setActionRequired("Institution must get bank endorsement letter on official letterhead signed by Branch Manager.");
        o1.setRecordedBy("sen.a@aicte-india.org");
        o1.setRecordedAt("2023-07-22 15:45:00");
        o1.setResolved(false);
        observations.put(o1.getId(), o1);

        ScrutinyObservation o2 = new ScrutinyObservation();
        o2.setId("OBS-002");
        o2.setFdrId("FDR-2026-003");
        o2.setInstitutionId("INST-003");
        o2.setCategory("EXPIRED_DOCUMENT");
        o2.setSeverity(ScrutinySeverity.HIGH);
        o2.setObservation("FDR maturity date (2026-10-10) has passed. Renewal certificate not submitted by institution.");
        o2.setFollowUpRequired(true);
        o2.setActionRequired("Send second show-cause reminder to Karnataka College of Pharmacy.");
        o2.setRecordedBy("sen.a@aicte-india.org");
        o2.setRecordedAt("2026-10-15 10:00:00");
        o2.setResolved(false);
        observations.put(o2.getId(), o2);

        ScrutinyObservation o3 = new ScrutinyObservation();
        o3.setId("OBS-003");
        o3.setFdrId("FDR-2023-011");
        o3.setInstitutionId("INST-010");
        o3.setCategory("EXPIRED_DOCUMENT");
        o3.setSeverity(ScrutinySeverity.HIGH);
        o3.setObservation("Bank guarantee BG/SBI/2023/112244 expiring in 25 days. No extension letter submitted yet.");
        o3.setFollowUpRequired(true);
        o3.setActionRequired("Issue formal invocation warning to State Bank of India Kakkanad branch if not renewed by 10-Nov-2026.");
        o3.setRecordedBy("sen.a@aicte-india.org");
        o3.setRecordedAt("2026-10-25 15:40:00");
        o3.setResolved(false);
        observations.put(o3.getId(), o3);
    }

    private void seedReleaseCases() {
        // Case 1: NASA Architecture (Awaiting Director Sanction)
        ReleaseRefundCase c1 = new ReleaseRefundCase();
        c1.setId("REL-2026-001");
        c1.setInstitutionId("INST-005");
        c1.setInstitutionName("National Apex School of Architecture");
        c1.setInstitutionAicteId("1-58291039");
        c1.setFdrId("FDR-2018-005");
        c1.setFdrNumber("HDFC/NOI/2018/776655");
        c1.setAmount(10000000.0);
        c1.setRequestReason("TENURE_COMPLETION_8_YEARS");
        c1.setRequestDate("2026-09-10");
        c1.setInstitutionLetterRef("NASA/REG/2026/102");
        c1.setCaseStatus(CaseStatus.AWAITING_APPROVAL);
        c1.setAssignedReviewer("Dr. Rajesh Sharma");

        c1.getComplianceChecklist().put("tenureCompleted", true);
        c1.getComplianceChecklist().put("noOutstandingLiabilities", true);
        c1.getComplianceChecklist().put("originalFdrSurrendered", true);
        c1.getComplianceChecklist().put("courtCaseClearance", true);
        c1.getComplianceChecklist().put("stateNocReceived", true);

        c1.setScrutinyRecommendation("RECOMMENDED_FOR_RELEASE");
        c1.setReviewerNotes("All 5 regulatory verification criteria satisfied. 8-year moratorium completed without adverse regulatory notice. Recommended for sanction of release by Competent Authority.");
        c1.setReviewedBy("sen.a@aicte-india.org");
        c1.setReviewedAt("2026-10-18 16:30:00");
        c1.setAuthorityDecision("PENDING");
        c1.setCreatedAt("2026-09-12 10:00:00");
        c1.setUpdatedAt("2026-10-18 16:30:00");
        releaseCases.put(c1.getId(), c1);

        // Case 2: Gujarat Applied Sciences (Completed & Discharged)
        ReleaseRefundCase c2 = new ReleaseRefundCase();
        c2.setId("REL-2026-002");
        c2.setInstitutionId("INST-006");
        c2.setInstitutionName("Gujarat Institute of Applied Sciences & Engineering");
        c2.setInstitutionAicteId("1-68291049");
        c2.setFdrId("FDR-2017-006");
        c2.setFdrNumber("UBIN/AHM/2017/123987");
        c2.setAmount(5000000.0);
        c2.setRequestReason("COURSE_CLOSURE");
        c2.setRequestDate("2026-01-15");
        c2.setInstitutionLetterRef("GIAS/CLOSURE/2026/01");
        c2.setCaseStatus(CaseStatus.COMPLETED);
        c2.setAssignedReviewer("Dr. Rajesh Sharma");

        c2.getComplianceChecklist().put("tenureCompleted", true);
        c2.getComplianceChecklist().put("noOutstandingLiabilities", true);
        c2.getComplianceChecklist().put("originalFdrSurrendered", true);
        c2.getComplianceChecklist().put("courtCaseClearance", true);
        c2.getComplianceChecklist().put("stateNocReceived", true);

        c2.setScrutinyRecommendation("RECOMMENDED_FOR_RELEASE");
        c2.setReviewerNotes("Full verification complete. Final student batch graduated with university diploma.");
        c2.setReviewedBy("sen.a@aicte-india.org");
        c2.setReviewedAt("2026-02-10 11:00:00");
        c2.setAuthorityDecision("APPROVED");
        c2.setDecisionDate("2026-04-12");
        c2.setSanctionOrderNumber("AICTE/REG/SAN/2026/019");
        c2.setAuthorityRemarks("Approved by Competent Authority in terms of Approval Process Handbook Chapter IV.");
        c2.setAuthorizedBy("sharma.r@aicte-india.org");
        c2.setReleaseCompletionDate("2026-05-10");
        c2.setDischargeCertificateNo("AICTE/DIS/2026/019");
        c2.setDispatchReference("Speed Post Dispatch Ref: SP-DL-2026-9901");
        c2.setCompletionRemarks("Discharge certificate delivered to Principal. Lien released in bank records.");
        c2.setCompletedBy("patel.v@aicte-india.org");
        c2.setCreatedAt("2026-01-20 10:00:00");
        c2.setUpdatedAt("2026-05-10 14:00:00");
        releaseCases.put(c2.getId(), c2);
    }

    private void seedNotifications() {
        notifications.add(new Notification(
                "NOTIF-001", "MATURITY", "Upcoming Maturity Alert: FDR-2026-001 (DITM Delhi)",
                "Deposit of ₹50.00 Lakhs reaches maturity on 2026-12-15 (approx 45 days remaining). Advance renewal notice protocol initiated.",
                "URGENT", "ROLE_REVIEWER", "sen.a@aicte-india.org", "FDR", "FDR-2026-001", false, "2026-10-15 09:00:00"
        ));

        notifications.add(new Notification(
                "NOTIF-002", "DISCREPANCY", "Critical Discrepancy: FDR-2026-002 (MIMS Pune)",
                "Lien endorsement missing in PNB Kothrud response. Case flagged for urgent regulatory follow-up under Section 10(k).",
                "URGENT", "ROLE_REVIEWER", "sen.a@aicte-india.org", "FDR", "FDR-2026-002", false, "2026-10-22 14:00:00"
        ));

        notifications.add(new Notification(
                "NOTIF-003", "RENEWAL", "Statutory Overdue Notice: FDR-2026-003 (Karnataka Pharmacy)",
                "Security deposit expired on 2026-10-10. Overdue by >20 days without renewal receipt from institution.",
                "URGENT", "ROLE_REVIEWER", "sen.a@aicte-india.org", "FDR", "FDR-2026-003", false, "2026-10-26 11:20:00"
        ));

        notifications.add(new Notification(
                "NOTIF-004", "APPROVAL", "Sanction Awaiting Approval: Case REL-2026-001 (NASA)",
                "Refund of ₹1.00 Crore scrutinized by Scrutiny Cell; pending Competent Authority Sanction Order from Dr. Rajesh Sharma.",
                "URGENT", "ROLE_APPROVER", "sharma.r@aicte-india.org", "RELEASE_CASE", "REL-2026-001", false, "2026-10-28 17:00:00"
        ));

        notifications.add(new Notification(
                "NOTIF-005", "VERIFICATION", "Fresh Deposit Submission: FDR-2026-009 (Kolkata Academy)",
                "New ₹35.00 Lakhs deposit leaf received by ERO desk. Verification request dispatched to Union Bank of India Salt Lake.",
                "INFO", "ROLE_REVIEWER", "sen.a@aicte-india.org", "FDR", "FDR-2026-009", false, "2026-10-24 16:30:00"
        ));
    }

    private void seedAuditTrail() {
        String genesisHash = "0000000000000000000000000000000000000000000000000000000000000000";

        AuditTrailEntry a1 = new AuditTrailEntry(
                "AUD-INIT-001", "CONFIG_UPDATE", "SYSTEM_CONFIG", "MASTER-CONFIG",
                "patel.v@aicte-india.org", "ROLE_ADMIN", "2026-01-01 09:00:00",
                "Master security configuration initialized with authorized scheduled commercial banks and reminder intervals.",
                null, "Advance Reminders: 30, 60, 90 days; Escalation threshold: 15 days"
        );
        a1.setPreviousHash(genesisHash);

        AuditTrailEntry a2 = new AuditTrailEntry(
                "AUD-INIT-002", "CREATE", "USER", "USR-001",
                "patel.v@aicte-india.org", "ROLE_ADMIN", "2026-01-01 09:30:00",
                "Provisioned internal administrative role for Dr. Rajesh Sharma (Advisor & Director, Regulation Bureau).",
                null, "ROLE_APPROVER"
        );
        a2.setPreviousHash(a1.getIntegrityHash());

        AuditTrailEntry a3 = new AuditTrailEntry(
                "AUD-INIT-003", "CREATE", "USER", "USR-002",
                "patel.v@aicte-india.org", "ROLE_ADMIN", "2026-01-01 10:00:00",
                "Provisioned reviewer role for Smt. Ananya Sen (Deputy Director, Case Scrutiny & FDR Cell).",
                null, "ROLE_REVIEWER"
        );
        a3.setPreviousHash(a2.getIntegrityHash());

        AuditTrailEntry a4 = new AuditTrailEntry(
                "AUD-INIT-004", "CREATE", "INSTITUTION", "INST-001",
                "sen.a@aicte-india.org", "ROLE_REVIEWER", "2026-01-05 10:15:00",
                "Imported approved technical institution baseline: Delhi Institute of Technology & Management (AICTE ID 1-10928472).",
                null, "Delhi Institute of Technology & Management"
        );
        a4.setPreviousHash(a3.getIntegrityHash());

        AuditTrailEntry a5 = new AuditTrailEntry(
                "AUD-INIT-005", "VERIFY", "FDR", "FDR-2026-001",
                "sen.a@aicte-india.org", "ROLE_REVIEWER", "2022-01-12 11:00:00",
                "Verified physical FDR SBI/ND/2021/883921 against official bank confirmation memo ref SBI/CP/CONF/2022/990.",
                "PENDING", "VERIFIED"
        );
        a5.setPreviousHash(a4.getIntegrityHash());

        AuditTrailEntry a6 = new AuditTrailEntry(
                "AUD-INIT-006", "STATUS_CHANGE", "FDR", "FDR-2026-002",
                "sen.a@aicte-india.org", "ROLE_REVIEWER", "2023-07-22 15:30:00",
                "Flagged critical discrepancy on FDR PNB/PUN/2023/102938: PNB Kothrud confirmed absence of AICTE joint lien endorsement.",
                "PENDING", "DISCREPANCY_FOUND"
        );
        a6.setPreviousHash(a5.getIntegrityHash());

        AuditTrailEntry a7 = new AuditTrailEntry(
                "AUD-INIT-007", "APPROVE", "RELEASE_CASE", "REL-2026-002",
                "sharma.r@aicte-india.org", "ROLE_APPROVER", "2026-04-12 15:00:00",
                "Competent Authority Sanction Order AICTE/REG/SAN/2026/019 executed for Gujarat Institute of Applied Sciences.",
                "AWAITING_APPROVAL", "APPROVED"
        );
        a7.setPreviousHash(a6.getIntegrityHash());

        AuditTrailEntry a8 = new AuditTrailEntry(
                "AUD-INIT-008", "RELEASE_RECORDED", "FDR", "FDR-2017-006",
                "patel.v@aicte-india.org", "ROLE_ADMIN", "2026-05-10 14:00:00",
                "Generated Discharge Certificate AICTE/DIS/2026/019 and dispatched original FDR via Speed Post SP-DL-2026-9901.",
                "APPROVED", "RELEASED"
        );
        a8.setPreviousHash(a7.getIntegrityHash());

        auditTrail.add(0, a8);
        auditTrail.add(1, a7);
        auditTrail.add(2, a6);
        auditTrail.add(3, a5);
        auditTrail.add(4, a4);
        auditTrail.add(5, a3);
        auditTrail.add(6, a2);
        auditTrail.add(7, a1);
    }
}
