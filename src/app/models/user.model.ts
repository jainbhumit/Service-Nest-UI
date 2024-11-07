export type UserProfile = {
  id:string;
  name: string;
  email:string;
  password:string;
  role:string;
  address:string;
  contact:string;
  security_answer:string
  is_active:boolean;
}

export type UpdateProfile = {
  email:string;
  password:string;
  address:string;
  contact:string;
}