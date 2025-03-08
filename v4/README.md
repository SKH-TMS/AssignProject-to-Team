# Version 4

## Changes

1. Removed the asssignlogs from the Project.ts
2. renamed the AssignedProjectLogs model collection to assigned_project_2_team.
3. Now when assigning the Project we first seacrh for all the projectIDs in the Project and then compare then to assigned_project_2_team. if the id exists the project is assigned and vise versa.
4. Now the assigned_project_2_team will not contain team Name.
5. I also removed some addition attributes like created by email and assigned by email from the Project and team collection.
6. Now the team Collection Contains the createdby which contains the id of the ProjectManager.
7. Also now when you are selectiong team or project for during team or project creation The specific id of team or project will be shown with the name during the selection.

## Fixing

Fixed some errors because during the creation of project or creation of the Team when we assign a team there were some inconsistencies.
