export interface InstructionGroup {
  title?: string,
  description?: string,
  steps: TextListData[]
}

export interface ListItem {
  content: string
  subList?: string[]
}

export interface TextListData {
  title: string
  extendTitle?: string
  text: string
  description: string | null | undefined
  end_description: string | null | undefined
  list: string[]
  extendList?: ListItem[] | null
  image: string[]
  imageBottom: string[]
  bottom: boolean
  bottomHeight?: number | null
}

export interface CrochetTerm {
  alias: string
  full_text: string
  description: string
}

export interface Introduction {
  title: string
  text: string
}

export class PatternInfo {
  public template: string
  public title: string
  public subtitle: string
  public inspiration: string
  public skillLevel: string
  public estimatedTime: string
  public finishedSize: string
  public info: TextListData
  public note: TextListData
  public terms: CrochetTerm[]
  public techniques: TextListData
  public yarn: string
  public brands: string
  public materialsDesc: string
  public colors: TextListData
  public tools: TextListData
  public supplies: TextListData
  public instructions: InstructionGroup[]
  public finishingTips: TextListData
  public troubleshooting: TextListData
  public bonus_tips: TextListData
  public bonus_idea: TextListData
  public bonus_community: TextListData
  public cover_image: string
  public introduction: Introduction
  public lang: string

  constructor(
    template: string = 'simple',
    title: string = 'Jacket Chickie',
    subtitle: string = 'Subtitle for Jacket Chickie Crochet Pattern',
    inspiration: string = 'This adorable Jacket Chickie was inspired by the charm of well-dressed farm animals and the joy of creating something both cute and sophisticated. Perfect for gifting or adding character to any space!',
    skillLevel: string = 'Beginner',
    estimatedTime: string = '6-8 hours',
    finishedSize: string = 'Approximately 12cm tall (using 3.5mm hook)',
    info: TextListData = { title: '', bottom: false, image: [], imageBottom: [], description: null, end_description: null, text: 'A charming amigurumi chicken wearing a dapper jacket', list: ['Detailed body with textured stitching', 'Moveable wings/arms', 'Adorable feet', 'Stylish jacket with pocket details', 'Crown comb and tail feathers', 'Expressive safety eyes and beak'] },
    note: TextListData = { title: '', bottom: false, image: [], imageBottom: [], description: null, end_description: null, text: 'This pattern requires knowledge of', list: ['Basic amigurumi techniques', 'Color changes', 'Sewing pieces together', 'Basic embroidery for details'] },
    techniques: TextListData = { title: '', bottom: false, image: [], imageBottom: [], description: null, end_description: null, text: 'Special Techniques Used', list: ['Magic Ring: Adjustable starting circle', 'Invisible Decrease: Neat decreasing method', 'Color Changes: Clean color transition technique', 'Mattress Stitch: Invisible seaming method'] },
    yarn: string = 'Medium weight yarn (4/DK weight)',
    brands: string = 'YarnArt Jeans, Alize Cotton Gold, Red Heart Super Saver',
    colors: TextListData = { title: '', bottom: false, image: [], imageBottom: [], description: null, end_description: null, text: '', list: ['White (Main): 50g', 'Red: 25g', 'Watermelon Red: 15g', 'Navy Blue: 30g', 'Light Khaki: 20g' ] },
    tools: TextListData = { title: '', bottom: false, image: [], imageBottom: [], description: null, end_description: null, text: '', list: ['Crochet Hook: 3.5mm or 4.0mm (US E/4 or G/6)', 'Safety Eyes: 8mm black (1 pair)','Fiberfill Stuffing: Polyester fill', 'Tapestry Needle: For sewing and embroidery', 'Stitch Markers: For marking rounds', 'Scissors: Sharp fabric scissors', 'Pins: For positioning before sewing'] },
    supplies: TextListData = { title: '', bottom: false, image: [], imageBottom: [], description: null, end_description: null, text: '', list: ['Hot glue gun (alternative to sewing)', 'Scissors (sharp)', 'Pencil (for marking)', 'Stitch markers (optional)'] },
    instructions: InstructionGroup[] = [{ title: '', steps: [{ title: 'Body', bottom: false, image: [], imageBottom: [], end_description: null, description: "Start with making a round base. Work in continuous rounds without slip stitches. you can stuff the chick's body with fiberfill to achieve the desired appearance; there's no need to pack it too tightly—a bit of fluffiness is ideal", text: 'With white yarn', list: ['Rnd 1: 6sc in the MR(6)','Rnd 2: 6inc (12)'] }, { title: 'WINGS/HANDS', bottom: false, image: [], imageBottom: [], end_description: null, description: null, text: 'Make 2 - Using White yarn', list: ['Round 1: Magic ring, 6 sc in ring (6)', "Change to light khaki color", 'Round 2: 6inc (12)'] }] }],
    finishingTips: TextListData = { title: '', bottom: false, image: [], imageBottom: [], end_description: null, description: null, text: '', list: ['Weaving Ends: Always weave in ends securely, going through multiple stitches', 'Shaping: Block pieces if needed for consistent shape', 'Stuffing: Stuff firmly but not overly tight to maintain shape']},
    troubleshooting: TextListData = { title: '', bottom: false, image: [], imageBottom: [], end_description: null, description: null, text: '', list: ['Uneven Stitches: Maintain consistent tension throughout', 'Loose Parts: Double-check all sewing before final assembly']},
    bonus_tips: TextListData = { title: '', bottom: false, image: [], imageBottom: [], end_description: null, description: null, text: '', list: ['Tension Control: Keep consistent tension for even stitches', 'Safety Eye Placement: Mark positions before inserting', 'Color Changing: Carry yarn up inside for clean lines', 'Assembly Order: Complete all pieces before assembly' ]},
    bonus_idea: TextListData = { title: '', bottom: false, image: [], imageBottom: [], end_description: null, description: null, text: '', list: ['Try different color combinations', 'Add embroidered details', 'Create seasonal versions', 'Make mini versions as keychains']},
    bonus_community: TextListData = { title: '', bottom: false, image: [], imageBottom: [], end_description: null, description: null, text: '', list: [
      '📸 Share your work! We\'d love to see your finished projects. Review us on social media to inspire other makers.',
      '🧐 Found an issue? If you notice something in the pattern that doesn\'t look right, please send us a message on Etsy. We\'ll be happy to review it and provide updates or clarifications if needed.',
      '💬 Join the journey! Leaving a review with photos on Etsy helps other makers and supports our small shop. Every project—whether beginner or advanced—is a meaningful step in your crochet journey.',
      '🎁 Our thank-you: Occasionally, we may send a small shop coupon as a gesture of appreciation for especially helpful feedback or detailed reviews.'
    ]},
    cover_image: string = '',
    materialsDesc: string = '',
    terms: CrochetTerm[] = [],
    introduction: Introduction = { title: "🧵 Before You Start – Please Read!", text: "" },
    lang: string = 'en'
  ) {
    this.template = template
    this.title = title
    this.subtitle = subtitle
    this.inspiration = inspiration
    this.skillLevel = skillLevel
    this.estimatedTime = estimatedTime
    this.finishedSize = finishedSize
    this.info = info
    this.note = note
    this.terms = terms
    this.techniques = techniques
    this.yarn = yarn
    this.brands = brands
    this.colors = colors
    this.tools = tools
    this.supplies = supplies
    this.instructions = instructions
    this.finishingTips = finishingTips
    this.troubleshooting = troubleshooting
    this.bonus_tips = bonus_tips
    this.bonus_idea = bonus_idea
    this.bonus_community = bonus_community
    this.cover_image = cover_image
    this.materialsDesc = materialsDesc
    this.introduction = introduction
    this.lang = lang
  }

  toJSON() {
    return {
      template: this.template,
      title: this.title,
      subtitle: this.subtitle,
      inspiration: this.inspiration,
      skillLevel: this.skillLevel,
      estimatedTime: this.estimatedTime,
      finishedSize: this.finishedSize,
      info: this.info,
      note: this.note,
      terms: this.terms,
      techniques: this.techniques,
      yarn: this.yarn,
      brands: this.brands,
      colors: this.colors,
      tools: this.tools,
      supplies: this.supplies,
      instructions: this.instructions,
      finishingTips: this.finishingTips,
      troubleshooting: this.troubleshooting,
      bonus_tips: this.bonus_tips,
      bonus_idea: this.bonus_idea,
      bonus_community: this.bonus_community,
      cover_image: this.cover_image,
      materialsDesc: this.materialsDesc,
      introduction: this.introduction,
      lang: this.lang
    }
  }

  static fromJSON(data: any): PatternInfo {
    const isObj = (v: any) => typeof v === 'object' && v !== null

    const normalizeTextListData = (d: any): TextListData => {
      if (!isObj(d)) {
        return {
          title: '',
          text: typeof d === 'string' ? d : '',
          description: null,
          list: Array.isArray(d) ? d.map((x: any) => String(x)) : [],
          extendList: null,
          image: [],
          imageBottom: [],
          end_description: null,
          bottom: false,
          bottomHeight: null,
        }
      }
      
      // 处理 extendList 字段
      let extendList: ListItem[] | null = null
      if (Array.isArray(d.extendList)) {
        extendList = d.extendList.map((item: any) => ({
          content: typeof item === 'string' ? item : (item?.content || ''),
          subList: Array.isArray(item?.subList) ? item.subList : undefined
        }))
      }
      
      // 对象：安全读取各字段
      return {
        title: typeof d.title === 'string' ? d.title : '',
        text: typeof d.text === 'string' ? d.text : '',
        description: 'description' in d ? d.description : null,
        list: Array.isArray(d.list) ? d.list.map((x: any) => String(x)) : [],
        extendList: extendList,
        image: Array.isArray(d.image) ? d.image : [],
        end_description: d.end_description ?? null,
        bottom: d.bottom ?? false,
        imageBottom: Array.isArray(d.imageBottom) ? d.imageBottom : [],
        bottomHeight: typeof d.bottomHeight === 'number'
          ? d.bottomHeight
          : (d.bottomHeight === '' || d.bottomHeight == null ? null : Number(d.bottomHeight)),
      }
    }

    const normalizeInstructionArray = (arr: any): InstructionGroup[] => {
      if (!Array.isArray(arr)) return []
      
      // 已是 InstructionGroup 格式
      if (arr.length > 0 && arr[0] && typeof arr[0] === 'object' && 'steps' in arr[0]) {
        return arr.map((group: any) => ({
          title: typeof group.title === 'string' ? group.title : '',
          description: typeof group.description === 'string' ? group.description : '',
          steps: Array.isArray(group.steps) ? group.steps.map((item: any) => normalizeTextListData(item)) : []
        }))
      } else if (arr.length > 0 && Array.isArray(arr[0])) {
        // 旧二维数组格式 -> 包装成 InstructionGroup（无描述）
        return arr.map((subArr: any) => ({
          title: '',
          description: '',
          steps: Array.isArray(subArr) ? subArr.map((item: any) => normalizeTextListData(item)) : []
        }))
      } else {
        // 一维数组 -> 单个 InstructionGroup（无描述）
        return [{
          title: '',
          description: '',
          steps: arr.map((item: any) => normalizeTextListData(item))
        }]
      }
    }

    const normalizeTerm = (t: any) => ({
      alias: String(t?.alias ?? ''),
      full_text: String(t?.full_text ?? ''),
      description: String(t?.description ?? '')
    })

    // terms 兼容数组或对象字典
    let normalizedTerms = [] as CrochetTerm[]
    const srcTerms = data?.terms
    if (Array.isArray(srcTerms)) {
      normalizedTerms = srcTerms.map(normalizeTerm).filter(t => t.alias)
    } else if (isObj(srcTerms)) {
      normalizedTerms = Object.entries(srcTerms).map(([alias, v]: [string, any]) => {
        if (isObj(v)) return normalizeTerm({ alias, ...v })
        return normalizeTerm({ alias, full_text: v })
      }).filter(t => t.alias)
    }

    // 标量：传 undefined 触发构造器默认值
    const template = typeof data?.template === 'string' ? data.template : undefined
    const title = typeof data?.title === 'string' ? data.title : undefined
    const subtitle = typeof data?.subtitle === 'string' ? data.subtitle : undefined
    const inspiration = typeof data?.inspiration === 'string' ? data.inspiration : undefined
    const skillLevel = typeof data?.skillLevel === 'string' ? data.skillLevel : undefined
    const estimatedTime = typeof data?.estimatedTime === 'string' ? data.estimatedTime : undefined
    const finishedSize = typeof data?.finishedSize === 'string' ? data.finishedSize : undefined
    const yarn = typeof data?.yarn === 'string' ? data.yarn : undefined
    const brands = typeof data?.brands === 'string' ? data.brands : undefined

    // 结构化
    const info = normalizeTextListData(data?.info)
    const note = normalizeTextListData(data?.note)
    const techniques = normalizeTextListData(data?.techniques)
    const colors = normalizeTextListData(data?.colors)
    const tools = normalizeTextListData(data?.tools)
    const supplies = normalizeTextListData(data?.supplies)
    const instructions = normalizeInstructionArray(data?.instructions)
    const finishingTips = normalizeTextListData(data?.finishingTips)
    const troubleshooting = normalizeTextListData(data?.troubleshooting)
    const bonus_tips = normalizeTextListData(data?.bonus_tips)
    const bonus_idea = normalizeTextListData(data?.bonus_idea)
    const bonus_community = normalizeTextListData(data?.bonus_community)
    const cover_image = typeof data?.cover_image === 'string' ? data.cover_image : undefined
    const materialsDesc = typeof data?.materialsDesc === 'string' ? data.materialsDesc : undefined
    const introduction = data?.introduction ?? { title: '', text: '' }
    const lang = data?.lang === 'es' ? 'es' : 'en'

    // 严格按构造函数参数顺序传参
    return new PatternInfo(
      template,
      title,
      subtitle,
      inspiration,
      skillLevel,
      estimatedTime,
      finishedSize,
      info,
      note,
      techniques,  // 注意：techniques 在 terms 之前
      yarn,
      brands,
      colors,
      tools,
      supplies,
      instructions,
      finishingTips,
      troubleshooting,
      bonus_tips,
      bonus_idea,
      bonus_community,
      cover_image,
      materialsDesc,
      normalizedTerms,  // terms 参数应该在这个位置
      introduction,
      lang
    )
  }
}