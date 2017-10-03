import { NewDocument, RetrievedDocument } from 'documentdb';

export interface DashboardUsersDocument extends RetrievedDocument {
  /* NewDocument Interface */
  // The document id is the dashboard id
  id: string;

  dashboards: IUserPermission[];
}

export interface IUserPermission
{
  userId: string;

  isAdmin: boolean;

  canEdit: boolean;
}

// Document example:
// {
//   id: "dashboardId",
//   users: [
//     {
//       id: "userId",
//       isAdmin: true,
//       canEdit: true
//     }
//   ]
// }




