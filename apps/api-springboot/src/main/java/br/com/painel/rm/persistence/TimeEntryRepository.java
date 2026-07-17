package br.com.painel.rm.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimeEntryRepository extends JpaRepository<TimeEntryEntity, String> {
    List<TimeEntryEntity> findByProjectIdOrderByWorkDateDesc(String projectId);
}
