"use client";

import { useState } from "react";

type Organisation = {
  id: number;
  name: string;
  category: string;
  status: "Pending" | "Verified" | "Rejected";
};

type Listing = {
  id: number;
  title: string;
  organisation: string;
  status: "Pending Review" | "Approved" | "Rejected";
};

export default function AdminConsole() {
  const [organisations, setOrganisations] = useState<Organisation[]>([
    { id: 1, name: "Green Earth Foundation", category: "Environment", status: "Pending" },
    { id: 2, name: "Helping Hands Trust", category: "Community Service", status: "Pending" },
    { id: 3, name: "Bright Future Society", category: "Education", status: "Verified" },
  ]);

  const [listings, setListings] = useState<Listing[]>([
    { id: 1, title: "Beach Cleanup Drive", organisation: "Green Earth Foundation", status: "Pending Review" },
    { id: 2, title: "Weekend Teaching Program", organisation: "Helping Hands Trust", status: "Pending Review" },
    { id: 3, title: "Tree Plantation Drive", organisation: "Bright Future Society", status: "Approved" },
  ]);

  const [reportedReviews, setReportedReviews] = useState([
    { id: 1, author: "Anonymous Volunteer", organisation: "Helping Hands Trust", reason: "Inappropriate content" },
    { id: 2, author: "Community Member", organisation: "Green Earth Foundation", reason: "Potentially misleading review" },
  ]);

  const [message, setMessage] = useState("");

  function updateOrganisation(id: number, status: "Verified" | "Rejected") {
    setOrganisations((current) =>
      current.map((org) => (org.id === id ? { ...org, status } : org))
    );
    setMessage("Organisation status updated in demo data.");
  }

  function updateListing(id: number, status: "Approved" | "Rejected") {
    setListings((current) =>
      current.map((listing) => (listing.id === id ? { ...listing, status } : listing))
    );
    setMessage("Listing status updated in demo data.");
  }

  function dismissReport(id: number) {
    setReportedReviews((current) => current.filter((review) => review.id !== id));
    setMessage("Report dismissed in demo data.");
  }

  const pendingOrganisations = organisations.filter((org) => org.status === "Pending").length;
  const pendingListings = listings.filter((listing) => listing.status === "Pending Review").length;

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900 md:p-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-purple-700">Administration</p>
        <h1 className="mt-2 text-3xl font-bold">Admin Console</h1>
        <p className="mt-2 text-gray-600">
          Review organisations, moderate volunteer listings, and manage reported reviews.
        </p>

        {message && (
          <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            {message}
          </p>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Pending Organisations</p>
            <p className="mt-2 text-3xl font-bold">{pendingOrganisations}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Listings to Review</p>
            <p className="mt-2 text-3xl font-bold">{pendingListings}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Reported Reviews</p>
            <p className="mt-2 text-3xl font-bold">{reportedReviews.length}</p>
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold">Organisation Verification Queue</h2>
          <div className="mt-4 space-y-4">
            {organisations.map((org) => (
              <div key={org.id} className="flex flex-col justify-between gap-3 border-b pb-4 last:border-0 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-semibold">{org.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{org.category}</p>
                  <p className="mt-1 text-sm">Status: {org.status}</p>
                </div>
                {org.status === "Pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateOrganisation(org.id, "Verified")} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white">
                      Verify
                    </button>
                    <button onClick={() => updateOrganisation(org.id, "Rejected")} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold">Listing Review Queue</h2>
          <div className="mt-4 space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="flex flex-col justify-between gap-3 border-b pb-4 last:border-0 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-semibold">{listing.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{listing.organisation}</p>
                  <p className="mt-1 text-sm">Status: {listing.status}</p>
                </div>
                {listing.status === "Pending Review" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateListing(listing.id, "Approved")} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white">
                      Approve
                    </button>
                    <button onClick={() => updateListing(listing.id, "Rejected")} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold">Reported Reviews</h2>
          <div className="mt-4 space-y-4">
            {reportedReviews.length === 0 ? (
              <p className="text-sm text-gray-500">No reported reviews remaining.</p>
            ) : (
              reportedReviews.map((review) => (
                <div key={review.id} className="flex flex-col justify-between gap-3 border-b pb-4 last:border-0 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-semibold">{review.organisation}</h3>
                    <p className="mt-1 text-sm text-gray-500">Reported by: {review.author}</p>
                    <p className="mt-1 text-sm">Reason: {review.reason}</p>
                  </div>
                  <button onClick={() => dismissReport(review.id)} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">
                    Dismiss Report
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <p className="mt-6 text-xs text-gray-500">
          Demo only: actions update local mock data and are not connected to the backend.
        </p>
      </div>
    </main>
  );
}
