package com.ktrac.service;

import com.ktrac.exception.KeycloakIntegrationException;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
public class KeycloakAdminClientService {

    private final Keycloak keycloak;

    @Value("${keycloak.realm:ktrac}")
    private String realm;

    public KeycloakAdminClientService(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    public String createUser(String username, String email, String firstName, String lastName, Set<String> roles) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);
        user.setEmailVerified(true);

        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();

        try (Response response = usersResource.create(user)) {
            if (response.getStatus() != 201) {
                throw new KeycloakIntegrationException("Failed to create user in Keycloak. Status: " + response.getStatus());
            }

            String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

            // Assign Roles
            if (roles != null && !roles.isEmpty()) {
                UserResource userResource = usersResource.get(userId);
                List<RoleRepresentation> realmRoles = roles.stream()
                        .map(roleName -> {
                            try {
                                return realmResource.roles().get(roleName).toRepresentation();
                            } catch (Exception e) {
                                throw new KeycloakIntegrationException("Role " + roleName + " not found in Keycloak", e);
                            }
                        })
                        .toList();

                userResource.roles().realmLevel().add(realmRoles);
            }

            return userId;
        } catch (Exception e) {
            if (e instanceof KeycloakIntegrationException) {
                throw e;
            }
            throw new KeycloakIntegrationException("Error communicating with Keycloak", e);
        }
    }

    public void updateUserByUsername(String username, String firstName, String lastName, String email, boolean isActive, Set<String> roles) {
        RealmResource realmResource = keycloak.realm(realm);
        List<UserRepresentation> users = realmResource.users().searchByUsername(username, true);
        if (users.isEmpty()) {
            throw new KeycloakIntegrationException("User not found in Keycloak: " + username);
        }

        String keycloakId = users.get(0).getId();
        UserResource userResource = realmResource.users().get(keycloakId);

        try {
            UserRepresentation user = userResource.toRepresentation();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setEnabled(isActive);
            userResource.update(user);

            if (roles != null) {
                // Remove all existing roles
                List<RoleRepresentation> existingRoles = userResource.roles().realmLevel().listAll();
                if (!existingRoles.isEmpty()) {
                    userResource.roles().realmLevel().remove(existingRoles);
                }

                // Add new roles
                if (!roles.isEmpty()) {
                    List<RoleRepresentation> realmRoles = roles.stream()
                            .map(roleName -> realmResource.roles().get(roleName).toRepresentation())
                            .toList();
                    userResource.roles().realmLevel().add(realmRoles);
                }
            }
        } catch (Exception e) {
            throw new KeycloakIntegrationException("Error updating user in Keycloak", e);
        }
    }

    public void disableUserByUsername(String username) {
        RealmResource realmResource = keycloak.realm(realm);
        List<UserRepresentation> users = realmResource.users().searchByUsername(username, true);
        if (users.isEmpty()) {
            throw new KeycloakIntegrationException("User not found in Keycloak: " + username);
        }

        String keycloakId = users.get(0).getId();
        UserResource userResource = realmResource.users().get(keycloakId);

        try {
            UserRepresentation user = userResource.toRepresentation();
            user.setEnabled(false);
            userResource.update(user);
        } catch (Exception e) {
            throw new KeycloakIntegrationException("Error disabling user in Keycloak", e);
        }
    }
}
