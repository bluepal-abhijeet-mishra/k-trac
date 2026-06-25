package com.ktrac.dto;

import jakarta.validation.constraints.Email;
import java.util.Set;

public class UserUpdateRequest {
    private String firstName;
    private String lastName;

    @Email(message = "Invalid email format")
    private String email;

    private Boolean isActive;
    private Set<String> roles;
    private Long homeLocationId;

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public Long getHomeLocationId() { return homeLocationId; }
    public void setHomeLocationId(Long homeLocationId) { this.homeLocationId = homeLocationId; }
}
