# Assign Project to a Team - byProjectManager

## version 0

1. Added Assign Project Page and route.
2. Also added the button on the Profile page of Project Manager named: Assign Project.

### Work

1.  Simply click on assign Project button this will open a page on which you can assign a Project to a Team.
    What this is doing is that it is adding assigning a project to a team by filling Assignedto field of the project with the team it is assigning to.

## Version 1

### Assigning Project and team during Vise versa Creation

1. Assigning Team to the Project during Project Creation.
2. Assigning Project to the Team during Team Creation.

### More Improvements to Repo # T24

1. Project Manager can select Time now during the Project Creation.
2. Time can also be in AM and PM.

### Issue in this v1

- "projects" collection is updated after assigning project to a team. But there should be new collection in which assigned-project information will be stored. **This issue is solve in next version**
## Version 2

### Changes

I have updated the v2 to include the AssignedProjectLogs
this includes the

1.  AssignProjectId. // Unique Assignment ID
2.  projectId. // The project being assigned
3.  teamId. // The team assigned to the project
4.  teamName. // The name of the team
5.  assignedBy. // Project Manager who assigned the project
6.  deadline: Date.

I have removed the deadline field from the Project and included it in the AssignedProjectLogs
I have added the assignedLog in the Project to track rather the project is assignoed to any team or not
## Version 3

### Error Handeling

1. Redirecting to userData/Loginuser if unautherized access.

### Changes

1. Most of alerts have been removed and now instead of using normal alert react-hot-toast is being used.
2. in case of error toast.error
3. In case of Sucess toast.sucess
## Version 4

### Changes

1. Removed the asssignlogs from the Project.ts
2. renamed the AssignedProjectLogs model collection to assigned_project_2_team.
3. Now when assigning the Project we first seacrh for all the projectIDs in the Project and then compare then to assigned_project_2_team. if the id exists the project is assigned and vise versa.
4. Now the assigned_project_2_team will not contain team Name.
5. I also removed some addition attributes like created by email and assigned by email from the Project and team collection.
6. Now the team Collection Contains the createdby which contains the id of the ProjectManager.
7. Also now when you are selectiong team or project for during team or project creation The specific id of team or project will be shown with the name during the selection.

### Fixing

Fixed some errors because during the creation of project or creation of the Team when we assign a team there were some inconsistencies.

## Version 5

### Changes

Added the ZOD integration for the backend Validation. Now if any error occurs during backed validation the error will be directed to the frontend and client or user will be able to see the error and its occuring reason.

#### Changes in File Structure

I have added the "Schemas" folder in "src" folder.

1. "adminSchema.ts"
2. "assignedProjectLogSchema.ts"
3. "projectSchema.ts"
4. "teamSchema.ts"
5. "userSchema.ts"

#### Changes in the routes

1. assignProject/route.ts
2. createProject/route.ts
3. createTeam/route.ts

### Fixing

Fixed Deadline format now all the pages "CreateProject","CreateTeam"and"AssignProject" will store the deadline in the similer format.

