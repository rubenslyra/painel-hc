package br.com.painel.rm.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "rm_events")
public class RmEventEntity {
    @Id
    private String id;
    private String type;
    private String projectId;
    private OffsetDateTime occurredAt;
    @Column(length = 4000)
    private String payload;
    private boolean delivered;
    private OffsetDateTime deliveredAt;

    protected RmEventEntity() {}

    public RmEventEntity(String id, String type, String projectId, OffsetDateTime occurredAt, String payload) {
        this.id = id;
        this.type = type;
        this.projectId = projectId;
        this.occurredAt = occurredAt;
        this.payload = payload;
    }

    public String getId() { return id; }
    public String getType() { return type; }
    public String getProjectId() { return projectId; }
    public OffsetDateTime getOccurredAt() { return occurredAt; }
    public String getPayload() { return payload; }
    public boolean isDelivered() { return delivered; }
    public OffsetDateTime getDeliveredAt() { return deliveredAt; }

    public void markDelivered() {
        this.delivered = true;
        this.deliveredAt = OffsetDateTime.now();
    }
}
