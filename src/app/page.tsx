// src/app/page.tsx

import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import DirectBookingForm from "@/components/DirectBookingForm";

const amenities = [
  "Sleeps up to 4 guests",
  "King and queen beds",
  "1 full bathroom + 1 half bathroom",
  "Fully equipped kitchen",
  "High-speed Wi-Fi",
  "Dedicated workspace",
  "Washer and dryer",
  "Roku smart TV",
  "Central heating and air",
  "Keypad self check-in",
  "Private fenced backyard",
  "Free street parking",
];

const reviews = [
  {
    name: "Samuel",
    location: "Spokane, Washington",
    platform: "Airbnb",
    stay: "April 2026",
    text: "This place was absolutely beautiful and historic, full of character, and very well maintained. Everything was clean, sharp, and well put together. The bed was so comfortable, and the location was ideal. Krystal communicated clearly and consistently, making the entire stay feel smooth and comfortable. I would definitely stay here again. 10/10 experience.",
  },
  {
    name: "Anisha",
    location: "Chicago, Illinois",
    platform: "Airbnb",
    stay: "2026",
    text: "Very clean and super cute! Amazing location and a really good host. I would definitely book again if in the area. The host left us cookies too!",
  },
  {
    name: "Brandy",
    location: "Goshen, Indiana",
    platform: "Airbnb",
    stay: "April 2026",
    text: "Very comfortable, spacious, and clean.",
  },
  {
    name: "Amy R.",
    location: "Traveled with a group",
    platform: "Vrbo",
    stay: "July 2026",
    text: "This house is wonderful. Well appointed, clean, comfortable, and close to everything. The host is fabulous. Clear communication, thoughtful extras, and one of my best Vrbo rental experiences in Indy to date.",
  },
  {
    name: "Vicki K.",
    location: "Traveled with partner and group",
    platform: "Vrbo",
    stay: "June 2026",
    text: "The house is perfect for two couples or a girls trip. The hosts thought of everything, and the house is set up in a thoughtful way to keep everyone comfortable. The location is perfect and walkable to many spots. We enjoyed the backyard, the cookies, and the personalized house code. We would definitely return.",
  },
];

const galleryImages = [
  {
    src: "/images/DSC_3523.jpg",
    alt: "Comfortable living room at Lord St.",
  },
  {
    src: "/images/DSC_3425.jpg",
    alt: "King bedroom at Lord St.",
  },
  {
    src: "/images/DSC_3574.jpg",
    alt: "Full kitchen at Lord St.",
  },
  {
    src: "/images/DSC_3459.jpg",
    alt: "Queen bedroom at Lord St.",
  },
  {
    src: "/images/DSC_3512.jpg",
    alt: "Dining room at Lord St.",
  },
  {
    src: "/images/DSC_3595.jpg",
    alt: "Bathroom at Lord St.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Navigation */}
        <SiteHeader />

      {/* Hero */}
      <section id="home" className="hero">
        <Image
          src="/images/DSC_3474.jpg"
          alt="Lord St. vacation rental in downtown Indianapolis"
          fill
          priority
          className="hero-image"
          sizes="100vw"
        />

        <div className="hero-overlay" />

        <div className="container hero-content">
          <p className="eyebrow">Downtown Indianapolis</p>

          <h1>
            Historic charm.
            <br />
            Modern comfort.
          </h1>

          <p className="hero-description">
            A thoughtfully renovated two-bedroom home near Fountain Square,
            downtown attractions, restaurants, breweries, and entertainment.
          </p>

          <div className="hero-buttons">
            <a href="#book" className="button button-light">
              Check Availability
            </a>

            <a href="#gallery" className="button button-outline-light">
              Explore the Home
            </a>
          </div>
        </div>

        <div className="property-summary">
          <div>
            <strong>4</strong>
            <span>Guests</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Bedrooms</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Beds</span>
          </div>
          <div>
            <strong>1.5</strong>
            <span>Bathrooms</span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section id="about" className="section intro-section">
        <div className="container two-column">
          <div>
            <p className="eyebrow dark">Welcome to Lord St.</p>

            <h2>A memorable stay in the heart of Indianapolis</h2>
          </div>

          <div className="intro-copy">
            <p>
              Step into a beautifully renovated historic home where original
              character meets modern comfort. Lord St. offers two welcoming
              bedrooms, spacious living areas, a fully equipped kitchen, and a
              private backyard made for relaxing after a day in the city.
            </p>

            <p>
              Whether you are visiting for a concert, sporting event, girls
              weekend, couples trip, or work, you will be close to downtown
              while still having the comfort and privacy of an entire home.
            </p>

            <a href="#gallery" className="text-link">
              Take a look inside <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Featured image */}
      <section className="wide-image-section">
        <div className="container">
          <div className="wide-image">
            <Image
              src="/images/DSC_3525.jpg"
              alt="Stylish and comfortable living room"
              fill
              className="cover-image"
              sizes="(max-width: 900px) 100vw, 1200px"
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="section gallery-section">
        <div className="container">
          <div className="section-heading centered">
            <p className="eyebrow dark">Inside the home</p>
            <h2>Comfort in every room</h2>
            <p>
              Thoughtful details, inviting spaces, and everything you need to
              feel at home during your Indianapolis stay.
            </p>
          </div>

          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div
                className={`gallery-item gallery-item-${index + 1}`}
                key={image.src}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="cover-image"
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section id="amenities" className="section amenities-section">
        <div className="container amenities-layout">
          <div className="amenities-photo">
            <Image
              src="/images/DSC_3579.jpg"
              alt="Kitchen and coffee area at Lord St."
              fill
              className="cover-image"
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>

          <div className="amenities-content">
            <p className="eyebrow">Everything you need</p>
            <h2>Designed for an easy, comfortable stay</h2>

            <p>
              From restful bedrooms to a well-equipped kitchen and private
              outdoor space, Lord St. has been prepared with real guest comfort
              in mind.
            </p>

            <div className="amenities-grid">
              {amenities.map((amenity) => (
                <div className="amenity" key={amenity}>
                  <span className="checkmark" aria-hidden="true">
                    ✓
                  </span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="section location-section">
        <div className="container">
          <div className="section-heading centered">
            <p className="eyebrow dark">Explore Indianapolis</p>
            <h2>Close to the places you came to see</h2>
            <p>
              Enjoy easy access to Fountain Square, downtown Indianapolis,
              restaurants, breweries, sporting events, concerts, and
              conventions.
            </p>
          </div>

          <div className="location-cards">
            <div className="location-card">
              <span className="location-number">01</span>
              <h3>Downtown Events</h3>
              <p>
                Convenient access to Gainbridge Fieldhouse, Lucas Oil Stadium,
                the Convention Center, and downtown entertainment.
              </p>
            </div>

            <div className="location-card">
              <span className="location-number">02</span>
              <h3>Food &amp; Drinks</h3>
              <p>
                Walk or take a short ride to popular restaurants, coffee shops,
                cocktail bars, and local Indianapolis breweries.
              </p>
            </div>

            <div className="location-card">
              <span className="location-number">03</span>
              <h3>Fountain Square</h3>
              <p>
                Explore one of the city&apos;s most vibrant neighborhoods,
                known for dining, nightlife, art, music, and local character.
              </p>
            </div>
          </div>

          <p className="address-note">
            The exact property address is shared with confirmed guests before
            arrival.
          </p>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="section reviews-section">
        <div className="container">
          <div className="section-heading centered light-heading">
            <p className="eyebrow">Guest experiences</p>
            <h2>Guests feel at home here</h2>
            <p>
              Selected reviews from guests who booked Lord St. through Airbnb
              and Vrbo.
            </p>
          </div>

          <div className="reviews-grid">
            {reviews.map((review) => (
              <article className="review-card" key={`${review.name}-${review.stay}`}>
                <div
                  className="stars"
                  aria-label="Five out of five stars"
                >
                  ★★★★★
                </div>

                <blockquote>&ldquo;{review.text}&rdquo;</blockquote>

                <div className="review-footer">
                  <div>
                    <strong>{review.name}</strong>
                    <span>{review.location}</span>
                  </div>

                  <div className="review-platform">
                    <strong>{review.platform}</strong>
                    <span>{review.stay}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="section booking-section">
        <div className="container booking-layout">
          <div>
            <p className="eyebrow dark">Plan your stay</p>
            <h2>Ready to experience Lord St.?</h2>

            <p className="booking-description">
              View current availability, pricing, policies, and secure booking
              options through Airbnb or Vrbo.
            </p>

            <div className="booking-buttons">
              <a
                href="https://airbnb.com/h/lordst"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary"
              >
                View on Airbnb
              </a>

              <a
                href="https://vrbo.onelink.me/ItNz/zvaqssef"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary"
              >
                View on Vrbo
              </a>

              <a href="#direct-booking" className="button button-secondary">
                Returning Guest Request
              </a>
            </div>

            <p className="booking-note">
              Returning guests may contact us about direct-booking
              availability.
            </p>
          </div>

          <div className="booking-photo">
            <Image
              src="/images/DSC_3425.jpg"
              alt="Comfortable king bedroom at Lord St."
              fill
              className="cover-image"
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Direct booking request */}
      <section id="direct-booking" className="section direct-booking-section">
        <div className="container">
          <div className="direct-booking-intro">
            <div>
              <p className="eyebrow dark">Returning guests</p>
              <h2>Request a direct stay</h2>
            </div>

            <div>
              <p>
                Returning guests and guests referred by someone we know may request
                to book directly. Every request is personally reviewed before dates
                and pricing are confirmed.
              </p>

              <p className="direct-booking-notice">
                New guests should continue booking through Airbnb or Vrbo.
              </p>
            </div>
          </div>

          <DirectBookingForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-content">
          <div>
            <a href="#home" className="footer-logo">
              Lord St.
            </a>
            <p>A historic downtown Indianapolis stay.</p>
          </div>

          <div className="footer-links">
            <a href="#about">The Home</a>
            <a href="#gallery">Gallery</a>
            <a href="#amenities">Amenities</a>
            <a href="#location">Location</a>
            <a href="#reviews">Reviews</a>
          </div>

          <div className="footer-booking-links">
            <a
              href="https://airbnb.com/h/lordst"
              target="_blank"
              rel="noopener noreferrer"
            >
              Airbnb
            </a>

            <a
              href="https://vrbo.onelink.me/ItNz/zvaqssef"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vrbo
            </a>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} ZIA Residential. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}