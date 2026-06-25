package com.ktrac.controller;

import com.ktrac.dto.UserCreateRequest;
import com.ktrac.dto.UserDto;
import com.ktrac.dto.UserUpdateRequest;
import com.ktrac.entity.User;
import com.ktrac.mapper.UserMapper;
import com.ktrac.security.JwtClaimExtractor;
import com.ktrac.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final JwtClaimExtractor jwtClaimExtractor;

    public UserController(UserService userService, UserMapper userMapper, JwtClaimExtractor jwtClaimExtractor) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.jwtClaimExtractor = jwtClaimExtractor;
    }

    @GetMapping("/me")
    public UserDto getMe() {
        String username = jwtClaimExtractor.getUsername();
        if (username == null) {
            throw new IllegalArgumentException("Could not extract username from token");
        }
        User user = userService.getUserByUsername(username);
        return userMapper.toDto(user);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserDto> getUsers(Pageable pageable) {
        // Simplified non-paged retrieval for now, mapped to Page
        List<User> users = userService.getAllUsers();
        List<UserDto> userDtos = users.stream().map(userMapper::toDto).collect(Collectors.toList());
        return new PageImpl<>(userDtos, pageable, userDtos.size());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@Valid @RequestBody UserCreateRequest request) {
        User user = userService.createUser(
                request.getUsername(),
                request.getEmail(),
                request.getFirstName(),
                request.getLastName(),
                request.getRoles(),
                request.getHomeLocationId()
        );
        return userMapper.toDto(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto updateUser(@PathVariable UUID id, @Valid @RequestBody UserUpdateRequest request) {
        User user = userService.updateUser(
                id,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getIsActive(),
                request.getRoles(),
                request.getHomeLocationId()
        );
        return userMapper.toDto(user);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
    }
}
