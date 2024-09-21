export type ChartType ='m' |'w'|'n'

export type WeekOfMonth ={
    year: string;
    month: string;
    week: string;
  }

export type Track ={
    rank:string
    title:string
    titleKeyword:string
    trackID:string
}
export type Artist ={
    artistName:string
    artistKeyword:string
    artistID: string
}

export type ChartDetail = Track &{artists:Artist[]}

export type WeeklyChartScope ={
    startDate:Date
    endDate :Date
    weekOfMonth:WeekOfMonth
    chartType:ChartType
}

export type MonthlyChartScope ={
    date :Date
    chartType:ChartType
}
