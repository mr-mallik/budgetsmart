import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f9d73",
          color: "white",
          fontSize: 108,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        B
      </div>
    ),
    { width: 192, height: 192 }
  );
}
