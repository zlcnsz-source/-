
import React, { useState, useEffect } from 'react';
import { Ticket, User, UserRole, TicketStatus, Step1Data, Step2Data, Step3Data, Step4ReceiveData, Step4RepairData, Step4TechReviewData, Step4MarketWarrantyData, Step4InternalData, Step4ShipData } from '../types';
import { updateTicket, createTicket } from '../services/db';
import { DEPARTMENTS, PRODUCT_NAMES, PRODUCT_MATERIALS, USAGE_METHODS, SCREW_TYPES, SCREW_MATERIALS, ADMIN_ASSIGN_OPTIONS, STATUS_LABELS } from '../constants';
import { Label, Input, Select, TextArea, SectionTitle, ReadOnlyField } from '../components/FormComponents';
import { ArrowLeft, CheckCircle, Printer, ShieldAlert, Save, ClipboardList, PenTool, Truck, Settings, CheckSquare, Copy, Home } from 'lucide-react';

interface TicketFormProps {
  user: User | null; // User is null for public applicants
  ticket?: Ticket;
  onBack: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ user, ticket, onBack }) => {
  const [formData, setFormData] = useState<Partial<Step1Data>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null); // To show success screen

  // Admin State
  const [adminAssignStatus, setAdminAssignStatus] = useState<string>('');

  // Action Form States
  const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({});
  const [step3Data, setStep3Data] = useState<Partial<Step3Data>>({});
  const [step4Receive, setStep4Receive] = useState<Partial<Step4ReceiveData>>({});
  const [step4Repair, setStep4Repair] = useState<Partial<Step4RepairData>>({});
  const [step4TechReview, setStep4TechReview] = useState<Partial<Step4TechReviewData>>({});
  const [step4Market, setStep4Market] = useState<Partial<Step4MarketWarrantyData>>({});
  const [step4Internal, setStep4Internal] = useState<Partial<Step4InternalData>>({});
  const [step4Ship, setStep4Ship] = useState<Partial<Step4ShipData>>({});

  // Initialize form data if ticket exists
  useEffect(() => {
    if (ticket) {
      setFormData(ticket.step1);
    } else {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
            applyDate: today,
            // If user is logged in (internal), auto-fill. If guest, leave empty.
            salesman: user?.role === UserRole.APPLICANT ? user.name : '',
        });
    }
  }, [ticket, user]);

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create the ticket
    const newTicket = createTicket(formData as Step1Data);
    
    setTimeout(() => {
        setIsSubmitting(false);
        if (user) {
            // Internal user: go back to dashboard
            onBack();
        } else {
            // Guest user: Show success screen with ID
            setSubmittedTicketId(newTicket.id);
        }
    }, 500);
  };

  const handleStepAction = (actionName: string, data: any) => {
     if (!ticket) return;
     setIsSubmitting(true);
     
     let nextStatus = ticket.status;
     const updates: Partial<Ticket> = {};

     // Workflow Logic
     if (actionName === 'approve_business') {
        updates.step2 = { ...data, date: new Date().toISOString().split('T')[0] };
        nextStatus = TicketStatus.PENDING_TECH_SUPPORT;
     } else if (actionName === 'tech_diagnose') {
         updates.step3 = { ...data, date: new Date().toISOString().split('T')[0] };
         const d = data as Step3Data;
         if (d.handlingSuggestion === '要求返厂检查维修') {
             nextStatus = TicketStatus.PENDING_CLERK_RECEIVE;
         } else {
             nextStatus = TicketStatus.PENDING_FINAL_CLOSURE; 
         }
     } else if (actionName === 'clerk_receive') {
         const repairId = `R-${Math.floor(Math.random()*10000)}`;
         updates.step4Receive = { ...data, repairId, date: new Date().toISOString().split('T')[0] };
         const d = data as Step4ReceiveData;
         if (d.isReturnedUnrepaired) {
             nextStatus = TicketStatus.PENDING_FINAL_CLOSURE;
         } else {
             nextStatus = TicketStatus.PENDING_REPAIR;
         }
     } else if (actionName === 'repair_complete') {
         updates.step4Repair = data;
         nextStatus = TicketStatus.PENDING_TECH_DEPT_REVIEW;
     } else if (actionName === 'tech_dept_review') {
         updates.step4TechReview = { ...data, date: new Date().toISOString().split('T')[0] };
         nextStatus = TicketStatus.PENDING_MARKET_WARRANTY;
     } else if (actionName === 'market_warranty') {
         updates.step4MarketWarranty = { ...data, date: new Date().toISOString().split('T')[0] };
         const d = data as Step4MarketWarrantyData;
         if (d.warrantyType === '保修期内免费维修') {
             nextStatus = TicketStatus.PENDING_CLERK_SHIP; 
         } else {
             nextStatus = TicketStatus.PENDING_INTERNAL_AFFAIRS;
         }
     } else if (actionName === 'internal_confirm') {
         updates.step4Internal = { ...data, date: new Date().toISOString().split('T')[0] };
         nextStatus = TicketStatus.PENDING_CLERK_SHIP;
     } else if (actionName === 'clerk_ship') {
         updates.step4Ship = { ...data, date: new Date().toISOString().split('T')[0] };
         nextStatus = TicketStatus.PENDING_FINAL_CLOSURE;
     } else if (actionName === 'final_close') {
         nextStatus = TicketStatus.CLOSED;
     }

     updateTicket(ticket.id, { ...updates, status: nextStatus });
     
     setTimeout(() => {
        setIsSubmitting(false);
        onBack();
     }, 500);
  };

  const handleAdminAction = (action: 'close' | 'return' | 'assign') => {
      if (!ticket) return;
      if (!window.confirm("确定执行此管理员操作吗?")) return;

      let updates: Partial<Ticket> = {};
      
      if (action === 'close') {
          updates.status = TicketStatus.CLOSED;
      } else if (action === 'return') {
          updates.status = TicketStatus.DRAFT;
      } else if (action === 'assign') {
          if (!adminAssignStatus) return;
          updates.status = adminAssignStatus as TicketStatus;
      }
      
      updateTicket(ticket.id, updates);
      onBack();
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
          alert("工单号已复制到剪贴板");
      });
  };

  // --- Visual Components ---

  const Timeline = () => {
    if (!ticket) return null;

    // Simplified workflow stages for visualization
    const stages = [
        { label: '申请', icon: ClipboardList, active: true },
        { label: '审核', icon: CheckSquare, active: ticket.step2 !== undefined },
        { label: '诊断', icon: PenTool, active: ticket.step3 !== undefined },
        { label: '维修', icon: Settings, active: ticket.step4Receive !== undefined }, // Merging receive/repair for simple view
        { label: '发货', icon: Truck, active: ticket.step4Ship !== undefined },
        { label: '结案', icon: CheckCircle, active: ticket.status === TicketStatus.CLOSED },
    ];

    // Calculate progress percentage approximately
    let activeIndex = stages.filter(s => s.active).length - 1;
    if (ticket.status === TicketStatus.CLOSED) activeIndex = stages.length - 1;

    return (
        <div className="mb-8 px-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between min-w-[320px] relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-4 w-full h-1 bg-gray-200 -z-10 rounded"></div>
                <div 
                    className="absolute left-0 top-4 h-1 bg-blue-500 -z-10 rounded transition-all duration-500" 
                    style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
                ></div>

                {stages.map((stage, idx) => {
                    const isActive = idx <= activeIndex;
                    const isCurrent = idx === activeIndex && ticket.status !== TicketStatus.CLOSED;
                    return (
                        <div key={idx} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all ${isActive ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110' : 'bg-white border-gray-300 text-gray-400'}`}>
                                <stage.icon size={14} />
                            </div>
                            <span className={`text-[10px] mt-2 font-bold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{stage.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderHistory = () => {
      if (!ticket) return null;
      return (
          <div className="space-y-6 mb-8">
              {/* Step 1 Display */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <SectionTitle>申请信息</SectionTitle>
                  <div className="grid grid-cols-2 gap-4">
                      <ReadOnlyField label="申请部门" value={ticket.step1.department} />
                      <ReadOnlyField label="业务员" value={ticket.step1.salesman} />
                      <ReadOnlyField label="终端用户" value={ticket.step1.endUserName} fullWidth />
                      <ReadOnlyField label="品名" value={ticket.step1.productName} />
                      <ReadOnlyField label="型号" value={ticket.step1.model} />
                      <ReadOnlyField label="SN码" value={ticket.step1.snCode} />
                  </div>
              </div>

              {ticket.step2 && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      <SectionTitle>业务部审核</SectionTitle>
                      <ReadOnlyField label="审批意见" value={ticket.step2.approvalOpinion} fullWidth />
                      <div className="flex justify-between mt-2 gap-4">
                          <ReadOnlyField label="签名" value={ticket.step2.signature} />
                          <ReadOnlyField label="日期" value={ticket.step2.date} />
                      </div>
                  </div>
              )}

              {ticket.step3 && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                      <SectionTitle>技术支持诊断</SectionTitle>
                      <div className="grid grid-cols-1 gap-2">
                        <ReadOnlyField label="故障原因" value={ticket.step3.faultCause} />
                        <ReadOnlyField label="处理意见" value={ticket.step3.handlingSuggestion} />
                      </div>
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <span className="text-xs text-gray-400 uppercase font-bold block mb-1">诊断描述</span>
                          <p className="text-sm text-gray-800">{ticket.step3.faultDesc || '无详细描述'}</p>
                      </div>
                  </div>
              )}

              {(ticket.step4Receive || ticket.step4Repair || ticket.step4TechReview) && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                      <SectionTitle>维修与检测</SectionTitle>
                      
                      {ticket.step4Receive && (
                          <div className="mb-4 pb-4 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-gray-700">福士营业收货</h4>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{ticket.step4Receive.receiveDate}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <ReadOnlyField label="维修单号" value={ticket.step4Receive.repairId} />
                                    {ticket.step4Receive.isReturnedUnrepaired && (
                                        <div className="col-span-2 text-red-500 text-xs font-bold bg-red-50 p-2 rounded">已退回 (超期未收)</div>
                                    )}
                                </div>
                          </div>
                      )}

                      {ticket.step4Repair && (
                          <div className="mb-4 pb-4 border-b border-gray-100">
                              <h4 className="text-sm font-bold text-gray-700 mb-2">维修员检测</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <ReadOnlyField label="故障归属" value={ticket.step4Repair.faultCause} />
                                <ReadOnlyField label="检测报告" value={ticket.step4Repair.hasTestReport} />
                              </div>
                          </div>
                      )}

                      {ticket.step4TechReview && (
                          <div>
                              <h4 className="text-sm font-bold text-gray-700 mb-2">技术部复核</h4>
                              <ReadOnlyField label="审核意见" value={ticket.step4TechReview.reviewOpinion} fullWidth/>
                          </div>
                      )}
                  </div>
              )}

              {(ticket.step4MarketWarranty || ticket.step4Internal) && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                      <SectionTitle>判定与结算</SectionTitle>
                      {ticket.step4MarketWarranty && <ReadOnlyField label="保修判定" value={ticket.step4MarketWarranty.warrantyType} fullWidth />}
                      {ticket.step4Internal && <ReadOnlyField label="内务部收费确认" value={ticket.step4Internal.paymentStatus} fullWidth />}
                  </div>
              )}
              
              {ticket.step4Ship && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                      <SectionTitle>发货信息</SectionTitle>
                      <ReadOnlyField label="状态" value={ticket.step4Ship.status} />
                      <ReadOnlyField label="快递信息" value={`${ticket.step4Ship.courierCompany || '-'} ${ticket.step4Ship.trackingNumber || ''}`} fullWidth />
                  </div>
              )}
          </div>
      );
  };

  const renderActionForm = () => {
      if (!ticket || !user) return null; // Actions require login

      // Wrap inputs in a nice card
      const ActionCard = ({ title, colorClass, children }: any) => (
          <div className={`p-6 rounded-2xl border mb-8 shadow-lg ${colorClass} bg-white animate-fade-in-up`}>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                  <span className="w-2 h-6 rounded-full bg-current mr-2 opacity-50"></span>
                  {title}
              </h3>
              {children}
          </div>
      );

      // 1. Business Manager Review
      if (ticket.status === TicketStatus.PENDING_BUSINESS_REVIEW && user.role === UserRole.BUSINESS_MANAGER) {
          return (
              <ActionCard title="业务主管审核" colorClass="border-blue-100 text-blue-900 shadow-blue-100/50">
                  <TextArea label="审批意见" value={step2Data.approvalOpinion || ''} onChange={e => setStep2Data({...step2Data, approvalOpinion: e.target.value})} />
                  <Input label="电子签名" value={step2Data.signature || ''} onChange={e => setStep2Data({...step2Data, signature: e.target.value})} placeholder="请输入姓名确认" />
                  <button onClick={() => handleStepAction('approve_business', step2Data)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">提交审核</button>
              </ActionCard>
          );
      }

      // 2. Tech Support
      if (ticket.status === TicketStatus.PENDING_TECH_SUPPORT && user.role === UserRole.TECH_SUPPORT) {
          return (
              <ActionCard title="技术支持诊断" colorClass="border-blue-100 text-blue-900 shadow-blue-100/50">
                  <Select 
                      label="问题原因" 
                      options={['使用问题', '生产问题', '设计问题']} 
                      value={step3Data.faultCause || ''}
                      onChange={e => setStep3Data({...step3Data, faultCause: e.target.value as any})} 
                  />
                  <TextArea 
                      label="故障描述" 
                      value={step3Data.faultDesc || ''}
                      onChange={e => setStep3Data({...step3Data, faultDesc: e.target.value})} 
                  />
                  <Select 
                      label="处理意见" 
                      options={['电话/视频 远程已处理', '出差客户现场解决', '要求返厂检查维修']} 
                      value={step3Data.handlingSuggestion || ''}
                      onChange={e => setStep3Data({...step3Data, handlingSuggestion: e.target.value as any})} 
                  />
                  <Input 
                      label="电子签名" 
                      value={step3Data.signature || ''}
                      onChange={e => setStep3Data({...step3Data, signature: e.target.value})} 
                  />
                  <button onClick={() => handleStepAction('tech_diagnose', step3Data)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-2">提交诊断</button>
              </ActionCard>
          );
      }

      // 3. Clerk Receive
      if (ticket.status === TicketStatus.PENDING_CLERK_RECEIVE && user.role === UserRole.AFTER_SALES_CLERK) {
          return (
              <ActionCard title="福士营业收货" colorClass="border-orange-100 text-orange-900 shadow-orange-100/50">
                  <div className="flex gap-3">
                      <button 
                        onClick={() => handleStepAction('clerk_receive', { receiveDate: new Date().toISOString().split('T')[0], isReturnedUnrepaired: false })}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold shadow hover:bg-green-700"
                      >
                          确认签收
                      </button>
                      <button 
                        onClick={() => handleStepAction('clerk_receive', { receiveDate: new Date().toISOString().split('T')[0], isReturnedUnrepaired: true })}
                        className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold shadow hover:bg-red-600"
                      >
                          超期退回
                      </button>
                  </div>
              </ActionCard>
          );
      }

      // 4. Repair Tech
      if (ticket.status === TicketStatus.PENDING_REPAIR && user.role === UserRole.REPAIR_TECH) {
          return (
              <ActionCard title="维修员检测" colorClass="border-orange-100 text-orange-900 shadow-orange-100/50">
                  <Select 
                      label="故障类型" 
                      options={['使用故障（人为）', '产品本身故障']} 
                      value={step4Repair.faultCause || ''}
                      onChange={e => setStep4Repair({...step4Repair, faultCause: e.target.value as any})} 
                  />
                  {step4Repair.faultCause === '产品本身故障' && (
                      <Select 
                          label="产品故障详情" 
                          options={['生产问题', '设计结构问题']} 
                          value={step4Repair.productFaultDetail || ''}
                          onChange={e => setStep4Repair({...step4Repair, productFaultDetail: e.target.value as any})} 
                      />
                  )}
                  <Select 
                      label="检测报告" 
                      options={['已出具', '未出具']} 
                      value={step4Repair.hasTestReport || ''}
                      onChange={e => setStep4Repair({...step4Repair, hasTestReport: e.target.value as any})} 
                  />
                  <button onClick={() => handleStepAction('repair_complete', step4Repair)} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 mt-2">提交检测结果</button>
              </ActionCard>
          );
      }

      // 5. Tech Dept Review
      if (ticket.status === TicketStatus.PENDING_TECH_DEPT_REVIEW && user.role === UserRole.TECH_DEPT) {
          return (
              <ActionCard title="技术部审核" colorClass="border-blue-100 text-blue-900 shadow-blue-100/50">
                  <TextArea 
                      label="审核意见" 
                      value={step4TechReview.reviewOpinion || ''}
                      onChange={e => setStep4TechReview({...step4TechReview, reviewOpinion: e.target.value})} 
                  />
                  <button onClick={() => handleStepAction('tech_dept_review', step4TechReview)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-2">通过审核</button>
              </ActionCard>
          );
      }

      // 6. Market Warranty
      if (ticket.status === TicketStatus.PENDING_MARKET_WARRANTY && user.role === UserRole.MARKET_DEPT) {
           return (
              <ActionCard title="市场部保修判定" colorClass="border-purple-100 text-purple-900 shadow-purple-100/50">
                  <div className="space-y-3">
                      {['保修期内免费维修', '保修期外收费维修', '人为故障收费维修', '特批免费维修'].map(opt => (
                          <label key={opt} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${step4Market.warrantyType === opt ? 'bg-purple-100 border-purple-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                              <input 
                                type="radio" 
                                name="warrantyType" 
                                value={opt} 
                                checked={step4Market.warrantyType === opt}
                                onChange={e => setStep4Market({...step4Market, warrantyType: e.target.value as any})}
                                className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm font-medium">{opt}</span>
                          </label>
                      ))}
                  </div>
                  <button onClick={() => handleStepAction('market_warranty', step4Market)} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 mt-6 shadow-md">确认判定</button>
              </ActionCard>
          );
      }

      // 7. Internal Affairs
      if (ticket.status === TicketStatus.PENDING_INTERNAL_AFFAIRS && user.role === UserRole.INTERNAL_AFFAIRS) {
          return (
              <ActionCard title="内务部收费确认" colorClass="border-purple-100 text-purple-900 shadow-purple-100/50">
                   <div className="space-y-3">
                      {['已收费（全额）', '已收费（特价）'].map(opt => (
                          <label key={opt} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${step4Internal.paymentStatus === opt ? 'bg-purple-100 border-purple-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                              <input 
                                type="radio" 
                                name="paymentStatus" 
                                value={opt} 
                                checked={step4Internal.paymentStatus === opt}
                                onChange={e => setStep4Internal({...step4Internal, paymentStatus: e.target.value as any})}
                                className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm font-medium">{opt}</span>
                          </label>
                      ))}
                  </div>
                  <button onClick={() => handleStepAction('internal_confirm', step4Internal)} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 mt-6 shadow-md">确认收款</button>
              </ActionCard>
          );
      }

      // 8. Clerk Ship
      if (ticket.status === TicketStatus.PENDING_CLERK_SHIP && user.role === UserRole.AFTER_SALES_CLERK) {
          return (
              <ActionCard title="福士营业发货" colorClass="border-green-100 text-green-900 shadow-green-100/50">
                  <Select 
                      label="处理结果" 
                      options={['已完成维修并检测寄回', '未维修滞留寄回']} 
                      value={step4Ship.status || ''}
                      onChange={e => setStep4Ship({...step4Ship, status: e.target.value as any})} 
                  />
                  {step4Ship.status === '未维修滞留寄回' && (
                      <Input 
                          label="滞留天数" 
                          type="number" 
                          value={step4Ship.stayDays || ''}
                          onChange={e => setStep4Ship({...step4Ship, stayDays: e.target.value})} 
                      />
                  )}
                  <Input 
                      label="快递公司" 
                      value={step4Ship.courierCompany || ''}
                      onChange={e => setStep4Ship({...step4Ship, courierCompany: e.target.value})} 
                  />
                  <Input 
                      label="快递单号" 
                      value={step4Ship.trackingNumber || ''}
                      onChange={e => setStep4Ship({...step4Ship, trackingNumber: e.target.value})} 
                  />
                  <button onClick={() => handleStepAction('clerk_ship', step4Ship)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 mt-2 shadow-md">确认发货</button>
              </ActionCard>
          );
      }

      // 9. Final Closure (Market Dept)
      if (ticket.status === TicketStatus.PENDING_FINAL_CLOSURE && user.role === UserRole.MARKET_DEPT) {
          return (
              <ActionCard title="工单结案" colorClass="border-green-100 bg-green-50 text-green-900 shadow-green-100/50 text-center">
                  <p className="text-gray-600 mb-6">所有流程已完成，请确认结案存档。</p>
                  <button onClick={() => handleStepAction('final_close', {})} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 flex justify-center items-center transform hover:scale-[1.02] transition-all">
                      <CheckCircle className="mr-2"/> 确认结案
                  </button>
              </ActionCard>
          );
      }

      return null;
  };

  const renderSuperAdminPanel = () => {
      if (!user || user.role !== UserRole.MARKET_DEPT || !ticket || ticket.status === TicketStatus.CLOSED) return null;

      return (
          <div className="mt-12 border border-purple-200 bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl shadow-inner">
              <h3 className="text-purple-800 font-bold flex items-center mb-6 text-sm uppercase tracking-widest">
                  <ShieldAlert className="mr-2" size={16} /> 超级管理员控制台
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-2">节点干预 (强制流转)</label>
                      <div className="flex gap-2">
                          <select 
                            className="flex-1 text-sm border border-gray-200 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                            value={adminAssignStatus}
                            onChange={(e) => setAdminAssignStatus(e.target.value)}
                          >
                              <option value="">选择目标节点...</option>
                              {ADMIN_ASSIGN_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                          </select>
                          <button 
                            onClick={() => handleAdminAction('assign')}
                            disabled={!adminAssignStatus}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-purple-700 disabled:bg-gray-300 disabled:shadow-none"
                          >
                              执行
                          </button>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleAdminAction('return')}
                        className="bg-orange-100 text-orange-700 border border-orange-200 py-3 rounded-xl text-sm font-bold hover:bg-orange-200 transition-colors"
                      >
                          退回给申请人
                      </button>
                      <button 
                        onClick={() => handleAdminAction('close')}
                        className="bg-gray-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg"
                      >
                          强制结案
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  // --- SUBMISSION SUCCESS SCREEN (For Guests) ---
  if (submittedTicketId) {
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-green-500 animate-fade-in-up">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">提交成功</h2>
                  <p className="text-gray-500 mb-6">您的申请已提交至业务部审核</p>
                  
                  <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 mb-6 relative group">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-2">您的工单号</p>
                      <div className="text-3xl font-mono font-bold text-blue-600 tracking-wider select-all">
                          {submittedTicketId}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(submittedTicketId)}
                        className="absolute right-2 top-2 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="复制"
                      >
                          <Copy size={18} />
                      </button>
                  </div>

                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm mb-8 flex items-start text-left">
                      <ShieldAlert size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                          <p className="font-bold mb-1">重要提示</p>
                          <p>请务必<span className="font-bold underline">截屏或复制保存</span>此工单号。后续您需要凭此工单号查询维修进度。</p>
                      </div>
                  </div>

                  <button 
                    onClick={onBack}
                    className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-black transition-colors"
                  >
                      <Home size={18} className="mr-2" /> 返回首页
                  </button>
              </div>
          </div>
      )
  }

  // --- Main Render ---

  if (ticket) {
      // VIEW/EDIT MODE
      return (
          <div className="max-w-4xl mx-auto p-4 pb-20">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50/95 backdrop-blur z-10 py-2 border-b border-gray-200/50">
                  <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                      <ArrowLeft size={24} className="text-gray-700" />
                  </button>
                  <div className="text-right">
                      <div className="text-xs text-gray-400 font-mono mb-0.5">{ticket.id}</div>
                      <div className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">{STATUS_LABELS[ticket.status]}</div>
                  </div>
              </div>

              <Timeline />

              {renderHistory()}

              {renderActionForm()}

              {renderSuperAdminPanel()}

              {ticket.status === TicketStatus.CLOSED && (
                  <div className="text-center mt-12 mb-8">
                      <button onClick={() => window.print()} className="bg-gray-800 text-white px-8 py-4 rounded-full shadow-2xl flex items-center mx-auto no-print hover:scale-105 transition-transform font-bold">
                          <Printer className="mr-2" /> 打印存档
                      </button>
                  </div>
              )}
          </div>
      );
  }

  // CREATE MODE (Step 1 Form)
  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-2 transition-colors">
              <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">新建售后服务申请</h2>
      </div>

      <form onSubmit={handleSubmitStep1} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <SectionTitle>1. 申请信息</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
                label="申请部门" 
                options={DEPARTMENTS} 
                value={formData.department || ''}
                onChange={e => setFormData({...formData, department: e.target.value})}
                required
            />
            
            {/* Logic: If user is logged in, use their name and make it read-only. If guest, allow input. */}
            <Input 
                label="业务员" 
                value={formData.salesman || ''} 
                onChange={e => !user && setFormData({...formData, salesman: e.target.value})}
                readOnly={!!user} 
                required 
                className={!!user ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""} 
            />

            <Input label="联系电话" value={formData.contactPhone || ''} onChange={e => setFormData({...formData, contactPhone: e.target.value})} required />
            <Input label="申请日期" value={formData.applyDate || ''} readOnly className="bg-gray-100 text-gray-500" />
            <Input label="终端用户名称" value={formData.endUserName || ''} onChange={e => setFormData({...formData, endUserName: e.target.value})} required />
            <Input label="设备商名称" value={formData.equipmentVendor || ''} onChange={e => setFormData({...formData, equipmentVendor: e.target.value})} />
            <Input label="经销商名称" value={formData.distributorName || ''} onChange={e => setFormData({...formData, distributorName: e.target.value})} />
            <Input label="对接联系人及电话" value={formData.contactPerson || ''} onChange={e => setFormData({...formData, contactPerson: e.target.value})} required />
            <Input label="对接人身份" value={formData.contactPersonRole || ''} onChange={e => setFormData({...formData, contactPersonRole: e.target.value})} required />
        </div>

        <SectionTitle>2. 售后产品信息</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="品名" options={PRODUCT_NAMES} value={formData.productName || ''} onChange={e => setFormData({...formData, productName: e.target.value})} required />
            <Input label="型号" value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} />
            <Input label="SN码" value={formData.snCode || ''} onChange={e => setFormData({...formData, snCode: e.target.value})} required />
            <Input label="数量" type="number" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} />
            <Input label="交货时间" type="date" value={formData.deliveryDate || ''} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
            <Select label="维保记录" options={['有维保过', '无维保过']} value={formData.maintenanceRecord || ''} onChange={e => setFormData({...formData, maintenanceRecord: e.target.value as any})} />
            <Select label="保修期" options={['保修期内', '已过保修期']} value={formData.warrantyStatus || ''} onChange={e => setFormData({...formData, warrantyStatus: e.target.value as any})} />
            <Input label="其他" value={formData.otherInfo || ''} onChange={e => setFormData({...formData, otherInfo: e.target.value})} />
        </div>

        <SectionTitle>3. 故障描述</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="锁付产品" value={formData.faultProductType || ''} onChange={e => setFormData({...formData, faultProductType: e.target.value})} />
            <Select label="产品材质" options={PRODUCT_MATERIALS} value={formData.productMaterial || ''} onChange={e => setFormData({...formData, productMaterial: e.target.value})} />
            <Input label="使用扭力" value={formData.torqueUsed || ''} onChange={e => setFormData({...formData, torqueUsed: e.target.value})} />
            <Select label="使用方式" options={USAGE_METHODS} value={formData.usageMethod || ''} onChange={e => setFormData({...formData, usageMethod: e.target.value})} />
            <Input label="螺丝规格" value={formData.screwSpec || ''} onChange={e => setFormData({...formData, screwSpec: e.target.value})} />
            <Select label="是否垫片" options={['有', '无']} value={formData.hasWasher || ''} onChange={e => setFormData({...formData, hasWasher: e.target.value as any})} />
            <Select label="螺丝种类" options={SCREW_TYPES} value={formData.screwType || ''} onChange={e => setFormData({...formData, screwType: e.target.value})} />
            <Select label="螺丝材质" options={SCREW_MATERIALS} value={formData.screwMaterial || ''} onChange={e => setFormData({...formData, screwMaterial: e.target.value})} />
            <Input label="螺丝强度等级" value={formData.screwGrade || ''} onChange={e => setFormData({...formData, screwGrade: e.target.value})} />
            <Input label="使用频次(节拍)" value={formData.frequency || ''} onChange={e => setFormData({...formData, frequency: e.target.value})} />
            <Input label="单日使用时长" value={formData.dailyUsageHours || ''} onChange={e => setFormData({...formData, dailyUsageHours: e.target.value})} />
            <Input label="已累计使用时长" value={formData.totalUsageHours || ''} onChange={e => setFormData({...formData, totalUsageHours: e.target.value})} />
            <Select label="是否报修过" options={['有', '无']} value={formData.previouslyRepaired || ''} onChange={e => setFormData({...formData, previouslyRepaired: e.target.value as any})} />
            <TextArea label="补充描述" className="md:col-span-2" value={formData.supplementaryDesc || ''} onChange={e => setFormData({...formData, supplementaryDesc: e.target.value})} />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl disabled:bg-gray-400 disabled:shadow-none transition-all flex justify-center items-center active:scale-[0.98]"
            >
                {isSubmitting ? '提交中...' : '提交申请'}
                {!isSubmitting && <Save className="ml-2" size={20} />}
            </button>
        </div>
      </form>
    </div>
  );
};
