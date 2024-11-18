import { IAddress } from "./address.model";

export interface IUser {
  id: string;
  userID: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  address: IAddress;
  phone: string;
  promotionalEmails: boolean;
}
