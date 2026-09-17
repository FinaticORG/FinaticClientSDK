import {
  FinaticConnect,
  isPortalLifecycleEventPayload,
  type PortalEventCallback,
  type PortalLifecycleEventPayload,
} from "../../src";

declare const finatic: FinaticConnect;

void finatic.openPortal({
  onEvent: (eventName, payload) => {
    if (eventName === "partner.custom-event") {
      void payload;
    }
  },
});

const broadLegacyHandler = (eventName: string, payload?: unknown): void => {
  void eventName;
  void payload;
};
const compatibleHandler: PortalEventCallback = broadLegacyHandler;
compatibleHandler("partner.custom-event", { partnerId: "partner-1" });

const lifecycleHandler: PortalEventCallback = (eventName, payload) => {
  if (eventName !== "portal.lifecycle" || !isPortalLifecycleEventPayload(payload)) {
    return;
  }

  switch (payload.stage) {
    case "portal_authenticated":
      void payload.userId;
      break;
    case "broker_connection_created":
      void payload.connectionId;
      break;
    case "push_agent_state_changed":
      void payload.state;
      break;
    default: {
      const exhaustive: never = payload;
      void exhaustive;
    }
  }
};

const lifecyclePayload: PortalLifecycleEventPayload = {
  schemaVersion: 1,
  stage: "push_agent_state_changed",
  brokerId: "mt5",
  connectionId: "connection-1",
  state: "LIVE_DATA",
  dataReady: true,
};
lifecycleHandler("portal.lifecycle", lifecyclePayload);
