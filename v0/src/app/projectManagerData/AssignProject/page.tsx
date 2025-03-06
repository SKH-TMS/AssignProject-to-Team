"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarUser from "../../userData/NavbarUser/page";

interface Team {
  teamId: string;
  teamName: string;
}

interface Project {
  ProjectId: string;
  title: string;
  description: string;
  deadline: string;
}

export default function AssignProject() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch Teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("../../api/projectManagerData/getTeams");
        const data = await response.json();

        if (data.success) {
          setTeams(data.teams);
        } else {
          setError(data.message || "Failed to fetch teams.");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        setError("Failed to fetch teams. Please try again.");
      }
    };

    fetchTeams();
  }, []);

  // ✅ Fetch Unassigned Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          "../../api/projectManagerData/getUnassignedProjects"
        );
        const data = await response.json();

        if (data.success) {
          setProjects(data.projects);
        } else {
          setError(data.message || "Failed to fetch projects.");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to fetch projects. Please try again.");
      }
    };

    fetchProjects();
  }, []);

  // ✅ Handle Project Assignment
  const handleAssignProject = async () => {
    if (!selectedTeam || !selectedProject) {
      alert("Please select both a project and a team.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "../../api/projectManagerData/assignProject",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: selectedProject.ProjectId,
            teamId: selectedTeam.teamId,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Project assigned successfully!");
        router.push("/projectManagerData/ProfileProjectManager");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error assigning project:", error);
      setError("Failed to assign project. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div>
      <NavbarUser />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Assign Project to a Team
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="flex flex-col gap-4">
            {/* ✅ Select Project */}
            <label className="text-gray-700 font-semibold">
              Select Unassigned Project:
            </label>
            <select
              value={selectedProject?.ProjectId || ""}
              onChange={(e) => {
                const project = projects.find(
                  (proj) => proj.ProjectId === e.target.value
                );
                setSelectedProject(project || null);
              }}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 text-orange-400"
            >
              <option value="">-- Select a Project --</option>
              {projects.map((project) => (
                <option key={project.ProjectId} value={project.ProjectId}>
                  {project.title} (Deadline: {project.deadline})
                </option>
              ))}
            </select>

            {/* ✅ Select Team */}
            <label className="text-gray-700 font-semibold">
              Select a Team:
            </label>
            <select
              value={selectedTeam?.teamId || ""}
              onChange={(e) => {
                const team = teams.find((t) => t.teamId === e.target.value);
                setSelectedTeam(team || null);
              }}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 text-blue-600"
            >
              <option value="">-- Select a Team --</option>
              {teams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>

            {/* ✅ Assign Project Button */}
            <button
              onClick={handleAssignProject}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 mt-4"
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign Project"}
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
