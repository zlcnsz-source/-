
import { User, UserRole, TicketStatus } from "./types";

export const DEPARTMENTS = [
  '上海办', '苏州办', '北京办', '青岛办', '深圳办', '厦门办', '杭州办', '宁波办', '长沙办'
];

export const PRODUCT_NAMES = [
  '手持螺丝刀', '机载螺丝刀', '拧紧轴', '无刷电批', '熊猫Q系列'
];

export const PRODUCT_MATERIALS = [
  '铝', '铁', '不锈钢', '塑料', '陶瓷', '其他'
];

export const USAGE_METHODS = [
  '单手持', '手持加力臂架', '机装加平台机', '机装加机械手', '集成设备'
];

export const SCREW_TYPES = [
  '自攻', '机牙', '其他'
];

export const SCREW_MATERIALS = [
  '铝', '铁', '不锈钢', '塑料', '其他'
];

// Tech Support Mapping
export const DEPT_TO_TECH_REGION: Record<string, string> = {
  '上海办': 'husu',
  '苏州办': 'husu',
  '北京办': 'qingdao',
  '青岛办': 'qingdao',
  '深圳办': 'south',
  '厦门办': 'south',
  '杭州办': 'zhejiang',
  '宁波办': 'zhejiang',
  '长沙办': 'south',
};

// Initial Mock Users (Now used to seed the DB)
export const INITIAL_USERS: User[] = [
  { username: 'applicant', password: '123', role: UserRole.APPLICANT, name: '申请业务员' },
  // Managers
  { username: 'manager_sh', password: '123', role: UserRole.BUSINESS_MANAGER, department: '上海办', name: '上海办主管' },
  { username: 'manager_sz', password: '123', role: UserRole.BUSINESS_MANAGER, department: '苏州办', name: '苏州办主管' },
  { username: 'manager_bj', password: '123', role: UserRole.BUSINESS_MANAGER, department: '北京办', name: '北京办主管' },
  { username: 'manager_qd', password: '123', role: UserRole.BUSINESS_MANAGER, department: '青岛办', name: '青岛办主管' },
  { username: 'manager_shenzhen', password: '123', role: UserRole.BUSINESS_MANAGER, department: '深圳办', name: '深圳办主管' },
  { username: 'manager_xm', password: '123', role: UserRole.BUSINESS_MANAGER, department: '厦门办', name: '厦门办主管' },
  { username: 'manager_hz', password: '123', role: UserRole.BUSINESS_MANAGER, department: '杭州办', name: '杭州办主管' },
  { username: 'manager_nb', password: '123', role: UserRole.BUSINESS_MANAGER, department: '宁波办', name: '宁波办主管' },
  { username: 'manager_cs', password: '123', role: UserRole.BUSINESS_MANAGER, department: '长沙办', name: '长沙办主管' },
  
  // Tech Support
  { username: 'tech_husu', password: '123', role: UserRole.TECH_SUPPORT, region: 'husu', name: '沪苏技术支持' },
  { username: 'tech_qingdao', password: '123', role: UserRole.TECH_SUPPORT, region: 'qingdao', name: '青岛技术支持' },
  { username: 'tech_south', password: '123', role: UserRole.TECH_SUPPORT, region: 'south', name: '华南技术支持' },
  { username: 'tech_zhejiang', password: '123', role: UserRole.TECH_SUPPORT, region: 'zhejiang', name: '浙江技术支持' },

  // Others
  { username: 'clerk', password: '123', role: UserRole.AFTER_SALES_CLERK, name: '福士营业' },
  { username: 'repair', password: '123', role: UserRole.REPAIR_TECH, name: '维修员' },
  { username: 'tech_dept', password: '123', role: UserRole.TECH_DEPT, name: '技术部' },
  { username: 'market', password: '123', role: UserRole.MARKET_DEPT, name: '市场部' },
  { username: 'internal', password: '123', role: UserRole.INTERNAL_AFFAIRS, name: '内务部' },
];

// Status Labels
export const STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.DRAFT]: '草稿 (申请人)',
  [TicketStatus.PENDING_BUSINESS_REVIEW]: '待业务主管审核',
  [TicketStatus.PENDING_TECH_SUPPORT]: '待技术支持诊断',
  [TicketStatus.PENDING_CLERK_RECEIVE]: '待福士营业签收',
  [TicketStatus.PENDING_REPAIR]: '待维修员检测',
  [TicketStatus.PENDING_TECH_DEPT_REVIEW]: '待技术部审核',
  [TicketStatus.PENDING_MARKET_WARRANTY]: '待市场部保修判定',
  [TicketStatus.PENDING_INTERNAL_AFFAIRS]: '待内务部收费确认',
  [TicketStatus.PENDING_CLERK_SHIP]: '待福士营业发货',
  [TicketStatus.PENDING_FINAL_CLOSURE]: '待市场部结案',
  [TicketStatus.CLOSED]: '已结案',
};

// Admin Assignment Options
export const ADMIN_ASSIGN_OPTIONS = [
  { label: '退回给申请人 (草稿)', value: TicketStatus.DRAFT },
  { label: '转给业务主管', value: TicketStatus.PENDING_BUSINESS_REVIEW },
  { label: '转给技术支持', value: TicketStatus.PENDING_TECH_SUPPORT },
  { label: '转给福士营业 (签收)', value: TicketStatus.PENDING_CLERK_RECEIVE },
  { label: '转给维修员', value: TicketStatus.PENDING_REPAIR },
  { label: '转给技术部', value: TicketStatus.PENDING_TECH_DEPT_REVIEW },
  { label: '转给市场部 (保修)', value: TicketStatus.PENDING_MARKET_WARRANTY },
  { label: '转给内务部', value: TicketStatus.PENDING_INTERNAL_AFFAIRS },
  { label: '转给福士营业 (发货)', value: TicketStatus.PENDING_CLERK_SHIP },
  { label: '转给市场部 (结案)', value: TicketStatus.PENDING_FINAL_CLOSURE },
  { label: '直接结案', value: TicketStatus.CLOSED },
];
