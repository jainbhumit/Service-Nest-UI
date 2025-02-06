export type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  imageUrl: string
};

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
};

export type ProviderDetail = {
  name: string;
  rating: number;
  price: number;
  rating_count:number
};

export type RequestBody = {
  service_name: string;
  category: string;
  description: string;
  scheduled_time: string;
  category_id:string
};

export type Booking = {
  request_id: string;
  service_name: string;
  service_id: string;
  requested_time: string;
  scheduled_time: string;
  status: string;
  approve_status: boolean;
  provider_details?: ProviderInfo[];
};

export type ProviderInfo = {
  service_provider_id: string;
  name: string;
  contact: string;
  address: string;
  price: string;
  rating: number;
  approve: boolean;
  status:string;
  service_id:string;
}

export type ApproveRequests = {
  request_id: string;
  service_name: string;
  service_id: string;
  requested_time: string;
  scheduled_time: string;
  status: string;
  provider_details: Booking['provider_details'];
};

export type Review = {
  request_id:string;
  service_id: string;
  provider_id: string;
  review_text: string;
  rating: number;
};

export type ProviderServiceDetail = {
  id: string;
  name: string;
  description: string;
  price: number;
  provider_id: string;
  category: string;
  avg_rating: number;
  rating_count: string;
  provider_name: string;
  provider_contact:string;
  provider_address:string;
};

export type AddService = {
  name: string;
  description: string;
  price: number;
  category: string;
  service_id:string;
};

export type ProviderViewRequest = {
  request_id: string;
  service_name: string;
  service_id: string;
  requested_time: string;
  scheduled_time: string;
  address: string;
  description: string;
  status:string;
};

export type ProviderApproveRequest = {
  request_id: string;
  householder_id: string;
  householder_name: string;
  householder_address: string;
  householder_contact: string;
  approve_status: boolean;
  service_id: string;
  requested_time: string;
  scheduled_time: string;
  status: string;
  service_name: string;
};

export type ProviderReview = {
  review_id: string;
  service_id: string;
  householder_id: string;
  provider_id: string;
  rating: number;
  comments: string;
  review_date: string;
};

export type EvaluatedKey = {
  PK:{
    Value:string;
  };
  SK:{
    Value:string;
  }
}
