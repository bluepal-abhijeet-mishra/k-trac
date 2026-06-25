package com.ktrac.service;

import com.ktrac.entity.Role;
import com.ktrac.entity.User;
import com.ktrac.repository.RoleRepository;
import com.ktrac.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final KeycloakAdminClientService keycloakAdminClientService;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, KeycloakAdminClientService keycloakAdminClientService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.keycloakAdminClientService = keycloakAdminClientService;
    }

    @Transactional
    public User createUser(String username, String email, String firstName, String lastName, Set<String> roleNames, Long homeLocationId) {
        Set<Role> roles = new HashSet<>();
        if (roleNames != null) {
            for (String roleName : roleNames) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
                roles.add(role);
            }
        }

        UUID userId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setActive(true);
        user.setRoles(roles);
        user.setHomeLocationId(homeLocationId);

        // Constraint: Write the User row to PostgreSQL first inside a Spring @Transactional method.
        userRepository.saveAndFlush(user);

        // Then, invoke the Keycloak API to create the authentication account.
        // If Keycloak fails, exception is thrown and Spring rolls back PostgreSQL insert.
        keycloakAdminClientService.createUser(username, email, firstName, lastName, roleNames);

        return user;
    }

    @Transactional
    public User updateUser(UUID id, String firstName, String lastName, String email, Boolean isActive, Set<String> roleNames, Long homeLocationId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (email != null) user.setEmail(email);
        if (isActive != null) user.setActive(isActive);
        if (homeLocationId != null) user.setHomeLocationId(homeLocationId);

        if (roleNames != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : roleNames) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        userRepository.saveAndFlush(user);

        Set<String> rolesToUpdate = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        keycloakAdminClientService.updateUserByUsername(user.getUsername(), user.getFirstName(), user.getLastName(), user.getEmail(), user.isActive(), rolesToUpdate);

        return user;
    }

    @Transactional
    public void deactivateUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setActive(false);
        userRepository.saveAndFlush(user);

        keycloakAdminClientService.disableUserByUsername(user.getUsername());
    }

    public User getUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
