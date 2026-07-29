import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";

const HUB_URL = "https://localhost:7143/hubs/taskflow"; // Ideally from env config

export function useSignalR() {
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log("Connected to TaskFlow SignalR Hub");

          connection.on("IssueCreated", (issueId: string) => {
            console.log("SignalR: IssueCreated", issueId);
            queryClient.invalidateQueries({ queryKey: ["issues"] });
          });

          connection.on("IssueUpdated", (issueId: string) => {
            console.log("SignalR: IssueUpdated", issueId);
            queryClient.invalidateQueries({ queryKey: ["issues"] });
            queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
          });

          connection.on("IssueDeleted", (issueId: string) => {
            console.log("SignalR: IssueDeleted", issueId);
            queryClient.invalidateQueries({ queryKey: ["issues"] });
          });
        })
        .catch(e => console.error("SignalR Connection Error: ", e));
    }
  }, [connection, queryClient]);

  return connection;
}
