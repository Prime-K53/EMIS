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
  GraduationCap,
  HeartHandshake,
  Sun,
  Trees,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center p-1.5 border border-emerald-100">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Coat_of_arms_of_Malawi.svg/1200px-Coat_of_arms_of_Malawi.svg.png" alt="Malawi Emblem" className="h-full w-auto" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-emerald-900 tracking-tight leading-none">EMIS TDC</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mt-0.5">Ministry of Education</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-[13px] font-semibold text-emerald-700">
              <a href="#mission" className="hover:text-amber-600 transition-colors">Our Mission</a>
              <a href="#impact" className="hover:text-amber-600 transition-colors">Impact</a>
              <a href="#modules" className="hover:text-amber-600 transition-colors">Modules</a>
              <button
                onClick={onEnter}
                className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-bold hover:bg-emerald-800 transition-all shadow-sm active:scale-95"
              >
                Access Portal
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={onEnter} className="p-2 text-emerald-600">
                <Users size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section – Malawian Primary Learners at the Center */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-amber-300/30 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-emerald-300/30 rounded-full blur-[140px]"></div>
          <div className="absolute top-1/2 left-1/3 w-[30%] h-[30%] bg-yellow-200/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-6">
                <Sun size={12} />
                <span>Every child deserves a quality education</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-900 leading-[1.1] mb-6 tracking-tight">
                For Every
                <br />
                <span className="text-amber-600">Malawian</span>
                <br />
                <span className="text-emerald-600">Primary Learner</span>
              </h2>
              <p className="text-lg text-emerald-700/80 font-medium leading-relaxed mb-10 max-w-xl">
                The Teacher Development Centre Information System (TDC-IS) empowers educators, 
                schools, and policymakers with real-time data — so every child in Malawi gets 
                the support they need to learn, grow, and thrive.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={onEnter}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 font-bold text-[14px]"
                >
                  Enter Management System
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={onEnter}
                  className="px-8 py-4 bg-white border border-amber-200 text-emerald-700 rounded-xl hover:bg-amber-50 transition-all font-bold text-[14px]"
                >
                  See Our Impact
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-amber-100 bg-amber-50 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Educator" />
                    </div>
                  ))}
                </div>
                <div className="text-[12px] font-medium text-emerald-600">
                  Empowering <span className="text-emerald-900 font-bold">5,000+</span> Educators Across Malawi
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-400/20 to-emerald-500/20 rounded-[2rem] blur-2xl"></div>
              <div className="relative rounded-[2rem] overflow-hidden border border-amber-200/50 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200"
                  alt="Malawian primary school children in classroom"
                  className="w-full h-auto object-cover aspect-[4/3] lg:aspect-square"
                />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-amber-100/50 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
                      <Star size={24} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-emerald-900 leading-tight">6+ Million Primary Learners</p>
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Building Malawi's future through data-driven education</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-4">
              <HeartHandshake size={12} />
              <span>Our Commitment</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4 tracking-tight">
              Putting Every Learner First
            </h2>
            <p className="text-emerald-700/70 text-[15px] leading-relaxed">
              From the shores of Lake Malawi to the highlands of Mulanje, we are building 
              a national education system that leaves no child behind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "For the Child",
                desc: "Every learner receives a unique identification number (LIN) that follows them throughout their educational journey — ensuring no child is ever lost in the system.",
                icon: <Star className="text-amber-600" />,
                color: "bg-amber-50",
                accent: "border-amber-200"
              },
              {
                title: "For the Teacher",
                desc: "Real-time classroom data, professional development tracking, and deployment insights to empower every teacher in Malawi's primary schools.",
                icon: <UserRoundCheck className="text-emerald-600" />,
                color: "bg-emerald-50",
                accent: "border-emerald-200"
              },
              {
                title: "For the Nation",
                desc: "Policy makers and district officers get the intelligence they need to allocate resources, improve infrastructure, and drive educational outcomes across all 28 districts.",
                icon: <Trees className="text-emerald-700" />,
                color: "bg-emerald-50",
                accent: "border-emerald-200"
              }
            ].map((item, idx) => (
              <div key={idx} className={`group p-8 rounded-2xl border ${item.accent} ${item.color} hover:shadow-xl hover:shadow-amber-600/5 transition-all`}>
                <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 28 })}
                </div>
                <h3 className="text-lg font-bold text-emerald-900 mb-3">{item.title}</h3>
                <p className="text-emerald-700/70 text-[13px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section id="impact" className="py-20 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-700/20 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Malawi by the Numbers
            </h2>
            <p className="text-emerald-200/80 text-[15px] leading-relaxed">
              Our national education system at a glance — the scale of our mission and the reach of our impact.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Primary Schools', value: '6,400+', icon: <School className="text-amber-400" /> },
              { label: 'Learners Enrolled', value: '6.2M+', icon: <Users className="text-emerald-300" /> },
              { label: 'Primary Teachers', value: '72,000+', icon: <UserRoundCheck className="text-amber-400" /> },
              { label: 'Districts Covered', value: '28/28', icon: <Globe2 className="text-emerald-300" /> },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-300/80">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-amber-400 mb-1">89%</div>
                <p className="text-[12px] text-emerald-200/70">Primary Net Enrollment Rate</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400 mb-1">4.6M</div>
                <p className="text-[12px] text-emerald-200/70">Learners Tracked via TDC-IS</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400 mb-1">99.8%</div>
                <p className="text-[12px] text-emerald-200/70">Data Reporting Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-24 bg-amber-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-4">
              <BookOpenCheck size={12} />
              <span>System Modules</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4 tracking-tight">Tools That Serve Every School</h2>
            <p className="text-emerald-700/70 text-[15px] leading-relaxed">
              An integrated ecosystem designed to support primary education across Malawi — 
              from learner enrollment to policy insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Learner Registry",
                desc: "Unique LIN generation, NIN validation, and lifelong records — every child counts from Standard 1 to Form 4.",
                icon: <Users className="text-emerald-600" />,
                color: "bg-emerald-50",
                borderColor: "border-emerald-200",
                hoverColor: "hover:border-emerald-300"
              },
              {
                title: "Teacher Registry",
                desc: "Comprehensive profiles, deployment tracking, and qualification management for Malawi's primary teaching workforce.",
                icon: <UserRoundCheck className="text-amber-600" />,
                color: "bg-amber-50",
                borderColor: "border-amber-200",
                hoverColor: "hover:border-amber-300"
              },
              {
                title: "School Infrastructure",
                desc: "Real-time auditing of classrooms, WASH facilities, and learning materials across all primary schools.",
                icon: <Building2 className="text-emerald-600" />,
                color: "bg-emerald-50",
                borderColor: "border-emerald-200",
                hoverColor: "hover:border-emerald-300"
              },
              {
                title: "Academic Performance",
                desc: "Zonal exam results tracking and continuous assessment monitoring to identify learners who need extra support.",
                icon: <GraduationCap className="text-amber-600" />,
                color: "bg-amber-50",
                borderColor: "border-amber-200",
                hoverColor: "hover:border-amber-300"
              },
              {
                title: "Financial Oversight",
                desc: "School grants tracking, expenditure reporting, and budget management for transparent resource allocation.",
                icon: <Database className="text-emerald-600" />,
                color: "bg-emerald-50",
                borderColor: "border-emerald-200",
                hoverColor: "hover:border-emerald-300"
              },
              {
                title: "AI Education Assistant",
                desc: "Predictive analytics and intelligent querying — helping educators spot at-risk learners before they fall behind.",
                icon: <Globe2 className="text-amber-600" />,
                color: "bg-amber-50",
                borderColor: "border-amber-200",
                hoverColor: "hover:border-amber-300"
              },
            ].map((module, idx) => (
              <div
                key={idx}
                className={`group p-8 rounded-2xl border ${module.borderColor} bg-white ${module.hoverColor} hover:shadow-xl hover:shadow-amber-600/5 transition-all`}
              >
                <div className={`w-14 h-14 ${module.color} rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  {React.cloneElement(module.icon as React.ReactElement, { size: 28 })}
                </div>
                <h3 className="text-lg font-bold text-emerald-900 mb-3">{module.title}</h3>
                <p className="text-emerald-700/70 text-[13px] leading-relaxed mb-6">{module.desc}</p>
                <button onClick={onEnter} className="flex items-center text-[12px] font-bold text-amber-600 gap-1.5 hover:gap-2.5 transition-all">
                  Learn More <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] p-8 md:p-16 text-center text-white overflow-hidden shadow-2xl shadow-emerald-900/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-600 to-amber-700"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-white/90 text-[11px] font-bold uppercase tracking-wider mb-6">
                <Sun size={12} />
                <span>A Brighter Future Starts Today</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                Every child deserves <br /> a chance to learn
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto font-medium">
                Join us in building a future where every Malawian primary learner has access 
                to quality education, supported by data and driven by care.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onEnter}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-emerald-700 rounded-xl hover:bg-amber-50 transition-all font-bold text-[14px] shadow-lg"
                >
                  Enter the Portal
                </button>
                <button className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-bold text-[14px] border border-white/30 backdrop-blur-sm">
                  Learn About TDC-IS
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 border-t border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-70 transition-all duration-500">
            <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-800 w-full text-center mb-4 md:mb-0 md:w-auto">Partners</div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Coat_of_arms_of_Malawi.svg/1200px-Coat_of_arms_of_Malawi.svg.png" className="h-8 w-auto" alt="Malawi Coat of Arms" />
            <div className="font-black text-xl tracking-tighter text-emerald-800">NIRA</div>
            <div className="font-bold text-lg tracking-tight text-emerald-700 uppercase">Malawi Government</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-700 rounded-full"></div>
              <span className="font-bold text-sm text-emerald-700">MoES</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-950 pt-20 pb-10 text-emerald-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center p-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Coat_of_arms_of_Malawi.svg/1200px-Coat_of_arms_of_Malawi.svg.png" alt="Malawi Emblem" className="h-full w-auto brightness-200 opacity-80" />
                </div>
                <span className="text-lg font-bold text-white">EMIS TDC</span>
              </div>
              <p className="text-[13px] text-emerald-300/60 leading-relaxed mb-6">
                Official platform of the Ministry of Education, Malawi — dedicated to tracking 
                and improving educational outcomes for every primary learner across all 28 districts.
              </p>
              <div className="flex items-center gap-2 text-amber-400/60 text-[11px] font-medium">
                <HeartHandshake size={14} />
                <span>For every Malawian child</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[12px] uppercase tracking-widest text-amber-400/80 mb-6">Resources</h4>
              <ul className="space-y-4 text-[13px] text-emerald-300/60 font-medium">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Teacher Guides</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">System Updates</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">API Access</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[12px] uppercase tracking-widest text-amber-400/80 mb-6">Governance</h4>
              <ul className="space-y-4 text-[13px] text-emerald-300/60 font-medium">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Data Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Education Standards</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Strategic Plan 2030</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Institutional Audit</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[12px] uppercase tracking-widest text-amber-400/80 mb-6">Support</h4>
              <ul className="space-y-4 text-[13px] text-emerald-300/60 font-medium">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Help Desk</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">District Contacts</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Teacher Training</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Report an Issue</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-emerald-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[12px] text-emerald-400/50 font-medium">
              © 2024 Government of Malawi. Ministry of Education and Sports.
            </div>
            <div className="flex items-center gap-8 text-[12px] text-emerald-400/50 font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-amber-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Cookies</a>
              <span className="text-amber-500/40">EMIS v4.1.2_Build_992</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
