export interface Todo {
  id?: string; // optional because Firestore generates this
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'Pending';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
  uid: string;
  email:string
}
