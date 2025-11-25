
export enum UserRole {
  APPLICANT = 'applicant', // 申请人
  BUSINESS_MANAGER = 'business_manager', // 业务部主管
  TECH_SUPPORT = 'tech_support', // 技术支持
  AFTER_SALES_CLERK = 'after_sales_clerk', // 福士营业 (原售后文员)
  REPAIR_TECH = 'repair_tech', // 维修员
  TECH_DEPT = 'tech_dept', // 技术部
  MARKET_DEPT = 'market_dept', // 市场部
  INTERNAL_AFFAIRS = 'internal_affairs', // 内务部
}

export enum TicketStatus {
  DRAFT = 'DRAFT',
  PENDING_BUSINESS_REVIEW = 'PENDING_BUSINESS_REVIEW',
  PENDING_TECH_SUPPORT = 'PENDING_TECH_SUPPORT',
  PENDING_CLERK_RECEIVE = 'PENDING_CLERK_RECEIVE', // Wait for Fushi Business to receive
  PENDING_REPAIR = 'PENDING_REPAIR', // Received, wait for repair tech
  PENDING_TECH_DEPT_REVIEW = 'PENDING_TECH_DEPT_REVIEW',
  PENDING_MARKET_WARRANTY = 'PENDING_MARKET_WARRANTY',
  PENDING_INTERNAL_AFFAIRS = 'PENDING_INTERNAL_AFFAIRS', // If paid
  PENDING_CLERK_SHIP = 'PENDING_CLERK_SHIP', // Wait for Fushi Business to ship back
  PENDING_FINAL_CLOSURE = 'PENDING_FINAL_CLOSURE', // Market dept final close
  CLOSED = 'CLOSED',
}

// Data Structures for each step
export interface Step1Data {
  department: string;
  salesman: string;
  contactPhone: string;
  applyDate: string;
  endUserName: string;
  equipmentVendor?: string;
  distributorName?: string;
  contactPerson: string;
  contactPersonRole: string;
  
  productName: string;
  model: string;
  snCode: string;
  quantity: number;
  deliveryDate?: string;
  maintenanceRecord: '有维保过' | '无维保过';
  warrantyStatus: '保修期内' | '已过保修期';
  otherInfo?: string;

  faultProductType: string;
  productMaterial: string;
  torqueUsed: string;
  usageMethod: string;
  screwSpec: string;
  hasWasher: '有' | '无';
  screwType: string;
  screwMaterial: string;
  screwGrade?: string;
  frequency?: string;
  dailyUsageHours?: string;
  totalUsageHours?: string;
  previouslyRepaired: '有' | '无';
  supplementaryDesc?: string;
}

export interface Step2Data {
  approvalOpinion: string;
  signature: string;
  date: string;
}

export interface Step3Data {
  faultCause: '使用问题' | '生产问题' | '设计问题';
  faultDesc: string;
  handlingSuggestion: '电话/视频 远程已处理' | '出差客户现场解决' | '要求返厂检查维修';
  signature: string;
  date: string;
}

export interface Step4ReceiveData {
  receiveDate: string;
  repairId: string; // Generated ID
  isReturnedUnrepaired?: boolean; // If > 7 days not received
}

export interface Step4RepairData {
  faultCause: '使用故障（人为）' | '产品本身故障';
  productFaultDetail?: '生产问题' | '设计结构问题'; // Only if Product Fault
  hasTestReport: '已出具' | '未出具';
}

export interface Step4TechReviewData {
  reviewOpinion: string;
  date: string;
}

export interface Step4MarketWarrantyData {
  warrantyType: '保修期内免费维修' | '保修期外收费维修' | '人为故障收费维修' | '特批免费维修';
  date: string;
}

export interface Step4InternalData {
  paymentStatus: '已收费（全额）' | '已收费（特价）';
  date: string;
}

export interface Step4ShipData {
  status: '已完成维修并检测寄回' | '未维修滞留寄回';
  stayDays?: string; // If waiting
  courierCompany?: string;
  trackingNumber?: string;
  date: string;
}

export interface Ticket {
  id: string;
  status: TicketStatus;
  createdAt: number;
  step1: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
  step4Receive?: Step4ReceiveData;
  step4Repair?: Step4RepairData;
  step4TechReview?: Step4TechReviewData;
  step4MarketWarranty?: Step4MarketWarrantyData;
  step4Internal?: Step4InternalData;
  step4Ship?: Step4ShipData;
}

export interface User {
  username: string;
  password?: string;
  role: UserRole;
  department?: string; // For managers to match Step 1 department
  region?: string; // For Tech Support mapping
  name: string;
}
