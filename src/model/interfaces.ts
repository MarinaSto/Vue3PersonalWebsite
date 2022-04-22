export interface Message {
  id: string;
  name: string;
  profilePictureUrl: string;
  text: string;
  imageUrl: string;
  time: Date | null;
}

export interface Item {
  isUserLogged: boolean;
  userName: string;
  userProfilePicture: string;
  messages: Array<Message>;
}
