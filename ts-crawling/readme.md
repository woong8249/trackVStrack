# Service Overview

이 서비스는 주요 국내 음원 스트리밍 플랫폼의 차트 데이터를 수집하고 통합하여 트랙 기준, 아티스트 기준으로 분류하고 통합하는 기능을 제공합니다.

- **데이터 수집** :   2013년부터 현재까지 데이터를 수집가능. 주간 Top 100 차트를 대상
- **지원 플랫폼** : `멜론(Melon)`, `지니(Genie)`, `벅스(Bugs)` 
- **향후 확장 계획** : `YT Music`, `Spotify` 등 국제 플랫폼을 포함시킬 계획을 고려 중입니다.

## Precondition

1. **env setting**
- `.env.development` => for fetching & inserting
- `.env.test` => for check test case

    ```
    # App
    VITE_APP_LEVEL=debug
    VITE_APP_ENV=dev
    VITE_APP_PORT=3000


    # Type ORM
    VITE_DB_HOST=
    VITE_DB_PORT=
    VITE_DB_USERNAME=
    VITE_DB_PASSWORD=
    VITE_DB_DATABASE=
    ```

2. **database setting**
- need mysql
- `root/src/typeorm/dataSource.ts` 아래와같이 변경해주세요
    ```ts
    const option = { ...typeorm, synchronize: true, entities: [Artist, Track] };
    ```


## Fetching data
1. **특정 기간의 데이터수집.**

    ```bash
    pnpm run fetch YYYY-MM-DD YYYY-MM-DD
    #pnpm 2012-12-31  2014-01-05 => 2013
    #pnpm 2014-01-06  2015-01-04 => 2014
    #pnpm 2015-01-05  2016-01-03 => 2015
    #pnpm 2016-01-04  2017-01-01 => 2016
    #pnpm 2017-01-02  2017-12-31 => 2017
    #pnpm 2018-01-01  2018-12-30 => 2018
    #pnpm 2018-12-31  2019-12-29 => 2019
    #pnpm 2019-12-30  2020-12-27 => 2020
    #pnpm 2020-12-28  2021-12-26 => 2021
    #pnpm 2021-12-27  2022-12-25 => 2022
    #pnpm 2022-12-26  2023-12-31 => 2023
    ```
 - 플랫폼별 차트데이터 크롤링
 - 데이터 저장 형식: 
    - `root/data/YYYYMMDD-YYYYMMDD-w/melon.json`
    - `root/data/YYYYMMDD-YYYYMMDD-w/genie.json`
    - `root/data/YYYYMMDD-YYYYMMDD-w/bugs.json`
- 한해 평균 차트인한 트랙수는 900~1000개 가까이됩니다(개 많습니다).  때문에 `연`단위로 수집할것을 권장합니다.

<br>

2. **필수데이터 확인**
- 데이터수집중 필수항목이 빠진경우 log파일을 통해 확인할 수 있습니다.
- `lyrics`, `artistImage`, `trackImage는` 통합을위한 필수로직이기에 빠진부분은 반드시 검수를 거쳐야합니다.

## Insert DB
1. **특정 기간의 데이터 DB 추가**
- `root/data/YYYYMMDD-YYYYMMDD-w`를 대상으로 합니다.
    ``` bash
    pnpm run insert YYYY-MM-DD YYYY-MM-DD
    ```



2. **모든데이터 DB추가**
-  `root/data`를 대상으로 합니다.
    ``` bash
    pnpm run insertAll
    ```





