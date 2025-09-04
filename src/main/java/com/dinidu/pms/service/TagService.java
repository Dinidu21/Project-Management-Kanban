package com.dinidu.pms.service;


import com.dinidu.pms.entity.Tag;
import com.dinidu.pms.repo.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    private static final String[] COLORS = {
            "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
            "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
    };

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public Tag findOrCreateTag(String name) {
        return tagRepository.findByName(name)
                .orElseGet(() -> {
                    Tag tag = Tag.builder()
                            .name(name)
                            .color(getRandomColor())
                            .build();
                    return tagRepository.save(tag);
                });
    }

    private String getRandomColor() {
        Random random = new Random();
        return COLORS[random.nextInt(COLORS.length)];
    }
}
