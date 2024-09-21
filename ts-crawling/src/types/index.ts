export type ChartType ='m' |'w'|'n'
export type PlatformName ='melon' | 'genie' | 'bugs'

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
export type TrackAddInfo ={
    releaseDate:Date
    trackImage:string
    lyrics: string
}

export type Artist ={
    artistName:string
    artistKeyword:string
    artistID: string
}
export type ArtistAddInfo ={
    artistImage:string
    debut: string
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

export type FetchWeeklyChartResult ={
    platform: PlatformName
    chartScope:WeeklyChartScope
    chartDetails:ChartDetail[]
}

export type FetchMonthlyChartResult ={
  platform: PlatformName
  chartScope:MonthlyChartScope
  chartDetails:ChartDetail[]
}

export interface PlatformModule {
    readonly platformName:PlatformName
    fetchChart(year:string, month:string, day:string, chartType:ChartType):Promise<FetchMonthlyChartResult|FetchWeeklyChartResult>
    fetchChartsInParallel(startDate:Date, endDate:Date, chartType:ChartType, chunkSize :number):Promise<(FetchMonthlyChartResult|FetchWeeklyChartResult)[]>
    fetchAddInfoOfTrack(trackID:string):Promise<TrackAddInfo>
    fetchAddInfoOArtist(artistID:string): Promise<ArtistAddInfo>
}
