type SendMiniAppNotificationResult =
  | {
      state: "error";
      error: unknown;
    }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

export async function sendMiniAppNotification({
  fid: _fid,
  title: _title,
  body: _body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<SendMiniAppNotificationResult> {
  // Notifications disabled - app is in coming soon mode
  return { state: "no_token" };
}
