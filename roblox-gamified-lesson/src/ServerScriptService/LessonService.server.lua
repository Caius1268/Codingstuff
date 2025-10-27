local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local LessonManager = require(ReplicatedStorage:WaitForChild("LessonManager"))
local DataService = require(script.Parent:WaitForChild("DataService"))
local RewardService = require(script.Parent:WaitForChild("RewardService"))

local remotes = ReplicatedStorage:WaitForChild("Remotes")
local RequestLessons = remotes:WaitForChild("RequestLessons") :: RemoteFunction
local StartLesson = remotes:WaitForChild("StartLesson") :: RemoteFunction
local SubmitAnswer = remotes:WaitForChild("SubmitAnswer") :: RemoteFunction
local ClaimDaily = remotes:WaitForChild("ClaimDaily") :: RemoteFunction
local Feedback = remotes:WaitForChild("Feedback") :: RemoteEvent
local PurchaseItem = remotes:WaitForChild("PurchaseItem") :: RemoteFunction
local GetOwnedItems = remotes:WaitForChild("GetOwnedItems") :: RemoteFunction

-- Memory progress per player
local playerProgress = {}

local RATE_LIMITS = {
    SubmitAnswer = { window = 5, max = 12 },
    PurchaseItem = { window = 10, max = 6 },
}

local throttleBuckets: { [Player]: { [string]: { windowStart: number, count: number } } } = {}

local function hitRateLimit(player: Player, key: string): boolean
    throttleBuckets[player] = throttleBuckets[player] or {}
    local bucket = throttleBuckets[player][key]
    local now = os.clock()
    local cfg = RATE_LIMITS[key]
    if not cfg then return false end
    if not bucket or now - bucket.windowStart > cfg.window then
        throttleBuckets[player][key] = { windowStart = now, count = 1 }
        return false
    end
    bucket.count += 1
    if bucket.count > cfg.max then
        return true
    end
    return false
end

local function startLessonForPlayer(player: Player, lessonId: string)
    local lessons = LessonManager.getLessons()
    local found = nil
    for _, l in ipairs(lessons) do
        if l.id == lessonId then found = l break end
    end
    if not found then return nil, "Lesson not found" end
    playerProgress[player] = {
        lessonId = lessonId,
        currentIndex = 1,
        correctCount = 0,
        total = found.total,
        startedAt = os.clock(),
    }
    return LessonManager.getQuestion(lessonId, 1)
end

local function submitAnswerForPlayer(player: Player, answerIndex: number)
    local prog = playerProgress[player]
    if not prog then return nil, "No active lesson" end

    local isCorrect, explanation = LessonManager.checkAnswer(prog.lessonId, prog.currentIndex, answerIndex)
    RewardService:awardForAnswer(player, isCorrect)
    if isCorrect then
        prog.correctCount += 1
    end

    local nextIndex = prog.currentIndex + 1
    local nextQuestion = LessonManager.getQuestion(prog.lessonId, nextIndex)
    prog.currentIndex = nextIndex

    local finished = nextQuestion == nil
    if finished then
        RewardService:awardForLessonCompletion(player)
        DataService:updateLessonBest(player, prog.lessonId, prog.correctCount)
        playerProgress[player] = nil
    end

    return {
        correct = isCorrect,
        explanation = explanation,
        nextQuestion = nextQuestion,
        finished = finished,
        correctCount = prog.correctCount,
    }
end

-- Remote bindings
RequestLessons.OnServerInvoke = function(player)
    return LessonManager.getLessons()
end

StartLesson.OnServerInvoke = function(player, lessonId)
    return startLessonForPlayer(player, lessonId)
end

SubmitAnswer.OnServerInvoke = function(player, answerIndex)
    if hitRateLimit(player, "SubmitAnswer") then
        return { error = "Slow down" }
    end
    local ok, resultOrErr = pcall(function()
        return submitAnswerForPlayer(player, tonumber(answerIndex))
    end)
    if not ok then
        return { error = "Server error" }
    end
    if resultOrErr == nil then
        return { error = "No active lesson" }
    end
    return resultOrErr
end

ClaimDaily.OnServerInvoke = function(player)
    local ok, msg, data = RewardService:claimDaily(player)
    return { ok = ok, message = msg, data = data }
end

GetOwnedItems.OnServerInvoke = function(player)
    local profile = DataService:get(player)
    return profile and profile.ownedItems or {}
end

Players.PlayerRemoving:Connect(function(player)
    playerProgress[player] = nil
    throttleBuckets[player] = nil
end)