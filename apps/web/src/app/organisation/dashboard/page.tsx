"use client";

import { useState } from "react";

const mockListings = [
  {
    id: 1,
    title: "Beach Cleanup Drive",
    location: "Visakhapatnam",
    applicants: 12,
    status: "Active",
  },
  {
    id: 2,
    title: "Community Teaching",
    location: "Rajahmundry",
    applicants: 8,
    status: "Active",
  },
];

export default function OrganisationDashboard() {
  const [listings, setListings] = useState(mockListings);

  function closeListing(id: number) {
    setListings((current) =>
      current.map((listing) =>
        listing.id === id ? { ...listing, status: "Closed" } : listing
      )
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900 md:p-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-blue-600">
          Organisation Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Organisation Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your volunteer opportunities and applicants.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Total Listings</p>
            <p className="mt-2 text-3xl font-bold">{listings.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Active Listings</p>
            <p className="mt-2 text-3xl font-bold">
              {listings.filter((item) => item.status === "Active").length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Total Applicants</p>
            <p className="mt-2 text-3xl font-bold">
              {listings.reduce((total, item) => total + item.applicants, 0)}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Your Opportunities</h2>
            <span className="text-sm text-gray-500">Mock data</span>
          </div>

          <div className="mt-5 space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold">{listing.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {listing.location} · {listing.applicants} applicants
                  </p>
                  <p className="mt-2 text-sm">
                    Status:{" "}
                    <span
                      className={
                        listing.status === "Active"
                          ? "font-medium text-green-700"
                          : "font-medium text-gray-500"
                      }
                    >
                      {listing.status}
                    </span>
                  </p>
                </div>

                {listing.status === "Active" && (
                  <button
                    onClick={() => closeListing(listing.id)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Close Listing
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
