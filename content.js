// Website content. Update both zh and en when editing bilingual text.
window.PROFILE = {
  email: 'tr2023211281@163.com',
  updated: '2026.09',
  education: [
    {period:'2027 — 2029', school:{zh:'清华大学',en:'Tsinghua University'}, unit:{zh:'深圳国际研究生院',en:'Shenzhen International Graduate School'}, degree:{zh:'大数据技术与工程 · 硕士',en:'M.Eng. in Big Data Technology and Engineering'}, note:{zh:'推免录取，预计 2027 年入学',en:'Admitted through recommendation; expected entry in 2027'}, initial:'THU', future:true},
    {period:'2023 — 2027', school:{zh:'哈尔滨工业大学（威海）',en:'Harbin Institute of Technology, Weihai'}, unit:{zh:'船舶与海洋工程',en:'Naval Architecture and Ocean Engineering'}, degree:{zh:'工学学士（在读）',en:'B.Eng. candidate'}, note:{zh:'综合成绩 93.59/100 · 专业排名 3/85',en:'Overall score 93.59/100 · Ranked 3 of 85'}, initial:'HIT'}
  ],
  research: [
    {
      label:{zh:'01 / 机器人微操作',en:'01 / ROBOTIC MICROMANIPULATION'},period:'2026',image:'assets/microvla.png',
      imageAlt:{zh:'MicroVLA 论文中的系统框架与显微操作实验总览',en:'MicroVLA system overview and robotic micromanipulation experiments from the paper'},
      title:{zh:'在微观世界，连接感知与行动',en:'Perception meets action, at the microscale.'},
      summary:{zh:'MicroVLA 与 MG-VTLA 探索视觉、语言和触觉如何参与微颗粒导航与抓取，让机器人在显微环境中理解物理风险与接触反馈。两项合作工作均获 IROS 2026 录用。',en:'MicroVLA and MG-VTLA bring vision, language, and tactile feedback to microparticle navigation and grasping. These collaborative works explore physical risk and contact-aware action in microscopic environments; both are accepted at IROS 2026.'},
      result:{zh:'实机评测：MicroVLA 运输成功率 79%；MG-VTLA 在 500 次评测中的抓取成功率为 76.2%。',en:'Real-robot evaluations: 79% transport success with MicroVLA; 76.2% grasping success across 500 trials with MG-VTLA.'},
      detail:{zh:'MicroVLA 以物理风险图作为训练期的辅助监督，并通过 LoRA 微调联合学习动作与物理表征。MG-VTLA 将压电自感知信号与触觉—语言对比学习结合，采用五步预测、单步执行的闭环策略。两者分别较 π0-FAST 提高 4.0 和 4.7 个百分点。',en:'MicroVLA uses physical risk maps as auxiliary supervision during LoRA fine-tuning. MG-VTLA combines piezoelectric self-sensing with tactile–language contrastive learning, using five-step prediction and single-step execution. Their success rates exceed π0-FAST by 4.0 and 4.7 percentage points, respectively.'},
      contribution:{zh:'在这两项合作研究中参与 VLA 框架搭建、基线对比测试与论文撰写；分别为第四、六作者。',en:'Across the two collaborations: VLA framework development, baseline evaluation, and manuscript writing. Fourth author on MicroVLA; sixth author on MG-VTLA.'}
    },
    {
      label:{zh:'02 / 多智能体系统',en:'02 / MULTI-AGENT SYSTEMS'},period:'2025 — 2026',image:'assets/swarm.png',
      imageAlt:{zh:'多无人机集群避障仿真，包括编队轨迹、跟踪误差和控制量',en:'Quadrotor swarm simulation showing formation trajectories, tracking error, and control signals'},
      title:{zh:'让集群协调地穿越复杂环境',en:'Many agents. One coordinated motion.'},
      summary:{zh:'将分层避碰规划与分布式滑模控制连接起来，在多无人机协同任务中同时考虑轨迹安全、编队形变与控制可跟踪性。',en:'Connecting hierarchical collision avoidance with distributed sliding mode control, so that swarm trajectories account for safety, formation deformation, and tracking feasibility together.'},
      result:{zh:'16 机、100 次 MATLAB 规划器对照仿真：成功率 99%，跟踪 RMSE 0.117 m。',en:'16 UAVs, 100 MATLAB planner-comparison simulations: 99% success and 0.117 m tracking RMSE.'},
      detail:{zh:'通过动态扩展处理位置与偏航的混合相对阶，耦合弹性编队、五次 B 样条优化与安全走廊。仿真平均重规划耗时 28.67 ms，并开展噪声、时延与模块消融分析。IEEE TASE 当前状态为条件接收。',en:'Dynamic extension handles mixed relative degrees in position and yaw. Elastic formations, quintic B-splines, and safe corridors are coupled with inter-agent separation constraints. Mean replanning time is 28.67 ms in simulation, with noise, delay, and ablation studies. The IEEE TASE manuscript is conditionally accepted.'},
      contribution:{zh:'第一作者；围绕分层规划与分布式控制开展研究。',en:'First author; research on hierarchical planning and distributed control.'}
    },
    {
      label:{zh:'03 / 海洋机器人',en:'03 / MARINE ROBOTICS'},period:'2026',image:'assets/ship-prototype.png',
      imageAlt:{zh:'船赛说明书中的水面移动平台实物，在实验水池内搭载太阳能板及油污处理管路',en:'Physical surface-vessel prototype with solar panels and oil-treatment piping in a test tank'},
      title:{zh:'从控制模型，走向真实水面',en:'From a model to the water.'},
      summary:{zh:'参与海空协同溢油探治系统项目，将 AI 感知、集群协同与水面移动平台相结合。图为参赛作品说明书中的实验样机。',en:'A collaborative air–sea oil-spill detection and treatment project, bringing together AI perception, swarm coordination, and a mobile surface platform. The photograph shows the physical prototype documented in our competition project.'},
      result:{zh:'第十五届全国海洋航行器设计与制作大赛 · 国家特等奖。',en:'National Grand Prize · 15th China Marine Vehicle Design and Construction Contest.'},
      detail:{zh:'作品“瀚海群清”围绕基于 AI 感知与分布式集群算法的生物质碳基吸附海洋溢油探治系统展开。相关竞赛工作还获全国大学生交通运输科技大赛一等奖。',en:'The project “Hanhai Qunqing” combines AI perception and distributed swarm algorithms with biomass-derived carbon adsorption for marine oil-spill response. Related competition work also received a national First Prize in transportation science and technology.'},
      contribution:{zh:'参赛团队成员；研究背景为海洋工程、自主系统与控制。',en:'Competition team member, with a background in marine engineering, autonomous systems, and control.'}
    }
  ],
  publications: [
    {
      venue:'IEEE TASE · 2026',status:'conditional',
      title:'Dynamic Extension-Based Distributed Sliding Mode Control with Hierarchical Collision Avoidance for Quadrotor Swarms',
      authors:['Rui Tang','Huihui Song','Xinpo Lin','Yue Zhao','Zhuang Liu','Xiang Gao','Jianxing Liu'],
      note:{zh:'第一作者 · IEEE Transactions on Automation Science and Engineering；条件接收，尚非正式发表。',en:'First author · IEEE Transactions on Automation Science and Engineering. Conditionally accepted; not yet published.'}
    },
    {
      venue:'IROS · 2026',status:'accepted',
      title:'MicroVLA: A Vision-Language-Action Framework for Microrobotic Navigation Considering Inter-Particle Micro-Force Fields',
      authors:['Haohan Min','Zexin Song','Zhetong Zhang','Rui Tang','Hengchang Zhang','Haoyuan Xue','Jie Xu','Feng Feng','Pingfa Feng'],
      note:{zh:'第四作者 · IEEE/RSJ International Conference on Intelligent Robots and Systems。',en:'Fourth author · IEEE/RSJ International Conference on Intelligent Robots and Systems.'},
      video:'assets/microvla-demo.mp4'
    },
    {
      venue:'IROS · 2026',status:'accepted',
      title:'MG-VTLA: A Vision–Tactile–Language–Action Framework for Contact-Robust Robotic Micro-Grasping',
      authors:['Jie Xu','Haohan Min','Hengchang Zhang','Zhetong Zhang','Zexin Song','Rui Tang','Jingwei Lv','Haoyuan Xue','Feng Feng','Pingfa Feng'],
      note:{zh:'第六作者 · IEEE/RSJ International Conference on Intelligent Robots and Systems。',en:'Sixth author · IEEE/RSJ International Conference on Intelligent Robots and Systems.'},
      video:'assets/mg-vtla-demo.mp4'
    },
    {
      venue:'IEEE TCAS-II · 2026',status:'published',
      title:'Prescribed-Time Synchronization of Second-Order Kuramoto Oscillators',
      authors:['Rui Tang','Huihui Song','Xinpo Lin','Shuaihao Jiang','Xiang Gao','Zhuang Liu','Jianxing Liu'],
      note:{zh:'第一作者 · IEEE Transactions on Circuits and Systems II: Express Briefs。',en:'First author · IEEE Transactions on Circuits and Systems II: Express Briefs.'},
      doi:'10.1109/TCSII.2026.3664824'
    },
    {
      venue:'FASTA · 2026',status:'published',
      title:'Robust Fully Actuated Control for Underactuated USVs via Dynamic Extension and Neural Compensation',
      authors:['Rui Tang','Xinpo Lin','Zhiyuan Zhao','Mu Tong','Bowen Yao','Zhuang Liu','Yabin Gao','Huihui Song'],
      note:{zh:'第一作者 · 5th Conference on Fully Actuated System Theory and Applications。',en:'First author · 5th Conference on Fully Actuated System Theory and Applications.'},
      doi:'10.1109/FASTA70174.2026.11549191'
    }
  ],
  awards: [
    {year:'2026',title:{zh:'第十五届全国海洋航行器设计与制作大赛',en:'15th China Marine Vehicle Design and Construction Contest'},level:{zh:'国家特等奖',en:'National Grand Prize'},featured:true,proof:'assets/awards/marine-design.jpg'},
    {year:'2025',title:{zh:'第十六届全国大学生数学竞赛决赛',en:'16th Chinese Mathematics Competition · National Final'},level:{zh:'国家一等奖 · 非数学 A 类',en:'National First Prize · Non-mathematics, Category A'},note:{zh:'全国第 35 名（据个人简历）',en:'35th nationally (as recorded in my CV)'},featured:true,proof:'assets/awards/mathematics-16.pdf'},
    {year:'2026',title:{zh:'第二十一届全国大学生交通运输科技大赛',en:'21st National College Transportation Science and Technology Competition'},level:{zh:'国家一等奖',en:'National First Prize'},featured:true,proof:'assets/awards/transport-science.pdf'},
    {year:'2026',title:{zh:'第十七届过程装备实践与创新赛',en:'17th Process Equipment Practice and Innovation Competition'},level:{zh:'全国决赛一等奖',en:'First Prize · National Final'},featured:true,proof:'assets/awards/process-equipment.jpg',proofKind:'announcement'},
    {year:'2026',title:{zh:'第十七届全国大学生数学竞赛决赛',en:'17th Chinese Mathematics Competition · National Final'},level:{zh:'国家三等奖 · 数学类高年级',en:'National Third Prize · Senior mathematics division'},proof:'assets/awards/mathematics-17-final.pdf'},
    {year:'2025',title:{zh:'第十七届全国大学生数学竞赛',en:'17th Chinese Mathematics Competition · Regional Round'},level:{zh:'黑龙江省一等奖 · 数学 A 类',en:'First Prize, Heilongjiang · Mathematics, Category A'},note:{zh:'全省第 4 名（据个人简历）',en:'4th in the province (as recorded in my CV)'},proof:'assets/awards/mathematics-17-regional.pdf'},
    {year:'2024',title:{zh:'全国大学生数学建模竞赛',en:'Contemporary Undergraduate Mathematical Contest in Modeling'},level:{zh:'山东赛区一等奖',en:'First Prize · Shandong Division'},proof:'assets/awards/modeling.pdf'},
    {year:'2026',title:{zh:'山东省大学生节能减排社会实践与科技大赛',en:'Shandong College Energy Conservation and Emission Reduction Competition'},level:{zh:'省一等奖',en:'Provincial First Prize'},proof:'assets/awards/energy-saving.jpg'},
    {year:'2024',title:{zh:'第十五届全国大学生数学竞赛决赛',en:'15th Chinese Mathematics Competition · National Final'},level:{zh:'国家三等奖 · 非数学类',en:'National Third Prize · Non-mathematics division'},proof:'assets/awards/mathematics-15-final.pdf'}
  ]
};
