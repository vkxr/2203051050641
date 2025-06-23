export async function Log(
  stack: "backend" | "frontend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  pkg:
    | "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service" 
    | "api" | "component" | "hook" | "page" | "state" | "style" 
    | "auth" | "config" | "middleware" | "utils", 
  message: string,
  token: string
): Promise<void> {
  const url = "http://20.244.56.144/evaluation-service/logs";

  const body = {
    stack,
    level,
    package: pkg,
    message
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {

        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error("Failed to log:", response.statusText);
    } else {
      const data = await response.json();
      console.log("Log response:", data);
    }
  } catch (error) {
    console.error("Logging middleware error:", error);
  }
}
