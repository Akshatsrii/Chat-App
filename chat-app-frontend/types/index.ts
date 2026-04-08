export interface User {
  id: string;
  username: string;
  avatar: string;
  online: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: User;
  timestamp: Date;
  isOwn: boolean;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  members: User[];
}