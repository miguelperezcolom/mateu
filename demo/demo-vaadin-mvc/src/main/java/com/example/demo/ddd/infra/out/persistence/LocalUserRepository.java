package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.booking.File;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.FileRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.users.User;
import com.example.demo.ddd.infra.out.persistence.hotel.users.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalUserRepository extends LocalRepository<User, String> implements UserRepository {
}
