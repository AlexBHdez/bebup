export default async function handler(req: any, res: any) {
  return res.status(200).json({
    ok: true,
    service: "push-api",
    revision: "2026-02-22-push-debug-1",
    method: req.method,
  });
}
