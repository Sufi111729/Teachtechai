package com.sufi.approvalhub.seed;

import com.sufi.approvalhub.domain.entity.User;
import com.sufi.approvalhub.domain.enums.Role;
import com.sufi.approvalhub.domain.enums.Status;
import com.sufi.approvalhub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "admin@local.com";
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User();
        admin.setName("System Admin");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode("Admin@12345"));
        admin.setRole(Role.ADMIN);
        admin.setStatus(Status.APPROVED);
        userRepository.save(admin);
        log.info("Default admin created with email {}", adminEmail);
    }
}
