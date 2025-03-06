"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarUser from "../../userData/NavbarUser/page";
import { IUser } from "@/models/User"; // ✅ Import User Model Interface

export default function CreateTeam() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<
    { email: string; userId: string }[]
  >([]);
  const [teamLeader, setTeamLeader] = useState<{
    email: string;
    userId: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "../../api/projectManagerData/getAllUsers"
        );
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.message || "Failed to fetch users.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again later.");
      }
    };

    fetchUsers();
  }, []);

  // ✅ Handle checkbox selection for team members (excluding leader)
  const handleCheckboxChange = (email: string, userId: string) => {
    setSelectedMembers((prev) =>
      prev.some((member) => member.email === email)
        ? prev.filter((member) => member.email !== email)
        : [...prev, { email, userId, role: "Team Member" }]
    );
  };

  // ✅ Handle form submission
  const handleCreateTeam = async () => {
    if (!teamName || selectedMembers.length === 0 || !teamLeader) {
      alert(
        "Please fill in all fields and select at least one member and a leader."
      );
      return;
    }

    // ✅ Exclude team leader from members list before submission
    const filteredMembers = selectedMembers.filter(
      (member) => member.email !== teamLeader.email
    );

    setLoading(true);
    setError("");

    try {
      const response = await fetch("../../api/projectManagerData/createTeam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          teamLeader,
          members: filteredMembers,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Team created successfully!");
        router.push("/projectManagerData/ProfileProjectManager");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error creating team:", error);
      setError("Failed to create team. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div>
      <NavbarUser />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Create New Team
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="flex flex-col gap-4">
            {/* ✅ Team Name Input */}
            <label className="text-gray-700 font-semibold">Team Name</label>
            <input
              type="text"
              placeholder="Enter Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />

            {/* ✅ Select Team Members */}
            <h2 className="text-lg font-semibold text-gray-700 mt-4">
              Select Team Members:
            </h2>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
              {users.map((user) => (
                <label
                  key={user.email}
                  className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    onChange={() =>
                      handleCheckboxChange(user.email, user.UserId)
                    }
                    checked={selectedMembers.some(
                      (member) => member.email === user.email
                    )}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-800 font-medium">
                    {user.firstname} {user.lastname} ({user.email})
                  </span>
                </label>
              ))}
            </div>

            {/* ✅ Select Team Leader */}
            <h2 className="text-lg font-semibold text-gray-700 mt-4">
              Select Team Leader:
            </h2>
            <select
              onChange={(e) => {
                const selected = users.find(
                  (user) => user.email === e.target.value
                );
                if (selected)
                  setTeamLeader({
                    email: selected.email,
                    userId: selected.UserId,
                  });
              }}
              value={teamLeader?.email || ""}
              disabled={selectedMembers.length === 0}
              className={`w-full p-3 border rounded-md focus:ring-2 ${
                selectedMembers.length <= 2
                  ? "bg-gray-300 cursor-not-allowed text-red-500"
                  : "border-gray-600 focus:ring-blue-500 text-teal-600"
              }`}
            >
              <option value="">-- Select Team Leader --</option>
              {selectedMembers.map((member) => (
                <option key={member.email} value={member.email}>
                  {member.email} (User ID: {member.userId})
                </option>
              ))}
            </select>

            {/* ✅ Create Team Button */}
            <button
              onClick={handleCreateTeam}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 mt-4"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Team"}
            </button>

            {/* ✅ Cancel Button */}
            <button
              onClick={() =>
                router.push("/projectManagerData/ProfileProjectManager")
              }
              className="w-full p-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition duration-200"
            >
              Cancel & Back to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
