"use client";

import { useState } from "react";

export default function OrganisationProfile() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Green Earth Foundation");
  const [email, setEmail] = useState("contact@greenearth.org");
  const [location, setLocation] = useState("Visakhapatnam, Andhra Pradesh");
  const [description, setDescription] = useState(
    "We work with communities to protect the environment and create a cleaner, greener future through volunteering."
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900 md:p-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium text-green-700">
          Organisation Portal
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Organisation Profile</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="rounded-lg bg-green-700 px-5 py-2.5 font-medium text-white hover:bg-green-800"
          >
            {editing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
              🌱
            </div>
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="mt-1 text-sm text-gray-500">{location}</p>
              <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Verification Pending
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="mt-2 text-2xl font-bold">4.5 / 5 ⭐</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Reviews Received</p>
              <p className="mt-2 text-2xl font-bold">12</p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Organisation Name
              </label>
              <input
                value={name}
                readOnly={!editing}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border p-3 read-only:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                readOnly={!editing}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border p-3 read-only:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Location
              </label>
              <input
                value={location}
                readOnly={!editing}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full rounded-lg border p-3 read-only:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                About the Organisation
              </label>
              <textarea
                value={description}
                readOnly={!editing}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full rounded-lg border p-3 read-only:bg-gray-50"
              />
            </div>

            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
              >
                Save Profile
              </button>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">Recent Reviews</h2>
          <div className="mt-4 space-y-4">
            <div className="border-b pb-4">
              <p className="font-semibold">Volunteer feedback ⭐⭐⭐⭐⭐</p>
              <p className="mt-1 text-sm text-gray-600">
                A wonderful initiative. The team was friendly and well organised!
              </p>
            </div>
            <div>
              <p className="font-semibold">Community volunteer ⭐⭐⭐⭐</p>
              <p className="mt-1 text-sm text-gray-600">
                A meaningful experience and a great opportunity to help the community.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-5 text-xs text-gray-500">
          Demo profile with mock data. Changes are not yet connected to the backend.
        </p>
      </div>
    </main>
  );
}
