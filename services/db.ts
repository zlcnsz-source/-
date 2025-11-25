
import { Ticket, TicketStatus, User, UserRole, Step1Data } from "../types";
import { DEPT_TO_TECH_REGION, INITIAL_USERS } from "../constants";

const STORAGE_KEY_TICKETS = 'airte_tickets_v1';
const STORAGE_KEY_USERS = 'airte_users_v1';

// --- Helper for ID Generation ---
const generateId = (prefix: string = 'TK') => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${datePart}-${randomPart}`;
};

// --- User Management ---

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY_USERS);
  if (!stored) {
    // Initialize with default users if empty
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  return JSON.parse(stored);
};

export const addUser = (user: User): boolean => {
  const users = getUsers();
  if (users.some(u => u.username === user.username)) {
    return false; // Username exists
  }
  users.push(user);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  return true;
};

export const updateUserPassword = (username: string, newPass: string): void => {
  const users = getUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx !== -1) {
    users[idx].password = newPass;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }
};

export const removeUser = (username: string): void => {
  const users = getUsers().filter(u => u.username !== username);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

// --- Ticket Management ---

export const getTickets = (): Ticket[] => {
  const stored = localStorage.getItem(STORAGE_KEY_TICKETS);
  return stored ? JSON.parse(stored) : [];
};

export const getTicketById = (id: string): Ticket | undefined => {
  return getTickets().find(t => t.id === id);
};

export const createTicket = (step1Data: Step1Data): Ticket => {
  const tickets = getTickets();
  const newTicket: Ticket = {
    id: generateId(),
    status: TicketStatus.PENDING_BUSINESS_REVIEW,
    createdAt: Date.now(),
    step1: step1Data,
  };
  tickets.unshift(newTicket);
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  return newTicket;
};

export const updateTicket = (id: string, updates: Partial<Ticket>): void => {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === id);
  if (idx !== -1) {
    tickets[idx] = { ...tickets[idx], ...updates };
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  }
};

// --- Access Control Logic ---

export const getTicketsForUser = (user: User): Ticket[] => {
  const allTickets = getTickets();

  switch (user.role) {
    case UserRole.MARKET_DEPT:
      // Super Admin: Sees ALL tickets
      return allTickets;

    case UserRole.APPLICANT:
      // Applicant: Sees only their own tickets (matching salesman name)
      return allTickets.filter(t => t.step1.salesman === user.name);

    case UserRole.BUSINESS_MANAGER:
      // Manager: Sees tickets for their department
      return allTickets.filter(t => t.step1.department === user.department);

    case UserRole.TECH_SUPPORT:
      // Tech Support: Sees tickets based on Region Mapping
      return allTickets.filter(t => {
        const dept = t.step1.department;
        const region = DEPT_TO_TECH_REGION[dept];
        return region === user.region && 
               // Only show if it has passed business review or is specifically in tech support stage
               // Or if it was returned to them? Usually just if workflow reached them.
               (t.status === TicketStatus.PENDING_TECH_SUPPORT || t.status !== TicketStatus.DRAFT);
      });

    case UserRole.AFTER_SALES_CLERK: // 福士营业
      return allTickets.filter(t => 
        t.status === TicketStatus.PENDING_CLERK_RECEIVE || 
        t.status === TicketStatus.PENDING_CLERK_SHIP ||
        // Can see history of items passing through? Let's show relevant ones
        (t.step4Receive !== undefined)
      );

    case UserRole.REPAIR_TECH:
      return allTickets.filter(t => t.status === TicketStatus.PENDING_REPAIR);

    case UserRole.TECH_DEPT:
      return allTickets.filter(t => t.status === TicketStatus.PENDING_TECH_DEPT_REVIEW);

    case UserRole.INTERNAL_AFFAIRS:
      return allTickets.filter(t => t.status === TicketStatus.PENDING_INTERNAL_AFFAIRS);

    default:
      return [];
  }
};
