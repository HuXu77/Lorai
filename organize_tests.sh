#!/bin/bash
mkdir -p src/tests/cards src/tests/mechanics src/tests/ui src/tests/parser src/tests/engine

# Cards
mv src/tests/bugs/bare-necessities-targeting.test.ts src/tests/cards/bare-necessities-targeting.test.ts
mv src/tests/bugs/bare-necessities-ui.test.ts src/tests/ui/bare-necessities.test.ts
mv src/tests/bugs/real-bare-necessities.test.ts src/tests/cards/bare-necessities-logic.test.ts
mv src/tests/bugs/blessed-bagpipes.test.ts src/tests/cards/blessed-bagpipes.test.ts
mv src/tests/bugs/emerald-chromicon.test.ts src/tests/cards/emerald-chromicon.test.ts
mv src/tests/bugs/gaston-top-that.test.ts src/tests/cards/gaston-top-that.test.ts
mv src/tests/bugs/hades-lore-boost.test.ts src/tests/cards/hades-lore-boost.test.ts
mv src/tests/bugs/hades-lore-nan.test.ts src/tests/cards/hades-lore-nan.test.ts
mv src/tests/bugs/lady-bug.test.ts src/tests/cards/lady-singer.test.ts
mv src/tests/bugs/lady-shift.test.ts src/tests/cards/lady-shift.test.ts
mv src/tests/bugs/lilo-bug.test.ts src/tests/cards/lilo.test.ts
mv src/tests/bugs/moana-princess.test.ts src/tests/cards/moana.test.ts
mv src/tests/bugs/mother-knows-best-bug.test.ts src/tests/cards/mother-knows-best.test.ts
mv src/tests/bugs/pete-action-block.test.ts src/tests/cards/pete-action-block.test.ts
mv src/tests/bugs/pete-expiration.test.ts src/tests/cards/pete-expiration.test.ts
mv src/tests/bugs/queen-commanding-presence.test.ts src/tests/cards/the-queen-commanding-presence.test.ts
mv src/tests/bugs/queen-page-logic.test.ts src/tests/cards/the-queen-page-logic.test.ts
mv src/tests/bugs/the-queen-repro.test.ts src/tests/cards/the-queen-repro.test.ts
mv src/tests/bugs/rapunzel-targeting.test.ts src/tests/cards/rapunzel-targeting.test.ts
mv src/tests/bugs/repro-pluto-stats.test.ts src/tests/cards/pluto.test.ts
mv src/tests/bugs/repro-ratigan-song.test.ts src/tests/cards/ratigan.test.ts
mv src/tests/bugs/repro-sudden-chill.test.ts src/tests/cards/sudden-chill.test.ts
mv src/tests/bugs/repro-sudden-scare.test.ts src/tests/cards/sudden-scare.test.ts
mv src/tests/bugs/sensor-core-lore.test.ts src/tests/cards/sensor-core.test.ts
mv src/tests/bugs/sisu-strength.test.ts src/tests/cards/sisu.test.ts
mv src/tests/bugs/webby-double-trigger.test.ts src/tests/cards/webby.test.ts
mv src/tests/bugs/demona-engine.test.ts src/tests/cards/demona.test.ts
mv src/tests/bugs/show-me-more.spec.ts src/tests/cards/show-me-more.test.ts

# Mechanics
mv src/tests/bugs/bodyguard-repro.test.ts src/tests/mechanics/bodyguard.test.ts
mv src/tests/bugs/boost-implementation.test.ts src/tests/mechanics/boost-implementation.test.ts
mv src/tests/bugs/emily-quackfaster-boost.test.ts src/tests/mechanics/boost-emily.test.ts
mv src/tests/bugs/gaston-boost-execution.test.ts src/tests/mechanics/boost-gaston.test.ts
mv src/tests/bugs/repro-gaston-boost.test.ts src/tests/mechanics/boost-gaston-repro.test.ts
mv src/tests/bugs/duration-aliases.test.ts src/tests/mechanics/duration-aliases.test.ts
mv src/tests/bugs/duration-expiration.test.ts src/tests/mechanics/duration-expiration.test.ts
mv src/tests/bugs/evasive-challenge.test.ts src/tests/mechanics/evasive.test.ts
mv src/tests/bugs/location-lore.test.ts src/tests/mechanics/location-lore.test.ts
mv src/tests/bugs/singer-vanishing.test.ts src/tests/mechanics/singer-vanishing.test.ts
mv src/tests/bugs/undamaged-condition.test.ts src/tests/mechanics/condition-undamaged.test.ts

# UI
mv src/tests/bugs/modal-card-rendering.test.ts src/tests/ui/modal-rendering.test.ts
mv src/tests/bugs/storm-animation.test.ts src/tests/ui/storm-animation.test.ts

# Parser
mv src/tests/bugs/hades-parsing.test.ts src/tests/parser/hades-parsing.test.ts
mv src/tests/bugs/keyword-only-cards.test.ts src/tests/parser/keyword-only.test.ts
mv src/tests/bugs/lore-parser-regression.test.ts src/tests/parser/lore-regression.test.ts

# Engine
mv src/tests/bugs/duplicate-logs.test.ts src/tests/engine/duplicate-logs.test.ts
mv src/tests/bugs/executor-fixes.test.ts src/tests/engine/executor-fixes.test.ts
