import { motion } from 'framer-motion';
import { FiMail, FiGithub, FiLinkedin, FiTerminal, FiDatabase } from 'react-icons/fi';
import SectionHeading from '../components/SectionHeading';
import tieImage from '../../images/tie.png';
import developerImage from '../../images/AdobeExpressPhotos_d37fda8e4bff4c1c8a7eae42a6d1a57e_CopyEdited.jpg';

const DEVELOPERS = [
  {
    id: 'dev-1',
    name: 'Niño P. Betonio',
    role: 'Lead Full Stack Architect & Visionary Leader',
    bio: 'The visionary leader and extraordinarily powerful Full Stack Developer behind FoodHub. Niño orchestrates the entire technical stack with unparalleled mastery, seamlessly bridging complex server-side infrastructure with breathtaking frontend experiences. As the primary driving force of the engineering team, his technical brilliance and leadership ensure FoodHub remains lightyears ahead of the competition.',
    email: 'nbetonio470@gmail.com',
    img: tieImage,
    github: '#',
    linkedin: '#',
    icon: <FiTerminal className="text-[#FF9900] mb-2" size={20} />
  },
  {
    id: 'dev-2',
    name: 'Clark Cleo P. Sarabusques',
    role: 'Principal Backend Architect & Database Engineer',
    bio: 'The core engine of FoodHub. Clark architects massive-scale, highly secure database structures using Supabase and PostgreSQL. He writes the impenetrable Row-Level Security policies and ultra-low latency APIs that allow the platform to handle extreme volume without breaking a sweat.',
    email: 'clark@gmail.com',
    img: developerImage,
    github: '#',
    linkedin: '#',
    icon: <FiDatabase className="text-[#FF9900] mb-2" size={20} />
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function About() {
  return (
    <div className="section-shell py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-16"
      >
        <motion.div variants={itemVariants}>
          <SectionHeading title="About the Network" />
        </motion.div>

        {/* Network Stats Banner */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[#333] border border-[#333] rounded-sm overflow-hidden">
        {[
          { label: 'Uptime', value: '99.99%' },
          { label: 'Latency', value: '< 50ms' },
          { label: 'Security', value: 'Enterprise' },
          { label: 'Architecture', value: 'Serverless' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#141414] p-6 text-center hover:bg-[#1a1a1a] transition-colors">
            <div className="text-2xl font-black text-[#FF9900] mb-1">{stat.value}</div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#141414] p-8 border border-[#222] rounded-sm">
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
            Built for <span className="text-[#FF9900]">Scale.</span>
          </h2>
          <p className="text-gray-300 mb-6 text-sm leading-relaxed font-bold">
            We engineered FoodHub from the ground up to rival the performance of the internet's most heavily trafficked media sites. By abandoning bloated templates in favor of a raw, high-contrast, flat-UI aesthetic, we've delivered an application that doesn't just look iconic—it performs flawlessly under maximum load.
          </p>
          <div className="inline-flex items-center gap-2 text-[#FF9900] font-bold text-sm hover:text-black hover:bg-[#FF9900] transition-colors cursor-pointer border border-[#FF9900] px-4 py-2 rounded-sm">
            Read Engineering Docs
          </div>
        </div>
        
        <div className="bg-black border border-[#222] p-8 rounded-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="space-y-2">
              <div className="bg-[#FF9900] text-black text-[10px] font-black px-2 py-0.5 rounded-sm inline-block uppercase tracking-wider">System</div>
              <h4 className="text-white font-black text-lg leading-tight">Hyper-Optimized</h4>
              <p className="text-xs text-gray-400 font-bold">Zero bloat. Instant render times across all devices.</p>
           </div>
           <div className="space-y-2">
              <div className="bg-[#FF9900] text-black text-[10px] font-black px-2 py-0.5 rounded-sm inline-block uppercase tracking-wider">Security</div>
              <h4 className="text-white font-black text-lg leading-tight">Impenetrable</h4>
              <p className="text-xs text-gray-400 font-bold">Military-grade Row Level Security and encrypted sessions.</p>
           </div>
           <div className="space-y-2">
              <div className="bg-[#FF9900] text-black text-[10px] font-black px-2 py-0.5 rounded-sm inline-block uppercase tracking-wider">Design</div>
              <h4 className="text-white font-black text-lg leading-tight">Iconic UI</h4>
              <p className="text-xs text-gray-400 font-bold">High contrast, fully flat design tokens built for visual impact.</p>
           </div>
           <div className="space-y-2">
              <div className="bg-[#FF9900] text-black text-[10px] font-black px-2 py-0.5 rounded-sm inline-block uppercase tracking-wider">Database</div>
              <h4 className="text-white font-black text-lg leading-tight">Real-time</h4>
              <p className="text-xs text-gray-400 font-bold">Live synchronized inventory and instant order pipelines.</p>
           </div>
        </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SectionHeading title="The Architects" />
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {DEVELOPERS.map((d) => (
          <div key={d.id} className="bg-[#141414] border border-[#222] rounded-sm p-6 sm:p-8 flex flex-col xl:flex-row gap-8 hover:border-[#FF9900] transition-colors group">
            
            {/* Enhanced Image Container */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0 mx-auto xl:mx-0">
              {/* Offset shadow that animates on hover */}
              <div className="absolute inset-0 bg-[#FF9900] translate-x-2 translate-y-2 rounded-sm opacity-30 group-hover:translate-x-3 group-hover:translate-y-3 group-hover:opacity-70 group-hover:blur-sm transition-all duration-300"></div>
              
              <div className="relative w-full h-full bg-[#222] rounded-sm overflow-hidden border-2 border-[#FF9900] z-10">
                <img src={d.img} alt={d.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col text-center xl:text-left">
              <div className="flex justify-center xl:justify-start">
                {d.icon}
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#FF9900] transition-colors">{d.name}</h4>
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 mb-3">{d.role}</div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 font-bold flex-1">
                {d.bio}
              </p>
              
              <div className="flex items-center justify-center xl:justify-start gap-3 mt-auto">
                <a href={`mailto:${d.email}`} className="bg-[#222] hover:bg-[#FF9900] text-gray-300 hover:text-black p-2 rounded-sm transition-colors" title="Contact">
                  <FiMail size={16} />
                </a>
                <a href={d.github} className="bg-[#222] hover:bg-[#FF9900] text-gray-300 hover:text-black p-2 rounded-sm transition-colors" title="GitHub">
                  <FiGithub size={16} />
                </a>
                <a href={d.linkedin} className="bg-[#222] hover:bg-[#FF9900] text-gray-300 hover:text-black p-2 rounded-sm transition-colors" title="LinkedIn">
                  <FiLinkedin size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
        </motion.div>
      </motion.div>
    </div>
  );
}