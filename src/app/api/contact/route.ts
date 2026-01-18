import { NextResponse } from "next/server";
import type { ContactRequest, ContactResponse } from "@/types/contact";
import { CONTACT_CATEGORIES } from "@/types/contact";

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bug Report",
  feature: "Feature Request",
  payment: "Payment",
  account: "Account",
  other: "Other",
};

export async function POST(request: Request): Promise<NextResponse<ContactResponse>> {
  try {
    const body = (await request.json()) as ContactRequest;
    const { category, email, message } = body;

    if (!category || !CONTACT_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("SLACK_WEBHOOK_URL is not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const slackPayload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `New Contact: ${CATEGORY_LABELS[category] || category}`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Category:*\n${CATEGORY_LABELS[category] || category}`,
            },
            {
              type: "mrkdwn",
              text: `*Email:*\n${email || "Not provided"}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n${message}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Submitted at ${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };

    const slackResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackPayload),
    });

    if (!slackResponse.ok) {
      console.error("Slack webhook failed:", await slackResponse.text());
      return NextResponse.json(
        { success: false, error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
