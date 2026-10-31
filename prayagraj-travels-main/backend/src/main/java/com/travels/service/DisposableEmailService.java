package com.travels.service;

import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Detects disposable / throwaway email domains to prevent fake registrations.
 */
@Service
public class DisposableEmailService {

    private static final Set<String> DISPOSABLE_DOMAINS = Set.of(
            "mailinator.com",
            "guerrillamail.com",
            "10minutemail.com",
            "yopmail.com",
            "throwaway.email",
            "temp-mail.org",
            "fakeinbox.com",
            "sharklasers.com",
            "guerrillamailblock.com",
            "grr.la",
            "guerrillamail.info",
            "spam4.me",
            "trashmail.com",
            "trashmail.me",
            "trash-mail.com",
            "dispostable.com",
            "maildrop.cc",
            "mailnull.com",
            "spamgourmet.com",
            "spamgourmet.net",
            "binkmail.com",
            "bobmail.info",
            "chammy.info",
            "devnullmail.com",
            "discard.email",
            "dodgit.com",
            "dump-email.info",
            "extra.wingitwith.us",
            "filzmail.com",
            "get1mail.com",
            "getonemail.com",
            "hasup.com",
            "ieatspam.eu",
            "inoutmail.de",
            "jetable.fr.nf",
            "kasmail.com",
            "klzlk.com",
            "kurzepost.de",
            "letthemeatspam.com",
            "mail-temporaire.fr",
            "maileater.com",
            "nospam.ze.tc"
    );

    /**
     * Returns {@code true} when the email's domain appears in the known disposable list.
     *
     * @param email full email address (e.g. "user@mailinator.com")
     * @return {@code true} if disposable, {@code false} otherwise
     */
    public boolean isDisposable(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }
        String domain = email.substring(email.lastIndexOf('@') + 1).trim().toLowerCase();
        return DISPOSABLE_DOMAINS.contains(domain);
    }
}
