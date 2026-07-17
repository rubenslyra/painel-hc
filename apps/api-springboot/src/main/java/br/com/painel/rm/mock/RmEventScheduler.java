package br.com.painel.rm.mock;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RmEventScheduler {
    private final RmEventGenerator generator;

    public RmEventScheduler(RmEventGenerator generator) {
        this.generator = generator;
    }

    @Scheduled(fixedDelayString = "${rm.webhook.interval-5-ms:300000}", initialDelayString = "${rm.webhook.initial-delay-ms:30000}")
    public void everyFiveMinutes() { generator.generate("Scheduler-5m"); }

    @Scheduled(fixedDelayString = "${rm.webhook.interval-17-ms:1020000}", initialDelayString = "${rm.webhook.initial-delay-ms:30000}")
    public void everySeventeenMinutes() { generator.generate("Scheduler-17m"); }

    @Scheduled(fixedDelayString = "${rm.webhook.interval-3-ms:180000}", initialDelayString = "${rm.webhook.initial-delay-ms:30000}")
    public void everyThreeMinutes() { generator.generate("Scheduler-3m"); }

    @Scheduled(fixedDelayString = "${rm.webhook.interval-40-ms:2400000}", initialDelayString = "${rm.webhook.initial-delay-ms:30000}")
    public void everyFortyMinutes() { generator.generate("Scheduler-40m"); }

    @Scheduled(fixedDelayString = "${rm.webhook.interval-86-ms:5160000}", initialDelayString = "${rm.webhook.initial-delay-ms:30000}")
    public void everyEightySixMinutes() { generator.generate("Scheduler-86m"); }
}
