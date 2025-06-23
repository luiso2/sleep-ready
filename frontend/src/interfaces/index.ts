// Customer Interface
export interface ICustomer {
  id: string;
  phone?: string;
  email?: string;
  first_name: string;
  last_name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  tier?: string;
  source?: string;
  tags?: string[];
  lifetime_value?: number;
  first_purchase_date?: string;
  last_purchase_date?: string;
  last_contact_date?: string;
  purchased_items?: string[];
  is_elite_member?: boolean;
  membership_status?: string;
  total_trades?: number;
  total_credit_earned?: number;
  current_credit?: number;
  do_not_call?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Employee Interface
export interface IEmployee {
  id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  store_id?: string;
  phone_extension?: string;
  avatar?: string;
  status?: string;
  shift?: string;
  hired_at?: string;
  commissions?: any;
  performance?: any;
  created_at?: string;
  updated_at?: string;
}

// Store Interface
export interface IStore {
  id: string;
  name: string;
  code: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  phone?: string;
  manager_id?: string;
  hours?: any;
  service_area?: any;
  performance?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Product Interface
export interface IProduct {
  id: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  model?: string;
  sku?: string;
  price: number;
  cost?: number;
  commission_rate?: number;
  stock_quantity?: number;
  min_stock?: number;
  features?: any;
  specifications?: any;
  images?: string[];
  tags?: string[];
  status?: string;
  warranty_months?: number;
  created_at?: string;
  updated_at?: string;
}

// Sale Interface
export interface ISale {
  id: string;
  subscription_id?: string;
  customer_id?: string;
  user_id?: string;
  store_id?: string;
  type: string;
  channel: string;
  amount: {
    subtotal?: number;
    tax?: number;
    total?: number;
    discount?: number;
  };
  commission?: any;
  contract?: any;
  payment_status?: string;
  call_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Call Interface
export interface ICall {
  id: string;
  caller_phone?: string;
  customer_id?: string;
  agent_id?: string;
  campaign_id?: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  status: string;
  direction: string;
  recording_url?: string;
  notes?: string;
  outcome?: string;
  script_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Campaign Interface
export interface ICampaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  start_date?: string;
  end_date?: string;
  target_audience?: any;
  script_id?: string;
  goals?: any;
  results?: any;
  created_at?: string;
  updated_at?: string;
}

// Subscription Interface
export interface ISubscription {
  id: string;
  customer_id: string;
  plan_type: string;
  status: string;
  start_date: string;
  end_date?: string;
  billing_cycle: string;
  amount: number;
  features?: any;
  payment_method?: string;
  auto_renew?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Appointment Interface
export interface IAppointment {
  id: string;
  customer_id: string;
  store_id?: string;
  employee_id?: string;
  type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration?: number;
  status: string;
  notes?: string;
  reminder_sent?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Evaluation Interface
export interface IEvaluation {
  id: string;
  customer_id: string;
  employee_id?: string;
  mattress_info?: any;
  condition_score?: number;
  ai_evaluation?: any;
  credit_offered?: number;
  status: string;
  notes?: string;
  images?: string[];
  coupon_code?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Commission Interface
export interface ICommission {
  id: string;
  employee_id: string;
  sale_id?: string;
  type: string;
  amount: number;
  rate?: number;
  status: string;
  paid_date?: string;
  period_start?: string;
  period_end?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Achievement Interface
export interface IAchievement {
  id: string;
  employee_id: string;
  type: string;
  name: string;
  description?: string;
  earned_at: string;
  points?: number;
  badge_url?: string;
  created_at?: string;
  updated_at?: string;
}

// User Interface (for auth)
export interface IUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}
