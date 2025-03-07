# Version 2

## Changes

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
