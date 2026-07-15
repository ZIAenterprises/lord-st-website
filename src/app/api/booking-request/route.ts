// src/app/api/booking-request/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";

type BookingRequestBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  guestCount?: string;
  checkIn?: string;
  checkout?: string;
  visitReason?: string;
  returningGuest?: string;
  previousPlatform?: string;
  previousReservationName?: string;
  message?: string;
  website?: string;
};

type UnavailableRange = {
  start: string;
  end: string;
};

type AvailabilityResponse = {
  success?: boolean;
  unavailableRanges?: UnavailableRange[];
  partial?: boolean;
  error?: string;
};

function cleanValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function datesOverlap(
  requestedCheckIn: string,
  requestedCheckout: string,
  range: UnavailableRange,
) {
  return (
    requestedCheckIn < range.end &&
    requestedCheckout > range.start
  );
}

async function verifyAvailability(
  request: Request,
  checkIn: string,
  checkout: string,
) {
  const availabilityUrl = new URL(
    "/api/availability",
    request.url,
  );

  const response = await fetch(availabilityUrl, {
    method: "GET",
    cache: "no-store",
  });

  const result =
    (await response.json()) as AvailabilityResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        "Availability could not be verified.",
    );
  }

  const conflict = (
    result.unavailableRanges ?? []
  ).find((range) =>
    datesOverlap(checkIn, checkout, range),
  );

  return {
    available: !conflict,
    partial: Boolean(result.partial),
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const bookingEmail = process.env.BOOKING_EMAIL;

    if (!apiKey || !bookingEmail) {
      console.error(
        "Missing RESEND_API_KEY or BOOKING_EMAIL.",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The booking email service is not configured.",
        },
        { status: 500 },
      );
    }

    const body =
      (await request.json()) as BookingRequestBody;

    const fullName = cleanValue(body.fullName);
    const email = cleanValue(body.email);
    const phone = cleanValue(body.phone);
    const guestCount = cleanValue(body.guestCount);
    const checkIn = cleanValue(body.checkIn);
    const checkout = cleanValue(body.checkout);
    const visitReason = cleanValue(body.visitReason);
    const returningGuest = cleanValue(
      body.returningGuest,
    );
    const previousPlatform = cleanValue(
      body.previousPlatform,
    );
    const previousReservationName = cleanValue(
      body.previousReservationName,
    );
    const message = cleanValue(body.message);
    const website = cleanValue(body.website);

    // Hidden spam-trap field.
    if (website) {
      return NextResponse.json({ success: true });
    }

    if (
      !fullName ||
      !email ||
      !phone ||
      !guestCount ||
      !checkIn ||
      !checkout ||
      !returningGuest
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please complete every required field.",
        },
        { status: 400 },
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    const checkInDate = new Date(
      `${checkIn}T12:00:00`,
    );
    const checkoutDate = new Date(
      `${checkout}T12:00:00`,
    );

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkoutDate.getTime()) ||
      checkoutDate <= checkInDate
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Checkout must be after check-in.",
        },
        { status: 400 },
      );
    }

    let availability: {
      available: boolean;
      partial: boolean;
    };

    try {
      availability = await verifyAvailability(
        request,
        checkIn,
        checkout,
      );
    } catch (error) {
      console.error(
        "Unable to verify booking availability:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Availability could not be verified. Please try again shortly.",
        },
        { status: 503 },
      );
    }

    if (!availability.available) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Those dates overlap an existing reservation. Please select different dates.",
        },
        { status: 409 },
      );
    }

    const resend = new Resend(apiKey);

    const availabilityNote = availability.partial
      ? "One booking calendar could not be checked. Manually verify these dates before approving."
      : "Both Airbnb and Vrbo calendars were checked before this request was sent.";

    const { data, error } = await resend.emails.send({
      from: "Lord St. Booking Requests <onboarding@resend.dev>",
      to: [bookingEmail],
      replyTo: email,
      subject: `Lord St. booking request from ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #292723;">
          <div style="background: #6f2932; padding: 28px; color: white;">
            <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">
              Lord St.
            </p>

            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 30px; font-weight: normal;">
              New direct booking request
            </h1>
          </div>

          <div style="padding: 30px; background: #fffdf9; border: 1px solid #ded5c8;">
            <div style="margin-bottom: 28px; padding: 16px; background: #edf2e9; border-left: 4px solid #65745d;">
              <strong>Availability check:</strong>
              ${escapeHtml(availabilityNote)}
            </div>

            <h2 style="font-family: Georgia, serif; font-weight: normal;">
              Guest information
            </h2>

            <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Number of guests:</strong> ${escapeHtml(guestCount)}</p>

            <hr style="margin: 28px 0; border: 0; border-top: 1px solid #ded5c8;" />

            <h2 style="font-family: Georgia, serif; font-weight: normal;">
              Stay details
            </h2>

            <p><strong>Check-in:</strong> ${escapeHtml(checkIn)}</p>
            <p><strong>Checkout:</strong> ${escapeHtml(checkout)}</p>

            <p>
              <strong>Reason for visit:</strong>
              ${escapeHtml(visitReason || "Not provided")}
            </p>

            <hr style="margin: 28px 0; border: 0; border-top: 1px solid #ded5c8;" />

            <h2 style="font-family: Georgia, serif; font-weight: normal;">
              Previous stay
            </h2>

            <p>
              <strong>Returning or referred guest:</strong>
              ${escapeHtml(returningGuest)}
            </p>

            <p>
              <strong>Previous platform:</strong>
              ${escapeHtml(previousPlatform || "Not provided")}
            </p>

            <p>
              <strong>Reservation or referral name:</strong>
              ${escapeHtml(previousReservationName || "Not provided")}
            </p>

            <hr style="margin: 28px 0; border: 0; border-top: 1px solid #ded5c8;" />

            <h2 style="font-family: Georgia, serif; font-weight: normal;">
              Message
            </h2>

            <p style="white-space: pre-wrap; line-height: 1.6;">
              ${escapeHtml(message || "No additional message provided.")}
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return NextResponse.json(
        {
          success: false,
          error:
            error.message ||
            "The email could not be delivered.",
        },
        { status: 500 },
      );
    }

    console.log(
      "Booking request email sent:",
      data?.id,
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Booking request route error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while sending the booking request.",
      },
      { status: 500 },
    );
  }
}