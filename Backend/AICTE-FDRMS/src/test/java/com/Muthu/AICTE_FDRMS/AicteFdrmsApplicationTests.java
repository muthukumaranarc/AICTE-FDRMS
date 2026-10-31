package com.Muthu.AICTE_FDRMS;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

@SpringBootTest
class AicteFdrmsApplicationTests {

    @Autowired
    private Environment environment;

    @Test
    void inspectMongoConfig() {
        String uri = environment.getProperty("MONGODB_URL");
        System.out.println("Testing URI: " + uri);
        
        String[] variations = new String[] {
            uri,
            "mongodb+srv://muthukumaranarc00:motn34Muthu@tunez.gp6t4e7.mongodb.net/aicte_fdrms?retryWrites=true&w=majority",
            "mongodb+srv://muthukumaranarc00:motn34Muthu@tunez.gp6t4e7.mongodb.net/admin?authSource=admin&retryWrites=true&w=majority",
            "mongodb+srv://muthukumaranarc00:motn34Muthu@tunez.gp6t4e7.mongodb.net/?authSource=admin&authMechanism=SCRAM-SHA-256"
        };

        for (String testUri : variations) {
            try {
                System.out.println("--> Attempting connection with: " + testUri);
                try (MongoClient client = MongoClients.create(testUri)) {
                    for (String name : client.listDatabaseNames()) {
                        System.out.println("    Found DB: " + name);
                    }
                    System.out.println("    SUCCESS!");
                    return;
                }
            } catch (Exception e) {
                System.out.println("    Failed: " + e.getMessage());
            }
        }
    }
}

