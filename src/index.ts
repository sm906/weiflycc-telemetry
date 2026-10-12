export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // GET /api/telemetry
    if (
      request.method === "GET" &&
      url.pathname === "/api/telemetry"
    ) {

      const { results } =
        await env.DB.prepare(`
          SELECT *
          FROM telemetry_logs
          ORDER BY id DESC
          LIMIT 100
        `).all();

      return Response.json(results);
    }

    // POST /api/telemetry
    if (
      request.method === "POST" &&
      url.pathname === "/api/telemetry"
    ) {

      const data =
        await request.json();

      await env.DB.prepare(`
        INSERT INTO telemetry_logs (
          timestamp,
          service,
          category,
          event,
          level,
          message,
          metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        new Date().toISOString(),
        data.service,
        data.category,
        data.event,
        data.level || "info",
        data.message || "",
        JSON.stringify(data.metadata || {})
      )
      .run();

      return Response.json({
        success: true
      });
    }

    return Response.json(
      {
        error: "Not Found"
      },
      {
        status: 404
      }
    );
  }
} satisfies ExportedHandler<Env>;
`
