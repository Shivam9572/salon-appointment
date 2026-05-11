export interface Provider {
  id: string;
  email: string;
  salonName: string;
  salonAddress: string;
  salonContact: string;
  servicesOffered: string;
  status: string;
  role: string;
  longitude: number;
  latitude: number;
  isVerified: boolean;
  available: boolean;
  opening_time: string;
  closing_time: string;
}

export interface Service {
  id: string;
  custom_price: string;
  custom_duration: number;
  custom_description: string;
  Service: {
    name: string;
  };
  Category: {
    name: string;
  };
  Staff: {
    name: string;
    phone: string;
  };
}