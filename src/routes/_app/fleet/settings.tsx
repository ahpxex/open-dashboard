import { BellIcon, GearSixIcon, PulseIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/fleet/settings")({
  component: FleetSettings,
});

interface Settings {
  autoAck: boolean;
  pollingInterval: "30s" | "1m" | "5m";
  pagerDuty: boolean;
  digest: "daily" | "weekly" | "never";
  retention: "30" | "90" | "365";
  maintenance: boolean;
}

const DEFAULTS: Settings = {
  autoAck: true,
  pollingInterval: "1m",
  pagerDuty: true,
  digest: "daily",
  retention: "90",
  maintenance: false,
};

function FleetSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState<Settings>(DEFAULTS);

  const dirty = (Object.keys(settings) as (keyof Settings)[]).some(
    (key) => settings[key] !== saved[key],
  );

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Fleet settings
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Monitoring, alerting, and data retention for the fleet. The save bar
          appears once something changes.
        </p>
      </div>

      <div className="flex max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PulseIcon size={18} />
              Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ToggleRow
              id="auto-ack"
              title="Auto-acknowledge info alerts"
              description="Clear informational alerts without manual review."
              checked={settings.autoAck}
              onChange={(value) => update("autoAck", value)}
            />
            <Separator />
            <SelectRow
              id="polling"
              title="Polling interval"
              description="How often devices report their status."
              value={settings.pollingInterval}
              onChange={(value) =>
                update("pollingInterval", value as Settings["pollingInterval"])
              }
              options={[
                { value: "30s", label: "Every 30s" },
                { value: "1m", label: "Every minute" },
                { value: "5m", label: "Every 5 min" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellIcon size={18} />
              Alerting
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ToggleRow
              id="pagerduty"
              title="Page on critical"
              description="Send critical alerts to the on-call rotation."
              checked={settings.pagerDuty}
              onChange={(value) => update("pagerDuty", value)}
            />
            <Separator />
            <SelectRow
              id="digest"
              title="Summary digest"
              description="Bundle non-urgent alerts on a schedule."
              value={settings.digest}
              onChange={(value) =>
                update("digest", value as Settings["digest"])
              }
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "never", label: "Never" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GearSixIcon size={18} />
              Data
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SelectRow
              id="retention"
              title="Telemetry retention"
              description="How long to keep raw device metrics."
              value={settings.retention}
              onChange={(value) =>
                update("retention", value as Settings["retention"])
              }
              options={[
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
                { value: "365", label: "1 year" },
              ]}
            />
            <Separator />
            <ToggleRow
              id="maintenance"
              title="Maintenance mode"
              description="Suppress alerts during scheduled maintenance."
              checked={settings.maintenance}
              onChange={(value) => update("maintenance", value)}
            />
          </CardContent>
        </Card>
      </div>

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-3">
            <p className="text-sm text-muted-foreground">
              You have unsaved changes.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSettings(saved)}>
                Discard
              </Button>
              <Button
                onClick={() => {
                  setSaved(settings);
                  toast.success("Fleet settings saved");
                }}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="flex flex-col gap-1">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SelectRow({
  id,
  title,
  description,
  value,
  onChange,
  options,
}: {
  id: string;
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="flex flex-col gap-1">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </Label>
      <Select value={value} onValueChange={(next) => next && onChange(next)}>
        <SelectTrigger id={id} className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
