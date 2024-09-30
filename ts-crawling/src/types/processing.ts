import type {
  Artist,
  ArtistAddInfo,
  ChartDetail, DailyChartScope, MonthlyChartScope, TrackAddInfo, WeeklyChartScope,
} from './fetch';

export type Platform =Omit<ChartDetail, 'rank'>&{
        dailyChartScope?:(DailyChartScope&{rank:string})[]
        weeklyChartScope:(WeeklyChartScope&{rank:string})[]
        monthlyChartScope?:(MonthlyChartScope&{rank:string})[]
       }

export type TrackFormatWithoutAddInfo ={
    trackKeyword: string
    melon?: Platform
    genie?: Platform
    bugs?:Platform
  }
export type PlatformWhitAddInfo =Omit<Platform, 'artists'> & {artists:(Artist&ArtistAddInfo)[]} &TrackAddInfo

export type TrackFormatWithAddInfo ={
    trackKeyword: string
    melon?: PlatformWhitAddInfo
    genie?: PlatformWhitAddInfo
    bugs?:PlatformWhitAddInfo
  }
export type ArtistWithAddInfo =Artist&ArtistAddInfo

export type ArtistFormatWithAddInfo ={
    artistKeyword: string
    melon?: ArtistWithAddInfo
    genie?: ArtistWithAddInfo
    bugs?:ArtistWithAddInfo
  }
