package com.scholarship.scholarshipportal.service;

import java.util.Collections;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

        private final UserRepository userRepository;

        public CustomUserDetailsService(UserRepository userRepository) {
                this.userRepository = userRepository;
        }

        @Override
        public UserDetails loadUserByUsername(String username)
                        throws UsernameNotFoundException {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                String role = user.getRole();
                if (role != null && !role.toUpperCase().startsWith("ROLE_")) {
                        role = "ROLE_" + role.toUpperCase();
                } else if (role != null) {
                        role = role.toUpperCase();
                }

                return new org.springframework.security.core.userdetails.User(
                                user.getUsername(),
                                user.getPassword(),
                                Collections.singletonList(
                                                new SimpleGrantedAuthority(role)));
        }
}