package com.dinidu.pms.controller;

import com.dinidu.pms.entity.*;
import com.dinidu.pms.service.ProjectService;
import com.dinidu.pms.service.TaskService;
import com.dinidu.pms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class WebController {

    private final TaskService taskService;
    private final ProjectService projectService;
    private final UserService userService;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/")
    public String home() {
        return "redirect:/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("todoCount", taskService.getTaskCountByStatus(Task.Status.TODO));
        model.addAttribute("inProgressCount", taskService.getTaskCountByStatus(Task.Status.IN_PROGRESS));
        model.addAttribute("reviewCount", taskService.getTaskCountByStatus(Task.Status.REVIEW));
        model.addAttribute("doneCount", taskService.getTaskCountByStatus(Task.Status.DONE));

        List<Task> recentTasks = taskService.getAllTasks().stream()
                .limit(5)
                .toList();
        model.addAttribute("recentTasks", recentTasks);

        return "dashboard";
    }

    @GetMapping("/tasks")
    public String tasks(Model model) {
        List<Task> tasks = taskService.getAllTasks();
        List<Project> projects = projectService.getAllProjects();

        model.addAttribute("tasks", tasks);
        model.addAttribute("projects", projects);
        model.addAttribute("taskStatuses", Task.Status.values());
        model.addAttribute("taskPriorities", Task.Priority.values());

        return "tasks";
    }

    @GetMapping("/projects")
    public String projects(Model model) {
        List<Project> projects = projectService.getAllProjects();
        model.addAttribute("projects", projects);
        model.addAttribute("projectStatuses", Project.Status.values());

        return "projects";
    }
}