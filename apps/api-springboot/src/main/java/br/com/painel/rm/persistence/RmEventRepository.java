package br.com.painel.rm.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RmEventRepository extends JpaRepository<RmEventEntity, String> {
    List<RmEventEntity> findTop50ByOrderByOccurredAtDesc();
}
