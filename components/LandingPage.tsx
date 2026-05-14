
import React from 'react';
import { 
  ChevronRight, 
  School, 
  Users, 
  UserRoundCheck, 
  BarChart3, 
  ShieldCheck, 
  Globe2,
  BookOpenCheck,
  Building2,
  ArrowRight,
  Database,
  GraduationCap
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center p-1.5 border border-slate-100">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Coat_of_arms_of_Malawi.svg/1200px-Coat_of_arms_of_Malawi.svg.png" alt="Malawi Emblem" className="h-full w-auto" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">EMIS TDC</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-0.5">Ministry of Education</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 text-[13px] font-semibold text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Framework</a>
              <a href="#stats" className="hover:text-blue-600 transition-colors">Impact</a>
              <a href="#modules" className="hover:text-blue-600 transition-colors">Modules</a>
              <button 
                onClick={onEnter}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[13px] font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                Access Portal
              </button>
            </div>

            {/* Mobile Menu Toggle (Simplified) */}
            <div className="md:hidden">
               <button onClick={onEnter} className="p-2 text-slate-600">
                 <Users size={24} />
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>2024.4 Deployment Active</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                Empowering Malawi's <br />
                <span className="text-blue-600">Educational Future</span> <br />
                with Data.
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10 max-w-xl">
                The Teacher Development Centre Information System (TDC-IS) provides a robust, centralized framework for real-time educational monitoring, resource management, and strategic policy implementation.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button 
                  onClick={onEnter}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 font-bold text-[14px]"
                >
                  Enter Management System
                  <ArrowRight size={18} />
                </button>
                <button 
                  onClick={onEnter}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold text-[14px]"
                >
                  Public Publications
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                     </div>
                   ))}
                </div>
                <div className="text-[12px] font-medium text-slate-500">
                  Trusted by <span className="text-slate-900 font-bold">5,000+</span> Administrators & Teachers
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/10 to-emerald-600/10 rounded-[2rem] blur-2xl group-hover:opacity-100 transition-opacity"></div>
              <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200" 
                  alt="Modern Education" 
                  className="w-full h-auto object-cover aspect-[4/3] lg:aspect-square"
                />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                         <ShieldCheck size={24} />
                      </div>
                      <div>
                         <p className="text-[14px] font-bold text-slate-900 leading-tight">ISO-9001 Compliant</p>
                         <p className="text-[11px] text-slate-500 font-medium mt-0.5">Secure, Validated Data Infrastructure</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Registered Schools', value: '1,240+', icon: <School className="text-blue-400" /> },
              { label: 'Active Learners', value: '450k+', icon: <Users className="text-emerald-400" /> },
              { label: 'Verified Teachers', value: '12.5k', icon: <UserRoundCheck className="text-blue-400" /> },
              { label: 'Reporting Accuracy', value: '99.8%', icon: <BarChart3 className="text-emerald-400" /> },
            ].map((stat, idx) => (
              <div key={idx} className="text-center md:text-left">
                <div className="mb-4 inline-block">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Core System Modules</h2>
            <p className="text-slate-600 text-[15px] leading-relaxed">
              A integrated ecosystem designed to handle the complexities of national-scale educational data management with precision and ease.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Learner Registry", 
                desc: "Unique LIN generation, NIN validation, and lifelong educational record tracking.", 
                icon: <Users className="text-blue-600" />,
                color: "bg-blue-50"
              },
              { 
                title: "HR & Teacher Registry", 
                desc: "Comprehensive teacher profiles, deployment status, and qualification tracking.", 
                icon: <UserRoundCheck className="text-emerald-600" />,
                color: "bg-emerald-50"
              },
              { 
                title: "Infrastructure & Assets", 
                desc: "Real-time auditing of classrooms, sanitation facilities, and school assets.", 
                icon: <Building2 className="text-orange-600" />,
                color: "bg-orange-50"
              },
              { 
                title: "Academic Performance", 
                desc: "Zonal aggregate exam results and continuous assessment monitoring.", 
                icon: <GraduationCap className="text-purple-600" />,
                color: "bg-purple-50"
              },
              { 
                title: "Financial Reporting", 
                desc: "Grants management, expenditure tracking, and school budget oversight.", 
                icon: <Database className="text-red-600" />,
                color: "bg-red-50"
              },
              { 
                title: "Neural AI Assistant", 
                desc: "Predictive analytics and intelligent querying for policy decision making.", 
                icon: <Globe2 className="text-blue-600" />,
                color: "bg-blue-50"
              },
            ].map((module, idx) => (
              <div key={idx} className="group p-8 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-600/5 transition-all">
                <div className={`w-14 h-14 ${module.color} rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  {React.cloneElement(module.icon as React.ReactElement, { size: 28 })}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{module.title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed mb-6">{module.desc}</p>
                <button onClick={onEnter} className="flex items-center text-[12px] font-bold text-blue-600 gap-1.5 hover:gap-2.5 transition-all">
                  Explore Module <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-blue-600 rounded-[2.5rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">Ready to modernise your <br /> institutional records?</h2>
                <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
                  Join the nationwide transition to a fully digital educational management information system today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={onEnter}
                    className="w-full sm:w-auto px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold text-[14px]"
                  >
                    Get Started Now
                  </button>
                  <button className="w-full sm:w-auto px-10 py-5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all font-bold text-[14px] border border-blue-500/30">
                    Contact MoE Support
                  </button>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900 w-full text-center mb-4 md:mb-0 md:w-auto">Framework Partners</div>
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Coat_of_arms_of_Malawi.svg/1200px-Coat_of_arms_of_Malawi.svg.png" className="h-8 w-auto" alt="Partner" />
             <div className="font-black text-xl tracking-tighter text-slate-900">NIRA</div>
             <div className="font-bold text-lg tracking-tight text-slate-900 uppercase">Malawi Government</div>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-900 rounded-full"></div>
                <span className="font-bold text-sm">MoES</span>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                 <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center p-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Coat_of_arms_of_Malawi.svg/1200px-Coat_of_arms_of_Malawi.svg.png" alt="Malawi Emblem" className="h-full w-auto brightness-200" />
                 </div>
                 <span className="text-lg font-bold text-slate-900">EMIS TDC</span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
                Official digital platform for the Ministry of Education, Malawi, managing institutional data across all levels of primary and secondary education.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-[12px] uppercase tracking-widest text-slate-900 mb-6">Resources</h4>
              <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">User Manuals</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">System Updates</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API Access</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[12px] uppercase tracking-widest text-slate-900 mb-6">Governance</h4>
              <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Data Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Compliance Standards</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Strategic Plan</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Institutional Audit</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[12px] uppercase tracking-widest text-slate-900 mb-6">Support</h4>
              <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Desk</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">District Contacts</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Training Portal</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Report a Bug</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="text-[12px] text-slate-400 font-medium">
               © 2024 Government of Malawi. Ministry of Education and Sports.
             </div>
             <div className="flex items-center gap-8 text-[12px] text-slate-400 font-bold uppercase tracking-widest">
                <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Cookies</a>
                <span className="text-blue-600/40">EMIS v4.1.2_Build_992</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
