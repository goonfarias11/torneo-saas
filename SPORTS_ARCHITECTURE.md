# Sports Engine Architecture

## Current Limitations Detected

- `Tournament.type` was a single string centered on `LEAGUE`.
- Scoring was football-like: win/draw/loss and home/away score.
- Fixture generation only supported round-robin teams.
- UI creation hardcoded one format and did not know sports, presets, standings, sets, heats, rounds or series.
- No place existed for organization custom rules or reusable tournament templates.

## New Architecture

Core files:

- `src/features/sports/types.ts`: strong TypeScript contracts for sports, formats, scoring, match structure, metrics, UI and standings.
- `src/features/sports/catalog.ts`: central sport and format catalog. UI and backend both consume this.
- `src/features/sports/rules-engine.ts`: validates sport/format compatibility and composes persistable configs.
- `src/features/sports/adapters.ts`: strategy entry point for sport-specific behavior.
- `src/app/org/[slug]/tournaments/new/tournament-creation-wizard.tsx`: five-step creation UX.

Prisma additions:

- `Tournament.sportSlug`
- `Tournament.formatSlug`
- `Tournament.participantMode`
- `Tournament.competitionMode`
- `Tournament.rulesConfig`
- `Tournament.scoringConfig`
- `Tournament.standingsConfig`
- `Tournament.fixtureConfig`
- `Tournament.statisticsConfig`
- `Tournament.uiConfig`
- `Tournament.customRules`
- `TournamentTemplate`
- `OrganizationSportRule`

The project still uses SQLite locally. The fields are stored as JSON strings for compatibility. In production PostgreSQL, these should become `Json` columns.

## How To Add A Sport

1. Add a `SportDefinition` in `src/features/sports/catalog.ts`.
2. Choose `validFormats` from `COMPETITION_FORMATS`.
3. Define scoring, match structure, metrics, rule fields, standings and UI labels.
4. Add presets if the sport has common templates.
5. Add a specialized adapter only if fixture/stat calculation cannot be expressed by the generic catalog.

## Compatibility Rules

`validateTournamentConfiguration` rejects:

- unknown sport
- unknown format
- format not enabled for sport
- participant type mismatch
- required format feature not supported by sport

## Roadmap To Production

1. Move datasource to PostgreSQL and convert config string fields to `Json`.
2. Add versioned sport catalog migrations: `catalogVersion` on tournaments and templates.
3. Split generic fixture services:
   - `RoundRobinFixtureService`
   - `BracketFixtureService`
   - `GroupsPlayoffsFixtureService`
   - `HeatFixtureService`
   - `ClassificationFixtureService`
   - `SeriesFixtureService`
4. Add participant abstraction beyond teams:
   - athletes
   - pairs
   - teams
   - mixed squads
5. Expand `Match` into sport-neutral event records:
   - `MatchSegment` for sets, quarters, innings, rounds or maps
   - `MatchStatistic`
   - `EventResult` for timed/judged/classification sports
6. Add organization-level custom rules UI using `OrganizationSportRule`.
7. Add template builder UI using `TournamentTemplate`.
8. Add test coverage for every adapter and invalid sport/format pair.

## Roster, Events And Individual Statistics

New domain layer:

- `Person`: sport-neutral athlete/staff identity.
- `TeamMember`: membership of a person in a team roster with sport role, position, jersey and status.
- `MatchParticipant`: match-level participation for starters, minutes, relay members, pairs or individual entrants.
- `MatchEvent`: sport-configured event stream. Events are not hardcoded in UI.
- `PlayerStatistic`: match and tournament player aggregates.
- `TournamentStatistic`: tournament-level player/team aggregates.
- `SeasonStatistic`: organization season aggregates for historical profiles.
- `LeaderboardSnapshot`: generated ranking rows for public/fast leaderboard views.

Configuration lives in:

- `src/features/sports/participant-config.ts`

Each sport can define:

- `positions`
- `staffRoles`
- `matchEvents`
- `leaderboards`
- `statistics`
- `requiredRosterSize`
- `maxRosterSize`

Event flow:

1. UI asks the sport config which events are valid.
2. User records player, event, team, minute and period.
3. `recordMatchEvent` persists `MatchEvent`.
4. `applyMatchEventStatistics` increments match, tournament and season statistics.
5. Leaderboards can be generated from the configured `leaderboards` list.

This structure supports teams, individuals, pairs, relays and staff histories without duplicating event logic per sport.
