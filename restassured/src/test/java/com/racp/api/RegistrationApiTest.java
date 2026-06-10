package com.racp.api;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;

import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class RegistrationApiTest {

    private static final String BASE_PATH = "/api/registrations";
    private static String postedEmail;

    @BeforeAll
    static void setup() {
        RestAssured.baseURI = "http://localhost:3001";
        postedEmail = "testuser." + System.currentTimeMillis() + "@example.com";
    }

    // -------------------------------------------------------------------------
    // POST tests
    // -------------------------------------------------------------------------

    @Test
    @org.junit.jupiter.api.Order(1)
    void postValidRegistration_returns201WithRecord() {
        Map<String, String> body = new HashMap<>();
        body.put("firstName", "Test");
        body.put("lastName", "User");
        body.put("email", postedEmail);
        body.put("password", "Secret123");
        body.put("phone", "555-0199");
        body.put("dateOfBirth", "1985-03-20");

        given()
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post(BASE_PATH)
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("email", equalTo(postedEmail))
            .body("firstName", equalTo("Test"))
            .body("lastName", equalTo("User"))
            .body("createdAt", notNullValue());
    }

    @Test
    @org.junit.jupiter.api.Order(2)
    void postDuplicateEmail_returns400() {
        Map<String, String> body = new HashMap<>();
        body.put("firstName", "Dupe");
        body.put("lastName", "User");
        body.put("email", postedEmail);
        body.put("password", "AnotherPass1");

        given()
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post(BASE_PATH)
        .then()
            .statusCode(400)
            .body("error", containsString("already exists"));
    }

    @Test
    void postMissingEmail_returns400() {
        Map<String, String> body = new HashMap<>();
        body.put("firstName", "No");
        body.put("lastName", "Email");
        body.put("password", "password123");

        given()
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post(BASE_PATH)
        .then()
            .statusCode(400)
            .body("error", notNullValue());
    }

    @Test
    void postMissingRequiredFields_returns400() {
        given()
            .contentType(ContentType.JSON)
            .body("{}")
        .when()
            .post(BASE_PATH)
        .then()
            .statusCode(400)
            .body("error", notNullValue());
    }

    @Test
    void postInvalidEmailFormat_returns400() {
        Map<String, String> body = new HashMap<>();
        body.put("firstName", "Bad");
        body.put("lastName", "Email");
        body.put("email", "not-an-email");
        body.put("password", "password123");

        given()
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post(BASE_PATH)
        .then()
            .statusCode(400)
            .body("error", containsString("email"));
    }

    @Test
    void postShortPassword_returns400() {
        Map<String, String> body = new HashMap<>();
        body.put("firstName", "Short");
        body.put("lastName", "Pass");
        body.put("email", "shortpass@example.com");
        body.put("password", "abc");

        given()
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post(BASE_PATH)
        .then()
            .statusCode(400)
            .body("error", containsString("6 characters"));
    }

    // -------------------------------------------------------------------------
    // GET tests
    // -------------------------------------------------------------------------

    @Test
    @org.junit.jupiter.api.Order(3)
    void getAllRegistrations_returns200AndArray() {
        given()
        .when()
            .get(BASE_PATH)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("$", instanceOf(java.util.List.class));
    }

    @Test
    @org.junit.jupiter.api.Order(4)
    void getAllRegistrations_containsPostedRecord() {
        given()
        .when()
            .get(BASE_PATH)
        .then()
            .statusCode(200)
            .body("email", hasItem(postedEmail));
    }
}
