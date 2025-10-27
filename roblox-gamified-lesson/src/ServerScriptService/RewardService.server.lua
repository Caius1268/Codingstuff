local DataService = require(script.Parent:WaitForChild("DataService"))

local RewardService = {}

RewardService.SETTINGS = {
    correctAnswerXP = 10,
    correctAnswerCoins = 5,
    lessonCompletionBonusXP = 25,
    lessonCompletionBonusCoins = 20,
    dailyBaseCoins = 30,
    dailyStreakBonusPerDay = 5, -- coins per streak day added to base
    maxDailyStreak = 7,
}

function RewardService:awardForAnswer(player: Player, isCorrect: boolean)
    if isCorrect then
        DataService:addXP(player, self.SETTINGS.correctAnswerXP)
        DataService:adjustCoins(player, self.SETTINGS.correctAnswerCoins)
    end
end

function RewardService:awardForLessonCompletion(player: Player)
    DataService:addXP(player, self.SETTINGS.lessonCompletionBonusXP)
    DataService:adjustCoins(player, self.SETTINGS.lessonCompletionBonusCoins)
end

function RewardService:claimDaily(player: Player)
    local now = os.time()
    local daily = DataService:getDaily(player)

    local isNewDay = (os.date("%j", now) ~= os.date("%j", daily.lastClaim or 0))
    if not isNewDay then
        return false, "Already claimed today"
    end

    local yesterday = now - 86400
    local continued = (os.date("%j", daily.lastClaim or 0) == os.date("%j", yesterday))
    local newStreak = continued and math.min((daily.streak or 0) + 1, self.SETTINGS.maxDailyStreak) or 1

    local reward = self.SETTINGS.dailyBaseCoins + (newStreak - 1) * self.SETTINGS.dailyStreakBonusPerDay

    DataService:setDaily(player, now, newStreak)
    DataService:adjustCoins(player, reward)

    return true, string.format("Claimed %d coins! Streak: %d", reward, newStreak), { reward = reward, streak = newStreak }
end

return RewardService