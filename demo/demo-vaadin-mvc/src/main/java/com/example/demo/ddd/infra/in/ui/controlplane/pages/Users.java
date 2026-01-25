package com.example.demo.ddd.infra.in.ui.controlplane.pages;

import com.example.demo.ddd.infra.in.ui.callcenter.pages.BookingCreationWizard;
import com.example.demo.ddd.infra.out.persistence.hotel.users.User;
import com.example.demo.ddd.infra.out.persistence.hotel.users.UserRepository;
import io.mateu.core.infra.declarative.GenericCrud;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.interfaces.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Users extends GenericCrud<User> {

    final UserRepository userRepository;


    @Override
    public Repository<User, String> repository() {
        return userRepository;
    }

}
