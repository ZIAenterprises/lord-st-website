// src/app/api/availability/route.ts

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CalendarSource = "Airbnb" | "Vrbo";

type UnavailableRange = {
  start: string;
  end: string;
  source: CalendarSource;
};

type PublicUnavailableRange = {
  start: string;
  end: string;
};

/**
 * iCalendar files can wrap long lines by placing a space or tab
 * at the beginning of the next line. This joins those lines.
 */
function unfoldCalendarLines(calendarText: string): string[] {
  return calendarText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n");
}

/**
 * Converts common ICS date values into YYYY-MM-DD.
 *
 * Examples:
 * 20260720
 * 20260720T150000Z
 */
function parseIcalDate(value: string): string | null {
  const cleanedValue = value.trim();
  const match = cleanedValue.match(/^(\d{4})(\d{2})(\d{2})/);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  return `${year}-${month}-${day}`;
}

function readPropertyValue(
  eventLines: string[],
  propertyName: "DTSTART" | "DTEND",
): string | null {
  const matchingLine = eventLines.find((line) => {
    return (
      line.startsWith(`${propertyName}:`) ||
      line.startsWith(`${propertyName};`)
    );
  });

  if (!matchingLine) {
    return null;
  }

  const colonIndex = matchingLine.indexOf(":");

  if (colonIndex === -1) {
    return null;
  }

  return matchingLine.slice(colonIndex + 1).trim();
}

function parseCalendarEvents(
  calendarText: string,
  source: CalendarSource,
): UnavailableRange[] {
  const lines = unfoldCalendarLines(calendarText);
  const ranges: UnavailableRange[] = [];

  let currentEventLines: string[] | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      currentEventLines = [];
      continue;
    }

    if (line === "END:VEVENT") {
      if (!currentEventLines) {
        continue;
      }

      const startValue = readPropertyValue(
        currentEventLines,
        "DTSTART",
      );

      const endValue = readPropertyValue(
        currentEventLines,
        "DTEND",
      );

      const start = startValue
        ? parseIcalDate(startValue)
        : null;

      const end = endValue ? parseIcalDate(endValue) : null;

      if (start && end && end > start) {
        ranges.push({
          start,
          end,
          source,
        });
      }

      currentEventLines = null;
      continue;
    }

    if (currentEventLines) {
      currentEventLines.push(line);
    }
  }

  return ranges;
}

async function fetchCalendar(
  url: string,
  source: CalendarSource,
): Promise<UnavailableRange[]> {
  const calendarUrl = url.replace(/^webcal:\/\//i, "https://");

  const response = await fetch(calendarUrl, {
    cache: "no-store",
    headers: {
      Accept: "text/calendar, text/plain;q=0.9, */*;q=0.8",
      "User-Agent": "Lord-St-Availability-Checker/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `${source} calendar returned HTTP ${response.status}.`,
    );
  }

  const calendarText = await response.text();

  if (!calendarText.includes("BEGIN:VCALENDAR")) {
    throw new Error(
      `${source} calendar did not return a valid iCalendar file.`,
    );
  }

  return parseCalendarEvents(calendarText, source);
}

function getTodayString(): string {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;

  return new Date(today.getTime() - timezoneOffset)
    .toISOString()
    .split("T")[0];
}

function mergeRanges(
  ranges: UnavailableRange[],
): PublicUnavailableRange[] {
  const sortedRanges = [...ranges]
    .filter((range) => range.end >= getTodayString())
    .sort((first, second) =>
      first.start.localeCompare(second.start),
    );

  const merged: PublicUnavailableRange[] = [];

  for (const range of sortedRanges) {
    const previous = merged.at(-1);

    if (!previous || range.start > previous.end) {
      merged.push({
        start: range.start,
        end: range.end,
      });

      continue;
    }

    if (range.end > previous.end) {
      previous.end = range.end;
    }
  }

  return merged;
}

export async function GET() {
  const airbnbUrl = process.env.AIRBNB_ICAL_URL;
  const vrboUrl = process.env.VRBO_ICAL_URL;

  if (!airbnbUrl || !vrboUrl) {
    console.error(
      "Missing AIRBNB_ICAL_URL or VRBO_ICAL_URL in .env.local.",
    );

    return NextResponse.json(
      {
        success: false,
        error: "The availability calendars are not configured.",
      },
      { status: 500 },
    );
  }

  const results = await Promise.allSettled([
    fetchCalendar(airbnbUrl, "Airbnb"),
    fetchCalendar(vrboUrl, "Vrbo"),
  ]);

  const unavailableRanges: UnavailableRange[] = [];
  const failedSources: CalendarSource[] = [];

  const airbnbResult = results[0];
  const vrboResult = results[1];

  if (airbnbResult.status === "fulfilled") {
    unavailableRanges.push(...airbnbResult.value);
  } else {
    failedSources.push("Airbnb");

    console.error(
      "Unable to read Airbnb calendar:",
      airbnbResult.reason,
    );
  }

  if (vrboResult.status === "fulfilled") {
    unavailableRanges.push(...vrboResult.value);
  } else {
    failedSources.push("Vrbo");

    console.error(
      "Unable to read Vrbo calendar:",
      vrboResult.reason,
    );
  }

  if (failedSources.length === 2) {
    return NextResponse.json(
      {
        success: false,
        error: "Availability could not be checked right now.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    success: true,
    unavailableRanges: mergeRanges(unavailableRanges),
    partial: failedSources.length > 0,
    failedSources,
    checkedAt: new Date().toISOString(),
  });
}