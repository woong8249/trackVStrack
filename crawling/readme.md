# Service Overview

이 서비스는 주요 국내 음원 스트리밍 플랫폼의 차트 데이터를 수집하고 통합하여 트랙 기준으로 분류하는 기능을 제공합니다.

- **데이터 수집** :  2018년 12월 31일부터 현재까지의 주간 차트 데이터를 수집완료.
- **지원 플랫폼** : 현재는 멜론(Melon), 지니(Genie), 벅스(Bugs) 등 국내 플랫폼의 주간 Top 100 차트를 대상으로 합니다.
- **향후 확장 계획** : YT Music, Spotify, Apple Music, Billboard 등 국제 플랫폼을 포함시킬 계획을 고려 중입니다.

## DB migration

```bash
pnpm run migrate
```

수집된 데이터를 한번에 데이터베이스로 이전하거나 데이터 수집 후 데이터베이스 스키마를 조정해야 할 경우 다음 명령어를 사용합니다:

## Collecting and updating data

주간 차트 데이터는 매주 업데이트됩니다. 다양한 플랫폼에서 트랙과 아티스트를 통합하는 복잡성으로 인해 전체 자동화는 가능하지만, 반드시 수동 검증 과정이 필요합니다.
때문에 작업을 단계별로 구성하여 로컬에서 실행후 Remote환경에 `sync`시키는 흐름을 생각하고 만들었습니다.

1. **특정 기간의 데이터수집.**

    ```bash
    # example
    pnpm run fetch YYYY-MM-DD YYYY-MM-DD
    ```

    - 플랫폼별 차트데이터 크롤링
    - 차트를 트랙 기준으로 재분류하고 중복 트랙을 통합.
    - 추가 트랙 정보 수집. (`thumbnail`, `releaseDate`, `lyrics` …)
    - 데이터 저장 형식: `src/integrate/domestic/dataBeforeIntegration/YYYYMMDD-YYYYMMDD-w.json`
2. **파일 검수**
    - 19금 트랙의 경우 가사 정보가 없을 수 있음.
    - `genie`플랫폼에서 아티스트가 복인경우 null일수 있음. 수동 조정 필요.
3. **플랫폼 통합**

    ```bash
    # example
    pnpm run integrate YYYY-MM-DD YYYY-MM-DD
    ```

    - 각기 다른 플랫폼의 `track`, `artist` 통합
    - `src/integrate/domestic/dataBeforeIntegration/YYYYMMDD-YYYYMMDD-w.json`을 읽어들여 작업을 진행함
    - `src/integrate/domestic/dataAfterIntegration/YYYYMMDD-YYYYMMDD-w.json`와 같이 저장됨
4. **파일 검수**
    1. `trackKey`의 `subFix`가 0 이상이며 `src/integrate/domestic/verifiedTracks.json`에 포함되지 않은경우
    `src/integrate/domestic/startDate-endDate-chartType-notVerified.json` 의 형태로 파일이 생성됩니다.<br>
    검수를 거친 trackKey는 `src/integrate/domestic/verifiedTracks.json`에 추가해야 합니다.
    <br>
    <br>
    2. 같은 트랙임이 분명해보이는데 다른 트랙으로 분류된경우 확인해야합니다.
    `artistTitle` ,`trackTtilte`  이 정규표현식을 거쳐도 묶을수 없는 경우 `src/integrate/domestic/artistException.json`,`src/integrate/domestic/titleException.json`  을 조정해야할 수 있습니다.
     가사의 유사도가 너무 떨어지는경우 같은 트랙으로 분류되지 않을 수 있습니다. 수기로 조정해야 할 수 있습니다.

5. **로컬 DB(mysql) 업데이트**

    ```bash
    # example
    pnpm run upsert 2024-05-06 2024-05-12
    ```

    - `src/integrate/domestic/dataAfterIntegration/20240506-20240512-w.json`을 읽어들여 작업을 진행합니다.
    - Mysql에 이미 있는 `track`이나 `artist`인경우 추가정보만 업데이트하고, 새로운데이터인경우 `insert`합니다

6. Remote DB sync
    - AWS RDS + AWS DMS를이용할 예정 (아직 구현x).
