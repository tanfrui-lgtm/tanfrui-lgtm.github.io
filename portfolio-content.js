window.PORTFOLIO = {
  copy: {
    en: {
      nav:['Work','Papers','Moments','About'],
      mission:'I explore how physical models and learning turn perception into reliable action.',
      opening:'From microscopic interactions to coordinated motion, my work connects robotics, learning, and control.',
      explore:'Explore my work',research:'Selected work',researchEn:'',
      researchLead:'Three perspectives on intelligence in the physical world.',
      problem:'The question',approach:'The idea',details:'Inside the work',
      related:'Read the research',watch:'Watch the experiment',
      moments:'Beyond the paper',momentsEn:'',momentsLead:'A few moments from FASTA 2026.',
      talkTitle:'Taking an idea into conversation.',
      talkText:'At FASTA 2026, I gave an oral presentation on robust control for underactuated surface vessels, sharing our work on dynamic extension and neural compensation.',
      talkLink:'Explore the paper',aboutTitle:'A little about me',aboutEn:'',
      aboutText:'My path began in naval architecture and ocean engineering at HIT, Weihai. It has taken me from marine systems and control theory to robotic micromanipulation and learning.',
      aboutNext:'Next, I will join the master’s program in Big Data Technology and Engineering at Tsinghua Shenzhen International Graduate School in 2027.',
      background:'Education & background',awards:'Selected honors',awardsEn:'',
      awardsLead:'A few milestones along the way.',allHonors:'Explore all honors',
      papersTitle:'Papers, methods & experiments.',papersText:'A closer look at the ideas behind the work, from robotic manipulation to coordinated control.',
      allPapers:'Explore the papers',publications:'Papers & research',
      contactTitle:'Let’s exchange ideas.',contactText:'Robotics, learning, control — or an interesting question that connects them.',
      backHome:'Back to the homepage',archiveIntro:'Research papers, representative figures, and demonstrations.',
      honorsTitle:'Honors & awards',honorsIntro:'Competition work and academic milestones.',
      homeTitle:'Rui Tang · Robotics, learning & control'
    },
    zh: {
      nav:['研究','论文','现场','关于'],
      mission:'我关注物理模型与学习方法如何将感知转化为可靠的行动。',
      opening:'从微观世界中的相互作用，到集群的协调运动，我在机器人、学习与控制之间探索。',
      explore:'走进我的研究',research:'精选研究',researchEn:'Selected work',
      researchLead:'从三个视角，探索物理世界中的智能。',
      problem:'关注的问题',approach:'关键想法',details:'走近这项研究',
      related:'阅读相关研究',watch:'观看实验演示',
      moments:'研究现场',momentsEn:'Beyond the paper',momentsLead:'FASTA 2026 的几个片段。',
      talkTitle:'让想法，走进交流。',
      talkText:'在 FASTA 2026，我围绕欠驱动无人艇的鲁棒控制作口头报告，介绍动态扩展与神经补偿方法。',
      talkLink:'阅读这项研究',aboutTitle:'关于我',aboutEn:'A little about me',
      aboutText:'我的研究起点是哈尔滨工业大学（威海）的船舶与海洋工程。从海洋系统与控制理论出发，我逐步走向机器人微操作与学习方法。',
      aboutNext:'下一站是清华大学深圳国际研究生院。我已获大数据技术与工程硕士推免录取，将于 2027 年入学。',
      background:'教育背景',awards:'荣誉片段',awardsEn:'Selected honors',
      awardsLead:'一路走来，几个值得记住的时刻。',allHonors:'查看全部荣誉',
      papersTitle:'论文与研究',papersText:'从机器人操作到协同控制，进一步了解每项工作的思路、方法与实验。',
      allPapers:'浏览论文',publications:'论文与研究',
      contactTitle:'保持联系',contactText:'聊聊机器人、学习、控制，或连接它们的一个有趣问题。',
      backHome:'返回主页',archiveIntro:'论文、代表性配图与实验演示。',
      honorsTitle:'荣誉与奖励',honorsIntro:'竞赛实践与学术成长中的一些记录。',
      homeTitle:'唐睿 · 机器人、学习与控制'
    }
  },
  works: [
    {
      id:'micromanipulation',paper:'microvla',video:'assets/microvla-demo.mp4',
      question:{zh:'在显微镜下，机器人怎样理解一次轻微的接触？',en:'How does a robot make sense of a delicate interaction under a microscope?'},
      idea:{zh:'把视觉、语言与物理反馈带入动作生成，探索微颗粒的导航、运输与抓取。',en:'Bring vision, language, and physical feedback into action generation for navigating, transporting, and grasping microparticles.'},
      takeaway:{zh:'MicroVLA 与 MG-VTLA · 从感知到微操作',en:'MicroVLA & MG-VTLA · From perception to micromanipulation'}
    },
    {
      id:'swarm',paper:'swarm',
      question:{zh:'当通道变窄，一整个集群如何一起穿过？',en:'When the passage narrows, how can a whole swarm find its way through?'},
      idea:{zh:'让编队形状随环境变化，并将避障规划与控制约束放在一起考虑。',en:'Let the formation adapt to its surroundings, while planning with both collision avoidance and tracking constraints in mind.'},
      takeaway:{zh:'弹性编队与分布式控制 · 16 机仿真',en:'Elastic formations & distributed control · 16-UAV simulations'}
    },
    {
      id:'marine',paper:'usv',
      question:{zh:'怎样让感知与协同，成为水面上的实际行动？',en:'How can perception and coordination become action on the water?'},
      idea:{zh:'“瀚海群清”将 AI 感知、集群算法与吸附材料相结合，探索海空协同的溢油探测与处理。',en:'Hanhai Qunqing brings AI perception, swarm algorithms, and adsorption materials together for air–sea oil-spill detection and response.'},
      takeaway:{zh:'海洋机器人 · 从控制模型到实验样机',en:'Marine robotics · From control models to a physical prototype'}
    }
  ],
  paperIds:['swarm','microvla','mg-vtla','kuramoto','usv','lcss','atlas-sr'],
  paperSummaries:[
    {zh:'让集群在穿越障碍时调整队形，并生成满足控制约束的安全轨迹。',en:'Adapt a swarm’s formation through obstacles while generating safe, controller-compatible trajectories.'},
    {zh:'将微力场感知融入视觉–语言–动作模型，用于机器人微颗粒导航。',en:'Bring micro-force-field awareness into a vision–language–action model for robotic microparticle navigation.'},
    {zh:'将触觉、视觉与语言结合，帮助机器人完成对接触敏感的微抓取。',en:'Combine tactile, visual, and language signals for contact-aware robotic micro-grasping.'},
    {zh:'研究二阶 Kuramoto 振子网络如何在预先指定的时间内实现同步。',en:'Study how second-order Kuramoto oscillator networks can synchronize within a prescribed time.'},
    {zh:'结合动态扩展与神经补偿，改善欠驱动无人艇的鲁棒轨迹跟踪。',en:'Combine dynamic extension and neural compensation for robust trajectory tracking of underactuated surface vessels.'},
    null,null
  ]
};
