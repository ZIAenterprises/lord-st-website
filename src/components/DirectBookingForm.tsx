// src/components/DirectBookingForm.tsx

"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DayPicker,
  type DateRange,
  type Matcher,
} from "react-day-picker";
import {
  addDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import "react-day-picker/style.css";

type FormStatus =
  | "idle"
  | "loading-calendar"
  | "checking"
  | "submitting"
  | "success"
  | "error";

type BookingFormData = {
  fullName: string;
  email: string;
  phone: string;
  guestCount: string;
  checkIn: string;
  checkout: string;
  visitReason: string;
  returningGuest: string;
  previousPlatform: string;
  previousReservationName: string;
  message: string;
  website: string;
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

const initialFormData: BookingFormData = {
  fullName: "",
  email: "",
  phone: "",
  guestCount: "",
  checkIn: "",
  checkout: "",
  visitReason: "",
  returningGuest: "",
  previousPlatform: "",
  previousReservationName: "",
  message: "",
  website: "",
};

function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function datesOverlap(
  requestedCheckIn: string,
  requestedCheckout: string,
  unavailableRange: UnavailableRange,
): boolean {
  return (
    requestedCheckIn < unavailableRange.end &&
    requestedCheckout > unavailableRange.start
  );
}

export default function DirectBookingForm() {
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] =
    useState<BookingFormData>(initialFormData);

  const [selectedRange, setSelectedRange] =
    useState<DateRange | undefined>();

  const [unavailableRanges, setUnavailableRanges] =
    useState<UnavailableRange[]>([]);

  const [status, setStatus] =
    useState<FormStatus>("loading-calendar");

  const [errorMessage, setErrorMessage] = useState("");

  const [availabilityMessage, setAvailabilityMessage] =
    useState("");

  const today = useMemo(() => startOfDay(new Date()), []);

  /*
   * Prevents the server-rendered form from differing from the
   * first browser render. The interactive calendar appears only
   * after the component has mounted in the browser.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Load the Airbnb and Vrbo availability when the form opens.
   */
  useEffect(() => {
    async function loadAvailability() {
      try {
        setStatus("loading-calendar");
        setErrorMessage("");

        const response = await fetch("/api/availability", {
          method: "GET",
          cache: "no-store",
        });

        const responseText = await response.text();

        let result: AvailabilityResponse;

        try {
          result = JSON.parse(
            responseText,
          ) as AvailabilityResponse;
        } catch {
          console.error(
            "Non-JSON availability response:",
            responseText,
          );

          throw new Error(
            `Availability returned an unexpected response (${response.status}).`,
          );
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              "Availability could not be loaded.",
          );
        }

        setUnavailableRanges(
          result.unavailableRanges ?? [],
        );

        if (result.partial) {
          setAvailabilityMessage(
            "One booking calendar could not be loaded. Every request will still be manually confirmed.",
          );
        }

        setStatus("idle");
      } catch (error) {
        setStatus("error");

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Availability could not be loaded.",
        );
      }
    }

    void loadAvailability();
  }, []);

  /*
   * Calendar date ranges use an exclusive checkout date.
   *
   * Example:
   * A July 10–13 reservation blocks the nights of July 10,
   * July 11, and July 12. July 13 remains available as the
   * next guest's check-in date.
   */
  const disabledDates = useMemo<Matcher[]>(() => {
    const bookedNights: Matcher[] = unavailableRanges
      .map((range) => {
        const from = parseISO(range.start);
        const through = addDays(
          parseISO(range.end),
          -1,
        );

        if (through < from) {
          return null;
        }

        return {
          from,
          to: through,
        };
      })
      .filter(
        (
          range,
        ): range is {
          from: Date;
          to: Date;
        } => Boolean(range),
      );

    return [
      {
        before: today,
      },
      ...bookedNights,
    ];
  }, [today, unavailableRanges]);

  function updateField(
    field: keyof BookingFormData,
    value: string,
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (
      status === "success" ||
      status === "error"
    ) {
      setStatus("idle");
    }

    setErrorMessage("");
  }

  function handleDateSelection(
    range: DateRange | undefined,
  ) {
    setSelectedRange(range);
    setErrorMessage("");
    setAvailabilityMessage("");

    setFormData((current) => ({
      ...current,
      checkIn: range?.from
        ? toDateString(range.from)
        : "",
      checkout: range?.to
        ? toDateString(range.to)
        : "",
    }));

    if (
      status === "success" ||
      status === "error"
    ) {
      setStatus("idle");
    }
  }

  async function checkAvailability() {
    if (!formData.checkIn || !formData.checkout) {
      throw new Error(
        "Select both a check-in and checkout date on the calendar.",
      );
    }

    if (formData.checkout <= formData.checkIn) {
      throw new Error(
        "Checkout must be after check-in.",
      );
    }

    setStatus("checking");
    setErrorMessage("");

    setAvailabilityMessage(
      "Checking the latest Airbnb and Vrbo availability...",
    );

    const response = await fetch("/api/availability", {
      method: "GET",
      cache: "no-store",
    });

    const responseText = await response.text();

    let result: AvailabilityResponse;

    try {
      result = JSON.parse(
        responseText,
      ) as AvailabilityResponse;
    } catch {
      console.error(
        "Non-JSON availability response:",
        responseText,
      );

      throw new Error(
        `Availability returned an unexpected response (${response.status}).`,
      );
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.error ||
          "Availability could not be verified. Please try again.",
      );
    }

    const currentRanges =
      result.unavailableRanges ?? [];

    setUnavailableRanges(currentRanges);

    const conflict = currentRanges.find((range) =>
      datesOverlap(
        formData.checkIn,
        formData.checkout,
        range,
      ),
    );

    if (conflict) {
      setSelectedRange(undefined);

      setFormData((current) => ({
        ...current,
        checkIn: "",
        checkout: "",
      }));

      throw new Error(
        "Those dates are no longer available. Please choose another stay on the calendar.",
      );
    }

    setAvailabilityMessage(
      result.partial
        ? "The dates appear available, but one calendar could not be checked. We will confirm them before approving the request."
        : "The selected dates are currently available.",
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await checkAvailability();

      setStatus("submitting");

      const response = await fetch(
        "/api/booking-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const responseText = await response.text();

      let result: {
        success?: boolean;
        error?: string;
      };

      try {
        result = JSON.parse(responseText) as {
          success?: boolean;
          error?: string;
        };
      } catch {
        console.error(
          "Non-JSON booking response:",
          responseText,
        );

        throw new Error(
          `The booking endpoint returned an unexpected response (${response.status}).`,
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "The request could not be submitted.",
        );
      }

      setFormData(initialFormData);
      setSelectedRange(undefined);
      setAvailabilityMessage("");
      setStatus("success");
    } catch (error) {
      setStatus("error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your request could not be sent.",
      );
    }
  }

  const isBusy =
    status === "loading-calendar" ||
    status === "checking" ||
    status === "submitting";

  /*
   * This placeholder is rendered by both the server and the
   * browser's first render. That keeps the HTML identical and
   * prevents the hydration warning.
   */
  if (!mounted) {
    return (
      <div className="direct-booking-form booking-form-loading">
        Loading current availability...
      </div>
    );
  }

  return (
    <form
      className="direct-booking-form"
      onSubmit={handleSubmit}
    >
      {/* Hidden spam protection */}
      <div
        className="spam-trap"
        aria-hidden="true"
      >
        <label>
          Website

          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(event) =>
              updateField(
                "website",
                event.target.value,
              )
            }
          />
        </label>
      </div>

      {/* Guest information */}
      <div className="form-section-heading">
        <span>01</span>

        <div>
          <h3>Guest information</h3>

          <p>
            Tell us who will be staying at the home.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>Full name *</span>

          <input
            type="text"
            name="fullName"
            autoComplete="name"
            required
            value={formData.fullName}
            onChange={(event) =>
              updateField(
                "fullName",
                event.target.value,
              )
            }
          />
        </label>

        <label className="form-field">
          <span>Email address *</span>

          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value,
              )
            }
          />
        </label>

        <label className="form-field">
          <span>Phone number *</span>

          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={(event) =>
              updateField(
                "phone",
                event.target.value,
              )
            }
          />
        </label>

        <label className="form-field">
          <span>Number of guests *</span>

          <select
            name="guestCount"
            required
            value={formData.guestCount}
            onChange={(event) =>
              updateField(
                "guestCount",
                event.target.value,
              )
            }
          >
            <option value="" disabled>
              Select
            </option>

            <option value="1 guest">
              1 guest
            </option>

            <option value="2 guests">
              2 guests
            </option>

            <option value="3 guests">
              3 guests
            </option>

            <option value="4 guests">
              4 guests
            </option>
          </select>
        </label>
      </div>

      {/* Stay details */}
      <div className="form-section-heading">
        <span>02</span>

        <div>
          <h3>Select your stay</h3>

          <p>
            Unavailable nights are crossed out.
            Select your arrival date, then your
            departure date.
          </p>
        </div>
      </div>

      <div className="booking-calendar-wrapper">
        {status === "loading-calendar" ? (
          <div className="calendar-loading">
            Loading current availability...
          </div>
        ) : (
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleDateSelection}
            disabled={disabledDates}
            excludeDisabled
            numberOfMonths={2}
            pagedNavigation
            startMonth={today}
            defaultMonth={today}
            showOutsideDays
            className="booking-calendar"
            modifiersClassNames={{
              disabled:
                "booking-day-unavailable",
              selected:
                "booking-day-selected",
              range_start:
                "booking-day-range-start",
              range_middle:
                "booking-day-range-middle",
              range_end:
                "booking-day-range-end",
            }}
          />
        )}

        <div className="calendar-legend">
          <span>
            <i className="legend-available" />
            Available
          </span>

          <span>
            <i className="legend-selected" />
            Your stay
          </span>

          <span>
            <i className="legend-unavailable" />
            Unavailable
          </span>
        </div>
      </div>

      <div className="selected-stay-summary">
        <div>
          <span>Check-in</span>

          <strong>
            {selectedRange?.from
              ? format(
                  selectedRange.from,
                  "MMM d, yyyy",
                )
              : "Select a date"}
          </strong>
        </div>

        <div>
          <span>Checkout</span>

          <strong>
            {selectedRange?.to
              ? format(
                  selectedRange.to,
                  "MMM d, yyyy",
                )
              : "Select a date"}
          </strong>
        </div>
      </div>

      <label className="form-field form-field-full">
        <span>Reason for your visit</span>

        <input
          type="text"
          name="visitReason"
          placeholder="Concert, family visit, work trip, weekend getaway..."
          value={formData.visitReason}
          onChange={(event) =>
            updateField(
              "visitReason",
              event.target.value,
            )
          }
        />
      </label>

      {availabilityMessage &&
        status !== "error" && (
          <div
            className="form-message form-message-availability"
            role="status"
          >
            {availabilityMessage}
          </div>
        )}

      {/* Previous stay */}
      <div className="form-section-heading">
        <span>03</span>

        <div>
          <h3>Previous stay</h3>

          <p>
            Direct booking is currently intended
            for returning or referred guests.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>
            Have you stayed with us before? *
          </span>

          <select
            name="returningGuest"
            required
            value={formData.returningGuest}
            onChange={(event) =>
              updateField(
                "returningGuest",
                event.target.value,
              )
            }
          >
            <option value="" disabled>
              Select
            </option>

            <option value="Yes">
              Yes
            </option>

            <option value="No, I was referred">
              No, I was referred
            </option>
          </select>
        </label>

        <label className="form-field">
          <span>
            Previous booking platform
          </span>

          <select
            name="previousPlatform"
            value={formData.previousPlatform}
            onChange={(event) =>
              updateField(
                "previousPlatform",
                event.target.value,
              )
            }
          >
            <option value="">
              Select
            </option>

            <option value="Airbnb">
              Airbnb
            </option>

            <option value="Vrbo">
              Vrbo
            </option>

            <option value="Direct">
              Direct
            </option>

            <option value="Referred guest">
              Referred guest
            </option>
          </select>
        </label>

        <label className="form-field form-field-full">
          <span>
            Previous reservation name or referring
            guest
          </span>

          <input
            type="text"
            name="previousReservationName"
            placeholder="Name used for the reservation"
            value={
              formData.previousReservationName
            }
            onChange={(event) =>
              updateField(
                "previousReservationName",
                event.target.value,
              )
            }
          />
        </label>

        <label className="form-field form-field-full">
          <span>Message</span>

          <textarea
            name="message"
            rows={5}
            placeholder="Share anything else we should know about your requested stay."
            value={formData.message}
            onChange={(event) =>
              updateField(
                "message",
                event.target.value,
              )
            }
          />
        </label>
      </div>

      {/* Acknowledgement */}
      <label className="form-checkbox">
        <input
          type="checkbox"
          required
        />

        <span>
          I understand that this is a booking
          request and does not guarantee
          availability or confirm a reservation.
        </span>
      </label>

      <button
        type="submit"
        className="button button-primary direct-booking-submit"
        disabled={isBusy}
      >
        {status === "loading-calendar"
          ? "Loading Availability..."
          : status === "checking"
            ? "Checking Availability..."
            : status === "submitting"
              ? "Sending Request..."
              : "Send Booking Request"}
      </button>

      {status === "success" && (
        <div
          className="form-message form-message-success"
          role="status"
        >
          Thank you! Your request was sent
          successfully. We will contact you after
          reviewing the dates and guest information.
        </div>
      )}

      {status === "error" && (
        <div
          className="form-message form-message-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </form>
  );
}