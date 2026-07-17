package br.com.painel.rm.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rm_analysts")
public class AnalystEntity {
    @Id
    private String id;
    private String externalId;
    private String name;
    private String email;
    private String role;
    private int allocationPercentage;

    protected AnalystEntity() {}

    public AnalystEntity(String id, String externalId, String name, String email, String role, int allocationPercentage) {
        this.id = id;
        this.externalId = externalId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.allocationPercentage = allocationPercentage;
    }

    public String getId() { return id; }
    public String getExternalId() { return externalId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public int getAllocationPercentage() { return allocationPercentage; }
}
