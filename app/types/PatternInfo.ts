import type { List } from "postcss/lib/list"

export interface TextListData {
  title: string
  text: string
  description: string | null | undefined  // 允许为 null 或 undefined
  list: string[]
}

export interface CrochetTerm {
  alias: string
  full_text: string
  description: string
}

export class PatternInfo {
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
  public colors: TextListData
  public tools: TextListData
  public supplies: TextListData
  public instructions: TextListData[]
  public finishingTips: TextListData
  public troubleshooting: TextListData
  public bonus_tips: TextListData
  public bonus_idea: TextListData
  public bonus_community: TextListData
  public cover_image: string

  constructor(
    title: string = 'Jacket Chickie',
    subtitle: string = 'Subtitle for Jacket Chickie Crochet Pattern',
    inspiration: string = 'This adorable Jacket Chickie was inspired by the charm of well-dressed farm animals and the joy of creating something both cute and sophisticated. Perfect for gifting or adding character to any space!',
    skillLevel: string = 'Beginner',
    estimatedTime: string = '6-8 hours',
    finishedSize: string = 'Approximately 12cm tall (using 3.5mm hook)',
    info: TextListData = { title: '', description: null, text: 'A charming amigurumi chicken wearing a dapper jacket', list: ['Detailed body with textured stitching', 'Moveable wings/arms', 'Adorable feet', 'Stylish jacket with pocket details', 'Crown comb and tail feathers', 'Expressive safety eyes and beak'] },
    note: TextListData = { title: '', description: null, text: 'This pattern requires knowledge of', list: ['Basic amigurumi techniques', 'Color changes', 'Sewing pieces together', 'Basic embroidery for details'] },
    techniques: TextListData = { title: '', description: null, text: '', list: ['Magic Ring: Adjustable starting circle', 'Invisible Decrease: Neat decreasing method', 'Color Changes: Clean color transition technique', 'Mattress Stitch: Invisible seaming method'] },
    yarn: string = 'Medium weight yarn (4/DK weight)',
    brands: string = 'YarnArt Jeans, Alize Cotton Gold, Red Heart Super Saver',
    colors: TextListData = { title: '', description: null, text: '', list: ['White (Main): 50g', 'Red: 25g', 'Watermelon Red: 15g', 'Navy Blue: 30g', 'Light Khaki: 20g' ] },
    tools: TextListData = { title: '', description: null, text: '', list: ['Crochet Hook: 3.5mm or 4.0mm (US E/4 or G/6)', 'Safety Eyes: 8mm black (1 pair)','Fiberfill Stuffing: Polyester fill', 'Tapestry Needle: For sewing and embroidery', 'Stitch Markers: For marking rounds', 'Scissors: Sharp fabric scissors', 'Pins: For positioning before sewing'] },
    supplies: TextListData = { title: '', description: null, text: '', list: ['Hot glue gun (alternative to sewing)', 'Scissors (sharp)', 'Pencil (for marking)', 'Stitch markers (optional)'] },
    instructions: TextListData[] = [{ title: 'Body', description: "Start with making a round base. Work in continuous rounds without slip stitches. you can stuff the chick's body with fiberfill to achieve the desired appearance; there's no need to pack it too tightly—a bit of fluffiness is ideal", text: 'With white yarn', list: ['Rnd 1: 6sc in the MR(6)','Rnd 2: 6inc (12)'] }, { title: 'WINGS/HANDS', description: null, text: 'Make 2 - Using White yarn', list: ['Round 1: Magic ring, 6 sc in ring (6)', "Change to light khaki color", 'Round 2: 6inc (12)'] }],
    finishingTips: TextListData = { title: '', description: null, text: '', list: ['Weaving Ends: Always weave in ends securely, going through multiple stitches', 'Shaping: Block pieces if needed for consistent shape', 'Stuffing: Stuff firmly but not overly tight to maintain shape']},
    troubleshooting: TextListData = { title: '', description: null, text: '', list: ['Uneven Stitches: Maintain consistent tension throughout', 'Loose Parts: Double-check all sewing before final assembly']},
    bonus_tips: TextListData = { title: '', description: null, text: '', list: ['Tension Control: Keep consistent tension for even stitches', 'Safety Eye Placement: Mark positions before inserting', 'Color Changing: Carry yarn up inside for clean lines', 'Assembly Order: Complete all pieces before assembly' ]},
    bonus_idea: TextListData = { title: '', description: null, text: '', list: ['Try different color combinations', 'Add embroidered details', 'Create seasonal versions', 'Make mini versions as keychains']},
    bonus_community: TextListData = { title: '', description: null, text: '', list: ['Tag us in your finished projects! We love seeing your creations!', 'Use hashtag: #JacketChickiePattern']},
    cover_image: string = '',
    terms: CrochetTerm[] = [
      { alias: 'ch', full_text: 'chain', description: 'Basic foundation stitch' },
      { alias: 'sc', full_text: 'single crochet', description: 'Basic crochet stitch' },
      { alias: 'dc', full_text: 'double crochet', description: 'Taller crochet stitch' },
      { alias: 'tc', full_text: 'treble crochet', description: 'Tallest basic stitch' },
      { alias: 'sl st', full_text: 'slip stitch', description: 'Joining/finishing stitch' },
      { alias: 'inc', full_text: 'increase', description: '2 sc in same stitch' },
      { alias: 'dec', full_text: 'decrease', description: 'sc2tog (single crochet 2 together)' },
      { alias: 'BLO', full_text: 'back loop only', description: 'Crochet through back loop only' },
      { alias: 'FLO', full_text: 'front loop only', description: 'Crochet through front loop only' },
      { alias: 'rnd', full_text: 'round', description: 'Working in continuous rounds' },
      { alias: 'st/sts', full_text: 'stitch/stitches', description: 'Individual crochet units' }
    ]
  ) {
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
  }

  // 导出为 JSON
  toJSON() {
    return {
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
      cover_image: this.cover_image
    }
  }

  // 从 JSON 导入（类型归一化与参数顺序修正）
  static fromJSON(data: any): PatternInfo {
    const isObj = (v: any) => typeof v === 'object' && v !== null

    const normalizeTextListData = (d: any): TextListData => {
      if (!isObj(d)) {
        // 非对象：字符串 => 作为 text；数组 => 作为 list；其余 => 使用默认空结构
        return {
          title: '',
          text: typeof d === 'string' ? d : '',
          description: null,
          list: Array.isArray(d) ? d.map((x: any) => String(x)) : []
        }
      }
      // 对象：安全读取各字段
      return {
        title: typeof d.title === 'string' ? d.title : '',
        text: typeof d.text === 'string' ? d.text : '',
        description: 'description' in d ? d.description : null,
        list: Array.isArray(d.list) ? d.list.map((x: any) => String(x)) : []
      }
    }

    const normalizeInstructionArray = (arr: any): TextListData[] => {
      if (!Array.isArray(arr)) return []
      return arr.map((item: any) => normalizeTextListData(item))
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

    // 严格按构造函数参数顺序传参
    return new PatternInfo(
      title,
      subtitle,
      inspiration,
      skillLevel,
      estimatedTime,
      finishedSize,
      info,
      note,
      techniques,
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
      normalizedTerms
      
    )
  }
}