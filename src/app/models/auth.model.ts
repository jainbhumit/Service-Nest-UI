import { Role } from "../config";

export type LoginData = {
  email : string;
  password : string;
}
export type SignupData = {
  name : string;
  email : string;
  password : string;
  role : Role;
  address : string;
  contact : string;
  security_answer : string;
}

export type ForgetPasswordData = {
  email : string;
  security_answer : string;
  password : string;
}
export interface JwtPayload {
  role : string;
  user_id : string;
  exp : string;
  authorized : string
}