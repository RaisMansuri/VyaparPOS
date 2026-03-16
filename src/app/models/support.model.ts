export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerName: string;
  customerEmail: string;
  createdAt: Date;
  updatedAt?: Date;
  assignedTo?: string;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  author: string;
  message: string;
  createdAt: Date;
}
