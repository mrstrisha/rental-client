export const CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
];

export const CONDITIONS = ["New", "Excellent", "Good", "Fair"];

export type EquipmentInput = {
  name: string;
  description: string;
  category: string;
  location: string;
  rentalPrice: number;
  rentalType: "Daily" | "Weekly" | "Monthly";
  quantity: number;
  condition: string;
  brand: string;
  model: string;
  image: string;
  terms: string;
};

export type Equipment = EquipmentInput & {
  _id: string;
  status: "pending" | "approved" | "rejected";
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string;
};

export type Booking = {
  _id: string;
  equipmentId: string;
  equipmentName: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  address?: string;
  deliveryAddress?: string;
  notes?: string;
  ownerName?: string;
  ownerEmail?: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
};