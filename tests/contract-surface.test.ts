/**
 * Contract tests for stable hand-authored sources only (no full barrel import).
 */
import * as fs from "fs";
import * as path from "path";
import type {
  PortalConnectorState,
  PortalEventCallback,
  PortalLifecycleEventPayload,
} from "../src/portal/PortalUI";
import { isPortalLifecycleEventPayload } from "../src/portal/PortalUI";

const connectorStates = [
  "REGISTERING",
  "AWAITING_FIRST_HEARTBEAT",
  "ONLINE_NO_DATA",
  "LIVE_DATA",
  "STALE_ONLINE_NO_DATA",
  "STALE_LIVE_DATA",
  "COOLDOWN",
  "REVOKED",
  "UNKNOWN",
] as const satisfies readonly PortalConnectorState[];

describe("Client SDK contract surface", () => {
  it("preserves FinaticConnect subclass marker in source", () => {
    const filePath = path.join(__dirname, "../src/FinaticConnect.ts");
    const src = fs.readFileSync(filePath, "utf8");
    expect(src).toContain("__CUSTOM_CLASS__");
  });

  it("exposes a correlated and exhaustively narrowable lifecycle callback", () => {
    const seenStages: string[] = [];
    const callback: PortalEventCallback = (eventName, payload) => {
      if (
        eventName !== "portal.lifecycle" ||
        !isPortalLifecycleEventPayload(payload)
      ) {
        return;
      }

      switch (payload.stage) {
        case "portal_authenticated":
          seenStages.push(payload.userId);
          break;
        case "broker_connection_created":
          seenStages.push(payload.connectionId);
          break;
        case "push_agent_state_changed":
          seenStages.push(`${payload.state}:${payload.dataReady ?? "unknown"}`);
          break;
        default: {
          const exhaustive: never = payload;
          return exhaustive;
        }
      }
    };

    const payload: PortalLifecycleEventPayload = {
      schemaVersion: 1,
      stage: "push_agent_state_changed",
      brokerId: "mt5",
      connectionId: "connection-1",
      state: "LIVE_DATA",
      dataReady: true,
    };
    callback("portal.lifecycle", payload);

    expect(connectorStates).toHaveLength(9);
    expect(seenStages).toEqual(["LIVE_DATA:true"]);
  });

  it("keeps broad legacy event handlers assignable", () => {
    const legacyHandler = jest.fn((eventName: string, payload?: unknown) => ({
      eventName,
      payload,
    }));
    const compatibleHandler: PortalEventCallback = legacyHandler;

    compatibleHandler("account.grant.created", { grantId: "grant-1" });

    expect(legacyHandler).toHaveBeenCalledWith("account.grant.created", {
      grantId: "grant-1",
    });
  });

  it("keeps arbitrary forwarded event names callable", () => {
    const callback: PortalEventCallback = (eventName, payload) => ({
      eventName,
      payload,
    });

    expect(() => callback("partner.custom-event", { partnerId: "partner-1" })).not.toThrow();
  });
});
