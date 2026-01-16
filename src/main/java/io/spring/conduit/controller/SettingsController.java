package io.spring.conduit.controller;

import io.spring.conduit.domain.User;
import io.spring.conduit.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/settings")
public class SettingsController {

    private final UserService userService;

    public SettingsController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public String settingsPage(@AuthenticationPrincipal User currentUser, Model model) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        model.addAttribute("currentUser", currentUser);
        return "settings";
    }

    @PostMapping
    public String updateSettings(@RequestParam(required = false) String image,
                                @RequestParam(required = false) String username,
                                @RequestParam(required = false) String bio,
                                @RequestParam(required = false) String email,
                                @RequestParam(required = false) String password,
                                @AuthenticationPrincipal User currentUser,
                                RedirectAttributes redirectAttributes) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        try {
            User updatedUser = userService.update(currentUser, email, username, password, bio, image);
            return "redirect:/profile/" + updatedUser.getUsername();
        } catch (IllegalArgumentException e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("settings", e.getMessage());
            redirectAttributes.addFlashAttribute("errors", errors);
            return "redirect:/settings";
        }
    }
}
