export type ServiceCategory = {
  id:string;
  name:string;
  description:string;
}

export type Service = {
    id: string;
    name: string;
    description: string;
    price: number;
    provider_id: string;
    category: string;
    category_id: string;
    avg_rating: number;
    rating_count: number;
    provider_name: string;
    provider_contact: string;
    provider_address: string;
}

export type ProviderDetail = {
  name: string;
  rating:number;
  price:number
} 

export type RequestBody = {
  service_name:string;
  category:string;
  description: string;
  scheduled_time: string;
}

export type Booking = {
  request_id:string;
  service_name:string;
  service_id:string;
  requested_time:string;
  scheduled_time:string;
  status:string;
  approve_status:boolean;
  provider_details?:{
    service_provider_id:string;
    name:string;
    contact:string;
    address:string;
    price:string;
    rating:number;
    approve:boolean;
  }[]
}

export type ApproveRequests = {
    request_id: string,
    service_name: string,
    service_id: string,
    requested_time: string,
    scheduled_time: string,
    status: string,
    provider_details: Booking["provider_details"]
}

export type Review = {
  service_id:string;
  provider_id:string;
  review_text:string;
  rating: number;
}